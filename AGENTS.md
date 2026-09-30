<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CULTIVO CORE APPLICATION RULE

> **"No prestored data , only using live analysis, but you can store previous analysis data and give suggestions"**

### Operational Guidelines:
1. **No Prestored Dummy Data**:
   - Do NOT load seeded/mock dummy reports into the initial database or localStorage.
   - Do NOT provide pre-stored diagnosed mock cards in the camera workflow. The system must strictly accept live user input (device camera or live photo upload).
2. **Pure Live Analysis**:
   - Compute diagnoses strictly in real time using the live uploaded specimen image and live environmental telemetry (weather, soil, GPS).
3. **Previous Analysis Storage & Longitudinal Suggestions**:
   - Persist previous analyses in the user's field history.
   - Cross-reference previous analysis records during subsequent scans to generate actionable historical trend suggestions (e.g. pathogen recurrence alerts, severity trajectories, and treatment continuity guidance).
