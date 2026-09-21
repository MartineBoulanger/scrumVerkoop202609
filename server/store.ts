import { mockArticleDetails, MOCK_COMPANY } from '../src/data/mockCatalog';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { customers, orders } from '../src/data/mockData';
import { mockArticleContent } from '@/data/mockArticleContent';
const dir = resolve(process.env.DATA_DIR || 'server/data');
mkdirSync(dir, { recursive: true });
const file = resolve(dir, 'store.json');
const groups = ['Admin', 'Cwebsite', 'Klantendienst', 'Magazijn'];
const articles = [
  ...new Map(
    orders
      .flatMap((o) => o.lines)
      .map((l) => [
        l.articleNumber,
        {
          id: l.articleNumber,
          name: l.articleName,
          ...mockArticleDetails(l.articleNumber),
          reviews: [],
          faqs: [],
        },
      ]),
  ).values(),
];
const db: any = existsSync(file)
  ? JSON.parse(readFileSync(file, 'utf8'))
  : { customers, orders, articles, users: [], messages: [] };
function save() {
  writeFileSync(file + '.tmp', JSON.stringify(db, null, 2), { mode: 0o600 });
  renameSync(file + '.tmp', file);
}
if (!db.users.length) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12 || Buffer.byteLength(password) > 72)
    throw new Error(
      'Stel ADMIN_PASSWORD in (minstens 12 tekens) voor eerste start.',
    );
  db.users.push({
    id: randomUUID(),
    username: 'admin',
    name: 'Beheerder',
    passwordHash: bcrypt.hashSync(password, 12),
    active: true,
    employeeActive: true,
    groups: ['Admin', 'Cwebsite', 'Klantendienst'],
  });
  save();
}
// Demo-account voor de website-medewerker: uitsluitend toegang tot Cwebsite.
// De account wordt alleen toegevoegd als hij nog niet bestaat.
if (!db.users.some((user: any) => user.username === 'website.medewerker')) {
  db.users.push({
    id: randomUUID(),
    username: 'website.medewerker',
    name: 'Website Medewerker',
    passwordHash: bcrypt.hashSync('PersoneelVanPrularia', 12),
    active: true,
    employeeActive: true,
    groups: ['Cwebsite', 'Klantendienst'],
  });
  save();
}
db.invoices ||= [];
// Apply the demo catalog on every start, including previously saved mock data.
// Reviews, FAQ entries, users, orders and issued invoice snapshots stay intact.
db.articles = db.articles.map((article: any) => ({
  ...article,
  ...mockArticleDetails(article.id),
}));
db.invoiceSettings = { ...MOCK_COMPANY };
// Eenmalige aanvulling voor nieuwe én bestaande demo-opslag.
// Bewaar bestaande invoer en voorkom dat verwijderde reviews terugkomen.
db.seedVersions ||= {};
if (!db.seedVersions.articleContentV1) {
  for (const article of db.articles) {
    const examples = mockArticleContent(article.id);
    article.reviews ||= [];
    article.faqs ||= [];
    const reviewIds = new Set(
      article.reviews.map((review: { id: string }) => review.id),
    );
    const faqIds = new Set(article.faqs.map((faq: { id: string }) => faq.id));
    article.reviews.push(
      ...examples.reviews.filter((review) => !reviewIds.has(review.id)),
    );
    article.faqs.push(...examples.faqs.filter((faq) => !faqIds.has(faq.id)));
  }
  db.seedVersions.articleContentV1 = true;
  save();
}
const publicUser = (u: any) => {
  const { passwordHash, ...rest } = u;
  return rest;
};
const attempts = new Map<string, { count: number; time: number }>();
const invites = new Map<string, { customerId: number; expires: number }>();
export { attempts, db, groups, invites, publicUser, save };
