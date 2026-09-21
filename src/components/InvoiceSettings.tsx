import { useEffect, useState } from "react";
import { api } from "../lib/api";
export default function InvoiceSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    api("/admin/invoice-settings")
      .then(setSettings)
      .catch((e) => setMessage(e.message));
  }, []);
  return (
    <details className="detail-card module-section">
      <summary>Facturatie · bedrijfsgegevens en prijsinstelling</summary>
      <p role="status">{message}</p>
      {settings && (
        <form
          className="module-form"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setSettings(
                await api("/admin/invoice-settings", "PUT", settings),
              );
              setMessage("Facturatiegegevens opgeslagen.");
            } catch (e) {
              setMessage((e as Error).message);
            }
          }}
        >
          {[
            ["name", "Bedrijfsnaam"],
            ["address", "Volledig bedrijfsadres"],
            ["companyNumber", "Ondernemingsnummer"],
            ["vatNumber", "BTW-nummer"],
            ["iban", "IBAN"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                required
                value={settings[key]}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: e.target.value })
                }
              />
            </label>
          ))}
          <label>
            Prijzen in bestellingen
            <select
              value={String(settings.pricesIncludeVat)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pricesIncludeVat: e.target.value === "true",
                })
              }
            >
              <option value="true">Inclusief btw</option>
              <option value="false">Exclusief btw</option>
            </select>
          </label>
          <button className="action-button">Opslaan</button>
        </form>
      )}
    </details>
  );
}
