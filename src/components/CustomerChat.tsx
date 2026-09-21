import { useEffect, useState } from "react";
import { api } from "../lib/api";
export function CustomerChat({ token }: { token: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const path = "/public/chat/" + encodeURIComponent(token);
  useEffect(() => {
    let active = true;
    const load = () =>
      api(path)
        .then((d) => {
          if (active) setMessages(d);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    void load();
    const t = setInterval(load, 2000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [path]);
  return (
    <main className="page-shell">
      <h1 className="page-title">Prularia klantendienst</h1>
      {error && <p role="alert">{error}</p>}
      <div className="chat-log" aria-live="polite">
        {messages.map((m) => (
          <div className="chat-message" key={m.id}>
            <strong>{m.sender}</strong>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <form
        className="module-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api(path, "POST", { text });
            setText("");
            setMessages(await api(path));
            setError("");
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Bericht
          <textarea
            required
            maxLength={4000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button className="action-button" disabled={busy || !text.trim()}>
          Versturen
        </button>
      </form>
    </main>
  );
}
