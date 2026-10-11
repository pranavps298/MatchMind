# MatchMind AI

An interactive live-cricket companion prototype for the Dream11 Forward Deployed Engineer Intern assignment.

## Run locally

Open `index.html` in a browser, or serve this folder with any static-file server.

## Demo highlights

- Evidence-based match momentum
- Fan-friendly explanations for key moments
- Natural-language match questions
- Simulated next-ball updates for a repeatable live demo

The current chat response layer is deliberately deterministic and grounded in the displayed score state, making the prototype reliable without credentials. Its `getAnswer()` function is the seam to replace with an OpenAI Responses API server route for production.

## Deployment

The included `vercel.json` deploys MatchMind as a static Vercel site; no server process or environment variables are required.

