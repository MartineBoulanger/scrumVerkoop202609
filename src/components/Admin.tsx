import { useEffect, useState } from 'react';
import { api } from '../lib/api';
export function Admin() {
  const [data, setData] = useState<{ users: any[]; groups: string[] }>({
    users: [],
    groups: [],
  });
  const [error, setError] = useState('');
  const [group, setGroup] = useState('');
  async function load() {
    try {
      setData(await api('/admin/users'));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function update(u: any) {
    try {
      await api(`/admin/users/${u.id}`, 'PUT', u);
      await load();
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function toggle(u: any, g: string) {
    return update({
      ...u,
      groups: u.groups.includes(g)
        ? u.groups.filter((x: string) => x !== g)
        : [...u.groups, g],
    });
  }
  return (
    <div className='page-shell'>
      <h1 className='page-title'>Gebruikers beheren</h1>
      {error && (
        <p role='alert' className='error-notice'>
          {error}
        </p>
      )}
      <form
        className='detail-card module-form'
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const d = new FormData(form);
          try {
            await api('/admin/users', 'POST', Object.fromEntries(d));
            form.reset();
            await load();
            setError('');
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <h2>Gebruiker toevoegen</h2>
        <label>
          Naam
          <input name='name' required />
        </label>
        <label>
          Gebruikersnaam
          <input name='username' required />
        </label>
        <label>
          Wachtwoord
          <input
            name='password'
            type='text'
            autoComplete='new-password'
            required
            disabled
            value='PersoneelVanPrularia'
          />
        </label>
        <button className='action-button'>Gebruiker toevoegen</button>
      </form>
      <section className='detail-card module-section'>
        <h2>Per gebruiker</h2>
        {data.users.map((u) => (
          <div className='user-row' key={u.id}>
            <strong>
              {u.name} ({u.username})
            </strong>
            <p>
              Gebruiker: {u.active ? 'Actief' : 'Uitgeschakeld'} ·
              Personeelsaccount: {u.employeeActive ? 'Actief' : 'Uitgeschakeld'}
            </p>
            <div className='group-options'>
              {data.groups.map((g) => (
                <label key={g}>
                  <input
                    type='checkbox'
                    checked={u.groups.includes(g)}
                    onChange={() => toggle(u, g)}
                  />
                  {g}
                </label>
              ))}
            </div>
            <button
              className='action-button'
              onClick={() => update({ ...u, active: !u.active })}
            >
              {u.active
                ? 'Gebruiker en personeel disablen'
                : 'Accounts activeren'}
            </button>
          </div>
        ))}
      </section>
      <section className='detail-card module-section'>
        <h2>Per securitygroep</h2>
        <select
          aria-label='Securitygroep'
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value=''>Kies een groep</option>
          {data.groups.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        {group &&
          data.users.map((u) => (
            <div className='group-row' key={u.id}>
              {u.name}
              <button
                className='action-button'
                onClick={() => toggle(u, group)}
              >
                {u.groups.includes(group)
                  ? 'Uit groep verwijderen'
                  : 'Aan groep toevoegen'}
              </button>
            </div>
          ))}
      </section>
    </div>
  );
}
