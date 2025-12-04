# WSL to Windows Port Forwarding Setup
# Run this PowerShell script as Administrator on Windows

# Get WSL IP address
$wslIP = wsl hostname -I | ForEach-Object { $_.Split()[0] }
Write-Host "WSL IP Address: $wslIP" -ForegroundColor Green

# Ports to forward
$ports = @(3001, 3000, 9001, 1883)
$listenAddress = "0.0.0.0"

Write-Host "`nSetting up port forwarding from Windows to WSL..." -ForegroundColor Cyan

foreach ($port in $ports) {
    Write-Host "`nForwarding port $port..." -ForegroundColor Yellow
    
    # Remove existing rule if it exists
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=$listenAddress 2>$null
    
    # Add new rule
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=$listenAddress connectport=$port connectaddress=$wslIP
    
    Write-Host "✓ Port $port forwarded to WSL ($wslIP:$port)" -ForegroundColor Green
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "Port forwarding setup complete!" -ForegroundColor Green
Write-Host "`nYou can now access the chat system from your mobile phone at:" -ForegroundColor Cyan
Write-Host "http://YOUR_WINDOWS_IP:3001" -ForegroundColor Yellow

Write-Host "`nTo find your Windows IP, run: ipconfig" -ForegroundColor Gray

# Verify
Write-Host "`nVerifying port forwarding rules:" -ForegroundColor Cyan
netsh interface portproxy show v4tov4
