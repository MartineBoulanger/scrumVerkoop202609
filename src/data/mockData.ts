export type CustomerType = 'particulier' | 'bedrijf';

export interface Address {
  id: number;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  type: 'facturatie' | 'levering';
  active: boolean;
  since: string;
}

export interface ContactPerson {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

export interface Customer {
  id: number;
  type: CustomerType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  accountActive: boolean;
  memberSince: string;
  addresses: Address[];
  contacts?: ContactPerson[];
}

export type OrderStatus =
  | 'Lopend'
  | 'Betaald'
  | 'Ingepakt'
  | 'Verzonden'
  | 'Geleverd'
  | 'Geannuleerd';
export type PaymentMethod = 'Bancontact' | 'Visa' | 'Overschrijving' | 'iDEAL';

export interface OrderLine {
  id: number;
  articleNumber: string;
  articleName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Order {
  invoiceNumber?: string;
  id: number;
  orderNumber: string;
  customerId: number;
  contactPersonId?: number;
  date: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentCode: string;
  promoCode?: string;
  billingAddressId: number;
  deliveryAddressId: number;
  allItemsInStock: boolean;
  trackingCode?: string;
  lines: OrderLine[];
}

export const customers: Customer[] = [
  {
    id: 1,
    type: 'particulier',
    firstName: 'Marie',
    lastName: 'Desmet',
    email: 'marie.desmet@gmail.com',
    accountActive: true,
    memberSince: '2021-03-14',
    addresses: [
      {
        id: 101,
        street: 'Kerkstraat',
        number: '12',
        postalCode: '9000',
        city: 'Gent',
        type: 'facturatie',
        active: true,
        since: '2021-03-14',
      },
      {
        id: 102,
        street: 'Veldstraat',
        number: '88 bus 3',
        postalCode: '9000',
        city: 'Gent',
        type: 'levering',
        active: true,
        since: '2023-09-01',
      },
    ],
  },
  {
    id: 2,
    type: 'bedrijf',
    companyName: 'Kantoor Supplies NV',
    email: 'aankoop@kantoorsupplies.be',
    accountActive: true,
    memberSince: '2019-07-22',
    addresses: [
      {
        id: 201,
        street: 'Industrielaan',
        number: '44',
        postalCode: '9320',
        city: 'Aalst',
        type: 'facturatie',
        active: true,
        since: '2019-07-22',
      },
      {
        id: 202,
        street: 'Industrielaan',
        number: '44',
        postalCode: '9320',
        city: 'Aalst',
        type: 'levering',
        active: true,
        since: '2019-07-22',
      },
    ],
    contacts: [
      {
        id: 301,
        firstName: 'Joris',
        lastName: 'Vermeersch',
        role: 'Aankoop',
        email: 'j.vermeersch@kantoorsupplies.be',
      },
      {
        id: 302,
        firstName: 'Lien',
        lastName: 'Bogaert',
        role: 'Boekhouding',
        email: 'l.bogaert@kantoorsupplies.be',
      },
    ],
  },
  {
    id: 3,
    type: 'particulier',
    firstName: 'Tom',
    lastName: 'Willems',
    email: 't.willems@hotmail.com',
    accountActive: false,
    memberSince: '2022-11-05',
    addresses: [
      {
        id: 401,
        street: 'Molenweg',
        number: '3',
        postalCode: '2800',
        city: 'Mechelen',
        type: 'facturatie',
        active: true,
        since: '2022-11-05',
      },
      {
        id: 402,
        street: 'Molenweg',
        number: '3',
        postalCode: '2800',
        city: 'Mechelen',
        type: 'levering',
        active: true,
        since: '2022-11-05',
      },
    ],
  },
  {
    id: 4,
    type: 'bedrijf',
    companyName: 'Buro & Co BVBA',
    email: 'info@buroco.be',
    accountActive: true,
    memberSince: '2020-02-18',
    addresses: [
      {
        id: 501,
        street: 'Amerikalei',
        number: '100',
        postalCode: '2000',
        city: 'Antwerpen',
        type: 'facturatie',
        active: true,
        since: '2020-02-18',
      },
      {
        id: 502,
        street: 'Amerikalei',
        number: '100',
        postalCode: '2000',
        city: 'Antwerpen',
        type: 'levering',
        active: true,
        since: '2020-02-18',
      },
    ],
    contacts: [
      {
        id: 601,
        firstName: 'Sara',
        lastName: 'Claes',
        role: 'Directeur',
        email: 'sara@buroco.be',
      },
    ],
  },
  {
    id: 5,
    type: 'particulier',
    firstName: 'Fatima',
    lastName: 'El Amrani',
    email: 'fatima.elamrani@outlook.com',
    accountActive: true,
    memberSince: '2023-05-30',
    addresses: [
      {
        id: 701,
        street: 'Stationsplein',
        number: '7',
        postalCode: '3000',
        city: 'Leuven',
        type: 'facturatie',
        active: true,
        since: '2023-05-30',
      },
      {
        id: 702,
        street: 'Stationsplein',
        number: '7',
        postalCode: '3000',
        city: 'Leuven',
        type: 'levering',
        active: true,
        since: '2023-05-30',
      },
    ],
  },
];

export const orders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-2024-00891',
    customerId: 1,
    date: '2024-11-12',
    status: 'Verzonden',
    paymentMethod: 'Bancontact',
    paymentCode: 'BC-4481-9923',
    billingAddressId: 101,
    deliveryAddressId: 102,
    allItemsInStock: true,
    trackingCode: '3SPRUL202411120891',
    lines: [
      {
        id: 1,
        articleNumber: 'KAN-0044',
        articleName: 'Ringmap A4 zwart 4-rings',
        quantity: 5,
        unitPrice: 3.99,
        totalAmount: 19.95,
      },
      {
        id: 2,
        articleNumber: 'PAP-1120',
        articleName: 'Kopieerpapier 80gr A4 500vel',
        quantity: 10,
        unitPrice: 6.5,
        totalAmount: 65.0,
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-2025-00034',
    customerId: 1,
    date: '2025-01-08',
    status: 'Lopend',
    paymentMethod: 'Visa',
    paymentCode: 'VI-7723-0045',
    promoCode: 'NIEUWJAAR10',
    billingAddressId: 101,
    deliveryAddressId: 102,
    allItemsInStock: false,
    lines: [
      {
        id: 3,
        articleNumber: 'PEN-0007',
        articleName: 'Balpen Bic Crystal blauw 50-pak',
        quantity: 2,
        unitPrice: 12.75,
        totalAmount: 25.5,
      },
      {
        id: 4,
        articleNumber: 'NOT-0331',
        articleName: 'Post-it 76x76mm geel 12-pak',
        quantity: 3,
        unitPrice: 8.2,
        totalAmount: 24.6,
      },
      {
        id: 5,
        articleNumber: 'STA-0088',
        articleName: 'Perforator 2-gaats metaal',
        quantity: 1,
        unitPrice: 14.99,
        totalAmount: 14.99,
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD-2024-00755',
    customerId: 2,
    contactPersonId: 301,
    date: '2024-10-03',
    status: 'Betaald',
    paymentMethod: 'Overschrijving',
    paymentCode: 'OV-BE82-0015-5544-2201',
    billingAddressId: 201,
    deliveryAddressId: 202,
    allItemsInStock: true,
    lines: [
      {
        id: 6,
        articleNumber: 'MBL-0012',
        articleName: 'Bureau-organizer hout naturel',
        quantity: 20,
        unitPrice: 22.0,
        totalAmount: 440.0,
      },
      {
        id: 7,
        articleNumber: 'KAN-0055',
        articleName: 'Ordner rug 8cm rood',
        quantity: 50,
        unitPrice: 2.8,
        totalAmount: 140.0,
      },
    ],
  },
  {
    id: 4,
    orderNumber: 'ORD-2025-00101',
    customerId: 2,
    contactPersonId: 302,
    date: '2025-02-20',
    status: 'Ingepakt',
    paymentMethod: 'Overschrijving',
    paymentCode: 'OV-BE82-0015-5544-2245',
    billingAddressId: 201,
    deliveryAddressId: 202,
    allItemsInStock: true,
    lines: [
      {
        id: 8,
        articleNumber: 'INK-0099',
        articleName: 'Inkjetcartridge zwart HP 301XL',
        quantity: 10,
        unitPrice: 19.99,
        totalAmount: 199.9,
      },
    ],
  },
  {
    id: 5,
    orderNumber: 'ORD-2025-00167',
    customerId: 4,
    contactPersonId: 601,
    date: '2025-03-15',
    status: 'Lopend',
    paymentMethod: 'Bancontact',
    paymentCode: 'BC-9901-3344',
    billingAddressId: 501,
    deliveryAddressId: 502,
    allItemsInStock: false,
    lines: [
      {
        id: 9,
        articleNumber: 'CHR-0003',
        articleName: 'Bureaustoel ergonomisch zwart',
        quantity: 3,
        unitPrice: 189.0,
        totalAmount: 567.0,
      },
      {
        id: 10,
        articleNumber: 'LAM-0041',
        articleName: 'Bureaulamp LED dimbaar',
        quantity: 3,
        unitPrice: 44.5,
        totalAmount: 133.5,
      },
    ],
  },
  {
    id: 6,
    orderNumber: 'ORD-2024-00612',
    customerId: 3,
    date: '2024-08-19',
    status: 'Geannuleerd',
    paymentMethod: 'iDEAL',
    paymentCode: 'ID-771-2024-0088',
    billingAddressId: 401,
    deliveryAddressId: 402,
    allItemsInStock: true,
    lines: [
      {
        id: 11,
        articleNumber: 'KAN-0099',
        articleName: 'Documentenmap transparant A4',
        quantity: 8,
        unitPrice: 1.75,
        totalAmount: 14.0,
      },
    ],
  },
];
