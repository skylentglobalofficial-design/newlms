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
        title="Install Skylent App"
        className="skylent-install-app-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: variant === 'dashboard' ? '5px 11px' : '6px 12px',
          borderRadius: 8,
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          color: '#1e293b',
          fontSize: 12.5,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>{installedJustNow ? 'Installed' : 'Get app'}</span>
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
            background: 'rgba(15, 23, 42, 0.5)',
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
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              maxWidth: 440,
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.2)',
              color: '#0f172a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <h3
                id="skylent-install-app-title"
                style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}
              >
                Install Skylent on your device
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close install dialog"
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                Close
              </button>
            </div>

            <p style={{ margin: '10px 0 16px', fontSize: 13.5, lineHeight: 1.55, color: '#475569' }}>
              Open Skylent directly from your home screen for full-screen courses, SQL/Python labs, and instant notifications.
            </p>

            <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '11px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                  Android (Chrome / Edge)
                </div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>
                  Tap the browser menu <strong>(⋮)</strong> and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '11px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                  iPhone &amp; iPad (Safari)
                </div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>
                  Tap the <strong>Share</strong> icon in Safari and select <strong>Add to Home Screen</strong>.
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '11px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                  Windows &amp; Mac Desktop
                </div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>
                  Click the <strong>Install Skylent</strong> icon on the right side of your browser address bar.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: '#5142b5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
export default InstallAppPrompt
