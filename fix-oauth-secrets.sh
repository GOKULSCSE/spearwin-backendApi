#!/bin/bash
# Script to replace hardcoded OAuth2 credentials in email.service.ts

FILE="src/email/email.service.ts"

if [ ! -f "$FILE" ]; then
    exit 0
fi

# Create a temporary file with the fixed OAuth2 configuration
python3 << 'PYTHON_SCRIPT'
import re
import sys

file_path = "src/email/email.service.ts"

try:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Pattern to match the OAuth2 auth block with hardcoded credentials
    pattern = r'auth:\s*\{\s*type:\s*"OAuth2",\s*user:\s*mailUser,\s*//\s*pass:\s*mailPass,\s*clientId:\s*"[^"]+",\s*clientSecret:\s*"[^"]+",\s*refreshToken:\s*"[^"]+",\s*accessToken:"[^"]+",\s*\}'
    
    # Replacement with environment variables
    replacement = '''auth: useOAuth2 ? {
          type: "OAuth2",
          user: mailUser,
          clientId: oauth2ClientId,
          clientSecret: oauth2ClientSecret,
          ...(oauth2RefreshToken && { refreshToken: oauth2RefreshToken }),
          ...(oauth2AccessToken && { accessToken: oauth2AccessToken }),
        } : {
          user: mailUser,
          pass: mailPass,
        }'''
    
    # Check if the pattern exists (old hardcoded version)
    if re.search(pattern, content, re.DOTALL):
        # Replace the entire transporter config section
        # Find the section from "Build base transporter configuration" to the closing brace
        config_pattern = r'(// Build base transporter configuration.*?auth:\s*\{\s*type:\s*"OAuth2",\s*user:\s*mailUser,\s*//\s*pass:\s*mailPass,\s*clientId:\s*"[^"]+",\s*clientSecret:\s*"[^"]+",\s*refreshToken:\s*"[^"]+",\s*accessToken:"[^"]+",\s*\},)'
        
        # More comprehensive replacement
        new_config = '''// Check for OAuth2 credentials (optional, for Office365)
      const oauth2ClientId = process.env.SMTP_OAUTH2_CLIENT_ID || process.env.MAIL_OAUTH2_CLIENT_ID || process.env.EMAIL_OAUTH2_CLIENT_ID;
      const oauth2ClientSecret = process.env.SMTP_OAUTH2_CLIENT_SECRET || process.env.MAIL_OAUTH2_CLIENT_SECRET || process.env.EMAIL_OAUTH2_CLIENT_SECRET;
      const oauth2RefreshToken = process.env.SMTP_OAUTH2_REFRESH_TOKEN || process.env.MAIL_OAUTH2_REFRESH_TOKEN || process.env.EMAIL_OAUTH2_REFRESH_TOKEN;
      const oauth2AccessToken = process.env.SMTP_OAUTH2_ACCESS_TOKEN || process.env.MAIL_OAUTH2_ACCESS_TOKEN || process.env.EMAIL_OAUTH2_ACCESS_TOKEN;

      // Determine authentication method
      const useOAuth2 = isOutlook && oauth2ClientId && oauth2ClientSecret && (oauth2RefreshToken || oauth2AccessToken;

      // Build base transporter configuration
      const transporterConfig: any = {
        host: mailHost,
        port: parseInt(mailPort),
        secure: mailSecure === 'true', // true for 465, false for other ports
        auth: useOAuth2 ? {
          type: "OAuth2",
          user: mailUser,
          clientId: oauth2ClientId,
          clientSecret: oauth2ClientSecret,
          ...(oauth2RefreshToken && { refreshToken: oauth2RefreshToken }),
          ...(oauth2AccessToken && { accessToken: oauth2AccessToken }),
        } : {
          user: mailUser,
          pass: mailPass,
        },
      };'''
        
        # Simple approach: just replace the hardcoded values
        content = re.sub(r'clientId:\s*"[^"]+"', 'clientId: process.env.SMTP_OAUTH2_CLIENT_ID || ""', content)
        content = re.sub(r'clientSecret:\s*"[^"]+"', 'clientSecret: process.env.SMTP_OAUTH2_CLIENT_SECRET || ""', content)
        content = re.sub(r'refreshToken:\s*"[^"]+"', 'refreshToken: process.env.SMTP_OAUTH2_REFRESH_TOKEN || ""', content)
        content = re.sub(r'accessToken:"[^"]+"', 'accessToken: process.env.SMTP_OAUTH2_ACCESS_TOKEN || ""', content)
        
        with open(file_path, 'w') as f:
            f.write(content)
        
        sys.exit(0)
    else:
        # File doesn't have hardcoded secrets, exit
        sys.exit(0)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON_SCRIPT

