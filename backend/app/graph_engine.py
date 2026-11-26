import networkx as nx
from typing import Dict, Any, List, Optional
from datetime import datetime
from .db import db

def build_attack_graph() -> Dict[str, Any]:
    """
    PloyWeb GraphX Autonomous Attack Reconstruction Engine
    ======================================================
    Dynamically reconstructs directed attack graph using NetworkX from actual security events.
    Correlates:
      - Attacker simulated entry point
      - Endpoints (Patient Zero & lateral pivot targets)
      - User accounts & privilege escalation states
      - Spawned processes (with genuine OS PIDs & command lines)
      - Targeted files & Canary Twin deception honey-tokens
      - Network sockets & C2 egress communication channels

    Assigns dynamic visual states:
      - 'normal'
      - 'suspicious'
      - 'malicious-simulation'
      - 'contained'
    """
    events = db.events.find(sort_by="timestamp", reverse=False)
    actions = db.response_actions.find()
    devices = {d["name"]: d for d in db.devices.find()}
    is_contained_globally = any(a.get("status") in ["executed", "EXECUTED_SIMULATED"] for a in actions)

    G = nx.DiGraph()

    if not events:
        return {
            "engine": "PloyWeb GraphX v2.4",
            "nodes": [],
            "edges": [],
            "summary": {
                "total_nodes": 0,
                "total_edges": 0,
                "attack_stages": 0,
                "patient_zero": None,
                "critical_path": [],
                "containment_status": "MONITORING"
            }
        }

    step_num = 1
    node_registry: Dict[str, Dict[str, Any]] = {}
    edges_list: List[Dict[str, Any]] = []

    def register_node(node_id: str, label: str, node_type: str, severity: str = "medium", metadata: Dict[str, Any] = None):
        if node_id not in node_registry:
            # Determine initial visual state
            if severity == "critical":
                vis_state = "malicious-simulation"
            elif severity == "high":
                vis_state = "suspicious"
            else:
                vis_state = "normal"

            node_registry[node_id] = {
                "id": node_id,
                "label": label,
                "type": node_type,  # attacker, device, account, process, file, canary, network
                "severity": severity,
                "visual_state": vis_state,
                "stage": 1,
                "metadata": metadata or {},
                "event_references": []
            }
        else:
            sev_order = {"critical": 4, "high": 3, "medium": 2, "low": 1, "info": 0}
            current_sev = node_registry[node_id]["severity"]
            if sev_order.get(severity, 0) > sev_order.get(current_sev, 0):
                node_registry[node_id]["severity"] = severity
                if severity == "critical":
                    node_registry[node_id]["visual_state"] = "malicious-simulation"
                elif severity == "high" and node_registry[node_id]["visual_state"] != "malicious-simulation":
                    node_registry[node_id]["visual_state"] = "suspicious"

        if metadata:
            node_registry[node_id]["metadata"].update(metadata)
        return node_registry[node_id]

    patient_zero = None

    for evt in events:
        evt_id = evt.get("id", f"EVT-{step_num}")
        src_ip = evt.get("source_ip", "Unknown-IP")
        dst_ip = evt.get("destination_ip", "Unknown-Dst")
        device_name = evt.get("device_name", "Unknown-Host")
        username = evt.get("username", "Unknown-User")
        evt_type = evt.get("event_type", "suspicious_activity")
        severity = evt.get("severity", "medium")
        is_canary = evt.get("is_canary", False)
        canary_file = evt.get("canary_file")
        stage = evt.get("stage", 1)
        raw_payload = evt.get("raw_payload", {})

        if not patient_zero and stage == 1 and device_name:
            patient_zero = device_name

        # 1. Attacker Entrypoint Node
        attacker_node_id = None
        if src_ip.startswith("198.51.") or src_ip.startswith("203.0.") or "login" in evt_type or stage == 1:
            attacker_node_id = f"node-attacker-{src_ip}"
            register_node(attacker_node_id, f"Adversary [{src_ip}]", "attacker", "critical", {
                "ip": src_ip,
                "threat_actor": "APT-SIM-409 (Controlled)",
                "reputation": "Malicious External Origin",
                "entrypoint": True
            })
            node_registry[attacker_node_id]["stage"] = 1
            node_registry[attacker_node_id]["event_references"].append(evt_id)

        # 2. Account Node
        account_node_id = None
        if username and username != "unknown_user":
            if username == "SYSTEM":
                account_node_id = "node-user-SYSTEM"
                register_node(account_node_id, "NT AUTHORITY\\SYSTEM", "account", "critical", {
                    "username": "SYSTEM",
                    "privilege": "Highest Kernel/OS Privilege",
                    "compromised_on": device_name
                })
            else:
                account_node_id = f"node-user-{username}"
                register_node(account_node_id, f"User: {username}", "account", severity, {
                    "username": username,
                    "role": "Domain User",
                    "device_affinity": device_name
                })
            node_registry[account_node_id]["stage"] = max(node_registry[account_node_id]["stage"], stage)
            node_registry[account_node_id]["event_references"].append(evt_id)

        # 3. Device Node (Endpoint)
        device_node_id = f"node-device-{device_name}"
        dev_info = devices.get(device_name, {})
        is_dev_isolated = dev_info.get("security_posture") == "protected" or "Isolated" in dev_info.get("mode", "")
        
        register_node(device_node_id, device_name, "device", severity, {
            "hostname": device_name,
            "ip": dst_ip,
            "os": dev_info.get("os", "Windows 11 / Linux"),
            "role": "Patient Zero (Workstation)" if device_name == patient_zero else "Internal Pivot Server",
            "is_patient_zero": (device_name == patient_zero),
            "isolated": is_dev_isolated
        })
        if is_dev_isolated or is_contained_globally:
            node_registry[device_node_id]["visual_state"] = "contained"
        node_registry[device_node_id]["stage"] = max(node_registry[device_node_id]["stage"], stage)
        node_registry[device_node_id]["event_references"].append(evt_id)

        # 4. Process Node (if process spawned)
        process_node_id = None
        pid = raw_payload.get("process_id") or raw_payload.get("pid")
        pname = raw_payload.get("process_name") or ("powershell.exe" if "privilege" in evt_type else None)
        if pid or pname:
            process_node_id = f"node-proc-{pid or pname}"
            register_node(process_node_id, f"Process: {pname or 'cmd.exe'} [PID {pid or 'N/A'}]", "process", severity, {
                "pid": pid,
                "process_name": pname or "python.exe",
                "command_line": raw_payload.get("command_line", "Benign simulated test process"),
                "executable_hash": raw_payload.get("executable_hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
                "host": device_name
            })
            if is_contained_globally:
                node_registry[process_node_id]["visual_state"] = "contained"
            node_registry[process_node_id]["stage"] = max(node_registry[process_node_id]["stage"], stage)
            node_registry[process_node_id]["event_references"].append(evt_id)

        # 5. File / Canary Node
        canary_node_id = None
        if is_canary or canary_file:
            target_canary = canary_file or "financial_report_demo.txt"
            canary_node_id = f"node-canary-{target_canary}"
            register_node(canary_node_id, f"Canary: {target_canary}", "canary", "critical", {
                "file_name": target_canary,
                "host": device_name,
                "state": "TRIPPED_DECEPTION",
                "sha256": raw_payload.get("post_access_sha256") or evt.get("evidence_hash")
            })
            if is_contained_globally:
                node_registry[canary_node_id]["visual_state"] = "contained"
            node_registry[canary_node_id]["stage"] = max(node_registry[canary_node_id]["stage"], stage)
            node_registry[canary_node_id]["event_references"].append(evt_id)

        # 6. Network C2 Node
        c2_node_id = None
        if "exfiltration" in evt_type or "c2" in evt_type or stage == 5:
            dest_host = raw_payload.get("destination_domain") or raw_payload.get("dest_ip") or "adverse-egress.net:443"
            c2_node_id = f"node-c2-{dest_host}"
            register_node(c2_node_id, f"C2 Socket: {dest_host}", "network", "critical", {
                "destination": dest_host,
                "protocol": raw_payload.get("protocol", "TLS Encrypted HTTPS:443"),
                "bytes": raw_payload.get("bytes_sent", 4194304)
            })
            if is_contained_globally:
                node_registry[c2_node_id]["visual_state"] = "contained"
            node_registry[c2_node_id]["stage"] = max(node_registry[c2_node_id]["stage"], stage)
            node_registry[c2_node_id]["event_references"].append(evt_id)

        # ==================== DYNAMIC GRAPHX EDGE SYNTHESIS ====================
        edge_src_id = None
        edge_dst_id = None
        edge_label = f"Stage {stage}: {evt.get('mitre_id', 'T1000')}"

        if evt_type in ["suspicious_login", "brute_force"] or stage == 1:
            edge_src_id = attacker_node_id
            edge_dst_id = account_node_id or device_node_id
            edge_label = f"Stage 1: Initial RDP Auth ({evt.get('mitre_id', 'T1078')})"
        elif evt_type in ["suspicious_process_spawn", "privilege_escalation"] or stage == 2:
            edge_src_id = account_node_id or device_node_id
            edge_dst_id = process_node_id or "node-user-SYSTEM"
            edge_label = f"Stage 2: PrivEsc Token ({evt.get('mitre_id', 'T1068')})"
        elif evt_type == "lateral_movement" or stage == 3:
            edge_src_id = f"node-device-{patient_zero}" if patient_zero else account_node_id
            edge_dst_id = device_node_id
            edge_label = f"Stage 3: WinRM Lateral Pivot ({evt.get('mitre_id', 'T1021')})"
        elif evt_type == "canary_access" or stage == 4:
            edge_src_id = device_node_id
            edge_dst_id = canary_node_id
            edge_label = f"Stage 4: Canary Trap Breach ({evt.get('mitre_id', 'T1005')})"
        elif evt_type in ["file_exfiltration", "c2_beacon"] or stage == 5:
            edge_src_id = device_node_id
            edge_dst_id = c2_node_id or attacker_node_id
            edge_label = f"Stage 5: C2 Encrypted Egress ({evt.get('mitre_id', 'T1048')})"
        elif stage == 6:
            edge_src_id = "node-user-SYSTEM"
            edge_dst_id = device_node_id
            edge_label = f"Stage 6: Persistent Daemon ({evt.get('mitre_id', 'T1543')})"
        else:
            edge_src_id = attacker_node_id or device_node_id
            edge_dst_id = device_node_id

        if edge_src_id and edge_dst_id and edge_src_id != edge_dst_id:
            edge_id = f"edge-{evt_id}-{step_num}"
            edge_data = {
                "id": edge_id,
                "source": edge_src_id,
                "target": edge_dst_id,
                "label": edge_label,
                "event_id": evt_id,
                "step": step_num,
                "stage": stage,
                "timestamp": evt.get("timestamp"),
                "event_type": evt_type,
                "severity": severity,
                "mitre_id": evt.get("mitre_id"),
                "mitre_name": evt.get("mitre_name"),
                "evidence_hash": evt.get("evidence_hash"),
                "description": evt.get("event_description"),
                "raw_payload": raw_payload,
                "animated": True,
                "contained": is_contained_globally
            }
            edges_list.append(edge_data)
            G.add_edge(edge_src_id, edge_dst_id, **edge_data)
            step_num += 1

    # ==================== GRAPHX TOPOLOGY & CRITICAL PATH ====================
    critical_path = []
    try:
        entry_nodes = [n for n in G.nodes if G.in_degree(n) == 0]
        exit_nodes = [n for n in G.nodes if G.out_degree(n) == 0]
        if entry_nodes and exit_nodes:
            longest_p = []
            for en in entry_nodes:
                for ex in exit_nodes:
                    if nx.has_path(G, en, ex):
                        p = nx.shortest_path(G, en, ex)
                        if len(p) > len(longest_p):
                            longest_p = p
            critical_path = longest_p
    except Exception:
        critical_path = list(node_registry.keys())[:6]

    # Clean spatial layout for GraphX canvas
    # X axis = Stage / Chronological timeline (1 -> 6)
    # Y axis = Logical Architectural Tier:
    #   Tier 0: Attacker / C2 External (y = 50)
    #   Tier 1: Identity & Credentials (y = 190)
    #   Tier 2: Endpoints / Hosts (y = 330)
    #   Tier 3: Active Processes & Tasks (y = 470)
    #   Tier 4: File Storage & Canary Decoys (y = 610)
    stage_x_map = {1: 80, 2: 360, 3: 660, 4: 960, 5: 1260, 6: 1560}
    type_y_map = {
        "attacker": 60,
        "network": 70,
        "account": 200,
        "device": 340,
        "process": 480,
        "file": 620,
        "canary": 620
    }

    tier_counts: Dict[tuple, int] = {}
    graphx_nodes = []

    for node_id, node in node_registry.items():
        st = node["stage"]
        ntype = node["type"]
        key = (st, ntype)
        idx = tier_counts.get(key, 0)
        tier_counts[key] = idx + 1

        x = stage_x_map.get(st, 300) + (idx * 50)
        y = type_y_map.get(ntype, 300) + (idx * 80)

        is_crit = node_id in critical_path

        graphx_nodes.append({
            "id": node_id,
            "type": "custom",
            "position": {"x": x, "y": y},
            "data": {
                **node,
                "is_critical_path": is_crit,
                "critical_path": is_crit,
                "is_patient_zero": (node_id == f"node-device-{patient_zero}")
            }
        })

    # Format edges with glowing cyber style
    graphx_edges = []
    for edge in edges_list:
        is_crit = (edge["source"] in critical_path and edge["target"] in critical_path)
        sev = edge["severity"]
        if is_contained_globally:
            stroke_color = "#10b981"  # Emerald contained
        elif sev == "critical":
            stroke_color = "#ef4444"  # Crimson attack
        elif sev == "high":
            stroke_color = "#f59e0b"  # Amber warning
        else:
            stroke_color = "#00f2fe"  # Cyan nominal

        graphx_edges.append({
            "id": edge["id"],
            "source": edge["source"],
            "target": edge["target"],
            "label": edge["label"],
            "type": "smoothstep",
            "animated": not is_contained_globally,
            "style": {
                "stroke": stroke_color,
                "strokeWidth": 3 if is_crit else 2,
                "strokeDasharray": "5 5" if not is_crit and sev != "critical" else None
            },
            "data": {
                **edge,
                "is_critical_path": is_crit
            }
        })

    return {
        "engine": "PloyWeb GraphX Autonomous Reconstruction Engine v2.4",
        "nodes": graphx_nodes,
        "edges": graphx_edges,
        "summary": {
            "total_nodes": len(graphx_nodes),
            "total_edges": len(graphx_edges),
            "attack_stages": max([n["stage"] for n in node_registry.values()], default=0),
            "patient_zero": patient_zero,
            "critical_path": critical_path,
            "containment_status": "CONTAINED" if is_contained_globally else "ACTIVE_INTRUSION"
        }
    }
