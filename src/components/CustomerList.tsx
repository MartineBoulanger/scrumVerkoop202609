import { useEffect, useRef, useState } from 'react';
import type { Customer, Order } from '../data/mockData';
import { inactivePdf } from '../lib/pdf';
import { inactiveCustomer, lastOrder } from '../lib/sales';
import { customerName, Page, StatusBadge } from './SalesUI';

function ContactsDropdown({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!customer.contacts || customer.contacts.length === 0)
    return <span className='empty-contact'>—</span>;

  return (
    <div
      ref={ref}
      className='contact-menu'
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={() => setOpen((v) => !v)} className='contacts-btn'>
        {customer.contacts.length} contact
        {customer.contacts.length !== 1 ? 'en' : ''} ▾
      </button>
      {open && (
        <div className='contacts-dropdown'>
          {customer.contacts.map((cp) => (
            <div key={cp.id} className='contacts-dropdown-item'>
              {cp.firstName} {cp.lastName}
              <span>{cp.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerList({
  customers,
  orders,
  onSelect,
}: {
  customers: Customer[];
  orders: Order[];
  onSelect: (id: number) => void;
}) {
  const [inactive, setInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const orderCount = (customerId: number) =>
    orders.filter((o) => o.customerId === customerId).length;

  const filtered = customers.filter(
    (c) =>
      customerName(c).toLowerCase().includes(search.toLowerCase()) &&
      (status === 'all' || c.accountActive === (status === 'active')) &&
      (!inactive || inactiveCustomer(c, orders)),
  );

  return (
    <Page>
      <div className='list-heading'>
        <div>
          <p className='eyebrow'>Klantenbeheer</p>
          <h1 className='page-title'>Klanten</h1>
          <p className='page-subtitle'>
            Klik op een klant om de detailpagina te openen.
          </p>
        </div>
        <p className='result-count'>
          {filtered.length} van {customers.length} klanten
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
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>Alle statussen</option>
            <option value='active'>Actief</option>
            <option value='blocked'>Inactief</option>
          </select>
          <label>
            <input
              type='checkbox'
              checked={inactive}
              onChange={(e) => setInactive(e.target.checked)}
            />
            {'Meer dan 1 maand geen bestelling'}
          </label>
          <button
            className='action-button'
            onClick={() =>
              inactivePdf(
                filtered.filter((c) => inactiveCustomer(c, orders)),
                orders,
              )
            }
          >
            Inactieve klanten PDF
          </button>
        </div>
        <div className='table-scroll'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Klantnaam</th>
                <th>Type</th>
                <th>Contactpersonen</th>
                <th>Status</th>
                <th>Laatste bestelling</th>
                <th className='align-right'>Bestellingen</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelect(c.id);
                  }}
                  onClick={() => onSelect(c.id)}
                >
                  <td className='customer-reference'>
                    #{c.id.toString().padStart(4, '0')}
                  </td>
                  <td>
                    <b>{customerName(c)}</b>
                  </td>
                  <td>
                    <span className='type-pill'>
                      {c.type === 'bedrijf' ? 'Bedrijf' : 'Particulier'}
                    </span>
                  </td>
                  <td>
                    {c.type === 'bedrijf' ? (
                      <ContactsDropdown customer={c} />
                    ) : (
                      <span className='empty-contact-small'>—</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge
                      status={c.accountActive ? 'Actief' : 'Inactief'}
                    />
                  </td>
                  <td>
                    <span
                      className={
                        inactiveCustomer(c, orders) ? 'age-warning' : ''
                      }
                    >
                      {lastOrder(c.id, orders) || 'Nog nooit besteld'}
                    </span>
                  </td>
                  <td className='customer-count'>{orderCount(c.id)}</td>
                  <td className='chevron'>›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className='empty-state'>Geen klanten gevonden.</div>
        )}
      </div>
    </Page>
  );
}
