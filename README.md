# CULTIVO — AI-Powered Agricultural Diagnostics & Decision-Support Platform

> **Capture → Locate → Understand Environment → Analyze Crop → Diagnose → Explain → Recommend → Escalate to Human Expert → Continuously Update**

Cultivo is a production-grade web application prototype for intelligent agricultural diagnostics and decision support. It combines computer vision, generative AI, geolocation, microclimate weather telemetry, soil intelligence, and real-time cloud synchronization between farmers and certified human agronomists.

---

## 🌟 Key Features

1. **Farmer Field Instrument**:
   - **One-Tap Diagnostic CTA**: Mobile-first interface with large touch targets (44×44px minimum) designed for direct sunlight outdoor readability.
   - **Hardware Camera & File Capture**: Browser-native `<input type="file" accept="image/*" capture="environment" />` with client-side canvas compression (1600px max, 0.85 quality) to conserve rural cellular bandwidth.
   - **Privacy Consent Protocol**: Explicit hardware permission modal with mandatory non-sale privacy guarantees and explanation of location, camera, and storage usage.
   - **Parallel Data Ingestion**: Concurrently uploads specimen imagery while acquiring device GPS (with graceful development fallback to Coimbatore Agro-Ecological Belt `11.0168, 76.9558`), OpenWeather Agro microclimate telemetry (temperature, relative humidity, pressure), and ISRIC SoilGrids profile (soil classification, pH, drainage).
   - **Transparent Diagnostic Pipeline**: Real-time step-by-step progress checklist (Crop captured → Image uploaded → Location detected → Weather retrieved → Soil retrieved → AI analyzed → Action plan).
   - **Structured 5-Division Report**:
     - **Division 1 (Identity & Status)**: Identified crop, disease, dual severity indicator (text + visual), and report status.
     - **Division 2 (Environmental Telemetry)**: Temperature, relative humidity, atmospheric pressure, soil classification, and soil pH.
     - **Division 3 (AI Agronomic Explanation)**: Plain-language diagnostic narrative, visual symptom checklist, root-cause environmental correlation, and scientific uncertainty disclaimers.
     - **Division 4 (Action Plan)**: Sequential execution steps with categorized tabs for Organic Solutions, Targeted Treatments, Preventive Actions, and Field Monitoring.
     - **Division 5 (Human Escalation)**: "Request Expert Review" button transitioning report status `AI_ANALYZED` → `PENDING_EXPERT`.
     - **Expert Review Priority**: When an agricultural expert submits a review, the **EXPERT AGRONOMIST NOTE** is prominently displayed **ABOVE** the AI recommendation.

2. **Agricultural Expert Portal**:
   - **Real-Time Pending Queue**: Filtered and sorted by submission recency.
   - **Clinical Verification Screen**: Side-by-side inspection of high-resolution crop imagery, environmental telemetry at capture, and baseline AI suggestions.
   - **Clinical Prescriptions**: Structured assessment and recommendation inputs with one-click standard agronomic finding templates.
   - **Live Cloud Synchronization**: Submitting a review immediately updates the farmer's report via Firestore `onSnapshot` real-time listeners without requiring manual page reload.

---

## 🎨 Earthical Design System

Cultivo adheres strictly to the **Earthical Palette**:

- `earth-bg`: `#F9F6F0` (warm natural cream)
- `earth-surface`: `#FFFFFF`
- `earth-primary`: `#2E7D32` (deep crop green)
- `earth-text`: `#4E342E` (rich soil brown)
- `earth-accent-sun`: `#F57C00` (harvest amber)
- `earth-accent-leaf`: `#81C784` (sprout green)
- `earth-danger`: `#D32F2F`
- `earth-warning`: `#FFA000`
- `earth-success`: `#388E3C`
- `earth-muted`: `#795548`
- `earth-border`: `#E0D7C6`
- `earth-shadow`: `0 4px 20px rgba(139, 115, 85, 0.08)`

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **AI Diagnostics**: Google Gemini (`@google/genai` official SDK) with fallback agronomic diagnostic engine.
- **Database & Live Sync**: Firebase Firestore with `onSnapshot` real-time listeners (and reactive local fallback for zero-configuration testing).
- **Authentication**: Firebase Auth (Google Sign-In + Provider-Agnostic Phone OTP flow).
- **File Storage**: Firebase Storage with client-side image compression.
- **Weather Service**: `WeatherService` interface supporting `MockWeatherService` and `OpenWeatherService`.
- **Soil Service**: `SoilService` interface supporting `MockSoilService` and `ISRICSoilService`.
- **Security Rules**: Production-grade `firestore.rules` and `storage.rules`.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.local.example` to `.env.local` and add your API keys:

```env
# Firebase Configuration (Optional for prototype mode, required for cloud persistence)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server-Side Only Secrets
GEMINI_API_KEY=
OPENWEATHER_API_KEY=
NEXT_PUBLIC_USE_ISRIC=false
```

*Note: If Firebase or Gemini credentials are not supplied, Cultivo seamlessly runs in full local agronomic prototype mode with real-time reactive event listeners, allowing immediate full-flow testing!*

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your mobile browser or desktop browser.

### 4. Build for Production

```bash
npm run build
npm start
```
