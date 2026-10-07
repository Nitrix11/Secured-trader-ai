# Nitrix AI Trader

Upload chart screenshots and get an AI-read entry, stop and targets, plus a short "in simple words" explanation.
React + Vite, installable as a PWA. Works with Claude (Anthropic), ChatGPT (OpenAI) or Google Gemini (has a free tier).

## How it is protected

- The Gemini API key and the app password are stored as environment variables on the server (`GEMINI_API_KEY`, `APP_PASSWORD`). They are not in the code and never reach the browser.
- The app asks for the password on first use. The server re-checks it on every request.
- The browser only talks to `/api/analyze` (`server/core.js`), which calls Gemini for you.

## Deploy (Netlify or Vercel, from a Git repo)

1. Push this folder to GitHub (the `.env` file is git-ignored).
2. Import the repo in Netlify or Vercel. Build command `npm run build`, output `dist`.
3. In the site settings add two environment variables: `GEMINI_API_KEY` and `APP_PASSWORD`.
4. Deploy. Uploading only the `dist/` folder will not work, because the server function must be deployed too.

Optional: set `GEMINI_MODEL` to change the model.

## Run it locally

```sh
npm install
npm i -g netlify-cli
cp .env.example .env   # fill in both values
netlify dev            # open the address it prints
```

`npm run dev` alone starts the page without the server function, so analysis will not work there.

## Notes

- Analyses and screenshots are saved on the device (IndexedDB).
- The AI can misread charts. Always check the levels yourself. Not financial advice.
