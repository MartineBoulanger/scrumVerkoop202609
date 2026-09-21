import { useEffect, useState } from "react";
import type { Customer } from "../data/mockData";
import { api } from "../lib/api";
import { customerName } from "../lib/sales";
export function Chat({ customers }: { customers: Customer[] }) {
  const [id, setId] = useState(customers[0]?.id || 0);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [link, setLink] = useState("");
  useEffect(() => {
    let active = true;
    setMessages([]);
    setLink("");
    async function load() {
      try {
        const m = await api(`/chat/${id}`);
        if (active) {
          setMessages(m);
          setError("");
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    }
    void load();
    const timer = setInterval(load, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);
  return (
    <div className="page-shell">
      <h1 className="page-title">Chat klantendienst</h1>
      <select
        disabled={sending}
        aria-label="Klant"
        className="module-select"
        value={id}
        onChange={(e) => setId(Number(e.target.value))}
      >
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {customerName(c)}
          </option>
        ))}
      </select>
      <button
        className="action-button"
        onClick={async () => {
          try {
            const d = await api(`/chat/${id}/invite`, "POST");
            setLink(`${location.origin}/?chat=${d.token}`);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Klantlink maken (24 uur)
      </button>
      {link && (
        <p>
          <a href={link} target="_blank" rel="noreferrer">
            Open klantchat
          </a>
          <input aria-label="Klantlink om te delen" readOnly value={link} />
        </p>
      )}
      {error && (
        <p role="alert" className="error-notice">
          {error}
        </p>
      )}
      <div className="detail-card module-section chat-log" aria-live="polite">
        {!messages.length && (
          <p>
            Nog geen berichten. Deel de klantlink om een gesprek te starten.
          </p>
        )}
        {messages.map((m) => (
          <div className="chat-message" key={m.id}>
            <strong>{m.sender}</strong>
            <time>{new Date(m.date).toLocaleString("nl-BE")}</time>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <form
        className="module-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setSending(true);
          try {
            await api(`/chat/${id}`, "POST", { text });
            setText("");
            setMessages(await api(`/chat/${id}`));
            setError("");
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setSending(false);
          }
        }}
      >
        <label>
          Bericht
          <textarea
            value={text}
            maxLength={4000}
            required
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button className="action-button" disabled={sending || !text.trim()}>
          Versturen
        </button>
      </form>
    </div>
  );
}
