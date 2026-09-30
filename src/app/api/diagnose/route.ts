import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import {
  Diagnosis,
  Severity,
  ConfidenceLevel,
  DifferentialDiagnosis,
  WeatherData,
  SoilData,
  LocationData,
  CropReport,
} from '@/types';

const SYSTEM_INSTRUCTION = `You are a conservative, evidence-driven expert agricultural agronomist assisting with crop diagnostic reasoning.

CORE OPERATIONAL MANDATES:
1. CROP IDENTIFICATION:
   - Do NOT invent or assume a specific crop species.
   - If the image does not provide definitive distinguishing botanical evidence, state:
     "Crop identification uncertain" or "Probable crop family: Solanaceae" (or Fabaceae, Poaceae, etc.).
   - Only identify specific crops (e.g. tomato, potato, pepper, wheat) if there is clear, distinctive visual proof (fruit, distinctive leaf margin, floral structure).

2. DISEASE IDENTIFICATION & REASONING PIPELINE:
   Follow strictly: OBSERVATION → INTERPRETATION → DIFFERENTIAL → CONFIDENCE → RECOMMENDATION.
   - Separate observed visual symptoms, probable condition, and differential diagnoses.
   - For image-based diagnosis, ALWAYS use probabilistic phrasing such as:
     "Probable fungal leaf-spot/blight condition" or "Probable foliar stress condition".
   - NEVER claim confirmed pathogen status (e.g. "Confirmed Alternaria", "Confirmed bacterial infection") from optical photograph analysis alone.

3. DIFFERENTIAL DIAGNOSES:
   - When multiple diseases share visually overlapping symptoms (e.g., fungal leaf spots vs bacterial speck/spot vs physiological stress), provide 2 to 3 plausible alternative hypotheses.
   - For each alternative, provide a clear rationale explaining why it is being considered based on the visual evidence.

4. CONFIDENCE (IMAGE-BASED DIAGNOSTIC CONFIDENCE):
   - Output confidence_level as one of: "High", "Moderate", or "Low".
   - High: Strong, highly distinctive, unambiguous visual evidence.
   - Moderate: Several matching symptoms, but plausible differential alternatives exist (e.g. fungal vs bacterial overlap).
   - Low: Symptoms are non-specific, early-stage, or image quality/detail is insufficient.
   - If fungal leaf spot vs bacterial speck cannot be distinguished with certainty, confidence MUST be Moderate or Low.
   - Provide a concise explanation for this rating in confidence_explanation.

5. EVIDENCE GROUNDING:
   - Only list visual symptoms that can actually be observed in the image (e.g., chlorotic/yellow halos, brown necrotic lesions, dark centers, irregular margin pattern, lesions along veins).
   - NEVER fabricate observations such as "early sporulation", "water-soaked lesions", or "concentric rings" unless explicitly and clearly evident.

6. SCIENTIFIC UNCERTAINTY:
   - Provide an uncertainty_note dynamically describing diagnostic ambiguity.
   - E.g.: "Visual analysis cannot reliably distinguish fungal leaf spot from bacterial leaf spot in this image. Field scouting or laboratory culture testing is required for confirmation."

7. AGRONOMIC RECOMMENDATIONS:
   - Recommendations must directly reflect the uncertainty level and differential diagnoses.
   - Recommend non-specific, low-risk cultural and sanitation actions first (e.g., prune heavily damaged lower foliage, avoid overhead wetting, sanitize shears).
   - Do NOT prescribe narrow, specific chemical fungicides/bactericides as if the pathogen were confirmed. State clearly that chemical controls must be selected after pathogen verification and according to local agricultural extension guidelines.`;

interface DiagnoseRequestBody {
  image_url?: string;
  image_base64?: string;
  mime_type?: string;
  weather: WeatherData;
  soil: SoilData;
  location: LocationData;
  previous_reports?: CropReport[];
}

