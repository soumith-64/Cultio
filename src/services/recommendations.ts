/**
 * CULTIVO — Recommendation Engine
 * Provides structured agronomic treatment & prevention action plans
 * Architecture is decoupled so it can later query Firestore RAG / Vector DB
 */

import { RecommendationPlan } from '@/types';

export interface IRecommendationService {
  getRecommendations(
    plantType: string,
    diseaseName: string,
    severity: string
  ): Promise<RecommendationPlan>;
}

// Local Agronomic Knowledge Repository (Extendable with RAG / Vector DB)
const KNOWLEDGE_CATALOG: Record<string, RecommendationPlan> = {
  'late blight': {
    organic_solutions: [
      'Apply copper hydroxide or Bordeaux mixture (1% solution) during early morning hours.',
      'Spray Bacillus subtilis bio-fungicide every 7-10 days on lower canopy foliage.',
      'Treat soil surface with bio-enriched compost tea to boost competing microbes.',
    ],
    chemical_solutions: [
      'Apply systemic fungicide containing Mancozeb (2 g/L) or Metalaxyl + Mancozeb (2.5 g/L).',
      'Follow a 14-day pre-harvest interval (PHI) and rotate modes of action to prevent resistance.',
    ],
    preventive_actions: [
      'Prune and destroy all heavily infected lower leaves; do not compost blighted tissue.',
      'Transition from overhead sprinklers to drip irrigation to keep leaf canopies dry.',
      'Increase planting space to 60 cm to improve microclimate ventilation.',
    ],
    monitoring_guidance: [
      'Inspect underside of leaves daily for white fuzzy sporulation, especially after evening dew.',
      'Monitor nearby solanaceous crops (potatoes, eggplants) for cross-contamination.',
    ],
    ordered_action_plan: [
      'Step 1: Immediately rogue out and bag severely infected leaves to halt spore spread.',
      'Step 2: Cease overhead spraying; ensure surface drip or trench watering only.',
      'Step 3: Apply the recommended protective bio-copper or systemic spray on remaining foliage.',
      'Step 4: Re-evaluate lesion boundaries in 72 hours and record disease progression.',
    ],
  },
  'leaf rust': {
    organic_solutions: [
      'Spray sulfur wettable powder (3 g/L) or neem seed kernel extract (NSKE 5%).',
      'Dust foliar canopy with potassium bicarbonate solution to alter leaf pH against fungi.',
    ],
    chemical_solutions: [
      'Apply Propiconazole 25% EC (1 mL/L) or Tebuconazole upon first sign of orange pustules.',
      'Wear protective gear during application; observe recommended safety withholding periods.',
    ],
    preventive_actions: [
      'Eliminate volunteer cereal weeds and alternate hosts surrounding field borders.',
      'Adopt resistant cultivar seed varieties in the subsequent planting cycle.',
      'Balance nitrogen fertilizer applications; excessive nitrogen softens leaf cuticles.',
    ],
    monitoring_guidance: [
      'Survey leaf collars and upper stems for raised orange-brown pustules every 48 hours.',
      'Log ambient humidity; spores germinate rapidly when leaf wetness exceeds 6 continuous hours.',
    ],
    ordered_action_plan: [
      'Step 1: Sanitize field tools and prune lower infected leaf sheaths.',
      'Step 2: Apply foliar organic sulfur or triazole treatment covering both leaf sides.',
      'Step 3: Reduce fertilizer nitrogen rates and supplement with soluble potassium.',
      'Step 4: Re-survey plot edges every 3 days for pustule drying and color darkening.',
    ],
  },
  'powdery mildew': {
    organic_solutions: [
      'Spray potassium silicate or baking soda spray (5g/L water with a few drops of vegetable oil).',
      'Foliar spray of diluted milk solution (1:9 ratio with water) on sunny mornings.',
      'Apply cold-pressed neem oil (5 mL/L) with emulsifier.',
    ],
    chemical_solutions: [
      'Apply Myclobutanil or Azoxystrobin following label concentration instructions.',
      'Alternate with Difenoconazole if infection persists past 10 days.',
    ],
    preventive_actions: [
      'Thin dense crop canopy to allow direct sunlight penetration through internal branches.',
      'Avoid high-nitrogen fertilizers that generate tender susceptible shoots.',
    ],
    monitoring_guidance: [
      'Check top surfaces of middle and upper leaves for talcum-powder-like white patches.',
      'Track warm, dry days followed by cool, humid nights which favor conidia release.',
    ],
    ordered_action_plan: [
      'Step 1: Mechanically thin crowded interior foliage to optimize sun exposure.',
      'Step 2: Spray potassium bicarbonate or neem formulation across all infected leaves.',
      'Step 3: Keep soil moisture consistent using mulch to reduce plant drought stress.',
      'Step 4: Monitor new shoot emergence for clear green leaves free of powdery residue.',
    ],
  },
  'nutrient deficiency': {
    organic_solutions: [
      'Drench root zone with well-aerated vermicompost leachate or fermented bio-slurry.',
      'Top-dress with decomposed farmyard manure (FYM) mixed with neem cake (4:1).',
      'Apply foliar seaweed extract (3 mL/L) for rapid chelated micronutrient uptake.',
    ],
    chemical_solutions: [
      'Foliar spray of 19:19:19 water-soluble NPK (5 g/L) or specific micronutrient mixture (zinc/iron).',
      'Apply agricultural gypsum or dolomitic lime if soil pH has locked out phosphorus.',
    ],
    preventive_actions: [
      'Conduct a laboratory comprehensive soil test every 2 seasons to calibrate fertility.',
      'Maintain soil organic carbon above 0.75% through green manuring crops.',
    ],
    monitoring_guidance: [
      'Observe leaf veins: interveinal chlorosis indicates iron/magnesium; uniform yellowing indicates nitrogen.',
      'Monitor new leaf growth versus older basal leaves for deficiency mobility.',
    ],
    ordered_action_plan: [
      'Step 1: Verify soil pH (adjust if below 6.0 or above 7.5 to unlock bound minerals).',
      'Step 2: Apply emergency foliar micronutrient spray for immediate cellular absorption.',
      'Step 3: Incorporate organic mulch and compost at the root drip line.',
      'Step 4: Compare chlorophyll intensity on newly emerging leaf nodes within 7 days.',
    ],
  },
  'healthy': {
    organic_solutions: [
      'Continue routine biological preventive sprays with Trichoderma viride or Pseudomonas fluorescens.',
      'Apply microbial compost tea monthly to maintain beneficial phyllosphere populations.',
    ],
    chemical_solutions: [
      'No synthetic chemical pesticide or fungicide intervention required.',
    ],
    preventive_actions: [
      'Maintain existing drip irrigation schedule matching crop evapotranspiration.',
      'Rotate crops with leguminous cover crops (sunn hemp, cowpea) after harvest.',
    ],
    monitoring_guidance: [
      'Maintain regular scouting schedule twice weekly for early detection of pest eggs.',
      'Record plant vigor, node spacing, and flowering rates.',
    ],
    ordered_action_plan: [
      'Step 1: Continue baseline soil moisture and mulch management.',
      'Step 2: Maintain regular weekly visual scouting along representative transects.',
      'Step 3: Protect beneficial predatory insects (ladybugs, spiders, hoverflies).',
      'Step 4: Keep records in Cultivo to track seasonal vigor benchmarks.',
    ],
  },
};

