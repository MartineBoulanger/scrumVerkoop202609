import bcrypt from "bcryptjs";
import express from "express";
import { attempts, db, publicUser } from "../store";
export function registerlogin(app: express.Express) {
  app.post("/api/login", async (req, res) => {
    const key = req.ip || "local";
    const a = attempts.get(key);
    if (a && a.count >= 10 && Date.now() - a.time < 600000)
      return res
        .status(429)
        .json({ error: "Probeer over 10 minuten opnieuw." });
    const u = db.users.find(
      (u: any) => u.username === String(req.body.username).toLowerCase(),
    );
    if (
      !u ||
      !u.active ||
      !u.employeeActive ||
      !u.groups.includes("Cwebsite") ||
      !(await bcrypt.compare(String(req.body.password), u.passwordHash))
    ) {
      attempts.set(key, {
        count: (a && Date.now() - a.time < 600000 ? a.count : 0) + 1,
        time: Date.now(),
      });
      return res
        .status(401)
        .json({ error: "Ongeldige aanmelding of account niet actief." });
    }
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: "Sessie mislukt" });
      (req.session as any).userId = u.id;
      attempts.delete(key);
      res.json(publicUser(u));
    });
  });
  app.post("/api/logout", (req, res) =>
    req.session.destroy(() => res.json({ ok: true })),
  );
}
