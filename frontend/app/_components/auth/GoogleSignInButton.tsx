"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleSignInButton({ onCredential, onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !CLIENT_ID || !buttonRef.current) return;
    const google = (window as typeof window & { google?: any }).google;
    if (!google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          onCredential(response.credential);
        } else {
          onError?.("Google sign-in didn't return a credential");
        }
      },
    });
    google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 240,
      text: "continue_with",
    });
  }, [scriptLoaded, onCredential, onError]);

  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        title="Google sign-in isn't configured on this deployment yet"
        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-400 cursor-not-allowed w-full"
      >
        Google (not configured)
      </button>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={buttonRef} className="flex justify-center [&>div]:w-full" />
    </>
  );
}
