'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageStorageService } from '@/services/storage';
import { useLanguage } from '@/context/LanguageContext';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  X,
  AlertCircle,
  Sun,
  Maximize2,
  ShieldCheck,
  Sparkles,
  MessageSquareText,
  Globe,
  Mic,
  MicOff,
  Loader2,
  Check,
} from 'lucide-react';

interface CameraWorkflowProps {
  onImageConfirmed: (imageData: {
    file?: File;
    base64: string;
    previewUrl: string;
    farmerNotes?: string;
  }) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

interface LiveTranslationState {
  translated_text: string;
  detected_language: string;
  key_symptoms?: string[];
  timeline_extracted?: string;
}

export const CameraWorkflow: React.FC<CameraWorkflowProps> = ({
  onImageConfirmed,
  onCancel,
  isProcessing = false,
}) => {
  const { t, language, translateLive } = useLanguage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [farmerNotes, setFarmerNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Live real-time translation states
  const [liveTranslation, setLiveTranslation] = useState<LiveTranslationState | null>(null);
  const [isTranslatingLive, setIsTranslatingLive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // DEBOUNCED LIVE REAL-TIME TRANSLATION
  // Translates the farmer's complete description, sentences, and paragraphs as they type or speak
  useEffect(() => {
    if (!farmerNotes || farmerNotes.trim().length < 3) {
      setLiveTranslation(null);
      setIsTranslatingLive(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsTranslatingLive(true);
      try {
        const result = await translateLive(farmerNotes, 'en');
        if (result && result.translated_text) {
          setLiveTranslation(result);
        }
      } catch (err) {
        console.warn('Real-time translation error:', err);
      } finally {
        setIsTranslatingLive(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [farmerNotes, translateLive]);

  // VOICE SPEECH-TO-TEXT FOR FARMERS (IN ANY REGIONAL LANGUAGE)
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Select matching regional BCP-47 language tag
      const langMap: Record<string, string> = {
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        kn: 'kn-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        es: 'es-ES',
        en: 'en-IN',
      };
      recognition.lang = langMap[language] || 'hi-IN';

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setFarmerNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Handle live file capture from camera or local file picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const validation = ImageStorageService.validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid image file.');
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await ImageStorageService.compressImage(file);
      setSelectedFile(compressed.file);
      setBase64Data(compressed.base64);
      setPreviewUrl(compressed.previewUrl);
    } catch (err: any) {
      setErrorMsg('Failed to process image. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleConfirm = () => {
    if (!previewUrl || !base64Data) {
      setErrorMsg('Please capture or select a live crop photograph first.');
      return;
    }
    onImageConfirmed({
      file: selectedFile || undefined,
      base64: base64Data,
      previewUrl,
      farmerNotes: farmerNotes.trim() || undefined,
    });
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setBase64Data(null);
    setFarmerNotes('');
    setLiveTranslation(null);
    setErrorMsg(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-5 sm:p-8 shadow-earth-lg max-w-xl mx-auto animate-fadeIn">
      {/* Hidden file inputs for live capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="cultivo-camera-input"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="cultivo-gallery-input"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2E7D32] uppercase tracking-wider bg-[#81C784]/20 px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3 h-3" />
            <span>{t('live_cloud_sync')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
            {previewUrl ? 'Review Crop Photograph' : t('capture_specimen')}
          </h2>
          <p className="text-xs sm:text-sm text-[#795548]">
            {previewUrl
              ? 'Check that symptoms, leaf margins, and lesions are sharp and clearly visible.'
              : 'Take a live photo of your crop foliage or upload an image taken in the field.'}
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="w-8 h-8 rounded-full border border-[#E0D7C6] flex items-center justify-center text-[#795548] hover:bg-[#F9F6F0] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#B71C1C] text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Area OR Capture Options */}
      {previewUrl ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#2E7D32] bg-[#F9F6F0] aspect-[4/3] flex items-center justify-center shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Live Crop Diagnostic Specimen"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black/65 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center justify-between">
              <span>Ready for Real-Time Analysis</span>
              <span className="text-[#81C784] font-semibold">Live Specimen</span>
            </div>
          </div>

          {/* MULTILINGUAL LIVE-TRANSLATING FARMER PROBLEM DESCRIPTION */}
          <div className="bg-[#F9F6F0] p-4 rounded-2xl border border-[#E0D7C6] space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="farmer-notes-textarea"
                className="text-xs font-bold uppercase tracking-wider text-[#4E342E] flex items-center gap-1.5"
              >
                <MessageSquareText className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{t('farmer_notes_label')}</span>
              </label>

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isListening
                    ? 'bg-[#D32F2F] text-white animate-pulse'
                    : 'bg-white border border-[#2E7D32]/30 text-[#2E7D32] hover:bg-[#2E7D32]/10'
                }`}
                title="Tap to speak in your language"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3 h-3" />
                    <span>{t('listening_status')}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    <span>{t('speak_in_your_language')}</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="farmer-notes-textarea"
              rows={3}
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              disabled={isProcessing}
              placeholder={t('farmer_notes_placeholder')}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#E0D7C6] bg-white text-[#4E342E] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none leading-relaxed"
            />

            {/* LIVE REAL-TIME TRANSLATION PREVIEW (NOT JUST 3 TO 5 WORDS!) */}
            {(isTranslatingLive || liveTranslation) && (
              <div className="bg-white p-3.5 rounded-xl border-2 border-[#2E7D32]/30 space-y-2 animate-fadeIn shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#2E7D32]">
                    <Globe className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>{t('live_translation_badge')}</span>
                    {isTranslatingLive && (
                      <Loader2 className="w-3 h-3 animate-spin text-[#2E7D32]" />
                    )}
                  </div>

                  {liveTranslation?.detected_language && (
                    <span className="text-[10px] font-bold text-[#2E7D32] bg-[#81C784]/20 px-2 py-0.5 rounded-md">
                      {liveTranslation.detected_language}
                    </span>
                  )}
                </div>

                {liveTranslation?.translated_text ? (
                  <p className="text-xs sm:text-sm font-semibold text-[#4E342E] leading-relaxed">
                    &ldquo;{liveTranslation.translated_text}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-[#795548] italic">
                    {t('translating_status')}
                  </p>
                )}

                {/* Extracted symptoms and timeline */}
                {liveTranslation?.key_symptoms && liveTranslation.key_symptoms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E0D7C6]">
                    <span className="text-[10px] font-bold text-[#795548] uppercase">
                      Detected Symptoms:
                    </span>
                    {liveTranslation.key_symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <Check className="w-2.5 h-2.5" />
                        {symptom}
                      </span>
                    ))}
                    {liveTranslation.timeline_extracted && (
                      <span className="bg-[#FFA000]/15 text-[#E65100] border border-[#FFA000]/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        ⏱️ {liveTranslation.timeline_extracted}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Helper Phrases */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#795548]">
              <span className="font-semibold text-[#4E342E]">Quick tags:</span>
              <button
                type="button"
                onClick={() =>
                  setFarmerNotes((prev) =>
                    prev ? `${prev} • काले धब्बे (Black spots)` : 'पत्तियों पर काले धब्बे दिख रहे हैं (Black spots on leaves)'
                  )
                }
                className="bg-white border border-[#E0D7C6] px-2 py-0.5 rounded-md hover:bg-[#EFE8DC] transition-colors cursor-pointer text-[#4E342E]"
              >
                + काले धब्बे
              </button>
              <button
                type="button"
                onClick={() =>
                  setFarmerNotes((prev) =>
                    prev ? `${prev} • ఆకులు పసుపు (Yellowing)` : 'ఆకులు పసుపు రంగులోకి మారుతున్నాయి (Leaves turning yellow)'
                  )
                }
                className="bg-white border border-[#E0D7C6] px-2 py-0.5 rounded-md hover:bg-[#EFE8DC] transition-colors cursor-pointer text-[#4E342E]"
              >
                + ఆకులు పసుపు
              </button>
              <button
                type="button"
                onClick={() =>
                  setFarmerNotes((prev) =>
                    prev ? `${prev} • இலையில் சுருக்கம் (Leaf curl)` : 'இலை சுருண்டு போகிறது (Leaf curling)'
                  )
                }
                className="bg-white border border-[#E0D7C6] px-2 py-0.5 rounded-md hover:bg-[#EFE8DC] transition-colors cursor-pointer text-[#4E342E]"
              >
                + இலை சுருக்கம்
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleReset}
              disabled={isProcessing}
              className="flex-1"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retake / Change
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirm}
              isLoading={isProcessing || isCompressing}
              className="flex-1 font-bold shadow-earth"
              rightIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              {t('start_diagnosis')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mobile Camera and File Selection Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-[#2E7D32] bg-[#2E7D32]/5 hover:bg-[#2E7D32]/10 transition-all text-center cursor-pointer group min-h-[150px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center mb-3 shadow-earth group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <span className="font-bold text-base text-[#2E7D32]">
                Open Camera
              </span>
              <span className="text-xs text-[#795548] mt-1">
                Capture live photo in field
              </span>
            </button>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-[#E0D7C6] bg-[#FFFFFF] hover:bg-[#F9F6F0] transition-all text-center cursor-pointer group min-h-[150px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#EFE8DC] text-[#4E342E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7 text-[#2E7D32]" />
              </div>
              <span className="font-bold text-base text-[#4E342E]">
                Select Field Photo
              </span>
              <span className="text-xs text-[#795548] mt-1">
                Upload image from device
              </span>
            </button>
          </div>

          {/* Live Field Photography Guidelines (Fully Localized!) */}
          <div className="bg-[#F9F6F0] rounded-2xl p-4 border border-[#E0D7C6] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4E342E] block">
              {t('field_guidelines_title')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#795548]">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E0D7C6]">
                <Maximize2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                <span>{t('guideline_focus')}</span>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E0D7C6]">
                <Sun className="w-4 h-4 text-[#F57C00] flex-shrink-0 mt-0.5" />
                <span>{t('guideline_light')}</span>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E0D7C6]">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                <span>{t('guideline_steady')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
