import express from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { db, invites, save } from "../store";
export function registerchat(app: express.Express) {
  app.use("/api/chat", (_, res, next) =>
    res.locals.user.groups.some((g: string) =>
      ["Admin", "Klantendienst"].includes(g),
    )
      ? next()
      : res.status(403).json({ error: "Enkel klantendienst" }),
  );
  app.post("/api/chat/:id/invite", (req, res) => {
    const customerId = Number(req.params.id);
    if (!db.customers.some((c: any) => c.id === customerId))
      return res.status(404).json({ error: "Klant niet gevonden" });
    for (const [key, value] of invites)
      if (value.customerId === customerId || value.expires < Date.now())
        invites.delete(key);
    const token = randomBytes(32).toString("hex");
    invites.set(token, { customerId, expires: Date.now() + 86400000 });
    res.json({ token });
  });
  app.get("/api/chat/:id", (req, res) =>
    res.json(
      db.messages.filter((m: any) => m.customerId === Number(req.params.id)),
    ),
  );
  app.post("/api/chat/:id", (req, res) => {
    if (
      !db.customers.some((c: any) => c.id === Number(req.params.id)) ||
      typeof req.body.text !== "string" ||
      !req.body.text.trim() ||
      req.body.text.length > 4000
    )
      return res.status(400).json({ error: "Ongeldig bericht" });
    const m = {
      id: randomUUID(),
      customerId: Number(req.params.id),
      sender: res.locals.user.name,
      text: req.body.text.trim(),
      date: new Date().toISOString(),
    };
    db.messages.push(m);
    save();
    res.json(m);
  });
}
