import logoPrularia from "@/assets/logo_prularia_zwart.png";
import { useState } from "react";
import { api } from "../lib/api";

interface Props {
  onLogin: (user: any) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      onLogin(await api("/login", "POST", { username, password }));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="login-page">
      {/* Left brand panel */}
      <div className="login-brand">
        <img src={logoPrularia} alt="Prularia" className="login-logo" />
        <p className="login-caption">Verkoop — Intern systeem</p>
      </div>

      {/* Right login panel */}
      <div className="login-panel">
        <div className="login-content">
          {/* Mobile logo */}
          <div className="login-mobile-brand">
            <img
              src={logoPrularia}
              alt="Prularia"
              className="login-mobile-logo"
            />
          </div>

          <h1 className="login-title">Aanmelden</h1>
          <p className="login-description">
            Enkel toegankelijk voor leden van{" "}
            <span className="login-group">Cwebsite</span>
          </p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="field-label">Gebruikersnaam</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="bijv. a.janssen"
                className="login-field"

                autoFocus
              />
            </div>
            <div>
              <label className="field-label">Wachtwoord</label>
              <div className="field-wrapper">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-field"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="password-toggle"
                  tabIndex={-1}
                  aria-label={
                    show ? "Wachtwoord verbergen" : "Wachtwoord tonen"
                  }
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

            <button type="submit" className="login-submit">
              Aanmelden
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
