import os
import time

# Create log directory -> Flag: SCENARI075{/opt/admin/logs}
log_dir = "/opt/admin/logs"
os.makedirs(log_dir, exist_ok=True)

access_log_path = os.path.join(log_dir, "access.log")
error_log_path = os.path.join(log_dir, "error.log")

# Setup exact variables requested by Blue Team Path
attacker_ip = "10.10.14.50" # Flag: SCENARI075{10.10.14.50}
user_agent = "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0" # Flag: SCENARI075{Mozilla/5.0}
base64_header = "UEhBT1RPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0=" # Flag: SCENARI075{UEhBT1RPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0} Length: 44 (Flag: SCENARI075{44})
legit_ip = "192.168.1.100" # Flag: SCENARI075{192.168.1.100}

# 1. Generate access.log
access_logs = [
    # Baseline traffic
    f'{legit_ip} - - [09/Oct/2026:18:45:00 +0700] "GET /dashboard HTTP/1.1" 200 1432 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"\n',
    # Recon Phase
    f'{attacker_ip} - - [09/Oct/2026:18:48:10 +0700] "GET / HTTP/1.1" 200 854 "-" "{user_agent}"\n',
    f'{attacker_ip} - - [09/Oct/2026:18:49:02 +0700] "GET /robots.txt HTTP/1.1" 200 65 "-" "{user_agent}"\n',
    # XSS Exploit Attempts (WAF blocks)
    f'{attacker_ip} - - [09/Oct/2026:18:50:15 +0700] "POST /submit-feedback HTTP/1.1" 403 212 "-" "{user_agent}"\n',
    # Bypassed XSS Execution and session token replay at exactly 18:51:55 -> Flag: SCENARI075{200} & SCENARI075{18:51:55}
    f'{attacker_ip} - - [09/Oct/2026:18:51:55 +0700] "GET /dashboard HTTP/1.1" 200 2453 "-" "{user_agent}" "{base64_header}"\n'
]

with open(access_log_path, "w") as f:
    f.writelines(access_logs)

# 2. Generate error.log -> Flag: SCENARI075{/opt/admin/logs/error.log}
error_logs = [
    # WAF alert for script tag block at 18:50:15 -> Flag: SCENARI075{18:50:15} & SCENARI075{<script>}
    '2026/10/09 18:50:15 [warn] 124#124: *12 WAF BLOCKED: Malicious <script> payload detected from IP 10.10.14.50\n',
    # Cookie reuse anomaly at 18:53:10 -> Flag: SCENARI075{18:53:10}, SCENARI075{CRITICAL}, SCENARI075{Authentication bypass anomaly}
    '2026/10/09 18:53:10 [error] 124#124: *15 [CRITICAL] Authentication bypass anomaly: Session token adm_sess_replayed detected without passing MFA verification endpoint.\n'
]

with open(error_log_path, "w") as f:
    f.writelines(error_logs)

print("Mock logs injected successfully.")
