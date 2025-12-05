# Containers & Services

This file documents the Docker services used by the MQTT Real-Time Chat project: purpose, ports, how to access, and quick troubleshooting commands.

## chat_frontend
- **Service name:** `chat_frontend`
- **Purpose:** React web UI (browser client). Handles join screen, room browser, chat UI and connects to MQTT over WebSocket.
- **Exposed ports (host:container):** `3001:3000` (dev server exposed on host 3001)
- **How to access:** `http://localhost:3001` (or `http://<WINDOWS_IP>:3001` for mobile)
- **Troubleshooting:** Check browser console for WebSocket or API errors; `docker compose logs -f chat_frontend`.

## chat_backend
- **Service name:** `chat_backend`
- **Purpose:** Node.js/Express API, MongoDB persistence and MQTT bridge (publishes join/leave/messages)
- **Exposed ports (host:container):** `3000:3000`
- **How to access:** REST API `http://localhost:3000` (e.g. `/api/rooms`)
- **Troubleshooting:** Check `docker compose logs -f chat_backend` and ensure `MONGO_URL` and `MQTT_BROKER_URL` environment variables point to the correct services.

## mqtt_broker
- **Service name:** `mqtt_broker`
- **Image:** Mosquitto
- **Purpose:** MQTT broker for real-time events (messages, presence)
- **Exposed ports (host:container):** `1883:1883` (MQTT TCP), `9001:9001` (MQTT WebSocket for browsers)
- **How to access:** `mqtt://<host>:1883` and `ws://<host>:9001` for WebSocket clients
- **Troubleshooting:** `docker compose logs -f mqtt_broker` and verify Mosquitto config enables WebSocket listener.

## mongo_db
- **Service name:** `mongo_db`
- **Image:** `mongo` (official)
- **Purpose:** Persistent storage for `rooms`, `messages`, and `users`
- **Exposed ports (host:container):** `27017:27017`
- **How to access:** `mongosh` inside container or MongoDB Compass via `mongodb://localhost:27017` (use portproxy/firewall if accessing from Windows to WSL)
- **Troubleshooting:** `docker compose logs -f mongo_db`; use `docker compose exec mongo_db mongosh` to inspect collections.

## Quick Checks
- List services: `docker compose ps`
- Follow logs: `docker compose logs -f <service>`
- Backend health: `curl http://localhost:3000/health`
- Mongo shell: `docker compose exec mongo_db mongosh`

Keep this file updated when you change ports, service names, or add auth/config. For remote/mobile access remember to set up Windows -> WSL port forwarding and firewall rules if Docker runs inside WSL.
