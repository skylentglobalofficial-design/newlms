import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isNativeAppShell } from '../../lib/api-base'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface Window {
    __skylentDeferredInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

function getGlobalDeferredPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === 'undefined') return null
  return window.__skylentDeferredInstallPrompt ?? null
}

function detectPlatform(): 'windows' | 'mac' | 'android' | 'ios' | 'other' {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent || ''
  if (/Windows NT/i.test(ua)) return 'windows'
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac'
  return 'other'
}

export function InstallAppPrompt({ variant = 'nav' }: { variant?: 'nav' | 'dashboard' }) {
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    getGlobalDeferredPrompt(),
  )
  const [isStandalone, setIsStandalone] = useState(() => isNativeAppShell())
  const [showModal, setShowModal] = useState(false)
  const [installedJustNow, setInstalledJustNow] = useState(false)
  const [platform] = useState(() => detectPlatform())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone =
      isNativeAppShell() ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    // Sync if <head> script already captured beforeinstallprompt
    const existing = getGlobalDeferredPrompt()
    if (existing) {
      setDeferredPrompt(existing)
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      window.__skylentDeferredInstallPrompt = promptEvent
      setDeferredPrompt(promptEvent)
    }

    const onInstallReady = () => {
      const promptEvent = getGlobalDeferredPrompt()
      if (promptEvent) setDeferredPrompt(promptEvent)
    }

    const onAppInstalled = () => {
      window.__skylentDeferredInstallPrompt = null
      setDeferredPrompt(null)
      setIsStandalone(true)
      setInstalledJustNow(true)
      setShowModal(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('skylent:install-ready', onInstallReady)
    window.addEventListener('appinstalled', onAppInstalled)
    window.addEventListener('skylent:app-installed', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('skylent:install-ready', onInstallReady)
      window.removeEventListener('appinstalled', onAppInstalled)
      window.removeEventListener('skylent:app-installed', onAppInstalled)
    }
  }, [])

  if (isStandalone && !installedJustNow) {
    return null
  }

  async function triggerNativeInstall(): Promise<boolean> {
    const activePrompt = deferredPrompt ?? getGlobalDeferredPrompt()
    if (!activePrompt) return false
    try {
      await activePrompt.prompt()
      const choice = await activePrompt.userChoice
      if (choice.outcome === 'accepted') {
        window.__skylentDeferredInstallPrompt = null
        setDeferredPrompt(null)
        setInstalledJustNow(true)
        setShowModal(false)
      }
      return true
    } catch {
      return false
    }
  }

  async function handleInstallClick() {
    const triggered = await triggerNativeInstall()
    if (triggered) return
    setShowModal(true)
  }

  const buttonLabel = installedJustNow
    ? 'App Installed ✓'
    : platform === 'windows'
      ? 'Install on Windows'
      : 'Install App'

  const buttonIcon = platform === 'windows' ? '💻' : '📲'

  return (
    <>
      <button
        type="button"
        onClick={() => void handleInstallClick()}
        title={
          platform === 'windows'
            ? 'Install Skylent Desktop App on Windows'
            : 'Install Skylent App on Your Device'
        }
        className="skylent-install-app-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: variant === 'dashboard' ? '5px 11px' : '6px 13px',
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
        <span aria-hidden="true">{buttonIcon}</span>
        <span>{buttonLabel}</span>
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
            background: 'rgba(15, 23, 42, 0.58)',
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
              borderRadius: 18,
              border: '1px solid #ddd6fe',
              borderTop: '5px solid #5142b5',
              maxWidth: 480,
              width: '100%',
              padding: '24px 22px',
              boxShadow: '0 24px 48px -12px rgba(59, 45, 150, 0.28)',
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
                  OFFICIAL SKYLENT DESKTOP & MOBILE APP
                </span>
                <h3
                  id="skylent-install-app-title"
                  style={{ margin: 0, fontSize: 19.5, fontWeight: 800, color: '#0f172a' }}
                >
                  {platform === 'windows'
                    ? 'Install Skylent on Windows 10 / 11'
                    : 'Install Skylent on Your Device'}
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
              Run Skylent in its own dedicated window with a Desktop &amp; Taskbar shortcut, full-screen SQL/Python Labs, and instant dashboard access:
            </p>

            <div style={{ display: 'grid', gap: 11, marginBottom: 18 }}>
              {/* 1. Windows 10 / 11 Native Desktop App Card */}
              <div
                style={{
                  background: platform === 'windows' ? '#f5f3ff' : '#f8fafc',
                  border: platform === 'windows' ? '2px solid #5142b5' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 15px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1e1b4b' }}>
                    💻 Windows 10 &amp; 11 Desktop App
                  </div>
                  {deferredPrompt ? (
                    <button
                      type="button"
                      onClick={() => void triggerNativeInstall()}
                      style={{
                        background: '#5142b5',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(81, 66, 181, 0.28)',
                      }}
                    >
                      ⚡ Install Windows App
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#5142b5',
                        background: '#ede9fe',
                        padding: '3px 9px',
                        borderRadius: 999,
                      }}
                    >
                      Chrome &amp; Edge Supported
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
                  Click the <strong>Install Skylent (🖥️ / 📥)</strong> icon on the right side of your address bar in <strong>Chrome</strong> or <strong>Microsoft Edge</strong> (or open browser menu <strong>⋮ → Cast, save, and share → Install Skylent as app</strong>) to pin Skylent to your <strong>Windows Desktop &amp; Taskbar</strong>.
                </div>
              </div>

              {/* 2. Android Trusted Play Store / Verified WebAPK Card */}
              <div
                style={{
                  background: platform === 'android' ? '#f5f3ff' : '#f8fafc',
                  border: platform === 'android' ? '2px solid #5142b5' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '13px 15px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>
                    🤖 Android (Google Play &amp; Verified Install)
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: '#065f46',
                      background: '#dcfce7',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    ✓ Play Protect Verified
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.48, marginBottom: 8 }}>
                  In Chrome on Android, tap the browser menu <strong>(⋮)</strong> and select <strong>“Install app”</strong> (or <strong>Add to Home screen</strong>) for a Play-Services verified native app icon without unknown-source warnings.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    window.sessionStorage.setItem('skylent:native-shell', '1')
                    navigate('/?app=native')
                    window.location.reload()
                  }}
                  style={{
                    background: '#ffffff',
                    color: '#5142b5',
                    border: '1px solid #c4b5fd',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  📱 Preview Play Store Mobile App UI →
                </button>
              </div>

              {/* 3. iPhone & iPad Safari Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 15px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 3 }}>
                  🍎 iPhone &amp; iPad (Safari)
                </div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>
                  Tap the <strong>Share</strong> icon in Safari and select <strong>“Add to Home Screen”</strong>.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>
                Auto-updates with every release · 0 MB bloat
              </span>
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
