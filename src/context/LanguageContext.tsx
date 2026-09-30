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
    crop_identification: 'Matched Crop & Botanical Species',
    primary_condition: 'Primary Diagnosed Foliar Condition',
    confidence: 'Diagnostic Confidence',
    high_confidence: 'High Confidence',
    moderate_confidence: 'Moderate Confidence',
    low_confidence: 'Initial Confidence',
    symptoms: 'Observed Visual Evidence',
    differential_diagnoses: 'Differential Diagnoses (Plausible Alternatives)',
    root_cause: 'Root Cause & Environmental Drivers',
    next_steps: 'Recommended Next Steps',
    soil_telemetry: 'Live Soil Telemetry & Horizon Data',
    weather_telemetry: 'Microclimatic Weather Data',
    gov_advisory: 'Official Government Agricultural Advisory',
    gov_guidelines: 'Official ICAR & CIBRC Approved Practice',
    farmer_notes_label: 'Describe Your Crop Issue (In Any Language)',
    farmer_notes_placeholder: 'Type in any language (Hindi, Telugu, Tamil, Marathi, Bengali, Spanish, English, etc.). AI translates live in real-time as you type or speak...',
    live_translation_badge: 'Live Real-Time Translation',
    translating_status: 'Translating in real-time...',
    speak_in_your_language: 'Speak (Voice Input)',
    listening_status: 'Listening... Speak in any language',
    field_guidelines_title: 'Field Photography Guidelines for Accurate Diagnostics:',
    guideline_focus: 'Focus on Lesions: Capture clear transition between healthy tissue and diseased margin.',
    guideline_light: 'Natural Daylight: Ensure bright, even lighting without heavy shadows.',
    guideline_steady: 'Hold Steady: Keep camera 15-25cm from leaf to avoid motion blur.',
    hero_title: 'Diagnose Crop Health in the Field',
    hero_subtitle: 'Capture a photograph of any leaf, stem, or fruit. Cultivo analyzes environmental soil & weather telemetry to pinpoint disease and give actionable treatment plans.',
    hero_badge: 'AI Field Instrument',
    scan_crop_cta: 'SCAN CROP',
    recent_diagnoses: 'Recent Field Diagnoses',
    no_reports_title: 'No Crop Diagnoses Yet',
    no_reports_desc: 'Tap "Scan Crop" above to capture your first crop specimen. Your complete diagnostic history will be recorded here.',
    immediate_action_plan: 'Immediate Action Plan',
    organic_solutions: 'Biological & Organic Solutions',
    chemical_treatments: 'Targeted Chemical Protectants',
    preventive_actions: 'Cultural & Preventive Actions',
    gov_standards_tab: 'Govt Agriculture Standards',
    field_monitoring: 'Ongoing Field Monitoring',
    view_full_report: 'View Full Diagnostic Report',
    back_to_dashboard: 'Back to Dashboard',
    print_report: 'Print Report',
    share_report: 'Share Report',
    escalate_to_expert: 'Escalate to Certified Agronomist',
    expert_terminal: 'Certified Agronomy Terminal',
    pending_cases: 'Pending Cases',
    prescribe_treatment: 'Prescribe Treatment',
    chemical_prescription: 'Chemical Prescription',
    biological_controls: 'Biological Controls',
    privacy_consent: 'Field Telemetry & Camera Consent',
    kisan_portal_link: 'Visit Kisan Suvidha Official Portal',
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
    crop_identification: 'पहचानी गई फसल और वैज्ञानिक नाम',
    primary_condition: 'मुख्य पहचानी गई बीमारी व लक्षण',
    confidence: 'सटीकता / विश्वास स्तर',
    high_confidence: 'उच्च सटीकता',
    moderate_confidence: 'मध्यम सटीकता',
    low_confidence: 'प्रारंभिक सटीकता',
    symptoms: 'पत्तियों पर देखे गए स्पष्ट लक्षण',
    differential_diagnoses: 'अन्य संभावित बीमारियां (वैकल्पिक जांच)',
    root_cause: 'मूल कारण और मौसमी/मिट्टी का प्रभाव',
    next_steps: 'तत्काल जरूरी कदम और सिफारिशें',
    soil_telemetry: 'लाइव मिट्टी विश्लेषण और पीएच डेटा',
    weather_telemetry: 'मौसम, तापमान और हवा में नमी',
    gov_advisory: 'शासकीय भारतीय कृषि अनुसंधान परिषद (ICAR) सलाह',
    gov_guidelines: 'ICAR और CIBRC द्वारा प्रमाणित मानक उपचार',
    farmer_notes_label: 'अपनी फसल की समस्या विस्तार से लिखें (किसी भी भाषा में)',
    farmer_notes_placeholder: 'हिंदी, तेलुगु, तमिल आदि किसी भी भाषा में लिखें। एआई तुरंत लाइव अनुवाद करके जांच में शामिल करेगा...',
    live_translation_badge: 'लाइव रियल-टाइम अनुवाद',
    translating_status: 'तुरंत अनुवाद किया जा रहा है...',
    speak_in_your_language: 'बोलकर बताएं (माइक)',
    listening_status: 'सुन रहे हैं... कृपया अपनी भाषा में बोलें',
    field_guidelines_title: 'सटीक जांच के लिए खेत में फोटो लेने के नियम:',
    guideline_focus: 'धब्बे पर फोकस करें: स्वस्थ और खराब हिस्से का बॉर्डर साफ दिखना चाहिए।',
    guideline_light: 'प्राकृतिक रोशनी: तेज धूप या सामान्य दिन की रोशनी में फोटो लें।',
    guideline_steady: 'कैमरा स्थिर रखें: पत्ती से 15-25 सेमी दूरी रखें ताकि फोटो धुंधली न हो।',
    hero_title: 'खेत में तुरंत करें फसल रोग की लाइव जांच',
    hero_subtitle: 'पत्ती, तने या फल की फोटो खींचें। कल्टिवो मौसम और मिट्टी के लाइव डेटा के साथ रोग पहचानकर सरकारी प्रमाणित उपचार बताता है।',
    hero_badge: 'एआई कृषि यंत्र',
    scan_crop_cta: 'फसल स्कैन करें',
    recent_diagnoses: 'पिछली की गई जांचें',
    no_reports_title: 'अभी तक कोई रिपोर्ट दर्ज नहीं हुई',
    no_reports_desc: 'पहली फसल की फोटो लेने के लिए ऊपर "फसल स्कैन करें" बटन दबाएं। आपका पूरा इतिहास यहां सुरक्षित रहेगा।',
    immediate_action_plan: 'तुरंत करने योग्य कार्य योजना',
    organic_solutions: 'जैविक व प्राकृतिक उपचार',
    chemical_treatments: 'प्रमाणित रासायनिक सुरक्षा दवाएं',
    preventive_actions: 'बचाव व प्रबंधन के तरीके',
    gov_standards_tab: 'सरकारी कृषि मानक व पोर्टल',
    field_monitoring: 'खेत की नियमित निगरानी',
    view_full_report: 'पूरी रिपोर्ट देखें',
    back_to_dashboard: 'डैशबोर्ड पर वापस जाएं',
    print_report: 'रिपोर्ट प्रिंट करें',
    share_report: 'साझा करें',
    escalate_to_expert: 'कृषि वैज्ञानिक को भेजें',
    expert_terminal: 'प्रमाणित कृषि वैज्ञानिक कंसोल',
    pending_cases: 'समीक्षा हेतु लंबित मामले',
    prescribe_treatment: 'उपचार व दवा लिखें',
    chemical_prescription: 'रासायनिक उपचार',
    biological_controls: 'जैविक व प्राकृतिक नियंत्रण',
    privacy_consent: 'कैमरा व जीपीएस अनुमति',
    kisan_portal_link: 'किसान सुविधा सरकारी पोर्टल खोलें',
  },
  te: {
    brand_tagline: 'నేల • పంట • విజ్ఞానం',
    farmer_portal: 'రైతు పోర్టల్',
    expert_portal: 'వ్యవసాయ నిపుణుల పోర్టల్',
    plots: 'పొలాలు / ప్లాట్లు',
    ai_scan: 'ఏఐ స్కాన్',
    sign_in: 'లాగిన్ చేయండి',
    sign_out: 'లాగ్ అవుట్',
    profile: 'రైతు ప్రొఫైల్',
    live_cloud_sync: 'లైవ్ క్లౌడ్ సింక్',
    capture_specimen: 'పంట ఫోటో తీయండి',
    start_diagnosis: 'లైవ్ నిర్ధారణ ప్రారంభించండి',
    crop_identification: 'గుర్తించబడిన పంట & వృక్షశాస్త్ర నామం',
    primary_condition: 'ప్రధాన తెగులు / రోగ లక్షణాలు',
    confidence: 'ఖచ్చితత్వ స్థాయి',
    high_confidence: 'అధిక ఖచ్చితత్వం',
    moderate_confidence: 'మధ్యస్థ ఖచ్చితత్వం',
    low_confidence: 'ప్రాథమిక ఖచ్చితత్వం',
    symptoms: 'గమనించిన ప్రత్యక్ష లక్షణాలు',
    differential_diagnoses: 'ఇతర సంభావ్య తెగుళ్లు (ప్రత్యామ్నాయాలు)',
    root_cause: 'ప్రధాన కారణం & వాతావరణం/నేల ప్రభావం',
    next_steps: 'సూచించిన తక్షణ చర్యలు',
    soil_telemetry: 'లైవ్ నేల విశ్లేషణ & pH స్థాయి',
    weather_telemetry: 'వాతావరణం & గాలిలో తేమ',
    gov_advisory: 'ప్రభుత్వ ICAR అధికారిక వ్యవసాయ సలహా',
    gov_guidelines: 'ICAR & CIBRC ఆమోదిత ప్రామాణిక పద్ధతులు',
    farmer_notes_label: 'మీ పంట సమస్యను వివరంగా రాయండి (ఏ భాషలోనైనా)',
    farmer_notes_placeholder: 'తెలుగులో రాయండి (ఉదా: ఆకులపై నల్లటి మచ్చలు వచ్చాయి, 3 రోజుల నుండి పసుపు రంగులోకి మారుతున్నాయి). AI ప్రత్యక్షంగా అనువదిస్తుంది...',
    live_translation_badge: 'లైవ్ రియల్-టైమ్ అనువాదం',
    translating_status: 'వెంటనే అనువదిస్తోంది...',
    speak_in_your_language: 'మాట్లాడి చెప్పండి (వాయిస్)',
    listening_status: 'వింటున్నాము... మీ భాషలో మాట్లాడండి',
    field_guidelines_title: 'ఖచ్చితమైన నిర్ధారణ కోసం పొలంలో ఫోటో తీసే సూచనలు:',
    guideline_focus: 'మచ్చలపై దృష్టి పెట్టండి: మంచి ఆకు మరియు తెగులు సోకిన భాగం స్పష్టంగా కనిపించాలి.',
    guideline_light: 'సహజ వెలుతురు: నీడలు లేకుండా పగటి వెలుతురులో ఫోటో తీయండి.',
    guideline_steady: 'కెమెరా కదలకుండా ఉంచండి: ఆకు నుండి 15-25 సెం.మీ దూరం ఉంచండి.',
    hero_title: 'పొలంలోనే పంట రోగాలను తక్షణమే గుర్తించండి',
    hero_subtitle: 'ఆకు లేదా కాండం ఫోటో తీయండి. కల్టివో నేల & వాతావరణ వివరాలను పరిశీలించి తెగుళ్లను గుర్తించి ప్రభుత్వ ప్రమాణాల ప్రకారం పరిష్కారాన్ని సూచిస్తుంది.',
    hero_badge: 'AI వ్యవసాయ సాధనం',
    scan_crop_cta: 'పంటను స్కాన్ చేయండి',
    recent_diagnoses: 'ఇటీవలి పంట పరీక్షలు',
    no_reports_title: 'ఇంకా ఎలాంటి రిపోర్టులు నమోదు కాలేదు',
    no_reports_desc: 'మొదటి పంట ఫోటో తీయడానికి పైన ఉన్న "పంటను స్కాన్ చేయండి" బటన్‌పై నొక్కండి.',
    immediate_action_plan: 'తక్షణ కార్యాచరణ ప్రణాళిక',
    organic_solutions: 'సేంద్రీయ & జీవ నియంత్రణ చర్యలు',
    chemical_treatments: 'లక్ష్య రసాయన రక్షణ మందులు',
    preventive_actions: 'నివారణ & నిర్వహణ పద్ధతులు',
    gov_standards_tab: 'ప్రభుత్వ వ్యవసాయ ప్రమాణాలు',
    field_monitoring: 'పొలం నిరంతర పర్యవేక్షణ',
    view_full_report: 'పూర్తి రిపోర్టు చూడండి',
    back_to_dashboard: 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి',
    print_report: 'ప్రింట్ రిపోర్ట్',
    share_report: 'షేర్ చేయండి',
    escalate_to_expert: 'వ్యవసాయ నిపుణుడికి పంపండి',
    expert_terminal: 'నిపుణుల కన్సోల్',
    pending_cases: 'పరిశీలనలో ఉన్న కేసులు',
    prescribe_treatment: 'మందులను సిఫార్సు చేయండి',
    chemical_prescription: 'రసాయన నియంత్రణ',
    biological_controls: 'జీవ నియంత్రణ',
    privacy_consent: 'కెమెరా & GPS అనుమతులు',
    kisan_portal_link: 'కిసాన్ సువిధ ప్రభుత్వ పోర్టల్',
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
    start_diagnosis: 'லைவ் நோய் கண்டறிதல் தொடங்கவும்',
    crop_identification: 'கண்டறியப்பட்ட பயிர் மற்றும் தாவரவியல் பெயர்',
    primary_condition: 'முதன்மை நோய் பாதிப்பு',
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
    gov_advisory: 'அரசு ICAR விவசாய ஆலோசனை',
    gov_guidelines: 'ICAR & CIBRC அங்கீகரிக்கப்பட்ட நடைமுறைகள்',
    farmer_notes_label: 'உங்கள் பயிர் பிரச்சனையை தமிழில் விவரிக்கவும்',
    farmer_notes_placeholder: 'இலையில் கரும்புள்ளிகள், மஞ்சள் நிற மாற்றம் போன்றவை பற்றி விவரிக்கவும். AI உடனடியாக மொழிபெயர்த்து பகுப்பாய்வு செய்யும்...',
    live_translation_badge: 'நேரலை நிகழ்நேர மொழிபெயர்ப்பு',
    translating_status: 'மொழிபெயர்க்கப்படுகிறது...',
    speak_in_your_language: 'பேசிப் பதிவு செய்யவும் (மைக்)',
    listening_status: 'கேட்கிறது... தமிழில் பேசவும்',
    field_guidelines_title: 'துல்லியமான பரிசோதனைக்கான புகைப்படம் எடுக்கும் முறைகள்:',
    guideline_focus: 'பாதிக்கப்பட்ட பகுதியில் கவனம் செலுத்துங்கள்.',
    guideline_light: 'இயற்கை வெளிச்சத்தில் புகைப்படம் எடுக்கவும்.',
    guideline_steady: 'கேமராவை அசையாமல் 15-25 செ.மீ தூரத்தில் வைக்கவும்.',
    hero_title: 'வயலிலேயே பயிர் நோய்களை உடனடியாகக் கண்டறியவும்',
    hero_subtitle: 'இலை அல்லது தண்டின் புகைப்படத்தை எடுக்கவும். மண் மற்றும் வானிலை தகவல்களை ஆராய்ந்து அரசு அங்கீகாரம் பெற்ற தீர்வுகளை வழங்குகிறது.',
    hero_badge: 'AI விவசாய கருவி',
    scan_crop_cta: 'பயிரை ஸ்கேன் செய்',
    recent_diagnoses: 'சமீபத்திய சோதனைகள்',
    no_reports_title: 'இதுவரை அறிக்கைகள் இல்லை',
    no_reports_desc: 'முதல் சோதனையைத் தொடங்க மேலே உள்ள பொத்தானை அழுத்தவும்.',
    immediate_action_plan: 'உடனடி செயல் திட்டம்',
    organic_solutions: 'இயற்கை மற்றும் உயிரியல் தீர்வுகள்',
    chemical_treatments: 'இரசாயன பாதுகாப்பு முறைகள்',
    preventive_actions: 'தடுப்பு நடவடிக்கைகள்',
    gov_standards_tab: 'அரசு விவசாய இணையதளங்கள்',
    field_monitoring: 'வயல் கண்காணிப்பு',
    view_full_report: 'முழு அறிக்கை காண்க',
    back_to_dashboard: 'முகப்பிற்குத் திரும்பு',
    print_report: 'அறிக்கை அச்சிடு',
    share_report: 'பகிர்க',
    escalate_to_expert: 'விவசாய நிபுணருக்கு அனுப்பவும்',
    expert_terminal: 'நிபுணர் அறை',
    pending_cases: 'நிலுவையில் உள்ள வழக்குகள்',
    prescribe_treatment: 'மருந்து பரிந்துரைக்கவும்',
    chemical_prescription: 'ரசாயன தீர்வு',
    biological_controls: 'இயற்கை கட்டுப்பாடு',
    privacy_consent: 'கேமரா அனுமதி',
    kisan_portal_link: 'கிசான் சுவிதா போர்டல்',
  },
  kn: {
    brand_tagline: 'ಮಣ್ಣು • ಬೆಳೆ • ಜ್ಞಾನ',
    farmer_portal: 'ರೈತ ಪೋರ್ಟಲ್',
    expert_portal: 'ಕೃಷಿ ತಜ್ಞರ ಪೋರ್ಟಲ್',
    plots: 'ಪ್ಲಾಟ್‌ಗಳು / ಹೊಲಗಳು',
    ai_scan: 'AI ಸ್ಕ್ಯಾನ್',
    sign_in: 'ಲಾಗಿನ್ ಮಾಡಿ',
    sign_out: 'ಲಾಗ್‌ಔಟ್',
    profile: 'ರೈತರ ಪ್ರೊಫೈಲ್',
    live_cloud_sync: 'ಲೈವ್ ಕ್ಲೌಡ್ ಸಿಂಕ್',
    capture_specimen: 'ಬೆಳೆಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ',
    start_diagnosis: 'ಲೈವ್ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ',
    crop_identification: 'ಗುರುತಿಸಲಾದ ಬೆಳೆ & ಸಸ್ಯಶಾಸ್ತ್ರೀಯ ಹೆಸರು',
    primary_condition: 'ಮುಖ್ಯ ರೋಗ ಮತ್ತು ಲಕ್ಷಣಗಳು',
    confidence: 'ನಿಖರತೆ',
    high_confidence: 'ಉನ್ನತ ನಿಖರತೆ',
    moderate_confidence: 'ಮಧ್ಯಮ ನಿಖರತೆ',
    low_confidence: 'ಪ್ರಾಥಮಿಕ ನಿಖರತೆ',
    symptoms: 'ಕಂಡುಬಂದ ಲಕ್ಷಣಗಳು',
    differential_diagnoses: 'ಇತರ ಸಂಭವನೀಯ ರೋಗಗಳು',
    root_cause: 'ಮೂಲ ಕಾರಣ & ಹವಾಮಾನ',
    next_steps: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು',
    soil_telemetry: 'ಲೈವ್ ಮಣ್ಣಿನ ಮಾಹಿತಿ',
    weather_telemetry: 'ಹವಾಮಾನ & ತೇವಾಂಶ',
    gov_advisory: 'ಸರ್ಕಾರಿ ಕೃಷಿ ಸಲಹೆ',
    gov_guidelines: 'ICAR ಮತ್ತು CIBRC ಅನುಮೋದಿತ ಪದ್ಧತಿ',
    farmer_notes_label: 'ನಿಮ್ಮ ಬೆಳೆಯ ಸಮಸ್ಯೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ',
    farmer_notes_placeholder: 'ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು, ಹಳದಿ ಬಣ್ಣ ಇತ್ಯಾದಿ ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ. AI ತಕ್ಷಣವೇ ಅನುವಾದಿಸುತ್ತದೆ...',
    live_translation_badge: 'ಲೈವ್ ರಿಯಲ್-ಟೈಮ್ ಅನುವಾದ',
    translating_status: 'ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...',
    speak_in_your_language: 'ಮಾತನಾಡಿ ತಿಳಿಸಿ (ಧ್ವನಿ)',
    listening_status: 'ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ',
    field_guidelines_title: 'ನಿಖರ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳುವ ವಿಧಾನ:',
    guideline_focus: 'ರೋಗಗ್ರಸ್ತ ಭಾಗದ ಮೇಲೆ ಗಮನವಿರಲಿ.',
    guideline_light: 'ನೈಸರ್ಗಿಕ ಬೆಳಕಿನಲ್ಲಿ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
    guideline_steady: 'ಕ್ಯಾಮೆರಾವನ್ನು 15-25 ಸೆಂ.ಮೀ ದೂರದಲ್ಲಿ ಸ್ಥಿರವಾಗಿರಿಸಿ.',
    hero_title: 'ಹೊಲದಲ್ಲೇ ಬೆಳೆ ರೋಗಗಳನ್ನು ತಕ್ಷಣ ಪತ್ತೆಹಚ್ಚಿ',
    hero_subtitle: 'ಎಲೆ ಅಥವಾ ಹಣ್ಣಿನ ಫೋಟೋ ತೆಗೆಯಿರಿ. ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ಆಧರಿಸಿ ಸರ್ಕಾರಿ ಅನುಮೋದಿತ ಪರಿಹಾರಗಳನ್ನು ಪಡೆಯಿರಿ.',
    hero_badge: 'AI ಕೃಷಿ ಸಾಧನ',
    scan_crop_cta: 'ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    recent_diagnoses: 'ಇತ್ತೀಚಿನ ಪರೀಕ್ಷೆಗಳು',
    no_reports_title: 'ಯಾವುದೇ ವರದಿಗಳಿಲ್ಲ',
    no_reports_desc: 'ಮೊದಲ ಪರೀಕ್ಷೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಮೇಲಿನ ಬಟನ್ ಒತ್ತಿರಿ.',
    immediate_action_plan: 'ತಕ್ಷಣದ ಕ್ರಿಯಾ ಯೋಜನೆ',
    organic_solutions: 'ಜೈವಿಕ ಪರಿಹಾರಗಳು',
    chemical_treatments: 'ರಾಸಾಯನಿಕ ರಕ್ಷಣೆ',
    preventive_actions: 'ಮುನ್ನೆಚ್ಚರಿಕೆ ಕ್ರಮಗಳು',
    gov_standards_tab: 'ಸರ್ಕಾರಿ ಕೃಷಿ ಪೋರ್ಟಲ್‌ಗಳು',
    field_monitoring: 'ಕ್ಷೇತ್ರ ಮೇಲ್ವಿಚಾರಣೆ',
    view_full_report: 'ಪೂರ್ಣ ವರದಿ ನೋಡಿ',
    back_to_dashboard: 'ಹಿಂದೆ ಹೋಗಿ',
    print_report: 'ವರದಿ ಮುದ್ರಿಸಿ',
    share_report: 'ಹಂಚಿಕೊಳ್ಳಿ',
    escalate_to_expert: 'ಕೃಷಿ ತಜ್ಞರಿಗೆ ಕಳುಹಿಸಿ',
    expert_terminal: 'ತಜ್ಞರ ಕನ್ಸೋಲ್',
    pending_cases: 'ಬಾಕಿ ಇರುವ ಪ್ರಕರಣಗಳು',
    prescribe_treatment: 'ಔಷಧಿ ಶಿಫಾರಸು ಮಾಡಿ',
    chemical_prescription: 'ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ',
    biological_controls: 'ಜೈವಿಕ ನಿಯಂತ್ರಣ',
    privacy_consent: 'ಕ್ಯಾಮೆರಾ ಅನುಮತಿ',
    kisan_portal_link: 'ಕಿಸಾನ್ ಸುವಿಧಾ ಪೋರ್ಟಲ್',
  },
  mr: {
    brand_tagline: 'माती • पीक • ज्ञान',
    farmer_portal: 'शेतकरी पोर्टल',
    expert_portal: 'कृषी तज्ज्ञ पोर्टल',
    plots: 'शेती / प्लॉट्स',
    ai_scan: 'एआय स्कॅन',
    sign_in: 'साइन इन करा',
    sign_out: 'लॉग आऊट',
    profile: 'शेतकरी प्रोफाइल',
    live_cloud_sync: 'लाईव्ह क्लाउड सिंक',
    capture_specimen: 'पिकाचा फोटो काढा',
    start_diagnosis: 'लाईव्ह तपासणी सुरू करा',
    crop_identification: 'ओळखलेले पीक व वनस्पतीशास्त्रीय नाव',
    primary_condition: 'मुख्य संभाव्य रोग व लक्षणे',
    confidence: 'अचूकता पातळी',
    high_confidence: 'उच्च अचूकता',
    moderate_confidence: 'मध्यम अचूकता',
    low_confidence: 'प्राथमिक अचूकता',
    symptoms: 'पानांवर दिसून आलेली लक्षणे',
    differential_diagnoses: 'इतर संभाव्य आजार',
    root_cause: 'मूळ कारण व हवामान/माती प्रभाव',
    next_steps: 'तातडीने करावयाची उपाययोजना',
    soil_telemetry: 'मातीचे थेट विश्लेषण व सामू',
    weather_telemetry: 'हवामान, तापमान व आर्द्रता',
    gov_advisory: 'शासकीय ICAR कृषी सल्लागार',
    gov_guidelines: 'ICAR व CIBRC प्रमाणित शिफारसी',
    farmer_notes_label: 'तुमच्या पिकाची समस्या मराठीत सांगा',
    farmer_notes_placeholder: 'पानांवर काळे डाग, पिवळेपणा याबद्दल लिहा. एआय थेट रीअल-टाइम भाषांतर करून तपासणी करेल...',
    live_translation_badge: 'थेट रीअल-टाइम भाषांतर',
    translating_status: 'भाषांतर होत आहे...',
    speak_in_your_language: 'बोलून सांगा (आवाज)',
    listening_status: 'ऐकत आहे... बोला',
    field_guidelines_title: 'अचूक निदानासाठी शेतात फोटो काढण्याच्या टिप्स:',
    guideline_focus: 'रोगाच्या डागावर फोकस करा.',
    guideline_light: 'सूर्यप्रकाशात स्पष्ट फोटो घ्या.',
    guideline_steady: 'कॅमेरा 15-25 सेमी अंतरावर स्थिर ठेवा.',
    hero_title: 'शेतातच करा पिकांच्या रोगांचे थेट निदान',
    hero_subtitle: 'पानाचा किंवा फळाचा फोटो काढा. कल्टिवो माती व हवामानाच्या आधारे अचूक निदान करून शासकीय प्रमाणित उपाय सांगते.',
    hero_badge: 'एआय कृषी साधन',
    scan_crop_cta: 'पीक स्कॅन करा',
    recent_diagnoses: 'मागील तपासण्या',
    no_reports_title: 'अजून कोणताही अहवाल नाही',
    no_reports_desc: 'पहिली तपासणी करण्यासाठी वरील बटण दाबा.',
    immediate_action_plan: 'तातडीची कृती योजना',
    organic_solutions: 'सेंद्रिय व जैविक उपाय',
    chemical_treatments: 'रासायनिक औषध फवारणी',
    preventive_actions: 'प्रतिबंधात्मक उपाय',
    gov_standards_tab: 'शासकीय कृषी पोर्टल्स',
    field_monitoring: 'शेतीचे नियमित निरीक्षण',
    view_full_report: 'पूर्ण अहवाल पहा',
    back_to_dashboard: 'डॅशबोर्डवर परत जा',
    print_report: 'प्रिंट अहवाल',
    share_report: 'शेअर करा',
    escalate_to_expert: 'कृषी तज्ज्ञांकडे पाठवा',
    expert_terminal: 'तज्ज्ञ कन्सोल',
    pending_cases: 'प्रलंबित प्रकरणे',
    prescribe_treatment: 'औषध सुचवा',
    chemical_prescription: 'रासायनिक फवारणी',
    biological_controls: 'जैविक उपाय',
    privacy_consent: 'कॅमेरा परवानगी',
    kisan_portal_link: 'किसान सुविधा पोर्टल',
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
    crop_identification: 'শনাক্তকৃত ফসল ও বৈজ্ঞানিক নাম',
    primary_condition: 'প্রধান রোগ ও লক্ষণ',
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
    gov_advisory: 'সরকারি ICAR কৃষি পরামর্শ',
    gov_guidelines: 'ICAR ও CIBRC অনুমোদিত নির্দেশিকা',
    farmer_notes_label: 'আপনার ফসলের সমস্যা বাংলায় লিখুন',
    farmer_notes_placeholder: 'পাতায় কালো দাগ, হলুদ ভাব ইত্যাদি বাংলায় লিখুন। এআই তাৎক্ষণিক লাইভ অনুবাদ করে রোগ নির্ণয় করবে...',
    live_translation_badge: 'লাইভ রিয়েল-টাইম অনুবাদ',
    translating_status: 'অনুবাদ করা হচ্ছে...',
    speak_in_your_language: 'মুখে বলুন (ভয়েস)',
    listening_status: 'শুনছি... বাংলায় বলুন',
    field_guidelines_title: 'সঠিক রোগ নির্ণয়ের জন্য ছবি তোলার নির্দেশিকা:',
    guideline_focus: 'আক্রান্ত অংশের ওপর ক্যামেরা ফোকাস করুন।',
    guideline_light: 'দিনের আলোতে পরিষ্কার ছবি তুলুন।',
    guideline_steady: 'পাতা থেকে ১৫-২৫ সেমি দূরে স্থির রাখুন।',
    hero_title: 'মাঠেই করুন ফসলের রোগের তাৎক্ষণিক লাইভ পরীক্ষা',
    hero_subtitle: 'পাতা বা ফলের ছবি তুলুন। আবহাওয়া ও মাটির তথ্য বিশ্লেষণ করে সরকারি নির্দেশিকা অনুযায়ী সমাধান প্রদান করে।',
    hero_badge: 'এআই কৃষি যন্ত্র',
    scan_crop_cta: 'ফসল স্ক্যান করুন',
    recent_diagnoses: 'সাম্প্রতিক রোগ নির্ণয়',
    no_reports_title: 'কোনো রিপোর্ট নেই',
    no_reports_desc: 'প্রথম ছবি তুলতে উপরের বাটনে চাপ দিন।',
    immediate_action_plan: 'জরুরি পদক্ষেপ পরিকল্পনা',
    organic_solutions: 'জৈব ও প্রাকৃতিক প্রতিকার',
    chemical_treatments: 'রাসায়নিক কীটনাশক স্প্রে',
    preventive_actions: 'প্রতিরোধমূলক ব্যবস্থা',
    gov_standards_tab: 'সরকারি কৃষি পোর্টাল',
    field_monitoring: 'মাঠ পর্যবেক্ষণ',
    view_full_report: 'সম্পূর্ণ রিপোর্ট দেখুন',
    back_to_dashboard: 'ড্যাশবোর্ডে ফিরুন',
    print_report: 'রিপোর্ট প্রিন্ট করুন',
    share_report: 'শেয়ার করুন',
    escalate_to_expert: 'কৃষি বিশেষজ্ঞের কাছে পাঠান',
    expert_terminal: 'বিশেষজ্ঞ কনসোল',
    pending_cases: 'পর্যালোচনাধীন কেস',
    prescribe_treatment: 'চিকিৎসা প্রেসক্রাইব করুন',
    chemical_prescription: 'রাসায়নিক চিকিৎসা',
    biological_controls: 'জৈব প্রতিকার',
    privacy_consent: 'ক্যামেরা অনুমতি',
    kisan_portal_link: 'কিষাণ সুবিধা পোর্টাল',
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
    crop_identification: 'Cultivo Identificado y Especie',
    primary_condition: 'Condición Foliar Primaria',
    confidence: 'Nivel de Confianza',
    high_confidence: 'Alta Confianza',
    moderate_confidence: 'Confianza Moderada',
    low_confidence: 'Confianza Inicial',
    symptoms: 'Evidencia Visual Observada',
    differential_diagnoses: 'Diagnósticos Diferenciales',
    root_cause: 'Causa Raíz y Microclima',
    next_steps: 'Pasos Recomendados',
    soil_telemetry: 'Telemetría de Suelo en Vivo',
    weather_telemetry: 'Clima y Humedad Relativa',
    gov_advisory: 'Aviso Agrícola Gubernamental',
    gov_guidelines: 'Práctica Estándar Aprobada',
    farmer_notes_label: 'Describa el problema en su idioma',
    farmer_notes_placeholder: 'Escriba manchas, hojas amarillas, marchitamiento. La IA traducirá en vivo en tiempo real...',
    live_translation_badge: 'Traducción en Tiempo Real',
    translating_status: 'Traduciendo en tiempo real...',
    speak_in_your_language: 'Hablar (Voz)',
    listening_status: 'Escuchando... Hable ahora',
    field_guidelines_title: 'Pautas para fotografía en campo:',
    guideline_focus: 'Enfoque en la lesión y borde de tejido sano.',
    guideline_light: 'Luz natural de día sin sombras pesadas.',
    guideline_steady: 'Sostenga a 15-25cm de la hoja.',
    hero_title: 'Diagnostique la salud del cultivo en campo',
    hero_subtitle: 'Capture una fotografía foliar. Cultivo analiza suelo y clima en vivo para brindar planes de tratamiento oficiales.',
    hero_badge: 'Instrumento IA de Campo',
    scan_crop_cta: 'ESCANEAR CULTIVO',
    recent_diagnoses: 'Diagnósticos Recientes',
    no_reports_title: 'Aún no hay diagnósticos',
    no_reports_desc: 'Toque "Escanear Cultivo" para registrar su primera muestra.',
    immediate_action_plan: 'Plan de Acción Inmediato',
    organic_solutions: 'Soluciones Biológicas y Orgánicas',
    chemical_treatments: 'Tratamientos Químicos Dirigidos',
    preventive_actions: 'Prácticas Culturales Preventivas',
    gov_standards_tab: 'Estándares Agrícolas Oficiales',
    field_monitoring: 'Monitoreo de Campo',
    view_full_report: 'Ver Informe Completo',
    back_to_dashboard: 'Volver al Panel',
    print_report: 'Imprimir Informe',
    share_report: 'Compartir',
    escalate_to_expert: 'Escalar a Agrónomo',
    expert_terminal: 'Terminal de Agronomía',
    pending_cases: 'Casos Pendientes',
    prescribe_treatment: 'Recetar Tratamiento',
    chemical_prescription: 'Prescripción Química',
    biological_controls: 'Control Biológico',
    privacy_consent: 'Consentimiento de Cámara',
    kisan_portal_link: 'Portal Oficial Kisan Suvidha',
  },
};

