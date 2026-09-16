import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// The key can be supplied per call, so players can paste their own in the lobby
// instead of the app needing one of its own. A server-side key is only used as a
// fallback; `false` keeps the plugin from demanding one at startup.
const serverApiKey =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || false;

export const ai = genkit({
  plugins: [googleAI({apiKey: serverApiKey})],
  model: 'googleai/gemini-3.6-flash',
});
