import express from "express";
import { randomUUID } from "node:crypto";
import { db, invites, save } from "../store";
export function registerpublicChat(app: express.Express) {
  app.all("/api/public/chat/:token", (req, res) => {
    const invite = invites.get(String(req.params.token));
    if (!invite || invite.expires < Date.now())
      return res
        .status(403)
        .json({ error: "Deze klantlink is verlopen of ongeldig." });
    if (req.method === "GET")
      return res.json(
        db.messages.filter((m: any) => m.customerId === invite.customerId),
      );
    if (req.method !== "POST")
      return res.status(405).json({ error: "Niet toegestaan" });
    const text = req.body.text;
    if (typeof text !== "string" || !text.trim() || text.length > 4000)
      return res.status(400).json({ error: "Ongeldig bericht" });
    const c = db.customers.find((c: any) => c.id === invite.customerId);
    const m = {
      id: randomUUID(),
      customerId: c.id,
      sender: c.companyName || `${c.firstName} ${c.lastName}`,
      text: text.trim(),
      date: new Date().toISOString(),
    };
    db.messages.push(m);
    save();
    res.json(m);
  });
}
