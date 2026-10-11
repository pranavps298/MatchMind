# MatchMind AI

An interactive live-cricket companion prototype for the Dream11 Forward Deployed Engineer Intern assignment.

## Run locally

```powershell
npm run dev
```

Open `http://localhost:4173`.

## Demo highlights

- Evidence-based match momentum
- Fan-friendly explanations for key moments
- Natural-language match questions
- Simulated next-ball updates for a repeatable live demo

The current chat response layer is deliberately deterministic and grounded in the displayed score state, making the prototype reliable without credentials. Its `getAnswer()` function is the seam to replace with an OpenAI Responses API server route for production.

