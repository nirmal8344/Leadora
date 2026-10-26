import React, { createContext, useContext, useState, useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PwaContext = createContext({
  needRefresh: false,
  offlineReady: false,
  updateApp: () => {},
  dismissUpdate: () => {},
  canInstall: false,
  isInstalled: false,
  installApp: async () => {},
  isOffline: false,
});

export function PwaProvider({ children }) {
  // Service Worker Registration & Safe Update Handling
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        // Periodically check for updates every 60 minutes
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn("PWA service worker registration error:", error);
    },
  });

  // Browser Install Prompt Handling
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Detect if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      setCanInstall(false);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent automatic browser banner
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsInstalled(true);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  const updateApp = () => {
    updateServiceWorker(true);
  };

  const dismissUpdate = () => {
    setNeedRefresh(false);
  };

  const dismissOfflineReady = () => {
    setOfflineReady(false);
  };

  return (
    <PwaContext.Provider
      value={{
        needRefresh,
        offlineReady,
        dismissOfflineReady,
        updateApp,
        dismissUpdate,
        canInstall,
        isInstalled,
        installApp,
        isOffline,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}

export default PwaContext;
