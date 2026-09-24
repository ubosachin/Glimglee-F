"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  width?: number;
  className?: string;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  text = "continue_with",
  theme = "outline",
  size = "large",
  width = 340,
  className = "",
}: GoogleSignInButtonProps) {
  const { loginWithGoogleCredential, loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Dynamically load Google Identity Services SDK
    if (window.google?.accounts?.id) {
      setGsiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    script.onerror = () => {
      console.warn("Failed to load Google Identity Services SDK");
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!gsiLoaded || !buttonRef.current || !clientId) return;

    try {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            onError?.("No credential received from Google");
            return;
          }
          setLoading(true);
          try {
            const ok = await loginWithGoogleCredential(response.credential);
            if (ok) {
              onSuccess?.();
            } else {
              onError?.("Failed to authenticate with Google");
            }
          } catch (e: any) {
            onError?.(e?.message || "Google Sign-In failed");
          } finally {
            setLoading(false);
          }
        },
      });

      // Clear any previous rendered button
      buttonRef.current.innerHTML = "";

      const containerWidth = buttonRef.current?.parentElement?.clientWidth || 320;
      const targetWidth = Math.min(width || 340, Math.max(220, containerWidth));

      window.google?.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme,
        size,
        text,
        shape: "rectangular",
        logo_alignment: "left",
        width: targetWidth,
      });
    } catch (err) {
      console.error("Error initializing Google Identity Services:", err);
    }
  }, [gsiLoaded, clientId, text, theme, size, width, loginWithGoogleCredential, onSuccess, onError]);

  const handleManualClick = async () => {
    setLoading(true);
    try {
      const ok = await loginWithGoogle();
      if (ok) {
        onSuccess?.();
      }
    } catch (e: any) {
      onError?.(e?.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  // If Client ID is configured, show official GSI rendered button
  if (clientId && clientId !== "your-google-client-id.apps.googleusercontent.com") {
    return (
      <div className={`relative flex flex-col items-center w-full max-w-full overflow-hidden ${className}`}>
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center z-10">
            <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
          </div>
        )}
        <div ref={buttonRef} className="flex justify-center w-full max-w-full overflow-hidden min-h-[44px]" />
      </div>
    );
  }

  // Fallback interactive button (opens Google or informs user to add NEXT_PUBLIC_GOOGLE_CLIENT_ID)
  return (
    <button
      type="button"
      onClick={handleManualClick}
      disabled={loading}
      className={`w-full h-12 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 text-sm font-medium flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span className="font-semibold text-stone-700">Continue with Google</span>
    </button>
  );
}
