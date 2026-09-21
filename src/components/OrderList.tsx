import { useState } from 'react';
import type { Customer, Order, OrderStatus } from '../data/mockData';
import { warehousePdf } from '../lib/pdf';
import {
  ageClass,
  deliveryAgeLabel,
  awaitingDelivery,
  daysSince,
  overdueDelivery,
  overduePayment,
  paidDate,
} from '../lib/sales';
import { customerName, Page, StatusBadge } from './SalesUI';

export default function OrderList({
  orders,
  customers,
  onSelect,
}: {
  orders: Order[];
  customers: Customer[];
  onSelect: (id: number) => void;
}) {
  const [followup, setFollowup] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'Alle'>('Alle');
  const nameFor = (id: number) => {
    const c = customers.find((x) => x.id === id);
    return c ? customerName(c) : '—';
  };
  const totalQty = (order: Order) =>
    order.lines.reduce((sum, l) => sum + l.quantity, 0);
  const filtered = orders.filter(
    (o) =>
      nameFor(o.customerId).toLowerCase().includes(search.toLowerCase()) &&
      (status === 'Alle' || o.status === status) &&
      (followup === 'all' ||
        (followup === 'delivery' && awaitingDelivery(o)) ||
        (followup === 'late' && overdueDelivery(o)) ||
        (followup === 'unpaid' && overduePayment(o))),
  );
  return (
    <Page>
      <div className='list-heading'>
        <div>
          <p className='eyebrow'>Orderbeheer</p>
          <h1 className='page-title'>Bestellingen</h1>
          <p className='page-subtitle'>
            Klik op een bestelling om de detailpagina te openen.
          </p>
        </div>
        <p className='result-count'>
          {filtered.length} van {orders.length} bestellingen
        </p>
      </div>
      <div className='list-card'>
        <div className='toolbar'>
          <input
            type='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Zoeken op klantnaam…'
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | 'Alle')}
          >
            {[
              'Alle',
              'Lopend',
              'Betaald',
              'Ingepakt',
              'Verzonden',
              'Geleverd',
              'Geannuleerd',
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label='Opvolging'
            value={followup}
            onChange={(e) => setFollowup(e.target.value)}
          >
            <option value='all'>Alle opvolging</option>
            <option value='delivery'>Betaald, niet geleverd</option>
            <option value='late'>Levering &gt; 5 dagen</option>
            <option value='unpaid'>Onbetaald &gt; 5 dagen</option>
          </select>
          <button
            className='action-button'
            onClick={() => warehousePdf(filtered, customers)}
          >
            Gefilterde lijst · magazijn PDF
          </button>
        </div>
        <div className='table-scroll'>
          <table className='data-table orders-table'>
            <thead>
              <tr>
                <th>Bestelling</th>
                <th>Klant</th>
                <th>Datum</th>
                <th>Status</th>
                <th>Dagen sinds bestelling</th>
                <th>Leverstatus</th>
                <th>Opvolging</th>
                <th className='align-right'>Artikelen</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelect(o.id);
                  }}
                  onClick={() => onSelect(o.id)}
                >
                  <td className='order-reference'>{o.orderNumber}</td>
                  <td>
                    <b>{nameFor(o.customerId)}</b>
                  </td>
                  <td>{o.date}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td>{daysSince(o.date)} dagen</td>
                  <td>
                    <span className={ageClass(daysSince(o.date))}>
                      {deliveryAgeLabel(daysSince(o.date))}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        overduePayment(o) || overdueDelivery(o)
                          ? 'age-danger'
                          : ''
                      }
                    >
                      {overduePayment(o)
                        ? 'Betaling achterstallig'
                        : awaitingDelivery(o)
                          ? `${daysSince(paidDate(o))} dagen na betaling${overdueDelivery(o) ? ' · Te laat' : ' · Binnen termijn'}`
                          : '—'}
                    </span>
                  </td>
                  <td className='quantity-cell'>{totalQty(o)}</td>
                  <td className='chevron'>›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className='empty-state'>Geen bestellingen gevonden.</div>
        )}
      </div>
    </Page>
  );
}
