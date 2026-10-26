import React, { useEffect, useState } from "react";
import { usePwa } from "../context/PwaContext";
import { RefreshCw, Download, WifiOff, CheckCircle2, X } from "lucide-react";
import "./PwaBanner.css";

export default function PwaBanner() {
  const {
    needRefresh,
    offlineReady,
    dismissOfflineReady,
    updateApp,
    dismissUpdate,
    canInstall,
    isInstalled,
    installApp,
    isOffline,
  } = usePwa();

  const [installDismissed, setInstallDismissed] = useState(false);

  // Auto-dismiss "offline ready" toast after 4 seconds
  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(() => {
        dismissOfflineReady();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady, dismissOfflineReady]);

  return (
    <>
      {/* Top Banner when Browser is Offline */}
      {isOffline && (
        <div className="ld-pwa-offline-bar" role="status" aria-live="polite">
          <WifiOff size={16} className="ld-pwa-offline-icon" />
          <span>
            <strong>Offline Mode:</strong> Operating with cached static assets. Internet connection required to sync leads, campaigns, and reports.
          </span>
        </div>
      )}

      {/* Floating Card Stack: Updates & Install Notifications */}
      <div className="ld-pwa-toast-container" aria-live="polite">
        {/* Update Available Card (Safe Update Handling) */}
        {needRefresh && (
          <div className="ld-pwa-card" role="alert">
            <div className="ld-pwa-card-header">
              <div className="ld-pwa-icon-box">
                <RefreshCw size={20} />
              </div>
              <div className="ld-pwa-card-content">
                <h4 className="ld-pwa-card-title">Update Available</h4>
                <p className="ld-pwa-card-desc">
                  A newer version of Leadora is ready. Update now to load the latest features.
                </p>
              </div>
              <button
                onClick={dismissUpdate}
                className="ld-pwa-btn-dismiss"
                aria-label="Dismiss update notification"
              >
                <X size={16} />
              </button>
            </div>
            <div className="ld-pwa-card-actions">
              <button onClick={dismissUpdate} className="ld-pwa-btn ld-pwa-btn-secondary">
                Later
              </button>
              <button onClick={updateApp} className="ld-pwa-btn ld-pwa-btn-primary">
                <RefreshCw size={14} />
                Update Now
              </button>
            </div>
          </div>
        )}

        {/* Offline Ready Toast */}
        {offlineReady && (
          <div className="ld-pwa-card" role="status">
            <div className="ld-pwa-card-header">
              <div className="ld-pwa-icon-box" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                <CheckCircle2 size={20} />
              </div>
              <div className="ld-pwa-card-content">
                <h4 className="ld-pwa-card-title">Ready for Offline Work</h4>
                <p className="ld-pwa-card-desc">
                  Core app shell and static resources have been cached for instant loading.
                </p>
              </div>
              <button
                onClick={dismissOfflineReady}
                className="ld-pwa-btn-dismiss"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Install Prompt Toast (Desktop / Mobile Browsers) */}
        {canInstall && !isInstalled && !installDismissed && (
          <div className="ld-pwa-card" role="dialog" aria-labelledby="ld-install-title">
            <div className="ld-pwa-card-header">
              <div className="ld-pwa-icon-box">
                <Download size={20} />
              </div>
              <div className="ld-pwa-card-content">
                <h4 id="ld-install-title" className="ld-pwa-card-title">
                  Install Leadora App
                </h4>
                <p className="ld-pwa-card-desc">
                  Install Leadora on your desktop or home screen for faster access, dedicated window, and streamlined workflow.
                </p>
              </div>
              <button
                onClick={() => setInstallDismissed(true)}
                className="ld-pwa-btn-dismiss"
                aria-label="Dismiss install prompt"
              >
                <X size={16} />
              </button>
            </div>
            <div className="ld-pwa-card-actions">
              <button
                onClick={() => setInstallDismissed(true)}
                className="ld-pwa-btn ld-pwa-btn-secondary"
              >
                Not Now
              </button>
              <button onClick={installApp} className="ld-pwa-btn ld-pwa-btn-primary">
                <Download size={14} />
                Install
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
