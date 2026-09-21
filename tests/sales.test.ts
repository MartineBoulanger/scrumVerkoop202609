import assert from 'node:assert/strict';
import { test } from 'node:test';
import { customers, orders, type Order } from '../src/data/mockData';
import {
  ageClass,
  daysSince,
  inactiveCustomer,
  isPaid,
  monthlyRevenue,
  overdueDelivery,
  overduePayment,
  paidDate,
  topArticles,
  topCustomers,
} from '../src/lib/sales';
const order = (patch: Partial<Order> = {}): Order => ({
  ...orders[0],
  date: '2026-09-15',
  status: 'Betaald',
  paymentMethod: 'Visa',
  ...patch,
});
test('Kalenderdagen en kleurgrenzen', () => {
  assert.equal(daysSince('2026-09-16', '2026-09-21'), 5);
  assert.equal(ageClass(5), 'age-ok');
  assert.equal(ageClass(6), 'age-warning');
  assert.equal(ageClass(10), 'age-warning');
  assert.equal(ageClass(11), 'age-danger');
  assert.equal(daysSince('2026-03-28', '2026-03-30'), 2);
});
test('Betaling en levertermijn', () => {
  assert.equal(paidDate(order()), '2026-09-15');
  assert.equal(
    paidDate(order({ date: '2026-12-31', paymentMethod: 'Overschrijving' })),
    '2027-01-01',
  );
  assert.equal(overdueDelivery(order(), '2026-09-20'), false);
  assert.equal(overdueDelivery(order(), '2026-09-21'), true);
  assert.equal(
    overdueDelivery(order({ paymentMethod: 'Overschrijving' }), '2026-09-21'),
    false,
  );
  assert.equal(
    overdueDelivery(order({ status: 'Verzonden' }), '2026-09-21'),
    true,
  );
  for (const status of ['Geannuleerd', 'Geleverd', 'Lopend'] as const)
    assert.equal(overdueDelivery(order({ status }), '2026-09-21'), false);
});
test('Onbetaald vanaf dag 6, inclusief overschrijving', () => {
  assert.equal(
    overduePayment(
      order({ status: 'Lopend', paymentMethod: 'Overschrijving' }),
      '2026-09-21',
    ),
    true,
  );
  assert.equal(
    overduePayment(order({ status: 'Lopend' }), '2026-09-20'),
    false,
  );
  assert.equal(
    overduePayment(order({ status: 'Geannuleerd' }), '2026-09-21'),
    false,
  );
});
test('Meer dan kalendermaand, maandultimo en nooit besteld', () => {
  assert.equal(
    inactiveCustomer(
      customers[0],
      [order({ date: '2026-08-21' })],
      '2026-09-21',
    ),
    false,
  );
  assert.equal(
    inactiveCustomer(
      customers[0],
      [order({ date: '2026-08-20' })],
      '2026-09-21',
    ),
    true,
  );
  assert.equal(
    inactiveCustomer(
      customers[0],
      [order({ date: '2026-02-28' })],
      '2026-03-31',
    ),
    false,
  );
  assert.equal(inactiveCustomer(customers[0], [], '2026-09-21'), false);
});
test('Topklanten en omzet alleen betaald, geen toekomstige maanden', () => {
  assert.equal(isPaid(order({ status: 'Lopend' })), false);
  const input = [
    order(),
    order({ status: 'Lopend' }),
    order({ status: 'Geannuleerd' }),
  ];
  assert.equal(topCustomers(customers, input)[0].total, 84.95);
  assert.equal(monthlyRevenue(input, 2026, '2026-09-21').length, 9);
  assert.equal(monthlyRevenue(input, 2026, '2026-09-21')[8].total, 84.95);
  assert.equal(monthlyRevenue(input, 2027, '2026-09-21').length, 0);
  assert.equal(topArticles(input)[0].quantity, 20);
});
