# WSL Docker Port Forwarding Guide

## Setup

### Step 1: Open PowerShell as Administrator

### Step 2: Get WSL IP Address
```powershell
wsl hostname -I
```
Example: `172.26.231.60`

### Step 3: Add Port Forwarding Rules

```powershell
# Frontend (Port 3001)
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=172.26.231.60

# Backend API (Port 3000)
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.26.231.60

# MQTT WebSocket (Port 9001)
netsh interface portproxy add v4tov4 listenport=9001 listenaddress=0.0.0.0 connectport=9001 connectaddress=172.26.231.60

# MQTT TCP (Port 1883)
netsh interface portproxy add v4tov4 listenport=1883 listenaddress=0.0.0.0 connectport=1883 connectaddress=172.26.231.60

# MongoDB (Port 27017)
netsh interface portproxy add v4tov4 listenport=27017 listenaddress=0.0.0.0 connectport=27017 connectaddress=172.26.231.60
```

### Step 4: Verify Rules

```powershell
netsh interface portproxy show v4tov4
```

You should see 4 rules listed.

---

## Step 5: Get Your Windows IP

```powershell
ipconfig
```

Look for "IPv4 Address" - usually something like `192.xxx.xxx.xxx` or `10.xxx.xxx.xxx`

---

## Step 6: Test from other device

On your other device's browser:
```
http://<your actual Windows IP>
```

---

## How It Works

```
Other Device (WiFi)
    ↓
Windows Router (IP: 192.168.1.100 or 10.200.51.194)
    ↓
Port Forwarding (netsh portproxy)
    ↓
WSL (IP: 172.26.231.60)
    ↓
Docker Containers
    ├── Frontend: 172.18.0.5:3001
    ├── Backend: 172.18.0.4:3000
    ├── MQTT: 172.18.0.2:9001
    └── MongoDB: 172.18.0.3:27017
```
