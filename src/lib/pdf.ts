import { jsPDF } from 'jspdf';
import type { Customer, Order } from '../data/mockData';
import {
  customerName,
  daysSince,
  lastOrder,
  paidDate,
  today,
  isPaid,
  awaitingDelivery,
  overduePayment,
  overdueDelivery,
  deliveryAgeLabel,
} from './sales';
export function reportPdf(title: string, lines: string[]) {
  const doc = new jsPDF();
  let y = 28;
  function header() {
    doc.setFillColor(171, 215, 168);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setFontSize(14);
    doc.text('Prularia | ' + title, 14, 12);
    doc.setFontSize(10);
  }
  header();
  for (const line of [`Datum: ${today()}`, ...lines]) {
    const wrapped = doc.splitTextToSize(line, 180) as string[];
    for (const part of wrapped) {
      if (y > 275) {
        doc.addPage();
        header();
        y = 28;
      }
      doc.text(part, 14, y);
      y += 5;
    }
    y += 3;
  }
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(9);
    doc.text(`${p} / ${pages}`, 190, 288, { align: 'right' });
  }
  return doc;
}
export function createWarehousePdf(orders: Order[], customers: Customer[]) {
  return reportPdf(
    'Magazijnopvolging',
    orders.length
      ? orders.flatMap((o) => {
          const c = customers.find((c) => c.id === o.customerId);
          const a = c?.addresses.find((a) => a.id === o.deliveryAddressId);
          return [
            `${o.orderNumber} | ${c ? customerName(c) : 'Onbekende klant'}`,
            `Besteld: ${o.date} | Exact aantal dagen: ${daysSince(o.date)} | Leverstatus: ${deliveryAgeLabel(daysSince(o.date))}`,
            `Betaaldatum (berekend): ${paidDate(o)} | Betaling: ${isPaid(o) ? 'Betaald' : o.status === 'Geannuleerd' ? 'Geannuleerd' : 'Nog niet betaald'}`,
            `Status: ${o.status} | ${overduePayment(o) ? 'BETALING ACHTERSTALLIG' : overdueDelivery(o) ? 'LEVERING TE LAAT' : awaitingDelivery(o) ? 'Levering binnen termijn' : 'Geen open leveringsopvolging'}`,
            `Levering: ${a ? `${a.street} ${a.number}, ${a.postalCode} ${a.city}` : 'Onbekend'}`,
            ...o.lines.map(
              (l) => `${l.quantity} x ${l.articleNumber} - ${l.articleName}`,
            ),
            '',
          ];
        })
      : ['Geen bestellingen in deze selectie.'],
  );
}
export function warehousePdf(orders: Order[], customers: Customer[]) {
  createWarehousePdf(orders, customers).save('magazijnopvolging.pdf');
}
export function inactivePdf(customers: Customer[], orders: Order[]) {
  reportPdf(
    'Inactieve klanten',
    customers.length
      ? customers.flatMap((c) => [
          customerName(c),
          `${c.email}`,
          `Laatste bestelling: ${lastOrder(c.id, orders)}`,
          '',
        ])
      : ['Geen inactieve klanten in deze selectie.'],
  ).save('inactieve-klanten.pdf');
}
/** One PDF builder shared by preview and local download. */
export function createInvoicePdf(i: any) {
  const doc = new jsPDF();
  const euros = (value: number) => `EUR ${value.toFixed(2)}`;
  const address = (a: any) =>
    a
      ? `${a.street} ${a.number}, ${a.postalCode} ${a.city}`
      : 'Niet beschikbaar';
  let y = 28;
  function header() {
    doc.setFillColor(171, 215, 168);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(17, 17, 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(`Prularia | Factuur ${i.number}`, 14, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  }
  function space(height: number) {
    if (y + height > 275) {
      doc.addPage();
      header();
      y = 28;
    }
  }
  function text(value: string, bold = false) {
    const lines = doc.splitTextToSize(value, 182) as string[];
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    for (const line of lines) {
      space(5);
      doc.text(line, 14, y);
      y += 5;
    }
    y += 2;
  }
  function tableHeader() {
    space(12);
    doc.setFillColor(240, 245, 239);
    doc.rect(14, y - 4, 182, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Artikel', 16, y + 2);
    doc.text('Stuks', 113, y + 2, { align: 'right' });
    doc.text('Prijs/stuk', 142, y + 2, { align: 'right' });
    doc.text('BTW', 160, y + 2, { align: 'right' });
    doc.text('Totaal incl.', 194, y + 2, { align: 'right' });
    y += 12;
    doc.setFont('helvetica', 'normal');
  }
  header();
  text(`Factuurdatum: ${i.date} | Bestelling: ${i.orderNumber}`);
  if (i.orderDate)
    text(
      `Besteldatum: ${i.orderDate} | Betaalwijze: ${i.paymentMethod} | Status bij opmaak: ${i.orderStatus}`,
    );
  if (i.paidOn) text(`Berekende betaaldatum: ${i.paidOn}`);
  text('Verkoper', true);
  text(i.seller.name);
  text(i.seller.address);
  text(`Onderneming: ${i.seller.companyNumber} | BTW: ${i.seller.vatNumber}`);
  text(`IBAN: ${i.seller.iban}`);
  text('Klant en facturatieadres', true);
  text(`${customerName(i.customer)} | Klantnummer: ${i.customer.id}`);
  text(address(i.address));
  text(`E-mail: ${i.customer.email} | Telefoon: ${i.customer.phone}`);
  if (i.contact)
    text(`Contactpersoon: ${i.contact.firstName} ${i.contact.lastName}`);
  if (i.deliveryAddress) {
    text('Leveringsadres', true);
    text(address(i.deliveryAddress));
  }
  if (i.promoCode) text(`Actiecode: ${i.promoCode}`);
  text(
    `Artikelprijzen ${i.seller.pricesIncludeVat ? 'inclusief' : 'exclusief'} btw. Bedragen in EUR.`,
  );
  tableHeader();
  for (const l of i.lines) {
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(
      `${l.articleName} (${l.articleNumber})`,
      86,
    ) as string[];
    const height = Math.max(10, lines.length * 4.5 + 5);
    if (y + height > 275) {
      doc.addPage();
      header();
      y = 28;
      tableHeader();
    }
    doc.text(lines, 16, y);
    doc.text(String(l.quantity), 113, y, { align: 'right' });
    doc.text(l.unitPrice.toFixed(2), 142, y, { align: 'right' });
    doc.text(`${l.vatRate}%`, 160, y, { align: 'right' });
    doc.text(l.gross.toFixed(2), 194, y, { align: 'right' });
    y += height;
    doc.setDrawColor(229, 231, 235);
    doc.line(14, y - 4, 196, y - 4);
  }
  y += 3;
  doc.setFontSize(10);
  text('BTW-specificatie', true);
  const taxes = new Map<number, { net: number; vat: number }>();
  for (const l of i.lines) {
    const row = taxes.get(l.vatRate) || { net: 0, vat: 0 };
    row.net += l.net;
    row.vat += l.vat;
    taxes.set(l.vatRate, row);
  }
  for (const [rate, row] of taxes)
    text(`${rate}%: grondslag ${euros(row.net)} | btw ${euros(row.vat)}`);
  text(`Totaal excl. btw: ${euros(i.net)}`);
  text(`Totaal btw: ${euros(i.vat)}`);
  text(`Totaal incl. btw: ${euros(i.gross)}`, true);
  const pages = doc.getNumberOfPages();
  for (let n = 1; n <= pages; n++) {
    doc.setPage(n);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${i.number} | ${n} / ${pages}`, 196, 288, { align: 'right' });
  }
  return doc;
}
export function invoicePdf(i: any) {
  createInvoicePdf(i).save(`factuur-${i.number}.pdf`);
}
