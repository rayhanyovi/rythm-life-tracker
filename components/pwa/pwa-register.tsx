"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      (process.env.NODE_ENV !== "production" &&
        process.env.NEXT_PUBLIC_PWA_DEV_ENABLED !== "true")
    ) {
      return;
    }

    const register = () => {
      void navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });

    return () => {
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
