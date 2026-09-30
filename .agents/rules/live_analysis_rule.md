# CULTIVO MANDATORY ARCHITECTURAL RULE: LIVE ANALYSIS & HISTORICAL SUGGESTIONS

## RULE DIRECTIVE
**No prestored data, only using live analysis, but you can store previous analysis data and give suggestions.**

## Operational Implementation
1. **Zero Prestored / Preseeded Data**:
   - The platform MUST NOT bundle or preload fake dummy reports, mocked sample crops, or hardcoded diagnosis records on startup.
   - When a user opens Cultivo for the first time, report history starts clean (0 reports).
   - The camera workflow MUST NOT offer pre-stored diagnosed mock photos; it MUST operate on live camera input or user-provided field photographs.

2. **Strict Live Analysis**:
   - Every diagnosis MUST be computed in real-time using live inputs:
     - The live specimen photograph captured or provided by the user.
     - Live location coordinates (or explicitly declared user fallback).
     - Live microclimate weather telemetry (temperature, relative humidity, pressure).
     - Live soil data (pH, classification, drainage).
   - The diagnostic engine (Gemini AI or agronomic inference) analyzes the live image pixels and environmental metrics dynamically rather than returning static canned templates.

3. **Historical Analysis Storage & Intelligent Suggestions**:
   - Previous live analyses MUST be persisted in the user's field history (in Firestore and secure local device storage).
   - When new live scans are conducted, the system MUST retrieve previous analysis data for that plot/crop to generate live historical intelligence:
     - **Pathogen Recurrence Tracking**: Detect if the same pathogen or disease has recurred in the plot within days or weeks.
     - **Disease Trajectory & Severity Trend**: Compare current severity against past records (`improving`, `deteriorating`, `stable`, or `new_outbreak`).
     - **Treatment Continuity Suggestions**: Suggest whether past organic/chemical interventions worked or if escalation to a different mode of action / human agronomist is urgently required.
     - **Environmental Pattern Correlation**: Correlate recurring conditions (e.g. repeated humidity spikes > 80% leading to fungal sporulation).