export class LocalRecommendationService implements IRecommendationService {
  async getRecommendations(
    plantType: string,
    diseaseName: string,
    severity: string
  ): Promise<RecommendationPlan> {
    // Latency simulation for decoupled retrieval
    await new Promise((resolve) => setTimeout(resolve, 350));

    const normalized = diseaseName.toLowerCase();
    
    // Find matching catalog entry
    let matchedKey = Object.keys(KNOWLEDGE_CATALOG).find((key) =>
      normalized.includes(key)
    );

    if (!matchedKey) {
      if (normalized.includes('rust')) matchedKey = 'leaf rust';
      else if (normalized.includes('blight') || normalized.includes('rot')) matchedKey = 'late blight';
      else if (normalized.includes('mildew') || normalized.includes('mold') || normalized.includes('fungal')) matchedKey = 'powdery mildew';
      else if (normalized.includes('deficien') || normalized.includes('chlorosis') || normalized.includes('yellowing')) matchedKey = 'nutrient deficiency';
      else if (normalized.includes('healthy') || normalized.includes('normal')) matchedKey = 'healthy';
    }

    if (matchedKey && KNOWLEDGE_CATALOG[matchedKey]) {
      return KNOWLEDGE_CATALOG[matchedKey];
    }

    // Default agronomic action plan
    return {
      organic_solutions: [
        `Isolate affected ${plantType} specimen and apply broad-spectrum botanical spray (Neem oil 5ml/L).`,
        'Incorporate bio-inoculants (Trichoderma harzianum) into root zone soil.',
      ],
      chemical_solutions: [
        'Consult local extension agronomist before applying synthetic treatments.',
        'Use targeted broad-spectrum protectant fungicide if pathogen progression accelerates.',
      ],
      preventive_actions: [
        'Sanitize shears and pruning tools with 70% isopropyl alcohol between plants.',
        'Avoid wetting foliar canopy during evening hours; maintain soil drainage.',
      ],
      monitoring_guidance: [
        'Scout 10 random plants along the row daily to estimate field incidence percentage.',
        'Photograph tagged plants at identical light angles to measure lesion expansion.',
      ],
      ordered_action_plan: [
        `Step 1: Prune visibly distressed foliage from ${plantType} using clean, sanitized shears.`,
        'Step 2: Adjust irrigation volume to prevent standing water around the root zone.',
        'Step 3: Apply preventive organic neem or copper-based bio-protectant.',
        'Step 4: Request Cultivo expert review if lesions spread past the lower foliage tier.',
      ],
    };
  }
}

let activeRecommendationService: IRecommendationService | null = null;

export function getRecommendationService(): IRecommendationService {
  if (!activeRecommendationService) {
    activeRecommendationService = new LocalRecommendationService();
  }
  return activeRecommendationService;
}
