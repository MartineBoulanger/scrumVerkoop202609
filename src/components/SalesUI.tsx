import type { OrderStatus } from '../data/mockData';

export { customerName, money, orderTotal } from '../lib/sales';

export function StatusBadge({
  status,
}: {
  status: OrderStatus | 'Actief' | 'Inactief';
}) {
  const colors: Record<string, string> = {
    Geleverd: 'status-success',
    Actief: 'status-success',
    Inactief: 'status-danger',
    Lopend: 'status-open',
    Betaald: 'status-success',
    Ingepakt: 'status-packed',
    Verzonden: 'status-shipped',
    Geannuleerd: 'status-danger',
  };
  return (
    <span className={`status-badge ${colors[status]}`}>
      <span className='status-dot' />
      {status}
    </span>
  );
}

export const Page = ({ children }: { children: React.ReactNode }) => (
  <div className='page-shell'>{children}</div>
);

export const BackButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button onClick={onClick} className='back-button'>
    ← {children}
  </button>
);
