'use client';

import React, { useRef, useState } from 'react';
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

export const CameraWorkflow: React.FC<CameraWorkflowProps> = ({
  onImageConfirmed,
  onCancel,
  isProcessing = false,
}) => {
  const { t } = useLanguage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [farmerNotes, setFarmerNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

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
            <span>Live Field Input</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
            {previewUrl ? 'Review Crop Photograph' : 'Capture Live Crop Specimen'}
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

          {/* Multilingual Farmer Problem Description Input */}
          <div className="bg-[#F9F6F0] p-4 rounded-2xl border border-[#E0D7C6] space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="farmer-notes-textarea"
                className="text-xs font-bold uppercase tracking-wider text-[#4E342E] flex items-center gap-1.5"
              >
                <MessageSquareText className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{t('farmer_notes_label') || 'Describe crop issue (in any language)'}</span>
              </label>
              <span className="text-[10px] font-bold text-[#2E7D32] bg-[#81C784]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>AI Auto-Translates</span>
              </span>
            </div>

            <textarea
              id="farmer-notes-textarea"
              rows={2}
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              disabled={isProcessing}
              placeholder={
                t('farmer_notes_placeholder') ||
                'Type in any language (Hindi, Telugu, Tamil, Marathi, Bengali, Spanish, English, etc.). The AI will translate and incorporate your observations.'
              }
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#E0D7C6] bg-white text-[#4E342E] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none leading-relaxed"
            />

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
              Start Live Diagnosis
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

          {/* Live Field Photography Guidelines (No Prestored Samples) */}
          <div className="bg-[#F9F6F0] rounded-2xl p-4 border border-[#E0D7C6] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4E342E] block">
              Field Photography Guidelines for Accurate Diagnostics:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#795548]">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E0D7C6]">
                <Maximize2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Focus on Lesions</strong>: Capture transition between healthy tissue and diseased margin.
                </span>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E0D7C6]">
                <Sun className="w-4 h-4 text-[#F57C00] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Natural Daylight</strong>: Ensure bright, even lighting without heavy shadows.
                </span>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E0D7C6]">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Hold Steady</strong>: Keep camera ~15-25cm from leaf to avoid motion blur.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
