import express from "express";
import session from "express-session";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { registeraccount } from "./routes/account";
import { registeradmin } from "./routes/admin";
import { registerarticles } from "./routes/articles";
import { registerchat } from "./routes/chat";
import { registerinvoices } from "./routes/invoices";
import { registerlogin } from "./routes/login";
import { registerpublicChat } from "./routes/publicChat";
import { registersales } from "./routes/sales";
import { db } from "./store";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", "loopback");
app.use((_, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  if (
    req.method !== "GET" &&
    req.headers.origin &&
    ![
      `${req.protocol}://${req.headers.host}`,
      process.env.APP_ORIGIN || "http://127.0.0.1:5173",
    ].includes(req.headers.origin)
  ) {
    return res.status(403).json({ error: "Ongeldige herkomst" });
  }
  next();
});
app.use(
  session({
    secret: process.env.SESSION_SECRET || randomBytes(48).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 3600000,
    },
  }),
);
registerlogin(app);
registerpublicChat(app);
app.use("/api", (req, res, next) => {
  const u = db.users.find((u: any) => u.id === (req.session as any).userId);
  if (!u?.active || !u.employeeActive || !u.groups.includes("Cwebsite"))
    return res.status(401).json({ error: "Meld u opnieuw aan." });
  res.locals.user = u;
  next();
});
registeraccount(app);
registersales(app);
registeradmin(app);
registerinvoices(app);
registerarticles(app);
registerchat(app);
app.use("/api", (_, res) => res.status(404).json({ error: "Niet gevonden" }));
app.use(express.static(resolve("dist")));
app.get("/{*path}", (_, res) => res.sendFile(resolve("dist/index.html")));
app.use(((error, _req, res, _next) => {
  console.error(error.message);
  res
    .status(500)
    .json({
      error:
        "Serverfout. Probeer opnieuw; wijzigingen zijn mogelijk niet opgeslagen.",
    });
}) as express.ErrorRequestHandler);
app.listen(Number(process.env.PORT || 3001), "127.0.0.1", () =>
  console.log("Sales API: http://127.0.0.1:3001"),
);
