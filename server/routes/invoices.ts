import { MOCK_COMPANY, MOCK_VAT_RATE } from "../../src/data/mockCatalog";
import { isPaid, paidDate } from "../../src/lib/sales";
import express from "express";
import { db, save } from "../store";
export function registerinvoices(app: express.Express) {
  app.post("/api/invoices/:id", (req, res) => {
    const o = db.orders.find((o: any) => o.id === Number(req.params.id));
    if (!o || o.status === "Geannuleerd")
      return res.status(400).json({ error: "Geen factureerbare bestelling." });
    const existing = db.invoices.find((i: any) => i.orderId === o.id);
    if (existing) return res.json(existing);
    const settings = MOCK_COMPANY;
    const c = db.customers.find((c: any) => c.id === o.customerId);
    const address = c.addresses.find((a: any) => a.id === o.billingAddressId);
    if (!address)
      return res.status(400).json({ error: "Facturatieadres ontbreekt." });
    const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    const lines = o.lines.map((l: any) => {
      const rate = MOCK_VAT_RATE;
      const net = round(
        settings.pricesIncludeVat
          ? l.totalAmount / (1 + rate / 100)
          : l.totalAmount,
      );
      const vat = round(
        settings.pricesIncludeVat ? l.totalAmount - net : (net * rate) / 100,
      );
      return { ...l, vatRate: rate, net, vat, gross: round(net + vat) };
    });
    const date = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Brussels",
    }).format(new Date());
    const year = date.slice(0, 4);
    const number = `FAC-${year}-${String(db.invoices.filter((i: any) => i.date.startsWith(year)).length + 1).padStart(5, "0")}`;
    const invoice = {
      orderId: o.id,
      number,
      date,
      orderNumber: o.orderNumber,
      orderDate: o.date,
      paymentMethod: o.paymentMethod,
      orderStatus: o.status,
      paidOn: isPaid(o) ? paidDate(o) : null,
      promoCode: o.promoCode,
      contact: c.contacts?.find(
        (person: any) => person.id === o.contactPersonId,
      ),
      deliveryAddress: {
        ...c.addresses.find((a: any) => a.id === o.deliveryAddressId),
      },
      seller: { ...settings },
      customer: JSON.parse(JSON.stringify(c)),
      address: { ...address },
      lines,
      net: round(lines.reduce((n: number, l: any) => n + l.net, 0)),
      vat: round(lines.reduce((n: number, l: any) => n + l.vat, 0)),
      gross: round(lines.reduce((n: number, l: any) => n + l.gross, 0)),
    };
    db.invoices.push(invoice);
    o.invoiceNumber = number;
    save();
    res.json(invoice);
  });
}
