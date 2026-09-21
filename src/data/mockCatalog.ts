/** Fictieve demogegevens; geen echte bedrijfs- of bankgegevens. */
export const MOCK_VAT_RATE = 21;
export const MOCK_COMPANY = Object.freeze({
  name: 'Prularia Demo BV',
  address: 'Voorbeeldlaan 21, 9000 Gent, België',
  companyNumber: '0000.000.000 (fictief)',
  vatNumber: 'BE0000000000 (fictief)',
  iban: 'BE00 0000 0000 0000 (fictief)',
  pricesIncludeVat: true,
});

const catalog: Record<string, { category: string; supplier: string }> = {
  'KAN-0044': { category: 'Archivering', supplier: 'BuroNova' },
  'PAP-1120': { category: 'Papierwaren', supplier: 'Papierpunt' },
  'PEN-0007': { category: 'Schrijfwaren', supplier: 'Schrijf & Co' },
  'NOT-0331': { category: 'Papierwaren', supplier: 'Papierpunt' },
  'STA-0088': { category: 'Bureauaccessoires', supplier: 'BuroNova' },
  'MBL-0012': { category: 'Bureauaccessoires', supplier: 'WerkplekPlus' },
  'KAN-0055': { category: 'Archivering', supplier: 'BuroNova' },
  'INK-0099': { category: 'Inkt en cartridges', supplier: 'Inktatelier' },
  'CHR-0003': { category: 'Kantoormeubilair', supplier: 'WerkplekPlus' },
  'LAM-0041': { category: 'Verlichting', supplier: 'LumenDesk' },
  'KAN-0099': { category: 'Archivering', supplier: 'BuroNova' },
};

export function mockArticleDetails(articleNumber: string) {
  return {
    ...(catalog[articleNumber] ?? {
      category: 'Kantoorbenodigdheden',
      supplier: 'BuroNova',
    }),
    vatRate: MOCK_VAT_RATE,
  };
}
