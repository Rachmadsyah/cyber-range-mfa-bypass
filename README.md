# Cyber Range Assessment Lab: Cookies Reuse & MFA Bypass

This repository contains the complete environment for the Practical Assessment at **PT Nauli Mula Data** for the **Cybersecurity Engineer (Lab & Range Developer)** role.

## 🏗️ 1. Infrastructure & Deployment Instructions
Target Environment: **Linux VM (Ubuntu/Debian) inside Proxmox VE**.

### Prerequisites
Ensure the Linux VM has `docker`, `docker-compose`, and `python3` installed.
Network Zone: Configured internal domain mapping to `feedback.admin.local`.

### Deployment Steps
1. Clone this repository onto the VM.
2. Make the setup script executable and run it as root:
   ```bash
   chmod +x setup_vm.sh
   sudo ./setup_vm.sh
   ```
3. The vulnerable web application will now be accessible via HTTP exactly on port `3075`.
4. Blue Team SSH access is configured on port `2275` (analyst / `blue_team_rocks`).

---

## 🔴 2. Red Team Walkthrough & Attack Path

### Phase 1: Reconnaissance
* **Tech Stack Identification:** Inspect the HTTP response headers. The backend exposes `X-Powered-By: SCENARI075{Node.js}`.
* **Hidden Paths:** Scan the site or read `robots.txt` to discover the restricted endpoint: `SCENARI075{/api/verify-mfa}` and the admin path `SCENARI075{/dashboard}`.
* **Source Code Clues:** Open the main HTML page source code (`GET /`). An ASCII art comment explicitly states: `SCENARI075{robots.txt}`.
* **Session Initialization:** Inspect the initial session cookies after visiting the page. You will find `SCENARI075{pre_mfa_session}` set to `SCENARI075{pending_mfa_verification}`.

### Phase 2: Defense Evasion (WAF & XSS)
* **Endpoint Analysis:** The feedback form submits requests exclusively using the `SCENARI075{POST}` method.
* **WAF Blocking:** Submitting a standard `<script>` alert payload returns a `SCENARI075{403}` Forbidden error.
* **WAF Bypass:** Bypass the filter by utilizing an HTML5 vector like `<svg onload=alert(1)>` (`SCENARI075{<svg>}`).
* **Cookie Obfuscation:** The WAF blocks direct keyword checks on cookies. Attackers must use JavaScript bracket notation: `SCENARI075{window['docu'+'ment']['coo'+'kie']}`.
* **Cookie Vulnerability:** The application sets `HttpOnly` to `SCENARI075{False}` on the pre-auth session, allowing JavaScript access.
* **Exfiltration:** Use the JavaScript `SCENARI075{fetch}` API to exfiltrate the stolen cookie token to an external listener.

### Phase 3: Initial Access & MFA Bypass
* **The Bypass:** Replaying the admin cookie directly against `SCENARI075{/dashboard}` will completely skip the `SCENARI075{/api/verify-mfa}` verification endpoint.
* **Session Prefix:** Administrative session cookies utilize the explicit prefix `SCENARI075{adm_sess}`.
* **Visual Confirmation:** Accessing `/dashboard` with the replayed session reflects the payload within an element with the class `SCENARI075{xss-payload}`.
* **Final Victory Flag:** Found deep inside the dashboard source: `SCENARI075{RED_C00k13_MFA_Byp4ss_0wn3d}`.

---

## 🔵 3. Blue Team Threat Hunting & Log Forensics

### Phase 1: Log Forensics
* **Log Location:** All Nginx-style access logs and error logs are stored at `SCENARI075{/opt/admin/logs}`.
* **Attacker Footprint:** Analyzing logs shows malicious requests originating from IP `SCENARI075{10.10.14.50}` using a `SCENARI075{Mozilla/5.0}` user-agent.
* **Dashboard Access:** Successful exploitation returned a status code of `SCENARI075{200}` at timestamp `SCENARI075{18:51:55}`.
* **Exfiltration Header:** The exfiltration payload was passed through the `X-Forwarded-For` header containing the Base64 value: `SCENARI075{UEhBT1RPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0}`.

### Phase 2: Threat Hunting
* **Baseline Traffic:** Legitimate administration traffic originates from the internal host `SCENARI075{192.168.1.100}`.
* **Subnet Mapping:** The attacker's IP belongs to the network block `SCENARI075{10.10.14.0/24}`.
* **WAF Alerts:** The `SCENARI075{/opt/admin/logs/error.log}` shows the very first blocked alert targeting a `SCENARI075{<script>}` tag at timestamp `SCENARI075{18:50:15}`.
* **Endpoint Verification:** Did the attacker's IP ever touch the MFA confirmation endpoint? `SCENARI075{No}`.

### Phase 3: Incident Response
* **Encoding Identification:** The exfiltration string uses standard `SCENARI075{Base64}` encoding with an exact character length of `SCENARI075{44}`.
* **Severity Markers:** High-risk token reuses are logged with a severity level of `SCENARI075{CRITICAL}`.
* **Anomaly Timestamps:** An error entry at `SCENARI075{18:53:10}` outputs the explicit warning text: `SCENARI075{Authentication bypass anomaly}`.
* **Final Blue Flag:** Decoding the Base64 payload yields: `SCENARI075{BLUE_LOG_HUnt3r_M4st3r}`.
