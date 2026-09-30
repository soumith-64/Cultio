'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'mr' | 'bn' | 'es';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    brand_tagline: 'Soil • Crop • Knowledge',
    farmer_portal: 'Farmer Portal',
    expert_portal: 'Expert Portal',
    plots: 'Plots',
    ai_scan: 'AI Scan',
    sign_in: 'Sign In',
    sign_out: 'Sign Out',
    profile: 'Profile',
    live_cloud_sync: 'Live Cloud Sync',
    capture_specimen: 'Capture Plant Specimen',
    start_diagnosis: 'Start Live Diagnosis',
    crop_identification: 'CROP IDENTIFICATION',
    primary_condition: 'PRIMARY PROBABLE CONDITION',
    confidence: 'Confidence',
    high_confidence: 'High Confidence',
    moderate_confidence: 'Moderate Confidence',
    low_confidence: 'Low Confidence',
    symptoms: 'Observed Visual Symptoms',
    differential_diagnoses: 'Differential Diagnoses',
    root_cause: 'Root Cause & Environmental Trigger',
    next_steps: 'Recommended Next Steps',
    soil_telemetry: 'Live Soil Telemetry',
    weather_telemetry: 'Weather & Microclimate',
    gov_advisory: 'Government Agricultural Advisory',
    gov_guidelines: 'Official ICAR & CIBRC Approved Practice',
    farmer_notes_label: 'Describe your crop issue (in any language)',
    farmer_notes_placeholder: 'Describe symptoms here (e.g. पत्तों पर काले धब्बे दिख रहे हैं, aku meeda nalla machalu, etc.). The AI will translate and analyze.',
    escalate_to_expert: 'Escalate to Certified Agronomist',
    expert_terminal: 'Certified Agronomy Terminal',
    pending_cases: 'Pending Cases',
    prescribe_treatment: 'Prescribe Treatment',
    chemical_prescription: 'Chemical Prescription',
    biological_controls: 'Biological Controls',
  },
  hi: {
    brand_tagline: 'मिट्टी • फसल • ज्ञान',
    farmer_portal: 'किसान पोर्टल',
    expert_portal: 'कृषि विशेषज्ञ पोर्टल',
    plots: 'खेत / प्लॉट',
    ai_scan: 'एआई स्कैन',
    sign_in: 'साइन इन करें',
    sign_out: 'लॉग आउट',
    profile: 'प्रोफ़ाइल',
    live_cloud_sync: 'लाइव क्लाउड सिंक',
    capture_specimen: 'फसल की फोटो लें',
    start_diagnosis: 'लाइव जांच शुरू करें',
    crop_identification: 'फसल की पहचान',
    primary_condition: 'मुख्य संभावित रोग / स्थिति',
    confidence: 'सटीकता',
    high_confidence: 'उच्च सटीकता',
    moderate_confidence: 'मध्यम सटीकता',
    low_confidence: 'प्रारंभिक सटीकता',
    symptoms: 'देखे गए लक्षण',
    differential_diagnoses: 'वैकल्पिक संभावित रोग',
    root_cause: 'मूल कारण और मौसमी प्रभाव',
    next_steps: 'सलाह व तत्काल कदम',
    soil_telemetry: 'लाइव मिट्टी डेटा',
    weather_telemetry: 'मौसम और जलवायु',
    gov_advisory: 'सरकारी कृषि दिशानिर्देश',
    gov_guidelines: 'आईसीएआर और सीआईबीआरसी प्रमाणित सलाह',
    farmer_notes_label: 'अपनी फसल की समस्या लिखें (किसी भी भाषा में)',
    farmer_notes_placeholder: 'अपनी भाषा में बताएं (जैसे: पत्तों पर काले धब्बे दिख रहे हैं, 2 दिन से पीलापन है)। एआई अनुवाद करके जांच करेगा।',
    escalate_to_expert: 'कृषि वैज्ञानिक को भेजें',
    expert_terminal: 'प्रमाणित कृषि वैज्ञानिक कंसोल',
    pending_cases: 'समीक्षा हेतु लंबित मामले',
    prescribe_treatment: 'उपचार व दवा लिखें',
    chemical_prescription: 'रासायनिक उपचार',
    biological_controls: 'जैविक व प्राकृतिक नियंत्रण',
  },
  te: {
    brand_tagline: 'నేల • పంట • విజ్ఞానం',
    farmer_portal: 'రైతు పోర్టల్',
    expert_portal: 'వ్యవసాయ నిపుణుల పోర్టల్',
    plots: 'పొలాలు / ప్లాట్లు',
    ai_scan: 'ఏఐ స్కాన్',
    sign_in: 'లాగిన్ చేయండి',
    sign_out: 'లాగ్ అవుట్',
    profile: 'ప్రొఫైల్',
    live_cloud_sync: 'లైవ్ క్లౌడ్ సింక్',
    capture_specimen: 'పంట ఫోటో తీయండి',
    start_diagnosis: 'లైవ్ నిర్ధారణ ప్రారంభించండి',
    crop_identification: 'పంట గుర్తింపు',
    primary_condition: 'ప్రధాన తెగులు / లక్షణం',
    confidence: 'ఖచ్చితత్వం',
    high_confidence: 'అధిక ఖచ్చితత్వం',
    moderate_confidence: 'మధ్యస్థ ఖచ్చితత్వం',
    low_confidence: 'ప్రాథమిక ఖచ్చితత్వం',
    symptoms: 'గమనించిన లక్షణాలు',
    differential_diagnoses: 'ఇతర సంభావ్య తెగుళ్లు',
    root_cause: 'ప్రధాన కారణం & వాతావరణం',
    next_steps: 'సూచించిన చర్యలు',
    soil_telemetry: 'లైవ్ నేల సమాచారం',
    weather_telemetry: 'వాతావరణం',
    gov_advisory: 'ప్రభుత్వ వ్యవసాయ సలహా',
    gov_guidelines: 'ICAR & CIBRC ఆమోదిత పద్ధతులు',
    farmer_notes_label: 'మీ పంట సమస్యను వివరించండి (ఏ భాషలోనైనా)',
    farmer_notes_placeholder: 'మీ సమస్యను తెలుగులో రాయండి (ఉదా: ఆకులపై నల్లటి మచ్చలు వచ్చాయి). AI అనువదించి విశ్లేషిస్తుంది.',
    escalate_to_expert: 'వ్యవసాయ నిపుణుడికి పంపండి',
    expert_terminal: 'ధృవీకరించబడిన వ్యవసాయ నిపుణుల కన్సోల్',
    pending_cases: 'పరిశీలనలో ఉన్న కేసులు',
    prescribe_treatment: 'చికిత్స & మందులు సూచించండి',
    chemical_prescription: 'రసాయన నియంత్రణ',
    biological_controls: 'జీవ నియంత్రణ చర్యలు',
  },
  ta: {
    brand_tagline: 'மண் • பயிர் • அறிவு',
    farmer_portal: 'விவசாயி போர்டல்',
    expert_portal: 'விவசாய நிபுணர் போர்டல்',
    plots: 'நிலங்கள் / தோட்டங்கள்',
    ai_scan: 'AI ஸ்கேன்',
    sign_in: 'உள்நுழையவும்',
    sign_out: 'வெளியேறு',
    profile: 'சுயவிவரம்',
    live_cloud_sync: 'லைவ் கிளவுட் ஒத்திசைவு',
    capture_specimen: 'பயிர் புகைப்படம் எடுக்கவும்',
    start_diagnosis: 'நோய் கண்டறிதலைத் தொடங்கவும்',
    crop_identification: 'பயிர் அடையாளம்',
    primary_condition: 'முதன்மை நோய் / பாதிப்பு',
    confidence: 'துல்லியம்',
    high_confidence: 'அதிக துல்லியம்',
    moderate_confidence: 'மிதமான துல்லியம்',
    low_confidence: 'ஆரம்ப துல்லியம்',
    symptoms: 'கண்டறியப்பட்ட அறிகுறிகள்',
    differential_diagnoses: 'பிற சாத்தியமான நோய்கள்',
    root_cause: 'காரணம் மற்றும் தட்பவெப்பநிலை',
    next_steps: 'பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்',
    soil_telemetry: 'மண் பரிசோதனை தகவல்',
    weather_telemetry: 'வானிலை மற்றும் ஈரப்பதம்',
    gov_advisory: 'அரசு விவசாய ஆலோசனை',
    gov_guidelines: 'ICAR & CIBRC அங்கீகரிக்கப்பட்ட நடைமுறைகள்',
    farmer_notes_label: 'உங்கள் பயிர் பிரச்சனையை விவரிக்கவும் (எந்த மொழியிலும்)',
    farmer_notes_placeholder: 'இலையில் கரும்புள்ளிகள், மஞ்சள் நிற மாற்றம் போன்றவை பற்றி தமிழில் விவரிக்கவும்.',
    escalate_to_expert: 'விவசாய நிபுணருக்கு அனுப்பவும்',
    expert_terminal: 'விவசாய நிபுணர் கட்டுப்பாட்டு அறை',
    pending_cases: 'நிலுவையில் உள்ள வழக்குகள்',
    prescribe_treatment: 'மருந்து பரிந்துரைக்கவும்',
    chemical_prescription: 'ரசாயன தீர்வு',
    biological_controls: 'இயற்கை மற்றும் உயிரியல் கட்டுப்பாடு',
  },
  kn: {
    brand_tagline: 'ಮಣ್ಣು • ಬೆಳೆ • ಜ್ಞಾನ',
    farmer_portal: 'ರೈತ ಪೋರ್ಟಲ್',
    expert_portal: 'ಕೃಷಿ ತಜ್ಞರ ಪೋರ್ಟಲ್',
    plots: 'ಪ್ಲಾಟ್‌ಗಳು / ಹೊಲಗಳು',
    ai_scan: 'AI ಸ್ಕ್ಯಾನ್',
    sign_in: 'ಲಾಗಿನ್ ಮಾಡಿ',
    sign_out: 'ಲಾಗ್‌ಔಟ್',
    profile: 'ಪ್ರೊಫೈಲ್',
    live_cloud_sync: 'ಲೈವ್ ಕ್ಲೌಡ್ ಸಿಂಕ್',
    capture_specimen: 'ಬೆಳೆಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ',
    start_diagnosis: 'ಲೈವ್ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ',
    crop_identification: 'ಬೆಳೆ ಗುರುತಿಸುವಿಕೆ',
    primary_condition: 'ಮುಖ್ಯ ರೋಗ / ಪರಿಸ್ಥಿತಿ',
    confidence: 'ನಿಖರತೆ',
    high_confidence: 'ಉನ್ನತ ನಿಖರತೆ',
    moderate_confidence: 'ಮಧ್ಯಮ ನಿಖರತೆ',
    low_confidence: 'ಪ್ರಾಥಮಿಕ ನಿಖರತೆ',
    symptoms: 'ಕಂಡುಬಂದ ಲಕ್ಷಣಗಳು',
    differential_diagnoses: 'ಇತರ ಸಂಭವನೀಯ ರೋಗಗಳು',
    root_cause: 'ಮೂಲ ಕಾರಣ & ಹವಾಮಾನ',
    next_steps: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು',
    soil_telemetry: 'ಲೈವ್ ಮಣ್ಣಿನ ಮಾಹಿತಿ',
    weather_telemetry: 'ಹವಾಮಾನ',
    gov_advisory: 'ಸರ್ಕಾರಿ ಕೃಷಿ ಸಲಹೆ',
    gov_guidelines: 'ICAR ಮತ್ತು CIBRC ಅನುಮೋದಿತ ಪದ್ಧತಿ',
    farmer_notes_label: 'ನಿಮ್ಮ ಬೆಳೆಯ ಸಮಸ್ಯೆಯನ್ನು ಬರೆಯಿರಿ (ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ)',
    farmer_notes_placeholder: 'ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು, ಹಳದಿ ಬಣ್ಣ ಇತ್ಯಾದಿ ವಿವರಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ.',
    escalate_to_expert: 'ಕೃಷಿ ತಜ್ಞರಿಗೆ ಕಳುಹಿಸಿ',
    expert_terminal: 'ಕೃಷಿ ತಜ್ಞರ ಕನ್ಸೋಲ್',
    pending_cases: 'ಬಾಕಿ ಇರುವ ಪ್ರಕರಣಗಳು',
    prescribe_treatment: 'ಔಷಧಿ ಶಿಫಾರಸು ಮಾಡಿ',
    chemical_prescription: 'ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ',
    biological_controls: 'ಜೈವಿಕ ನಿಯಂತ್ರಣ',
  },
  mr: {
    brand_tagline: 'माती • पीक • ज्ञान',
    farmer_portal: 'शेतकरी पोर्टल',
    expert_portal: 'कृषी तज्ज्ञ पोर्टल',
    plots: 'शेती / प्लॉट्स',
    ai_scan: 'एआय स्कॅन',
    sign_in: 'साइन इन करा',
    sign_out: 'लॉग आऊट',
    profile: 'प्रोफाइल',
    live_cloud_sync: 'लाईव्ह क्लाउड सिंक',
    capture_specimen: 'पिकाचा फोटो काढा',
    start_diagnosis: 'लाईव्ह तपासणी सुरू करा',
    crop_identification: 'पीक ओळख',
    primary_condition: 'मुख्य संभाव्य रोग / समस्या',
    confidence: 'अचूकता',
    high_confidence: 'उच्च अचूकता',
    moderate_confidence: 'मध्यम अचूकता',
    low_confidence: 'प्राथमिक अचूकता',
    symptoms: 'दिसून आलेली लक्षणे',
    differential_diagnoses: 'इतर संभाव्य रोग',
    root_cause: 'मूळ कारण व हवामान प्रभाव',
    next_steps: 'उपाययोजना व पुढील पावले',
    soil_telemetry: 'मातीचे थेट विश्लेषण',
    weather_telemetry: 'हवामान व आर्द्रता',
    gov_advisory: 'शासकीय कृषी सल्ला',
    gov_guidelines: 'ICAR व CIBRC प्रमाणित शिफारसी',
    farmer_notes_label: 'तुमच्या पिकाची समस्या लिहा (कोणत्याही भाषेत)',
    farmer_notes_placeholder: 'पानांवर काळे डाग, पिवळेपणा याबद्दल मराठीत लिहा. एआय भाषांतर करून विश्लेषण करेल.',
    escalate_to_expert: 'कृषी तज्ज्ञांकडे पाठवा',
    expert_terminal: 'कृषी तज्ज्ञ कन्सोल',
    pending_cases: 'प्रलंबित प्रकरणे',
    prescribe_treatment: 'उपचार व औषध सुचवा',
    chemical_prescription: 'रासायनिक फवारणी',
    biological_controls: 'जैविक व नैसर्गिक उपाय',
  },
  bn: {
    brand_tagline: 'মাটি • ফসল • জ্ঞান',
    farmer_portal: 'কৃষক পোর্টাল',
    expert_portal: 'কৃষি বিশেষজ্ঞ পোর্টাল',
    plots: 'জমি / প্লট',
    ai_scan: 'এআই স্ক্যান',
    sign_in: 'সাইন ইন করুন',
    sign_out: 'লগ আউট',
    profile: 'প্রোফাইল',
    live_cloud_sync: 'লাইভ ক্লাউড সিঙ্ক',
    capture_specimen: 'ফসলের ছবি তুলুন',
    start_diagnosis: 'লাইভ রোগ নির্ণয় শুরু করুন',
    crop_identification: 'ফসল শনাক্তকরণ',
    primary_condition: 'প্রধান সম্ভাব্য রোগ / অবস্থা',
    confidence: 'নির্ভুলতা',
    high_confidence: 'উচ্চ নির্ভুলতা',
    moderate_confidence: 'মাঝারি নির্ভুলতা',
    low_confidence: 'প্রাথমিক নির্ভুলতা',
    symptoms: 'পর্যবেক্ষিত লক্ষণসমূহ',
    differential_diagnoses: 'অন্যান্য সম্ভাব্য রোগ',
    root_cause: 'মূল কারণ এবং আবহাওয়া',
    next_steps: 'প্রস্তাবিত পদক্ষেপ',
    soil_telemetry: 'মাটির লাইভ তথ্য',
    weather_telemetry: 'আবহাওয়া ও আর্দ্রতা',
    gov_advisory: 'সরকারি কৃষি পরামর্শ',
    gov_guidelines: 'ICAR ও CIBRC অনুমোদিত নির্দেশিকা',
    farmer_notes_label: 'আপনার ফসলের সমস্যা লিখুন (যেকোনো ভাষায়)',
    farmer_notes_placeholder: 'পাতায় কালো দাগ বা হলুদ ভাব সম্পর্কে বাংলায় লিখুন। এআই অনুবাদ করে পরীক্ষা করবে।',
    escalate_to_expert: 'কৃষি বিশেষজ্ঞের কাছে পাঠান',
    expert_terminal: 'কৃষি বিশেষজ্ঞ কনসোল',
    pending_cases: 'পর্যালোচনাধীন কেস',
    prescribe_treatment: 'ঔষধ ও চিকিৎসা প্রেসক্রাইব করুন',
    chemical_prescription: 'রাসায়নিক চিকিৎসা',
    biological_controls: 'জৈব ও প্রাকৃতিক নিয়ন্ত্রণ',
  },
  es: {
    brand_tagline: 'Suelo • Cultivo • Conocimiento',
    farmer_portal: 'Portal del Agricultor',
    expert_portal: 'Portal del Agrónomo',
    plots: 'Parcelas',
    ai_scan: 'Escaneo IA',
    sign_in: 'Iniciar Sesión',
    sign_out: 'Cerrar Sesión',
    profile: 'Perfil',
    live_cloud_sync: 'Sincronización en la Nube',
    capture_specimen: 'Capturar Muestra Foliar',
    start_diagnosis: 'Iniciar Diagnóstico en Vivo',
    crop_identification: 'IDENTIFICACIÓN DEL CULTIVO',
    primary_condition: 'CONDICIÓN PROBABLE PRINCIPAL',
    confidence: 'Confianza',
    high_confidence: 'Alta Confianza',
    moderate_confidence: 'Confianza Moderada',
    low_confidence: 'Confianza Preliminar',
    symptoms: 'Síntomas Visuales Observados',
    differential_diagnoses: 'Diagnósticos Diferenciales',
    root_cause: 'Causa Raíz y Microclima',
    next_steps: 'Pasos Recomendados',
    soil_telemetry: 'Telemetría del Suelo en Vivo',
    weather_telemetry: 'Clima y Humedad',
    gov_advisory: 'Aviso Agrícola Gubernamental',
    gov_guidelines: 'Práctica Aprobada Oficial',
    farmer_notes_label: 'Describa el problema de su cultivo (en cualquier idioma)',
    farmer_notes_placeholder: 'Describa síntomas (ej. manchas negras en hojas, hojas amarillas). La IA traducirá y analizará.',
    escalate_to_expert: 'Escalar a Agrónomo Certificado',
    expert_terminal: 'Terminal de Agronomía Certificada',
    pending_cases: 'Casos Pendientes',
    prescribe_treatment: 'Recetar Tratamiento',
    chemical_prescription: 'Prescripción Química',
    biological_controls: 'Control Biológico',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'cultivo_app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY) as SupportedLanguage | null;
      if (stored && TRANSLATIONS[stored]) {
        setLanguageState(stored);
      }
    } catch (e) {
      console.warn('Language preference access warning:', e);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  };

  const t = (key: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
