import { useState } from 'react';
import type { Customer, Order } from '../data/mockData';
import { topArticles } from '../lib/sales';
import {
  BackButton,
  customerName,
  money,
  orderTotal,
  Page,
  StatusBadge,
} from './SalesUI';

export default function CustomerDetail({
  customer,
  orders,
  onBack,
  onOpenOrder,
  onUpdate,
}: {
  customer?: Customer;
  orders: Order[];
  onBack: () => void;
  onOpenOrder: (id: number) => void;
  onUpdate: (customer: Customer) => void;
}) {
  const [addressType, setAddressType] = useState<
    'facturatie' | 'levering' | null
  >(null);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    postalCode: '',
    city: '',
  });
  const [confirm, setConfirm] = useState(false);
  const [tab, setTab] = useState('overview');

  if (!customer)
    return (
      <Page>
        <BackButton onClick={onBack}>Terug naar klanten</BackButton>
        <div className='empty-state'>Klant niet gevonden.</div>
      </Page>
    );

  const history = orders.filter((order) => order.customerId === customer.id);

  function saveAddress() {
    if (
      !addressType ||
      !address.street ||
      !address.number ||
      !address.postalCode ||
      !address.city
    )
      return;
    const nextId = Math.max(0, ...customer!.addresses.map((a) => a.id)) + 1;
    onUpdate({
      ...customer!,
      addresses: [
        ...customer!.addresses.map((a) =>
          a.type === addressType && a.active ? { ...a, active: false } : a,
        ),
        {
          id: nextId,
          ...address,
          type: addressType,
          active: true,
          since: new Date().toISOString().slice(0, 10),
        },
      ],
    });
    setAddressType(null);
    setAddress({ street: '', number: '', postalCode: '', city: '' });
  }

  function reactivateAddress(addrId: number, type: 'facturatie' | 'levering') {
    onUpdate({
      ...customer!,
      addresses: customer!.addresses.map((a) => {
        if (a.type !== type) return a;
        if (a.id === addrId) return { ...a, active: true };
        if (a.active) return { ...a, active: false };
        return a;
      }),
    });
  }

  return (
    <Page>
      <BackButton onClick={onBack}>Terug naar klanten</BackButton>
      <div className='detail-heading'>
        <div>
          <div className='customer-heading'>
            <h1 className='page-title'>{customerName(customer)}</h1>
            <span className='type-pill'>
              {customer.type === 'bedrijf' ? 'Bedrijf' : 'Particulier'}
            </span>
            <StatusBadge
              status={customer.accountActive ? 'Actief' : 'Inactief'}
            />
          </div>
          <p className='page-subtitle'>
            Klant sinds {customer.memberSince} · ID #{customer.id}
          </p>
        </div>
        {!confirm ? (
          <button
            className={`action-button ${customer.accountActive ? 'danger-button' : ''}`}
            onClick={() => setConfirm(true)}
          >
            {customer.accountActive
              ? 'Account deactiveren'
              : 'Account heractiveren'}
          </button>
        ) : (
          <div className='confirm-box'>
            <span>Bevestig deze actie</span>
            <button onClick={() => setConfirm(false)}>Annuleer</button>
            <button
              className='confirm'
              onClick={() => {
                onUpdate({
                  ...customer,
                  accountActive: !customer.accountActive,
                });
                setConfirm(false);
              }}
            >
              Bevestigen
            </button>
          </div>
        )}
      </div>

      <div className='profile-tabs' role='tablist' aria-label='Klantprofiel'>
        {[
          ['overview', 'Klantgegevens en historiek'],
          ['top', 'Top 5 artikelen'],
        ].map(([id, label], index) => (
          <button
            key={id}
            id={`customer-tab-${id}`}
            type='button'
            role='tab'
            aria-selected={tab === id}
            aria-controls={`customer-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === 'Home'
                    ? 'overview'
                    : e.key === 'End'
                      ? 'top'
                      : index === 0
                        ? 'top'
                        : 'overview';
                setTab(next);
                document.getElementById(`customer-tab-${next}`)?.focus();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <section
        id='customer-panel-top'
        role='tabpanel'
        aria-labelledby='customer-tab-top'
        hidden={tab !== 'top'}
        className='detail-card'
      >
        <h2>Top 5 meest gekochte artikelen</h2>
        <p className='page-subtitle'>
          Gerangschikt op totaal aantal stuks, zonder geannuleerde bestellingen.
        </p>
        {topArticles(history).length ? (
          <table className='inner-table'>
            <thead>
              <tr>
                <th>Artikelnaam</th>
                <th className='align-right'>Totaal gekochte stuks</th>
              </tr>
            </thead>
            <tbody>
              {topArticles(history)
                .slice(0, 5)
                .map((a) => (
                  <tr key={a.number}>
                    <td>{a.name}</td>
                    <td className='amount-cell'>{a.quantity}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className='empty-state'>Nog geen aangekochte artikelen.</p>
        )}
      </section>
      <div
        id='customer-panel-overview'
        role='tabpanel'
        aria-labelledby='customer-tab-overview'
        hidden={tab !== 'overview'}
        className='detail-grid'
      >
        <section className='detail-card full-width-card'>
          <h2>Klantgegevens</h2>
          <div className='fact-grid'>
            <div>
              <label>E-mail</label>
              <p>{customer.email}</p>
            </div>
            <div>
              <label>Klanttype</label>
              <p>
                {customer.type === 'bedrijf'
                  ? 'Zakelijke klant'
                  : 'Particuliere klant'}
              </p>
            </div>
            <div>
              <label>Accountstatus</label>
              <p>{customer.accountActive ? 'Actief' : 'Inactief'}</p>
            </div>
          </div>
        </section>

        {(['facturatie', 'levering'] as const).map((type) => (
          <section className='detail-card' key={type}>
            <div className='card-title'>
              <h2 className='address-title'>{type}adres</h2>
              <button
                onClick={() =>
                  setAddressType(addressType === type ? null : type)
                }
              >
                {addressType === type ? 'Annuleren' : '+ Nieuw adres'}
              </button>
            </div>
            <div className='address-list'>
              {customer.addresses
                .filter((a) => a.type === type)
                .map((a) => (
                  <div
                    key={a.id}
                    className={`address-row ${a.active ? '' : 'inactive'}`}
                  >
                    <div className='address-content'>
                      <span>{a.active ? 'Actief' : 'Historiek'}</span>
                      <p>
                        {a.street} {a.number}, {a.postalCode} {a.city}
                      </p>
                      <small>vanaf {a.since}</small>
                    </div>
                  </div>
                ))}
            </div>
            {addressType === type && (
              <div className='address-form'>
                <p>Nieuw {type}adres — het huidige adres wordt gearchiveerd.</p>
                <div className='address-fields'>
                  <input
                    className='address-field-wide'
                    placeholder='Straat'
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                  />
                  <input
                    placeholder='Nr.'
                    value={address.number}
                    onChange={(e) =>
                      setAddress({ ...address, number: e.target.value })
                    }
                  />
                  <input
                    placeholder='Postcode'
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress({ ...address, postalCode: e.target.value })
                    }
                  />
                  <input
                    className='address-field-wide'
                    placeholder='Gemeente'
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />
                </div>
                <button
                  disabled={
                    !address.street ||
                    !address.number ||
                    !address.postalCode ||
                    !address.city
                  }
                  onClick={saveAddress}
                >
                  Adres opslaan
                </button>
              </div>
            )}
          </section>
        ))}

        {customer.type === 'bedrijf' && (
          <section className='detail-card wide'>
            <h2>Contactpersonen</h2>
            <div className='table-container'>
              <table className='inner-table'>
                <thead>
                  <tr>
                    <th>Naam</th>
                    <th>Functie</th>
                    <th>E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.contacts?.map((person) => (
                    <tr key={person.id}>
                      <td className='emphasis'>
                        {person.firstName} {person.lastName}
                      </td>
                      <td>{person.role}</td>
                      <td>{person.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className='detail-card wide'>
          <h2>Bestelhistoriek</h2>
          {history.length ? (
            <div className='table-container'>
              <table className='inner-table'>
                <thead>
                  <tr>
                    <th>Bestelling</th>
                    <th>Datum</th>
                    <th>Status</th>
                    <th className='align-right'>Totaal</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {history.map((order) => (
                    <tr
                      key={order.id}
                      className='click-row'
                      onClick={() => onOpenOrder(order.id)}
                    >
                      <td className='order-reference'>{order.orderNumber}</td>
                      <td>{order.date}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className='amount-cell'>
                        {money(orderTotal(order.lines))}
                      </td>
                      <td className='chevron'>›</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className='empty-state'>Nog geen bestellingen.</p>
          )}
        </section>
      </div>
    </Page>
  );
}
