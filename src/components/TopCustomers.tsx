import type { Customer, Order } from "../data/mockData";
import { customerName, money, topCustomers } from "../lib/sales";
export default function TopCustomers({
  customers,
  orders,
}: {
  customers: Customer[];
  orders: Order[];
}) {
  const ranking = topCustomers(customers, orders);
  return (
    <section className="detail-card module-section">
      <h2>Top 5 klanten · enkel betaalde bestellingen</h2>
      <p className="page-subtitle">
        Totaal bestelbedrag per unieke klant, van hoog naar laag. Geannuleerde
        bestellingen tellen niet mee.
      </p>
      {ranking.length ? (
        <ol className="ranking-list">
          {ranking.map(({ customer, total }) => (
            <li key={customer.id}>
              {customerName(customer)} <strong>{money(total)}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">Nog geen betaalde bestellingen.</p>
      )}
    </section>
  );
}
