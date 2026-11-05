import { useEffect, useState } from 'react'
import { isNativeAppShell } from '../../lib/api-base'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

let deferredPromptGlobal: BeforeInstallPromptEvent | null = null

export function InstallAppPrompt({ variant = 'nav' }: { variant?: 'nav' | 'dashboard' }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(deferredPromptGlobal)
  const [isStandalone, setIsStandalone] = useState(() => isNativeAppShell())
  const [showModal, setShowModal] = useState(false)
  const [installedJustNow, setInstalledJustNow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone =
      isNativeAppShell() ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptGlobal = e as BeforeInstallPromptEvent
      setDeferredPrompt(deferredPromptGlobal)
    }

    const onAppInstalled = () => {
      deferredPromptGlobal = null
      setDeferredPrompt(null)
      setIsStandalone(true)
      setInstalledJustNow(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  if (isStandalone && !installedJustNow) {
    return null
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        deferredPromptGlobal = null
        setDeferredPrompt(null)
      }
      return
    }
    setShowModal(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleInstallClick()}
        title="Install Skylent App on Phone or Desktop"
        className="skylent-install-app-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: variant === 'dashboard' ? '5px 11px' : '6px 12px',
          borderRadius: 999,
          background: '#f5f3ff',
          border: '1px solid #c4b5fd',
          color: '#5142b5',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 140ms ease',
        }}
      >
        <span aria-hidden="true">📲</span>
        <span>{installedJustNow ? 'App Installed ✓' : 'Get App'}</span>
      </button>

      {showModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skylent-install-app-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #ddd6fe',
              borderLeft: '5px solid #5142b5',
              maxWidth: 460,
              width: '100%',
              padding: '24px 22px',
              boxShadow: '0 24px 48px -12px rgba(59, 45, 150, 0.25)',
              color: '#0f172a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#5142b5',
                    background: '#f5f3ff',
                    padding: '3px 9px',
                    borderRadius: 999,
                    marginBottom: 8,
                  }}
                >
                  SKYLENT MOBILE & DESKTOP APP
                </span>
                <h3
                  id="skylent-install-app-title"
                  style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#0f172a' }}
                >
                  Install Skylent on Your Device
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close install dialog"
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: '#475569',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '10px 0 16px', fontSize: 13.5, lineHeight: 1.55, color: '#475569' }}>
              Launch Skylent directly from your home screen with full-screen SQL/Python Labs, 20-Min TA Doubt notifications, and instant dashboard access:
            </p>

            <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>
                  🤖 Android (Play Store APK or Chrome Install)
                </div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>
                  Tap the browser menu <strong>(⋮)</strong> at the top-right and select <strong>“Install app”</strong> or install the official signed Skylent Android APK.
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>
                  🍎 iPhone & iPad (Safari)
                </div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>
                  Tap the <strong>Share</strong> icon at the bottom bar and tap <strong>“Add to Home Screen”</strong>.
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>
                  💻 Windows & Mac Desktop
                </div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>
                  Click the <strong>Install Skylent</strong> icon on the right side of your address bar in Chrome or Edge.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: '#5142b5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 9,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
export default InstallAppPrompt
