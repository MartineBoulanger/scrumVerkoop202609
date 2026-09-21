import express from "express";
import { db, save } from "../store";
export function registersales(app: express.Express) {
  app.get("/api/data", (_, res) =>
    res.json({
      customers: db.customers,
      orders: db.orders,
      articles: db.articles,
    }),
  );
  app.put("/api/customers/:id", (req, res) => {
    const i = db.customers.findIndex(
      (c: any) => c.id === Number(req.params.id),
    );
    if (i < 0) return res.status(404).json({ error: "Klant niet gevonden" });
    const b = req.body;
    if (
      !Array.isArray(b.addresses) ||
      !b.addresses.every(
        (a: any) =>
          a.street &&
          a.number &&
          a.postalCode &&
          a.city &&
          ["levering", "facturatie"].includes(a.type),
      )
    )
      return res.status(400).json({ error: "Vul alle adresvelden in." });
    db.customers[i] = {
      ...db.customers[i],
      addresses: b.addresses,
      accountActive: !!b.accountActive,
    };
    save();
    res.json(db.customers[i]);
  });
  app.put("/api/orders/:id", (req, res) => {
    const o = db.orders.find((o: any) => o.id === Number(req.params.id));
    if (!o) return res.status(404).json({ error: "Bestelling niet gevonden" });
    const b = req.body;
    if (
      b.status === "Geleverd" &&
      ["Betaald", "Ingepakt", "Verzonden"].includes(o.status)
    ) {
      o.status = "Geleverd";
      save();
      return res.json(o);
    }
    if (o.invoiceNumber)
      return res.status(400).json({
        error: "Gefactureerde bestelling kan niet meer worden gewijzigd.",
      });
    if (!["Lopend", "Betaald"].includes(o.status))
      return res
        .status(400)
        .json({ error: "Bestelling is niet meer wijzigbaar" });
    if (b.status === "Geannuleerd") {
      o.status = "Geannuleerd";
      save();
      return res.json(o);
    }
    if (
      !Array.isArray(b.lines) ||
      !b.lines.length ||
      new Set(b.lines.map((l: any) => l.id)).size !== b.lines.length ||
      !b.lines.every((l: any) => {
        const old = o.lines.find((x: any) => x.id === l.id);
        return (
          old &&
          Number.isInteger(l.quantity) &&
          l.quantity >= 1 &&
          l.quantity <= old.quantity
        );
      })
    )
      return res.status(400).json({ error: "Ongeldige bestellijnen" });
    const c = db.customers.find((c: any) => c.id === o.customerId);
    if (
      b.deliveryAddressId !== o.deliveryAddressId &&
      !c.addresses.some(
        (a: any) =>
          a.id === b.deliveryAddressId && a.type === "levering" && a.active,
      )
    )
      return res.status(400).json({ error: "Ongeldig leveringsadres" });
    o.lines = b.lines.map((l: any) => {
      const old = o.lines.find((x: any) => x.id === l.id);
      return {
        ...old,
        quantity: l.quantity,
        totalAmount: Math.round(old.unitPrice * l.quantity * 100) / 100,
      };
    });
    o.deliveryAddressId = b.deliveryAddressId;
    save();
    res.json(o);
  });
}
