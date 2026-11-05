import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "../../context/AuthContext"
import { changePasswordRequest, type ProfessionalProfileDetails } from "../../lib/auth-api"

const LOCAL_PROF_KEY = "skylent:student-professional-profile:v1"

const DEFAULT_PROF: ProfessionalProfileDetails = {
  status: "College Student — Final Year",
  organization: "",
  roleOrDegree: "",
  graduationYear: "2026",
  targetTrack: "Data Analytics",
  linkedinUrl: "",
  githubUrl: "",
}

export default function StudentProfileAndSettingsPanel() {
  const { user, updateProfileDetails, markPasswordChanged } = useAuth()

  const [fullName, setFullName] = useState(user?.name ?? "")
  const [phoneInput, setPhoneInput] = useState(user?.phone ?? "")
  const [prof, setProf] = useState<ProfessionalProfileDetails>(() => {
    if (user?.professional) return { ...DEFAULT_PROF, ...user.professional }
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(LOCAL_PROF_KEY)
        if (raw) return { ...DEFAULT_PROF, ...(JSON.parse(raw) as Partial<ProfessionalProfileDetails>) }
      } catch {
        // ignore
      }
    }
    return DEFAULT_PROF
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [savingPass, setSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    if (user?.name) setFullName(user.name)
    if (user?.phone) setPhoneInput(user.phone)
    if (user?.professional) {
      setProf((prev) => ({ ...prev, ...user.professional }))
    }
  }, [user?.name, user?.phone, user?.professional])

  if (!user) return null

  const isPhoneLocked = Boolean(user.phone && user.phoneLocked !== false)
  const rotation = user.passwordRotation ?? {
    passwordUpdatedAt: new Date().toISOString(),
    daysSinceUpdate: 0,
    daysRemaining: 90,
    rotationDue: Boolean(user.mustChangePassword),
    nextRotationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const cleanName = fullName.trim()
      if (cleanName.length < 2) {
        throw new Error("Please enter your full name for certificates.")
      }
      const cleanPhone = !isPhoneLocked && phoneInput.trim() ? phoneInput.replace(/\D/g, "").slice(0, 10) : undefined
      if (cleanPhone && (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone))) {
        throw new Error("Enter a valid 10-digit Indian mobile number.")
      }

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(LOCAL_PROF_KEY, JSON.stringify(prof))
        } catch {
          // ignore
        }
      }

      await updateProfileDetails({
        displayName: cleanName,
        ...(cleanPhone ? { phone: cleanPhone } : {}),
        professional: prof,
      })
      setProfileMsg({
        type: "ok",
        text: cleanPhone
          ? "Profile saved and Mobile Number permanently locked to your account ✓"
          : "Profile and professional details saved ✓",
      })
    } catch (err) {
      setProfileMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Could not save profile changes.",
      })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordUpdate(e: FormEvent) {
    e.preventDefault()
    if (!currentPassword.trim()) {
      setPassMsg({ type: "err", text: "Enter your current password." })
      return
    }
    if (newPassword.trim().length < 12) {
      setPassMsg({ type: "err", text: "New password must be at least 12 characters." })
      return
    }
    setSavingPass(true)
    setPassMsg(null)
    try {
      await changePasswordRequest({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      })
      markPasswordChanged()
      setCurrentPassword("")
      setNewPassword("")
      setPassMsg({
        type: "ok",
        text: "Password updated ✓ Your 3-month (90-day) security rotation timer has been reset.",
      })
    } catch (err) {
      setPassMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Could not update password.",
      })
    } finally {
      setSavingPass(false)
    }
  }

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 14,
    fontFamily: "var(--font-body)",
  }

  const lockedFieldStyle = {
    ...fieldStyle,
    background: "#f1f5f9",
    color: "#475569",
    cursor: "not-allowed",
    fontWeight: 600,
  }

  const labelStyle = {
    display: "block",
    fontSize: 11.5,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "#475569",
    marginBottom: 6,
  }

  return (
    <div id="profile-settings" style={{ display: "grid", gap: 22 }}>
      {/* Top Profile Summary Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)",
          borderRadius: 18,
          padding: "24px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          boxShadow: "0 18px 40px -16px rgba(59, 45, 150, 0.45)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.18)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {user.avatar || (user.name[0] ?? "L").toUpperCase()}
          </span>
          <div>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#fde68a", display: "block" }}>
              LEARNER PROFILE &amp; ACCOUNT SETTINGS
            </span>
            <h2 style={{ margin: "4px 0", fontSize: 22, fontWeight: 800, color: "#ffffff" }}>
              {user.name}
            </h2>
            <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)" }}>
              {user.email} {user.phone ? `· +91-${user.phone}` : "· Mobile number not linked yet"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(16,185,129,0.22)", border: "1px solid rgba(110,231,183,0.5)", color: "#a7f3d0", fontSize: 12, fontWeight: 700 }}>
            🔒 1 Email ↔ 1 Mobile Identity Lock Active
          </span>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", color: "#ffffff", fontSize: 12, fontWeight: 700 }}>
            🔄 Password Policy: {rotation.daysRemaining}d left (3-Month Cycle)
          </span>
        </div>
      </section>

      {profileMsg ? (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: profileMsg.type === "ok" ? "#ecfdf5" : "#fef2f2",
            border: profileMsg.type === "ok" ? "1px solid #6ee7b7" : "1px solid #fecaca",
            color: profileMsg.type === "ok" ? "#065f46" : "#991b1b",
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          {profileMsg.text}
        </div>
      ) : null}

      <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: 22 }}>
        {/* Card 1: Account Identity & Permanent Lock */}
        <section
          className="sh-card"
          style={{ padding: "22px 24px", background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0" }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              1. Verified Account Identity (Permanent Email &amp; Mobile Lock)
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              To prevent duplicate accounts and protect certificate authenticity, your Email ID and Mobile Number (+91) are permanently locked once linked. Users cannot change them directly; any change requires emailing{" "}
              <a href="mailto:support@skylent.live" style={{ color: "#5142b5", fontWeight: 700 }}>
                support@skylent.live
              </a>{" "}
              for Admin verification.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            <div>
              <label htmlFor="prof-fullname" style={labelStyle}>
                Full Name (Printed on Certificates)
              </label>
              <input
                id="prof-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First and Last Name"
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="prof-email" style={labelStyle}>
                Registered Email Address 🔒 Locked
              </label>
              <input
                id="prof-email"
                type="email"
                value={user.email}
                disabled
                readOnly
                style={lockedFieldStyle}
              />
              <span style={{ fontSize: 11.5, color: "#64748b", display: "block", marginTop: 4 }}>
                🔒 Permanently bound to this account. Admin-only change via support@skylent.live.
              </span>
            </div>

            <div>
              <label htmlFor="prof-phone" style={labelStyle}>
                Registered Mobile Number (+91) {isPhoneLocked ? "🔒 Locked" : "· Bind Once"}
              </label>
              {isPhoneLocked ? (
                <>
                  <input
                    id="prof-phone"
                    type="text"
                    value={`+91-${user.phone}`}
                    disabled
                    readOnly
                    style={lockedFieldStyle}
                  />
                  <span style={{ fontSize: 11.5, color: "#64748b", display: "block", marginTop: 4 }}>
                    🔒 Permanently bound to {user.email}. Admin-only change via support@skylent.live.
                  </span>
                </>
              ) : (
                <>
                  <input
                    id="prof-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10-digit mobile number to lock permanently"
                    style={fieldStyle}
                  />
                  <span style={{ fontSize: 11.5, color: "#d97706", fontWeight: 600, display: "block", marginTop: 4 }}>
                    ⚠️ Enter carefully: once saved, this mobile number will be permanently locked to your account.
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Card 2: Professional & Academic Details */}
        <section
          className="sh-card"
          style={{ padding: "22px 24px", background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0" }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              2. Professional &amp; Academic Details
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              Used for your course certificates, project dossiers, and Career OS role matching.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div>
              <label htmlFor="prof-status" style={labelStyle}>Current Experience / Student Status</label>
              <select
                id="prof-status"
                value={prof.status}
                onChange={(e) => setProf({ ...prof, status: e.target.value })}
                style={fieldStyle}
              >
                <option value="College Student — Final Year">College Student — Final Year</option>
                <option value="College Student — 1st to Pre-Final Year">College Student — 1st to Pre-Final Year</option>
                <option value="Fresher / Recent Graduate">Fresher / Recent Graduate</option>
                <option value="Working Professional — Technical Roles">Working Professional — Technical Roles</option>
                <option value="Working Professional — Non-Technical">Working Professional — Non-Technical</option>
              </select>
            </div>

            <div>
              <label htmlFor="prof-org" style={labelStyle}>College / University or Company Name</label>
              <input
                id="prof-org"
                type="text"
                value={prof.organization}
                onChange={(e) => setProf({ ...prof, organization: e.target.value })}
                placeholder="e.g., ITER / KIIT / BPUT / TCS"
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="prof-degree" style={labelStyle}>Degree / Branch or Current Job Role</label>
              <input
                id="prof-degree"
                type="text"
                value={prof.roleOrDegree}
                onChange={(e) => setProf({ ...prof, roleOrDegree: e.target.value })}
                placeholder="e.g., B.Tech CSE / BCA / Business Analyst"
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="prof-grad" style={labelStyle}>Graduation / Batch Year</label>
              <input
                id="prof-grad"
                type="text"
                maxLength={10}
                value={prof.graduationYear}
                onChange={(e) => setProf({ ...prof, graduationYear: e.target.value })}
                placeholder="e.g., 2026"
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="prof-track" style={labelStyle}>Target Career Track</label>
              <select
                id="prof-track"
                value={prof.targetTrack}
                onChange={(e) => setProf({ ...prof, targetTrack: e.target.value })}
                style={fieldStyle}
              >
                <option value="Data Analytics">Data Analytics</option>
                <option value="Product Management">Product Management</option>
                <option value="Python & Data Engineering">Python &amp; Data Engineering</option>
                <option value="Data Science & AI">Data Science &amp; AI</option>
                <option value="Generative AI & LLM Systems">Generative AI &amp; LLM Systems</option>
                <option value="Full-Stack Web Engineering">Full-Stack Web Engineering</option>
              </select>
            </div>

            <div>
              <label htmlFor="prof-linkedin" style={labelStyle}>LinkedIn Profile URL</label>
              <input
                id="prof-linkedin"
                type="url"
                value={prof.linkedinUrl}
                onChange={(e) => setProf({ ...prof, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/yourname"
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="prof-github" style={labelStyle}>GitHub / Portfolio URL</label>
              <input
                id="prof-github"
                type="url"
                value={prof.githubUrl}
                onChange={(e) => setProf({ ...prof, githubUrl: e.target.value })}
                placeholder="https://github.com/yourname"
                style={fieldStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button
              type="submit"
              disabled={savingProfile}
              style={{
                padding: "11px 22px",
                borderRadius: 10,
                border: "none",
                background: "#5142b5",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {savingProfile ? "Saving Profile…" : "Save Profile & Professional Details ✓"}
            </button>
          </div>
        </section>
      </form>

      {/* Card 3: Password & 3-Month (90-Day) Mandatory Rotation Policy */}
      <section
        className="sh-card"
        style={{
          padding: "22px 24px",
          background: "#ffffff",
          borderRadius: 16,
          border: rotation.rotationDue ? "2px solid #f59e0b" : "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              3. Password &amp; 3-Month (90-Day) Auto-Rotation Security Policy
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              For account security, Skylent automatically prompts every user to rotate their password every <strong>3 months (90 days)</strong>.
            </p>
          </div>
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              background: rotation.rotationDue ? "#fef3c7" : "#ecfdf5",
              border: rotation.rotationDue ? "1px solid #f59e0b" : "1px solid #6ee7b7",
              color: rotation.rotationDue ? "#92400e" : "#065f46",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {rotation.rotationDue
              ? "⚠️ 3-Month Password Change Due Now"
              : `✓ Next Auto-Change Prompt in ${rotation.daysRemaining} Days`}
          </span>
        </div>

        {passMsg ? (
          <div
            role="status"
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              borderRadius: 10,
              background: passMsg.type === "ok" ? "#ecfdf5" : "#fef2f2",
              border: passMsg.type === "ok" ? "1px solid #6ee7b7" : "1px solid #fecaca",
              color: passMsg.type === "ok" ? "#065f46" : "#991b1b",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {passMsg.text}
          </div>
        ) : null}

        <form onSubmit={handlePasswordUpdate} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, alignItems: "end" }}>
          <div>
            <label htmlFor="sec-curr-pass" style={labelStyle}>Current Password</label>
            <input
              id="sec-curr-pass"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={fieldStyle}
            />
          </div>
          <div>
            <label htmlFor="sec-new-pass" style={labelStyle}>New Password (Min 12 Characters)</label>
            <input
              id="sec-new-pass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 12 characters"
              style={fieldStyle}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={savingPass}
              style={{
                width: "100%",
                padding: "11px 18px",
                borderRadius: 10,
                border: "none",
                background: "#0f172a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              {savingPass ? "Updating Password…" : "Update Password (Reset 90d Timer)"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
