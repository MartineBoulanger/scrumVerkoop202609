import { useState } from "react";
import { api } from "../lib/api";

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="field-wrapper">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="password-field"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="password-toggle"
          tabIndex={-1}
          aria-label={show ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
        >
          {show ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="password-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="password-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function validate() {
    if (!oldPw || !newPw || !confirmPw) return "Vul alle velden in.";

    if (newPw === oldPw)
      return "Nieuw wachtwoord mag niet hetzelfde zijn als het huidige.";
    if (newPw !== confirmPw)
      return "Nieuw wachtwoord en bevestiging komen niet overeen.";
    if (newPw.length < 12)
      return "Nieuw wachtwoord moet minstens 12 tekens bevatten.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    try {
      await api("/password", "POST", { oldPw, newPw });
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    setSuccess(true);
    setOldPw("");
    setNewPw("");
    setConfirmPw("");
  }

  return (
    <div className="password-page">
      <h1 className="password-title">Wachtwoord wijzigen</h1>
      <p className="password-description">
        Wachtwoorden worden gehasht opgeslagen met BCrypt.
      </p>

      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <span>
            Wachtwoord succesvol gewijzigd. Het nieuwe wachtwoord is gehasht
            opgeslagen.
          </span>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="password-form">
        <PasswordInput
          label="Huidig wachtwoord"
          value={oldPw}
          onChange={(v) => {
            setOldPw(v);
            setSuccess(false);
          }}
          autoComplete="current-password"
        />
        <PasswordInput
          label="Nieuw wachtwoord"
          value={newPw}
          onChange={(v) => {
            setNewPw(v);
            setSuccess(false);
          }}
          autoComplete="new-password"
        />
        <PasswordInput
          label="Bevestig nieuw wachtwoord"
          value={confirmPw}
          onChange={(v) => {
            setConfirmPw(v);
            setSuccess(false);
          }}
          autoComplete="new-password"
        />

        <div className="password-actions">
          <p className="password-help">Minstens 12 tekens vereist</p>
          <button type="submit" className="password-submit">
            Wachtwoord opslaan
          </button>
        </div>
      </form>

      <div className="password-security-note">
        <strong className="password-security-label">Beveiligingsinfo:</strong>{" "}
        Wachtwoorden worden nooit in leesbare tekst opgeslagen. Na opslaan wordt
        het wachtwoord direct gehasht via BCrypt voordat het in de database
        terechtkomt.
      </div>
    </div>
  );
}
