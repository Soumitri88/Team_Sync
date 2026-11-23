# Multi-stage build: Frontend + Python Backend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/pnpm-lock.yaml* ./
RUN npm install -g pnpm && (pnpm install --frozen-lockfile || pnpm install)
COPY frontend/ ./
RUN pnpm build

FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend ./backend

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8000
ENV PYTHONUNBUFFERED=1

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
