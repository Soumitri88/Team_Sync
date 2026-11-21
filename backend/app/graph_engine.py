import networkx as nx
from typing import Dict, Any, List, Optional
from .db import db

def build_attack_graph() -> Dict[str, Any]:
    """
    Constructs a NetworkX directed graph from ingested security events,
    calculates attack trajectories, and returns React Flow formatted nodes & edges.
    """
    events = db.events.find(sort_by="timestamp", reverse=False)

    G = nx.DiGraph()

    # If no events, return empty graph or default placeholder
    if not events:
        return {
            "nodes": [],
            "edges": [],
            "summary": {
                "total_nodes": 0,
                "total_edges": 0,
                "attack_stages": 0,
                "patient_zero": None,
                "critical_path": []
            }
        }

    # Step tracking
    step_num = 1
    node_registry = {}
    edges_list = []

    # Helper to add node
    def register_node(node_id: str, label: str, node_type: str, severity: str = "medium", metadata: Dict[str, Any] = None):
        if node_id not in node_registry:
            node_registry[node_id] = {
                "id": node_id,
                "label": label,
                "type": node_type, # attacker, device, account, canary
                "severity": severity,
                "stage": 1,
                "compromised": True,
                "metadata": metadata or {},
                "incoming_events": [],
                "outgoing_events": []
            }
        else:
            # Upgrade severity if higher
            sev_order = {"critical": 4, "high": 3, "medium": 2, "low": 1, "info": 0}
            if sev_order.get(severity, 0) > sev_order.get(node_registry[node_id]["severity"], 0):
                node_registry[node_id]["severity"] = severity
        return node_registry[node_id]

    patient_zero = None

    for evt in events:
        src_ip = evt.get("source_ip", "Unknown-IP")
        dst_ip = evt.get("destination_ip", "Unknown-Dst")
        device = evt.get("device_name", "Unknown-Host")
        username = evt.get("username", "Unknown-User")
        evt_type = evt.get("event_type", "suspicious_activity")
        severity = evt.get("severity", "medium")
        is_canary = evt.get("is_canary", False)
        canary_file = evt.get("canary_file")
        stage = evt.get("stage", 1)

        if not patient_zero and stage == 1 and device:
            patient_zero = device

        # 1. Attacker or Origin Node
        if src_ip.startswith("198.51.") or src_ip.startswith("203.0.") or "attacker" in evt_type or stage == 1:
            attacker_node_id = f"node-attacker-{src_ip}"
            register_node(attacker_node_id, f"Adversary [{src_ip}]", "attacker", "critical", {
                "ip": src_ip,
                "threat_actor": "APT-SIM-409",
                "reputation": "Malicious External Origin"
            })
            node_registry[attacker_node_id]["stage"] = 1
        else:
            attacker_node_id = None

        # 2. Account Node
        account_node_id = None
        if username and username not in ["unknown_user", "SYSTEM"]:
            account_node_id = f"node-user-{username}"
            register_node(account_node_id, f"User: {username}", "account", severity, {
                "username": username,
                "role": "Domain User",
                "device_affinity": device
            })
            node_registry[account_node_id]["stage"] = max(node_registry[account_node_id]["stage"], stage)
        elif username == "SYSTEM":
            account_node_id = f"node-user-SYSTEM"
            register_node(account_node_id, "NT AUTHORITY\\SYSTEM", "account", "critical", {
                "username": "SYSTEM",
                "privilege": "Highest Kernel/OS Privilege",
                "compromised_on": device
            })
            node_registry[account_node_id]["stage"] = max(node_registry[account_node_id]["stage"], stage)

        # 3. Device Node
        device_node_id = f"node-device-{device}"
        register_node(device_node_id, device, "device", severity, {
            "hostname": device,
            "ip": dst_ip,
            "os": "Windows Server / Workstation",
            "criticality": "High" if "DC" in device or "SRV" in device else "Standard"
        })
        node_registry[device_node_id]["stage"] = max(node_registry[device_node_id]["stage"], stage)

        # 4. Canary Asset Node (if triggered)
        canary_node_id = None
        if is_canary and canary_file:
            canary_node_id = f"node-canary-{canary_file}"
            register_node(canary_node_id, f"Canary: {canary_file}", "canary", "critical", {
                "file_name": canary_file,
                "host": device,
                "state": "TRIPPED_DECEPTION"
            })
            node_registry[canary_node_id]["stage"] = max(node_registry[canary_node_id]["stage"], stage)

        # Build Edges representing the attack sequence
        edge_source = attacker_node_id or (f"node-device-{evt.get('source_ip')}" if not evt.get('source_ip').startswith("10.") else None)
        
        # If lateral movement from another internal device
        if evt_type == "lateral_movement":
            # Find originating device or use source ip
            edge_src_id = account_node_id or attacker_node_id or device_node_id
            edge_dst_id = device_node_id
            edge_label = f"Step {step_num}: Lateral Move ({evt.get('mitre_id')})"
        elif evt_type == "privilege_escalation":
            edge_src_id = account_node_id or device_node_id
            edge_dst_id = f"node-user-SYSTEM"
            edge_label = f"Step {step_num}: PrivEsc -> SYSTEM"
        elif evt_type == "canary_access":
            edge_src_id = account_node_id or device_node_id
            edge_dst_id = canary_node_id
            edge_label = f"Step {step_num}: CANARY TRIPWIRE"
        elif evt_type == "file_exfiltration":
            edge_src_id = device_node_id
            edge_dst_id = attacker_node_id or f"node-attacker-{dst_ip}"
            edge_label = f"Step {step_num}: C2 Exfiltration"
        else: # initial access / login / brute force
            edge_src_id = attacker_node_id or account_node_id
            edge_dst_id = device_node_id
            edge_label = f"Step {step_num}: {evt.get('mitre_name', 'Initial Access')[:20]}"

        if edge_src_id and edge_dst_id and edge_src_id != edge_dst_id:
            edge_id = f"edge-{evt['id']}-{step_num}"
            edge_data = {
                "id": edge_id,
                "source": edge_src_id,
                "target": edge_dst_id,
                "label": edge_label,
                "event_id": evt["id"],
                "step": step_num,
                "timestamp": evt["timestamp"],
                "event_type": evt_type,
                "severity": severity,
                "mitre_id": evt.get("mitre_id"),
                "mitre_name": evt.get("mitre_name"),
                "evidence_hash": evt.get("evidence_hash"),
                "description": evt.get("event_description"),
                "raw_payload": evt.get("raw_payload", {}),
                "animated": True
            }
            edges_list.append(edge_data)

            # Add to NetworkX
            G.add_edge(edge_src_id, edge_dst_id, **edge_data)

            step_num += 1

    # NetworkX Calculations
    # Calculate shortest attack paths & critical paths
    critical_path = []
    try:
        # find node with in_degree 0 (entry) and out_degree 0 (target or canary/exfil)
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
        critical_path = []

    # Intelligent Spatial Layout for React Flow
    # X axis maps cleanly to Attack Stage / Chronological progression
    # Y axis groups by Node Category: Attacker (top, y=50), Accounts (y=180), Devices (y=320), Canaries (y=480)
    stage_x_map = {1: 80, 2: 360, 3: 650, 4: 940, 5: 1220}
    type_y_map = {"attacker": 60, "account": 190, "device": 340, "canary": 490}

    # Group counts to prevent direct overlapping
    type_counts = {}

    react_flow_nodes = []
    for node_id, node in node_registry.items():
        st = node["stage"]
        ntype = node["type"]
        
        count = type_counts.get((st, ntype), 0)
        type_counts[(st, ntype)] = count + 1

        x = stage_x_map.get(st, 300) + (count * 40)
        y = type_y_map.get(ntype, 250) + (count * 70)

        # Flag if on critical path
        on_critical = node_id in critical_path

        react_flow_nodes.append({
            "id": node_id,
            "type": "customNode",
            "position": {"x": x, "y": y},
            "data": {
                **node,
                "is_critical_path": on_critical
            }
        })

    # Format edges for React Flow
    react_flow_edges = []
    for edge in edges_list:
        is_crit = (edge["source"] in critical_path and edge["target"] in critical_path)
        
        # Color based on severity
        sev_color = "#ef4444" if edge["severity"] == "critical" else "#f59e0b" if edge["severity"] == "high" else "#00f2fe"

        react_flow_edges.append({
            "id": edge["id"],
            "source": edge["source"],
            "target": edge["target"],
            "label": edge["label"],
            "type": "smoothstep",
            "animated": True,
            "style": {
                "stroke": sev_color,
                "strokeWidth": 3 if is_crit else 2,
                "strokeDasharray": "5 5" if edge["severity"] != "critical" else None
            },
            "data": edge
        })

    return {
        "nodes": react_flow_nodes,
        "edges": react_flow_edges,
        "summary": {
            "total_nodes": len(react_flow_nodes),
            "total_edges": len(react_flow_edges),
            "attack_stages": max([n["stage"] for n in node_registry.values()], default=0),
            "patient_zero": patient_zero,
            "critical_path": critical_path
        }
    }
