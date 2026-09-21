import type { Customer, Order } from '../data/mockData';
export const customerName = (c: Customer) =>
  c.type === 'bedrijf' ? c.companyName! : `${c.firstName} ${c.lastName}`;
export const money = (n: number) =>
  new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(
    n,
  );
export const orderTotal = (lines: { totalAmount: number }[]) =>
  Math.round(lines.reduce((s, l) => s + l.totalAmount, 0) * 100) / 100;
export const today = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Brussels' }).format(
    new Date(),
  );
export const daysSince = (date: string, now = today()) =>
  Math.max(0, Math.floor((Date.parse(now) - Date.parse(date)) / 86400000));
export const isPaid = (o: Order) =>
  o.status !== 'Geannuleerd' &&
  ['Betaald', 'Ingepakt', 'Verzonden', 'Geleverd'].includes(o.status);
export function paidDate(o: Order) {
  const d = new Date(o.date + 'T00:00:00Z');
  if (o.paymentMethod === 'Overschrijving') d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
export const awaitingDelivery = (o: Order) =>
  isPaid(o) && o.status !== 'Geleverd';
export const overdueDelivery = (o: Order, now = today()) =>
  awaitingDelivery(o) && daysSince(paidDate(o), now) > 5;
export const overduePayment = (o: Order, now = today()) =>
  o.status === 'Lopend' && daysSince(o.date, now) > 5;
export const ageClass = (days: number) =>
  days >= 11 ? 'age-danger' : days >= 6 ? 'age-warning' : 'age-ok';
export const deliveryAgeLabel = (days: number) =>
  days >= 11 ? 'Rood' : days >= 6 ? 'Oranje' : 'OK';
export function lastOrder(id: number, orders: Order[]) {
  return orders
    .filter((o) => o.customerId === id && o.status !== 'Geannuleerd')
    .map((o) => o.date)
    .sort()
    .at(-1);
}
export function inactiveCustomer(c: Customer, orders: Order[], now = today()) {
  const last = lastOrder(c.id, orders);
  if (!last) return false;
  const d = new Date(now + 'T00:00:00Z');
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - 1);
  const end = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(day, end));
  return last < d.toISOString().slice(0, 10);
}
export function topArticles(orders: Order[]) {
  const map = new Map<
    string,
    { number: string; name: string; quantity: number }
  >();
  for (const o of orders.filter((o) => o.status !== 'Geannuleerd'))
    for (const l of o.lines) {
      const a = map.get(l.articleNumber) || {
        number: l.articleNumber,
        name: l.articleName,
        quantity: 0,
      };
      a.quantity += l.quantity;
      map.set(a.number, a);
    }
  return [...map.values()].sort(
    (a, b) => b.quantity - a.quantity || a.number.localeCompare(b.number),
  );
}
export function topCustomers(customers: Customer[], orders: Order[]) {
  return customers
    .map((c) => ({
      customer: c,
      total: orderTotal(
        orders
          .filter((o) => o.customerId === c.id && isPaid(o))
          .flatMap((o) => o.lines),
      ),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total || a.customer.id - b.customer.id)
    .slice(0, 5);
}
export function monthlyRevenue(orders: Order[], year: number, now = today()) {
  return Array.from(
    {
      length:
        year === Number(now.slice(0, 4))
          ? Number(now.slice(5, 7))
          : year < Number(now.slice(0, 4))
            ? 12
            : 0,
    },
    (_, i) => ({
      month: i + 1,
      total: orderTotal(
        orders
          .filter(
            (o) =>
              isPaid(o) &&
              paidDate(o).startsWith(
                `${year}-${String(i + 1).padStart(2, '0')}`,
              ),
          )
          .flatMap((o) => o.lines),
      ),
    }),
  );
}
