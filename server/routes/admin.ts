import bcrypt from 'bcryptjs';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { db, groups, publicUser, save } from '../store';
export function registeradmin(app: express.Express) {
  app.use('/api/admin', (_, res, next) =>
    res.locals.user.groups.includes('Admin')
      ? next()
      : res.status(403).json({ error: 'Enkel beheerders' }),
  );
  app.get('/api/admin/users', (_, res) =>
    res.json({ users: db.users.map(publicUser), groups }),
  );
  app.post('/api/admin/users', async (req, res) => {
    const { username, name, password } = req.body;
    if (
      !name ||
      typeof password !== 'string' ||
      password.length < 12 ||
      Buffer.byteLength(password) > 72 ||
      db.users.some((u: any) => u.username === username)
    )
      return res.status(400).json({
        error:
          'Controleer unieke gebruikersnaam, naam en wachtwoord (12 tekens tot 72 bytes).',
      });
    const u = {
      id: randomUUID(),
      username,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      active: true,
      employeeActive: true,
      groups: ['Cwebsite'],
    };
    if (db.users.some((existing: any) => existing.username === username))
      return res.status(409).json({ error: 'Gebruikersnaam bestaat al.' });
    db.users.push(u);
    save();
    res.json(publicUser(u));
  });
  app.put('/api/admin/users/:id', (req, res) => {
    const u = db.users.find((u: any) => u.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    if (
      !Array.isArray(req.body.groups) ||
      !req.body.groups.every((g: string) => groups.includes(g))
    )
      return res.status(400).json({ error: 'Ongeldige groep' });
    if (
      u.id === res.locals.user.id &&
      (!req.body.active ||
        !req.body.groups.includes('Admin') ||
        !req.body.groups.includes('Cwebsite'))
    )
      return res.status(400).json({
        error: 'U kunt uw eigen beheerderstoegang niet uitschakelen.',
      });
    Object.assign(u, {
      active: !!req.body.active,
      employeeActive: !!req.body.active,
      groups: [...new Set(req.body.groups)],
    });
    save();
    res.json(publicUser(u));
  });
}
