import TopCustomers from "./TopCustomers";
import { useState } from "react";
import type { Customer, Order } from "../data/mockData";
import {
  isPaid,
  money,
  monthlyRevenue,
  today,
  topArticles,
} from "../lib/sales";
export function Reports({
  customers,
  orders,
  articles,
}: {
  customers: Customer[];
  orders: Order[];
  articles: any[];
}) {
  const current = Number(today().slice(0, 4));
  const [year, setYear] = useState(current);
  const months = monthlyRevenue(orders, year);
  const max = Math.max(1, ...months.map((m) => m.total));
  const sold = topArticles(orders.filter(isPaid));
  return (
    <div className="page-shell">
      <h1 className="page-title">Rapporten</h1>
      <TopCustomers customers={customers} orders={orders} />
      <section className="detail-card module-section">
        <h2>Omzet per maand</h2>
        <label>
          Jaar{" "}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from(
              new Set([
                current,
                ...orders.map((o) => Number(o.date.slice(0, 4))),
              ]),
            )
              .sort((a, b) => b - a)
              .map((y) => (
                <option key={y}>{y}</option>
              ))}
          </select>
        </label>
        <p className="page-subtitle">
          Betaalde bestellingen, geboekt op berekende betaaldatum.
        </p>
        <div
          className="revenue-chart"
          role="img"
          aria-label={`Maandomzet ${year}: ${months.map((m) => `${m.month}: ${money(m.total)}`).join(", ")}`}
        >
          {months.map((m) => (
            <div className="chart-column" key={m.month}>
              <span>{money(m.total)}</span>
              <div className="chart-track">
                <div
                  className="chart-bar"
                  style={{ height: `${(m.total / max) * 100}%` }}
                />
              </div>
              <span>
                {new Date(year, m.month - 1).toLocaleString("nl-BE", {
                  month: "short",
                })}
              </span>
            </div>
          ))}
        </div>
        {months.every((m) => m.total === 0) && (
          <p>Geen betaalde omzet in dit jaar.</p>
        )}
      </section>
      <section className="detail-card module-section">
        <h2>Best verkochte artikelen per categorie</h2>
        <p className="page-subtitle">
          Gerangschikt op verkochte aantallen, enkel betaald.
        </p>
        <div className="table-scroll">
          <table className="inner-table">
            <thead>
              <tr>
                <th>Categorie</th>
                <th>Naam</th>
                <th>Leverancier</th>
                <th>Aantal</th>
              </tr>
            </thead>
            <tbody>
              {sold
                .map((a) => ({
                  ...a,
                  ...articles.find((x) => x.id === a.number),
                }))
                .sort(
                  (a, b) =>
                    a.category.localeCompare(b.category) ||
                    b.quantity - a.quantity,
                )
                .map((a) => (
                  <tr key={a.number}>
                    <td>{a.category}</td>
                    <td>{a.name}</td>
                    <td>{a.supplier}</td>
                    <td>{a.quantity}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
