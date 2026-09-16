# Sprint Derby

**Pick a random person with a horse race.** 🏇

[**Live demo → sprint-derby.vercel.app**](https://sprint-derby.vercel.app)

## What it's for

Someone has to run the sprint review report. Instead of a spinner, drawing
straws, or the same person volunteering every time, drop everyone's names in
and run a race. Each racer gets their own randomised speed curve, the horses
run a 400 m track, and whoever crosses the line first takes the task.

It works for anything you'd otherwise pick at random: who presents homework,
who runs standup, who gets the last conference ticket. It just happens to be
more fun to watch than a random number.

## How it works

1. Enter names as a comma-separated list (`Alice, Bob, Charlie`) — 2 to 8 racers.
2. Hit **Start Race** and watch the track.
3. The winner gets a trophy, confetti, and the job.

After the race you get a summary with each racer's finish time and min / max /
average speed, in case anyone wants to contest the result.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on [http://localhost:9002](http://localhost:9002).

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

## Optional: AI jockey names

**This is entirely optional. The app works fully without it.**

The only thing an AI key does is turn player names into fun jockey names in the
lobby. With no key, each racer's jockey name is just their own name, and
everything else — the race, the stats, the winner — behaves identically. If a
name fails to generate, it quietly falls back to the plain name too.

To use it, paste a [Google AI API key](https://aistudio.google.com/apikey) into
the **Google AI API Key** field in the lobby. Your key is used for that request
only; it isn't stored.

If you're self-hosting and want name generation to work without anyone pasting a
key, set `GOOGLE_API_KEY` (or `GEMINI_API_KEY`) in the environment and it's used
as the fallback.

Built with Next.js, TypeScript, Tailwind, shadcn/ui, and Genkit.
