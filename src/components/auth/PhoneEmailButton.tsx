'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PhoneEmailButtonProps {
  clientId?: string;
  onSuccess: (userJsonUrl: string) => void;
  disabled?: boolean;
}

export const PhoneEmailButton: React.FC<PhoneEmailButtonProps> = ({
  clientId = '13311688567845248231',
  onSuccess,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Register the global phoneEmailListener expected by phone.email gateway
    (window as any).phoneEmailListener = function (userObj: { user_json_url: string }) {
      if (userObj && userObj.user_json_url) {
        onSuccess(userObj.user_json_url);
      }
    };

    // Inject the script inside container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://www.phone.email/sign_in_button_v1.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      containerRef.current.appendChild(script);
    }
  }, [onSuccess]);

  const openPhoneEmailPopup = () => {
    const width = 460;
    const height = 600;
    const left = typeof window !== 'undefined' ? window.screen.width / 2 - width / 2 : 100;
    const top = typeof window !== 'undefined' ? window.screen.height / 2 - height / 2 : 100;
    window.open(
      `https://www.phone.email/http_auth/auth_button.php?client_id=${clientId}`,
      'phoneEmailAuth',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`
    );
  };

  return (
    <div className={`w-full space-y-2 my-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Official Phone.Email Script Mount Container */}
      <div
        ref={containerRef}
        className="pe_signin_button flex items-center justify-center w-full min-h-[46px] rounded-xl overflow-hidden shadow-2xs hover:shadow-sm transition-all"
        data-client-id={clientId}
      />

      {/* Instant 1-Tap Fallback / Direct Launch Button */}
      <button
        type="button"
        onClick={openPhoneEmailPopup}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#0288D1] hover:bg-[#0277BD] active:scale-[0.99] text-white font-bold text-xs shadow-earth transition-all cursor-pointer min-h-[42px]"
      >
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        <span>Instant WhatsApp / SMS OTP Verification</span>
      </button>
    </div>
  );
};
