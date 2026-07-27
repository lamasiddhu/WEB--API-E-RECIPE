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

  // Keep the latest callbacks in refs rather than the effect's dependency
  // array — login/register pages pass new inline function references on
  // every render, and Google's renderButton appends rather than replaces
  // the button in the target div, so re-running init/render on every
  // keystroke was duplicating the button visually.
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!scriptLoaded || !CLIENT_ID || !buttonRef.current) return;
    const google = (window as typeof window & { google?: any }).google;
    if (!google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      // Force English regardless of the browser/OS locale — Google's button
      // otherwise auto-translates based on the visitor's language settings.
      locale: "en",
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          onCredentialRef.current(response.credential);
        } else {
          onErrorRef.current?.("Google sign-in didn't return a credential");
        }
      },
    });
    google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 240,
      text: "continue_with",
    });
    // Deliberately only re-run when the script finishes loading — see the
    // ref comment above for why onCredential/onError are excluded here.
  }, [scriptLoaded]);

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
        src="https://accounts.google.com/gsi/client?hl=en"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={buttonRef} className="flex justify-center [&>div]:w-full" />
    </>
  );
}
