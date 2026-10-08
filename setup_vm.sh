#!/bin/bash
# Automation Script for Proxmox Linux VM Setup

echo "==> Configuring Custom SSH Access..."
# Create Analyst User for Blue Team -> Credentials: analyst/blue_team_rocks
if ! id "analyst" &>/dev/null; then
    useradd -m -s /bin/bash analyst
    echo "analyst:blue_team_rocks" | chpasswd
fi

# Change SSH Port to custom 2275
sed -i 's/#Port 22/Port 2275/g' /etc/ssh/sshd_config
sed -i 's/Port 22/Port 2275/g' /etc/ssh/sshd_config
systemctl restart sshd

echo "==> Setting up Log Directories..."
mkdir -p /opt/admin/logs
chown -R analyst:analyst /opt/admin/logs

echo "==> Deploying Cyber Range Environment via Docker Compose..."
docker-compose up -d

echo "==> Injecting Telemetry Mock Logs..."
python3 log_injector.py

echo "==> Setup Complete! Vulnerable app on port 3075, SSH analyst on port 2275."
