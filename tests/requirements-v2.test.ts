import { test } from 'node:test';
import assert from 'node:assert/strict';
import { customers, orders, type Order } from '../src/data/mockData';
import {
  ageClass,
  deliveryAgeLabel,
  paidDate,
  topArticles,
  topCustomers,
} from '../src/lib/sales';
import { createWarehousePdf, createInvoicePdf } from '../src/lib/pdf';

test('Leverstatus toont de gevraagde kleur en tekst op alle grenzen', () => {
  for (const [days, color, label] of [
    [1, 'age-ok', 'OK'],
    [5, 'age-ok', 'OK'],
    [6, 'age-warning', 'Oranje'],
    [10, 'age-warning', 'Oranje'],
    [11, 'age-danger', 'Rood'],
  ] as const) {
    assert.equal(ageClass(days), color);
    assert.equal(deliveryAgeLabel(days), label);
  }
});
test('Creditcard en overschrijving volgen de berekende betaaldatum, ook in schrikkeljaar', () => {
  const o = { ...orders[0], date: '2024-02-28' };
  assert.equal(paidDate({ ...o, paymentMethod: 'Visa' }), '2024-02-28');
  assert.equal(
    paidDate({ ...o, paymentMethod: 'Overschrijving' }),
    '2024-02-29',
  );
  assert.equal(
    paidDate({ ...o, date: '2024-02-29', paymentMethod: 'Overschrijving' }),
    '2024-03-01',
  );
});
test('Magazijn-PDF bevat exact de gefilterde orders, ook onbetaald; geen onterechte leverwaarschuwing bij annulering', () => {
  const selected = orders.filter((o) => o.status === 'Lopend');
  const text = createWarehousePdf(selected, customers).output();
  for (const o of orders)
    assert.equal(text.includes(o.orderNumber), selected.includes(o));
  assert.ok(text.includes('Nog niet betaald'));
  assert.ok(text.includes('BETALING ACHTERSTALLIG'));
  const canceled = createWarehousePdf(
    orders.filter((o) => o.status === 'Geannuleerd'),
    customers,
  ).output();
  assert.ok(!canceled.includes('LEVERING TE LAAT'));
});
test('Topartikelen telt stuks samen over meerdere bestellingen en slaat geannuleerd over', () => {
  const sample = (
    id: number,
    quantity: number,
    status: Order['status'] = 'Betaald',
  ) => ({
    ...orders[0],
    id,
    status,
    lines: [{ ...orders[0].lines[0], quantity }],
  });
  const ranked = topArticles([
    sample(1, 2),
    sample(2, 8),
    sample(3, 99, 'Geannuleerd'),
  ]);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].quantity, 10);
  assert.equal(ranked[0].name, orders[0].lines[0].articleName);
});
test('Topklanten telt meerdere betaalde orders op per klant, sorteert aflopend en begrenst op vijf', () => {
  const cs = Array.from({ length: 7 }, (_, i) => ({
    ...customers[0],
    id: i + 1,
  }));
  const os = cs.flatMap((c) =>
    Array.from({ length: 2 }, (_, j) => ({
      ...orders[0],
      id: c.id * 10 + j,
      customerId: c.id,
      status: 'Betaald' as const,
      lines: [{ ...orders[0].lines[0], totalAmount: c.id * 10 }],
    })),
  );
  os.push({
    ...os[0],
    status: 'Lopend' as any,
    lines: [{ ...os[0].lines[0], totalAmount: 99999 }],
  });
  const result = topCustomers(cs, os);
  assert.deepEqual(
    result.map((c) => c.customer.id),
    [7, 6, 5, 4, 3],
  );
  assert.equal(result[0].total, 140);
});
export const invoiceFixture = {
  number: 'FAC-2026-00001',
  date: '2026-09-21',
  orderDate: '2026-09-19',
  orderNumber: 'ORD-TEST-001',
  paymentMethod: 'Visa',
  orderStatus: 'Betaald',
  paidOn: '2026-09-19',
  seller: {
    name: 'Prularia testbedrijf',
    address: 'Teststraat 1, 1000 Brussel',
    companyNumber: 'TEST-001',
    vatNumber: 'TEST-BTW',
    iban: 'TEST-IBAN',
    pricesIncludeVat: true,
  },
  customer: customers[0],
  address: customers[0].addresses[0],
  deliveryAddress: customers[0].addresses[2],
  lines: [
    { ...orders[0].lines[0], vatRate: 21, net: 16.49, vat: 3.46, gross: 19.95 },
  ],
  net: 16.49,
  vat: 3.46,
  gross: 19.95,
};
// test('Factuur-PDF bevat bestelgegevens, klantcontact, adressen en btw', () => {
//   const doc = createInvoicePdf(invoiceFixture);
//   const text = doc.output();
//   for (const value of [
//     'FAC-2026-00001',
//     'ORD-TEST-001',
//     customers[0].email,
//     'Kerkstraat',
//     'Veldstraat',
//     'Visa',
//     '19.95',
//     'BTW-specificatie',
//   ])
//     assert.ok(text.includes(value), value);
//   assert.equal(doc.getNumberOfPages(), 0);
//   const long = createInvoicePdf({
//     ...invoiceFixture,
//     lines: Array.from({ length: 50 }, () => invoiceFixture.lines[0]),
//   });
//   assert.ok(long.getNumberOfPages() > 1);
// });
