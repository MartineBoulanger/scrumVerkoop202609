import { useState } from 'react';
import type { Customer, Order, OrderLine } from '../data/mockData';
import { api } from '../lib/api';
import InvoicePreview from './InvoicePreview';
import { awaitingDelivery } from '../lib/sales';
import {
  BackButton,
  customerName,
  money,
  orderTotal,
  Page,
  StatusBadge,
} from './SalesUI';

interface Props {
  order?: Order;
  customers: Customer[];
  onBack: () => void;
  onOpenCustomer: (id: number) => void;
  onUpdate: (order: Order) => void;
  onRefresh: () => Promise<void>;
}

export default function OrderDetail({
  order,
  customers,
  onBack,
  onOpenCustomer,
  onUpdate,
  onRefresh,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [editLines, setEditLines] = useState<OrderLine[]>([]);
  const [editDeliveryId, setEditDeliveryId] = useState<number | undefined>();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!order)
    return (
      <Page>
        <BackButton onClick={onBack}>Terug naar bestellingen</BackButton>
        <div className='empty-state'>Bestelling niet gevonden.</div>
      </Page>
    );

  const customer = customers.find((item) => item.id === order.customerId);
  if (!customer) return null;

  const contact = customer.contacts?.find(
    (person) => person.id === order.contactPersonId,
  );
  const addressLabel = (id: number) => {
    const a = customer.addresses.find((item) => item.id === id);
    return a ? `${a.street} ${a.number}, ${a.postalCode} ${a.city}` : '—';
  };
  const activeDeliveryAddresses = customer.addresses.filter(
    (a) => a.type === 'levering' && a.active,
  );
  const canEdit =
    !order.invoiceNumber && ['Lopend', 'Betaald'].includes(order.status);

  function startEdit() {
    setEditLines(order!.lines.map((l) => ({ ...l })));
    setEditDeliveryId(order!.deliveryAddressId);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditLines([]);
    setEditDeliveryId(undefined);
  }

  function updateQty(lineId: number, qty: number) {
    setEditLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? {
              ...l,
              quantity: qty,
              totalAmount: parseFloat((l.unitPrice * qty).toFixed(2)),
            }
          : l,
      ),
    );
  }

  function removeLine(lineId: number) {
    setEditLines((prev) => prev.filter((l) => l.id !== lineId));
  }

  function save() {
    onUpdate({
      ...order!,
      lines: editLines,
      deliveryAddressId: editDeliveryId ?? order!.deliveryAddressId,
    });
    setEditing(false);
  }

  function cancelOrder() {
    onUpdate({ ...order!, status: 'Geannuleerd', trackingCode: undefined });
    setConfirmCancel(false);
    setEditing(false);
  }

  const displayLines = editing ? editLines : order.lines;
  const displayTotal = editing
    ? editLines.reduce((sum, l) => sum + l.totalAmount, 0)
    : orderTotal(order.lines);

  return (
    <Page>
      <BackButton onClick={onBack}>Terug naar bestellingen</BackButton>
      <div className='detail-heading'>
        <div>
          <div className='order-heading'>
            <h1 className='page-title order-number'>{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className='page-subtitle'>Geplaatst op {order.date}</p>
        </div>
        {canEdit && (
          <div className='order-actions'>
            {editing ? (
              <>
                <button className='action-button' onClick={cancelEdit}>
                  Annuleren
                </button>
                <button
                  className='action-button primary-button'
                  onClick={save}
                  disabled={editLines.length === 0}
                >
                  Opslaan
                </button>
              </>
            ) : (
              <>
                <button className='action-button' onClick={startEdit}>
                  Bewerken
                </button>
                {!confirmCancel ? (
                  <button
                    className='action-button danger-button'
                    onClick={() => setConfirmCancel(true)}
                  >
                    Bestelling annuleren
                  </button>
                ) : (
                  <div className='confirm-box'>
                    <span>Bestelling annuleren?</span>
                    <button onClick={() => setConfirmCancel(false)}>Nee</button>
                    <button className='confirm' onClick={cancelOrder}>
                      Ja, annuleer
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className='module-actions'>
        <button
          className='action-button'
          disabled={invoiceBusy || order.status === 'Geannuleerd'}
          onClick={async () => {
            try {
              setInvoiceBusy(true);
              setInvoiceError('');
              setInvoice(await api(`/invoices/${order.id}`, 'POST'));
              await onRefresh();
            } catch (e) {
              setInvoiceError((e as Error).message);
            } finally {
              setInvoiceBusy(false);
            }
          }}
        >
          {invoiceBusy ? 'Factuur laden…' : 'Factuur bekijken'}
        </button>
        {awaitingDelivery(order) && (
          <button
            className='action-button'
            onClick={() => onUpdate({ ...order, status: 'Geleverd' })}
          >
            Markeer als geleverd
          </button>
        )}
      </div>
      {invoiceError && (
        <p role='alert' className='error-notice'>
          {invoiceError}
        </p>
      )}
      {invoice && (
        <InvoicePreview invoice={invoice} onClose={() => setInvoice(null)} />
      )}
      <div className='detail-grid'>
        <section className='detail-card'>
          <h2>Klant & contact</h2>
          <div className='fact-grid'>
            <div>
              <label>Klant</label>
              <button
                className='customer-link'
                onClick={() => onOpenCustomer(customer.id)}
              >
                {customerName(customer)}
              </button>
            </div>
            <div>
              <label>Contactpersoon</label>
              <p>
                {contact
                  ? `${contact.firstName} ${contact.lastName}`
                  : 'Niet van toepassing'}
              </p>
            </div>
            <div>
              <label>E-mail</label>
              <p>{customer.email}</p>
            </div>
          </div>
        </section>

        <section className='detail-card'>
          <h2>Betaling</h2>
          <div className='fact-grid'>
            <div>
              <label>Betaalwijze</label>
              <p>{order.paymentMethod}</p>
            </div>
            <div>
              <label>Betalingscode</label>
              <p className='reference-small'>{order.paymentCode}</p>
            </div>
            <div>
              <label>Actiecode</label>
              <p className={order.promoCode ? 'promo-code' : ''}>
                {order.promoCode ?? 'Geen'}
              </p>
            </div>
            <div>
              <label>Status</label>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </section>

        <section className='detail-card'>
          <h2>Facturatieadres</h2>
          <div className='address-row'>
            <p>{addressLabel(order.billingAddressId)}</p>
          </div>
        </section>

        <section className='detail-card'>
          <h2>Leveringsadres</h2>
          {editing && activeDeliveryAddresses.length > 1 ? (
            <select
              value={editDeliveryId}
              onChange={(e) => setEditDeliveryId(Number(e.target.value))}
              className='delivery-select'
            >
              {activeDeliveryAddresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.street} {a.number}, {a.postalCode} {a.city}
                </option>
              ))}
            </select>
          ) : (
            <div className='address-row'>
              <p>
                {addressLabel(
                  editing
                    ? (editDeliveryId ?? order.deliveryAddressId)
                    : order.deliveryAddressId,
                )}
              </p>
            </div>
          )}
          {editing && activeDeliveryAddresses.length <= 1 && (
            <p className='delivery-help'>
              Geen alternatieve leveringsadressen beschikbaar.
            </p>
          )}
        </section>

        <section className='detail-card wide'>
          <h2>Levering</h2>
          <div className='fact-grid'>
            <div>
              <label>Voorraadcontrole</label>
              <p
                className={
                  order.allItemsInStock ? 'stock-available' : 'stock-waiting'
                }
              >
                {order.allItemsInStock
                  ? 'Alle artikelen volledig beschikbaar'
                  : 'Wacht op volledige voorraad'}
              </p>
            </div>
            <div>
              <label>Trackingcode</label>
              <p className='reference-small'>
                {order.trackingCode ?? 'Nog niet toegekend'}
              </p>
            </div>
          </div>
          {!order.allItemsInStock && order.status !== 'Geannuleerd' && (
            <div className='stock-notice'>
              Deze bestelling wordt pas verzonden wanneer alle artikelen
              volledig op voorraad zijn. Deelleveringen zijn niet mogelijk.
            </div>
          )}
        </section>

        <section className='detail-card wide'>
          <h2>Bestellijnen</h2>
          {editing && (
            <p className='order-edit-notice'>
              U kunt artikelen verwijderen of het aantal verlagen. Verhogen is
              niet mogelijk.
            </p>
          )}
          <div className='table-container'>
            <table className='inner-table'>
              <thead>
                <tr>
                  <th>Artikelnummer</th>
                  <th>Artikelnaam</th>
                  <th>Prijs/stuk</th>
                  <th>Aantal</th>
                  <th className='align-right'>Totaalbedrag</th>
                  {editing && <th />}
                </tr>
              </thead>
              <tbody>
                {displayLines.map((line) => (
                  <tr key={line.id} className={editing ? 'editing-row' : ''}>
                    <td className='reference-small'>{line.articleNumber}</td>
                    <td className='emphasis'>{line.articleName}</td>
                    <td>{money(line.unitPrice)}</td>
                    <td>
                      {editing ? (
                        <input
                          type='number'
                          min={1}
                          max={
                            order.lines.find((l) => l.id === line.id)
                              ?.quantity ?? line.quantity
                          }
                          value={line.quantity}
                          onChange={(e) =>
                            updateQty(
                              line.id,
                              Math.max(
                                1,
                                Math.min(
                                  Math.floor(Number(e.target.value)),
                                  order.lines.find((l) => l.id === line.id)
                                    ?.quantity ?? line.quantity,
                                ),
                              ),
                            )
                          }
                          className='quantity-field'
                        />
                      ) : (
                        <span>{line.quantity}</span>
                      )}
                    </td>
                    <td className='amount-cell'>{money(line.totalAmount)}</td>
                    {editing && (
                      <td className='align-right'>
                        <button
                          onClick={() => removeLine(line.id)}
                          className='remove-line'
                          title='Bestellijn verwijderen'
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {displayLines.length === 0 && editing && (
                  <tr>
                    <td colSpan={6} className='empty-order-lines'>
                      Alle bestellijnen zijn verwijderd. U kunt de bestelling
                      niet opslaan zonder artikelen.
                    </td>
                  </tr>
                )}
                <tr className='total-row'>
                  <td colSpan={editing ? 4 : 4}>Totaal bestelling</td>
                  <td>{money(displayTotal)}</td>
                  {editing && <td />}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {!canEdit && order.status !== 'Geannuleerd' && (
        <p className='order-readonly-note'>
          Deze bestelling kan in de status {order.status} niet meer worden
          gewijzigd of geannuleerd.
        </p>
      )}
    </Page>
  );
}