interface TranslationResult {
  translated_text: string;
  detected_language: string;
  key_symptoms?: string[];
  timeline_extracted?: string;
}

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  translateLive: (text: string, targetLang?: string) => Promise<TranslationResult>;
  translateReportLive: (report: any, targetLang?: string) => Promise<{ success: boolean; translated_report: any; is_fallback?: boolean }>;
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

  const translateLive = async (text: string, targetLang: string = 'en'): Promise<TranslationResult> => {
    if (!text || text.trim() === '') {
      return { translated_text: '', detected_language: 'Unknown' };
    }
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          target_language: targetLang,
        }),
      });
      if (!res.ok) {
        throw new Error('Live translation request failed');
      }
      return await res.json();
    } catch (e) {
      console.warn('Live translation failed, using fallback:', e);
      return {
        translated_text: text,
        detected_language: 'User Input',
      };
    }
  };

  const translateReportLive = async (
    report: any,
    targetLang: string = language
  ): Promise<{ success: boolean; translated_report: any; is_fallback?: boolean }> => {
    if (!report) {
      return { success: false, translated_report: null };
    }
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          target_language: targetLang,
        }),
      });
      if (!res.ok) {
        throw new Error('Report translation failed');
      }
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Live report translation call failed, returning original:', e);
      return { success: false, translated_report: report, is_fallback: true };
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateLive,
        translateReportLive,
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
