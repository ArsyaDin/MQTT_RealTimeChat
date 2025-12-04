# WSL Docker Port Forwarding Guide

## Problem
When running Docker in WSL, the containers are on a virtual network. Your Windows IP (like 10.200.51.194) cannot directly reach the WSL containers.

## Solution
Port forward from Windows to WSL so external devices can connect.

## Method 1: Automatic Setup (Recommended)

### Step 1: Get WSL IP Address
```bash
# From WSL terminal
hostname -I
```
Example output: `172.26.231.60 172.17.0.1 172.18.0.1`
Use the first IP: `172.26.231.60`

### Step 2: Run PowerShell Script as Administrator

On Windows (PowerShell as Administrator):
```powershell
cd C:\Users\YourUsername\path\to\FinalProject
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-port-forwarding.ps1
```

The script will automatically set up forwarding for ports: 3001, 3000, 9001, 1883

---

## Method 2: Manual Setup (If Script Doesn't Work)

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
```

### Step 4: Verify Rules

```powershell
netsh interface portproxy show v4tov4
```

You should see 4 rules listed.

---

## Step 3: Get Your Windows IP

```powershell
ipconfig
```

Look for "IPv4 Address" - usually something like `192.168.1.100` or `10.200.51.194`

---

## Step 4: Test from Mobile

On your mobile phone browser:
```
http://192.168.1.100:3001
```
(Replace with your actual Windows IP)

---

## Troubleshooting

### Rules not working?

**Clear existing rules first:**
```powershell
netsh interface portproxy reset
```

Then re-add the rules.

### Port already in use?

```powershell
netstat -ano | findstr ":3001\|:3000\|:9001\|:1883"
```

If you see a process using the port, you may need to stop it or use a different port.

### Still can't connect?

1. Verify containers are running:
   ```bash
   docker ps
   ```

2. Check firewall allows the ports (Windows Defender)

3. Ensure mobile is on same network as Windows

4. Try connecting from Windows first:
   ```
   http://localhost:3001
   ```

---

## Removing Port Forwarding (If Needed)

```powershell
# Remove all port forwarding rules
netsh interface portproxy reset

# Or remove specific port
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0
```

---

## How It Works

```
Mobile Phone (WiFi)
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