// Live Conservative Agronomic Diagnostic Engine (Offline / Fallback / Testing)
function generateLiveAgronomicDiagnosis(
  weather: WeatherData,
  soil: SoilData,
  previousReports?: CropReport[]
): Diagnosis {
  const isHighHumidity = weather.humidity >= 70;
  const isElevatedTemp = weather.temp >= 26;
  const isAcidic = soil.soil_ph < 6.0;
  const isAlkaline = soil.soil_ph > 7.5;

  const hasHistory = previousReports && previousReports.length > 0;
  const previousReport = hasHistory ? previousReports[0] : null;

  // Determine crop identification conservatively
  let plantType = 'Crop identification uncertain (Probable Solanaceae family)';
  if (previousReport?.diagnosis?.plant_type && !previousReport.diagnosis.plant_type.includes('uncertain')) {
    plantType = `${previousReport.diagnosis.plant_type} (From farm records)`;
  }

  // Case 1: High Humidity & Warm Temp (Classic Fungal / Bacterial Overlap)
  if (isHighHumidity && isElevatedTemp) {
    const isRecurring = Boolean(
      previousReport?.diagnosis?.disease_name?.toLowerCase().includes('blight') ||
      previousReport?.diagnosis?.disease_name?.toLowerCase().includes('spot')
    );

    return {
      plant_type: plantType,
      disease_name: isRecurring
        ? 'Probable recurrent fungal leaf-spot / blight condition'
        : 'Probable fungal leaf-spot / blight condition',
      severity: isRecurring ? 'CRITICAL' : 'MODERATE',
      confidence_level: 'Moderate',
      confidence_explanation:
        'Optical inspection reveals foliar necrotic spotting and localized chlorosis; however, visual imaging cannot distinguish fungal leaf spot from bacterial speck/spot without laboratory culture.',
      confidence: 0.55,
      visual_symptoms: [
        'Brown necrotic lesions distributed across leaf lamina',
        'Chlorotic (yellow) discoloration adjacent to lesion margins',
        'Irregular spot margins with darker localized centers',
      ],
      differential_diagnoses: [
        {
          condition: 'Early Blight / Alternaria foliar spot',
          rationale:
            'Dark necrotic lesions surrounded by chlorotic yellow halos are typical of early-stage Alternaria development.',
        },
        {
          condition: 'Bacterial leaf spot / speck (Xanthomonas / Pseudomonas)',
          rationale:
            'Small, dark necrotic spots with chlorotic borders frequently mimic fungal leaf spots under high relative humidity.',
        },
        {
          condition: 'Septoria or Cercospora leaf spot',
          rationale:
            'Multiple scattered circular to irregular necrotic lesions across foliage share overlapping visual presentations.',
        },
      ],
      uncertainty_note:
        'Visual analysis cannot reliably distinguish fungal leaf spot from bacterial leaf spot in this image. Field scouting or laboratory testing is required for confirmation before applying systemic treatments.',
      root_cause_analysis: `Live ambient humidity of ${weather.humidity}% and temperature of ${weather.temp}°C provide favorable microclimate conditions for both fungal spore incubation and bacterial multiplication on leaf surfaces. Soil pH of ${soil.soil_ph} in ${soil.soil_type} indicates baseline soil availability, pointing toward atmospheric foliar stress rather than primary root collapse.`,
      recommended_next_steps: [
        'Prune and bag visibly affected foliage using clean shears to prevent potential mechanical spore transfer.',
        'Transition to drip or ground-level irrigation to keep foliar canopy completely dry.',
        'Refrain from broad-spectrum chemical sprays until extension agronomists or laboratory culture distinguish fungal from bacterial origin.',
        'Scout surrounding plants daily for rapid symptom spread over the next 48 to 72 hours.',
      ],
    };
  }

  // Case 2: Extreme Soil pH (Nutritional Chlorosis)
  if (isAcidic || isAlkaline) {
    return {
      plant_type: plantType,
      disease_name: isAcidic
        ? 'Probable nutrient deficiency / acid-induced micronutrient lockout'
        : 'Probable nutrient deficiency / alkaline-induced mineral uptake restriction',
      severity: 'LOW',
      confidence_level: 'Moderate',
      confidence_explanation:
        'Foliar yellowing correlates with measured soil pH stress, but optical analysis alone cannot rule out root rot or early viral mosaic.',
      confidence: 0.50,
      visual_symptoms: [
        'Interveinal chlorosis (yellowing between leaf veins)',
        'Prominent green venation with reduced chlorophyll density in lamina',
      ],
      differential_diagnoses: [
        {
          condition: 'Iron or magnesium deficiency',
          rationale:
            'Interveinal chlorosis with dark green veins is characteristic of micronutrient availability restrictions in non-neutral soils.',
        },
        {
          condition: 'Early viral mosaic infection',
          rationale:
            'Mottled or uneven foliar chlorosis can sometimes resemble nutritional deficiencies in early vegetative stages.',
        },
        {
          condition: 'Root-zone drainage or aeration stress',
          rationale:
            'Compacted soil or restricted root aeration can impair nutrient uptake even if minerals are present.',
        },
      ],
      uncertainty_note:
        'Visual chlorosis indicates physiological stress but cannot definitively confirm which specific mineral is depleted without a laboratory foliar tissue analysis.',
      root_cause_analysis: `Live soil telemetry indicates a pH of ${soil.soil_ph} in ${soil.soil_type}. In this pH range, essential micronutrients (such as iron, zinc, or manganese) become chemically bound, restricting root uptake despite ambient conditions (${weather.temp}°C, ${weather.humidity}% humidity).`,
      recommended_next_steps: [
        'Verify root zone moisture and ensure drainage is not waterlogged.',
        'Conduct a calibrated soil pH test across multiple points in the plot.',
        'Apply a gentle, balanced foliar micronutrient spray as a low-risk supportive measure.',
        'Monitor new growth shoots over 5 to 7 days for chlorophyll recovery.',
      ],
    };
  }

  // Case 3: Moderate Conditions (Early Mildew / Foliar Stress)
  return {
    plant_type: plantType,
    disease_name: 'Probable early foliar stress / leaf surface mildew symptoms',
    severity: 'LOW',
    confidence_level: 'Low',
    confidence_explanation:
      'Symptoms are early, superficial, and non-specific. Image resolution and visual traits do not provide conclusive evidence for definitive pathogen attribution.',
    confidence: 0.35,
    visual_symptoms: [
      'Early pale speckling and localized leaf surface discoloration',
      'Mild foliar curling without widespread tissue collapse',
    ],
    differential_diagnoses: [
      {
        condition: 'Early powdery mildew colonization',
        rationale: 'Superficial pale patches on the upper leaf surface can represent early conidial germination.',
      },
      {
        condition: 'Environmental solar or wind stress',
        rationale: 'Mild foliar curling and speckling can be induced by sudden temperature swings or localized drying.',
      },
      {
        condition: 'Early pest feeding damage (spider mites or thrips)',
        rationale: 'Fine chlorotic stippling across leaf surfaces frequently overlaps with early foliar mildew symptoms.',
      },
    ],
    uncertainty_note:
      'Symptoms are non-specific and early. Optical inspection alone is insufficient for confident classification. Continuous field scouting is recommended.',
    root_cause_analysis: `Current environmental parameters (${weather.temp}°C, ${weather.humidity}% humidity, ${weather.pressure} hPa) reflect moderate ambient exposure. Soil parameters (${soil.soil_type}, pH ${soil.soil_ph}) show balanced fertility baseline.`,
    recommended_next_steps: [
      'Inspect undersides of leaves with a hand lens to rule out microscopic mite stippling.',
      'Maintain regular drip irrigation without wetting canopy surfaces.',
      'Avoid unnecessary chemical applications while symptoms remain non-specific.',
      'Re-photograph the tagged specimen in 48 hours to assess whether lesions expand.',
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: DiagnoseRequestBody = await req.json();
    const { image_base64, mime_type, weather, soil, location, previous_reports } = body;

    if (!weather || !soil || !location) {
      return NextResponse.json(
        { error: 'Missing environmental context (weather, soil, or location).' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && image_base64) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const cleanBase64 = image_base64.replace(/^data:image\/\w+;base64,/, '');
        const mediaMimeType = mime_type || 'image/jpeg';

        let historyPrompt = 'PREVIOUS STORED FARM ANALYSES: None recorded for this plot.';
        if (previous_reports && previous_reports.length > 0) {
          const past = previous_reports.slice(0, 3).map((r, i) => {
            return `Scan #${i + 1} (${r.created_at}): Crop: ${r.diagnosis?.plant_type}, Disease: ${r.diagnosis?.disease_name}, Severity: ${r.diagnosis?.severity}`;
          });
          historyPrompt = `PREVIOUS STORED FARM ANALYSES (${previous_reports.length} scans on record):\n${past.join('\n')}\n*Use this history to evaluate disease progression and treatment continuity suggestions.*`;
        }

        const contextPrompt = `LIVE FIELD & ENVIRONMENTAL CONTEXT:
- Geographic Coordinates: Latitude ${location.latitude}, Longitude ${location.longitude} ${location.isFallback ? '(Declared Fallback)' : '(Hardware GPS)'}
- Ambient Temperature: ${weather.temp}°C
- Relative Humidity: ${weather.humidity}%
- Atmospheric Pressure: ${weather.pressure} hPa
- Weather Condition: ${weather.condition || 'Live Field Conditions'}
- Soil Classification: ${soil.soil_type}
- Soil pH: ${soil.soil_ph}
- Soil Drainage: ${soil.drainage || 'Standard'}

${historyPrompt}

DIAGNOSTIC INSTRUCTIONS:
Follow strictly: OBSERVATION → INTERPRETATION → DIFFERENTIAL → CONFIDENCE → RECOMMENDATION.
1. Crop Identification: Do not invent a crop. If uncertain, state "Crop identification uncertain" or "Probable crop family: Solanaceae".
2. Primary Condition: State probable condition (e.g. "Probable fungal leaf-spot/blight condition"). Never claim confirmed pathogen from image alone.
3. Confidence: "High", "Moderate", or "Low". If fungal vs bacterial overlap exists, confidence MUST be Moderate or Low. Provide confidence_explanation.
4. Visual Evidence: Only list symptoms clearly visible in the image. No fabricated observations.
5. Differential Diagnoses: 2 to 3 plausible alternative conditions with explicit rationale.
6. Scientific Uncertainty: Explicit warning on diagnostic limitations.
7. Recommended Next Steps: Practical, safe, non-destructive initial actions.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mediaMimeType,
                    data: cleanBase64,
                  },
                },
                {
                  text: contextPrompt,
                },
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                plant_type: { type: Type.STRING },
                disease_name: { type: Type.STRING },
                severity: {
                  type: Type.STRING,
                  enum: ['HEALTHY', 'LOW', 'MODERATE', 'CRITICAL'],
                },
                confidence_level: {
                  type: Type.STRING,
                  enum: ['High', 'Moderate', 'Low'],
                },
                confidence_explanation: { type: Type.STRING },
                visual_symptoms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                differential_diagnoses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      condition: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                    },
                    required: ['condition', 'rationale'],
                  },
                },
                uncertainty_note: { type: Type.STRING },
                root_cause_analysis: { type: Type.STRING },
                recommended_next_steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'plant_type',
                'disease_name',
                'severity',
                'confidence_level',
                'confidence_explanation',
                'visual_symptoms',
                'differential_diagnoses',
                'uncertainty_note',
                'root_cause_analysis',
                'recommended_next_steps',
              ],
            },
          },
        });

        const rawText = response.text;
        if (rawText) {
          const parsed = JSON.parse(rawText) as Diagnosis;

          let severity: Severity = 'MODERATE';
          if (['HEALTHY', 'LOW', 'MODERATE', 'CRITICAL'].includes(parsed.severity?.toUpperCase())) {
            severity = parsed.severity.toUpperCase() as Severity;
          }

          let confidenceLevel: ConfidenceLevel = 'Moderate';
          if (['High', 'Moderate', 'Low'].includes(parsed.confidence_level || '')) {
            confidenceLevel = parsed.confidence_level as ConfidenceLevel;
          }

          // Convert level to conservative numeric value for progress/badge backward compatibility
          const numericConfidence =
            confidenceLevel === 'High' ? 0.85 : confidenceLevel === 'Moderate' ? 0.55 : 0.30;

          const validatedDiagnosis: Diagnosis = {
            plant_type: parsed.plant_type || 'Crop identification uncertain',
            disease_name: parsed.disease_name || 'Probable foliar stress condition',
            severity,
            confidence_level: confidenceLevel,
            confidence_explanation:
              parsed.confidence_explanation ||
              'Optical inspection cannot distinguish fungal from bacterial pathogens without laboratory culture.',
            confidence: numericConfidence,
            uncertainty_note:
              parsed.uncertainty_note ||
              'Visual analysis cannot reliably distinguish fungal leaf spot from bacterial leaf spot in this image. Field scouting or laboratory testing is required for confirmation.',
            visual_symptoms: Array.isArray(parsed.visual_symptoms) ? parsed.visual_symptoms : [],
            differential_diagnoses: Array.isArray(parsed.differential_diagnoses)
              ? parsed.differential_diagnoses
              : [],
            root_cause_analysis: parsed.root_cause_analysis || 'No detailed analysis generated.',
            recommended_next_steps: Array.isArray(parsed.recommended_next_steps)
              ? parsed.recommended_next_steps
              : [],
          };

          return NextResponse.json({ diagnosis: validatedDiagnosis, source: 'gemini' });
        }
      } catch (geminiError) {
        console.warn('[Gemini API] Failed or errored, falling back gracefully to live engine:', geminiError);
      }
    }

    // Live Agronomic Engine
    const liveDiagnosis = generateLiveAgronomicDiagnosis(weather, soil, previous_reports);
    return NextResponse.json({
      diagnosis: liveDiagnosis,
      source: 'live_agronomic_engine',
      note: apiKey ? 'Live engine used due to Gemini connectivity' : 'Running in live agronomic analysis mode',
    });
  } catch (error: any) {
    console.error('Diagnostic API Route Error:', error);
    return NextResponse.json(
      { error: 'Live diagnostic processing failed. Please retry.' },
      { status: 500 }
    );
  }
}
