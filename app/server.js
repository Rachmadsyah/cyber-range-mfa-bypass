const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3075;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Custom X-Powered-By Header -> Flag: SCENARI075{Node.js}
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'SCENARI075{Node.js}');
    next();
});

// Root route - Redirect or serve login/feedback
app.get('/', (req, res) => {
    // Issue pre-auth cookie -> Flag: SCENARI075{pre_mfa_session} & SCENARI075{pending_mfa_verification}
    // HttpOnly must be False -> Flag: SCENARI075{False}
    res.cookie('pre_mfa_session', 'SCENARI075{pending_mfa_verification}', { httpOnly: false });
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// robots.txt -> Flag: SCENARI075{/api/verify-mfa}
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: SCENARI075{/api/verify-mfa}");
});

// Rudimentary WAF Implementation
function customWAF(req, res, next) {
    const { feedback } = req.body;
    if (feedback) {
        // Block standard <script> payload -> Flag: SCENARI075{403} & SCENARI075{<script>}
        if (/<script[^>]*>([\s\S]*?)<\/script>/gi.test(feedback) || /script/i.test(feedback)) {
            return res.status(403).send('Forbidden: Malicious activity detected by WAF.');
        }
    }
    next();
}

// Feedback Submission Endpoint exclusively POST -> Flag: SCENARI075{POST}
app.post('/submit-feedback', customWAF, (req, res) => {
    const { feedback } = req.body;
    // In a real environment, this would be saved and viewed by the admin, causing XSS.
    // For simulation, we just echo or accept it.
    res.send('Feedback submitted successfully to admin.');
});

// Restricted Admin Area -> Flag: SCENARI075{/dashboard}
app.get('/dashboard', (req, res) => {
    const session = req.cookies.session_token || '';
    
    // MFA Bypass / Session Replay Vulnerability:
    // If a valid stolen admin cookie prefix is replayed, completely skip /api/verify-mfa
    // Flag: SCENARI075{/api/verify-mfa} & SCENARI075{adm_sess}
    if (session.startsWith('SCENARI075{adm_sess}')) {
        // Reflect XSS payload inside container with CSS class xss-payload -> Flag: SCENARI075{xss-payload}
        // Embed final victory flag deep inside -> Flag: SCENARI075{RED_C00k13_MFA_Byp4ss_0wn3d}
        const simulatedXSSPayload = "window['docu'+'ment']['coo'+'kie']"; // Example payload attacker used
        
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Admin Dashboard</title></head>
            <body>
                <h1>Welcome Admin</h1>
                <div class="xss-payload" style="display:none;">
                    Simulated Exfiltrated Execution: SCENARI075{window['docu'+'ment']['coo'+'kie']} using SCENARI075{fetch}
                </div>
                <p>System Flag: <strong>SCENARI075{RED_C00k13_MFA_Byp4ss_0wn3d}</strong></p>
            </body>
            </html>
        `);
    } else {
        return res.status(401).send('Unauthorized: MFA verification required.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
