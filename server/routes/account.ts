import bcrypt from "bcryptjs";
import express from "express";
import { publicUser, save } from "../store";
export function registeraccount(app: express.Express) {
  app.get("/api/me", (_, res) => res.json(publicUser(res.locals.user)));
  app.post("/api/password", async (req, res) => {
    const u = res.locals.user;
    const p = String(req.body.newPw || "");
    if (
      p.length < 12 ||
      Buffer.byteLength(p) > 72 ||
      !(await bcrypt.compare(String(req.body.oldPw), u.passwordHash))
    )
      return res.status(400).json({
        error:
          "Controleer huidig wachtwoord; nieuw wachtwoord: 12 tekens tot 72 bytes.",
      });
    u.passwordHash = await bcrypt.hash(p, 12);
    save();
    res.json({ ok: true });
  });
}
