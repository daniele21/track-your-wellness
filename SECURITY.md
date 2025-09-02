# Security Guidelines

## Environment Variables and API Keys

### Setup
1. Copy `.env.example` to `.env.local`
2. Fill in your actual API keys in `.env.local`
3. Never commit `.env.local` or any file containing real API keys

### API Keys Used
- **GEMINI_API_KEY**: Google Gemini AI API key for meal analysis and workout generation

### Data Storage
- This application uses **IndexedDB** for local data storage
- No sensitive user data is transmitted to external servers except for AI analysis
- All personal data (meals, workouts, measurements) stays on the user's device

## Security Best Practices

### For Developers
1. Never hardcode API keys in source code
2. Always use environment variables for secrets
3. Regularly rotate API keys
4. Review dependencies for security vulnerabilities: `npm audit`
5. Keep dependencies updated: `npm update`

### For Deployment
1. Use environment variables in your hosting platform
2. Enable HTTPS for all deployments
3. Consider implementing Content Security Policy (CSP) headers
4. Regularly monitor for security updates

### API Key Security
- Gemini API keys should be restricted to specific domains in production
- Consider implementing rate limiting for API calls
- Monitor API usage for unusual patterns

## Incident Response
If you suspect an API key has been compromised:
1. Immediately regenerate the key in Google AI Studio
2. Update the key in your environment variables
3. Review access logs if available
4. Consider rotating any other potentially affected credentials
