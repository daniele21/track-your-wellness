<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1O-3Rq2Yg0OB1hW5gOz2SokqM_NJiMkQP

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. **Security Setup:**
   - Copy the environment template: `cp .env.example .env.local`
   - Get your Gemini API key from [Google AI Studio](https://ai.google.dev/tutorials/setup)
   - Add your API key to `.env.local`:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - **Important:** Never commit `.env.local` to version control

3. Run the app:
   ```bash
   npm run dev
   ```

## Security

This application prioritizes user privacy and security:
- All personal data is stored locally using IndexedDB
- No sensitive information is transmitted except for AI analysis
- API keys are handled securely through environment variables
- See [SECURITY.md](SECURITY.md) for detailed security guidelines
