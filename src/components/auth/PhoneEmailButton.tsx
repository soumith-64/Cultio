'use client';

import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    // Register the global phoneEmailListener expected by phone.email gateway
    (window as any).phoneEmailListener = function (userObj: { user_json_url: string }) {
      if (userObj && userObj.user_json_url) {
        onSuccess(userObj.user_json_url);
      }
    };

    // Inject the official Phone.Email script inside container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://www.phone.email/sign_in_button_v1.js';
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, [onSuccess]);

  return (
    <div className={`w-full flex items-center justify-center my-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Official Phone.Email Button Only */}
      <div
        ref={containerRef}
        className="pe_signin_button flex items-center justify-center w-full min-h-[46px]"
        data-client-id={clientId}
      />
    </div>
  );
};
