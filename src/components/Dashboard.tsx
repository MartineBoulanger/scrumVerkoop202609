import TopCustomers from "./TopCustomers";
import type { Customer, Order } from "../data/mockData";
import { isPaid } from "../lib/sales";
import { orderTotal } from "./SalesUI";

interface Props {
  currentUser: string;
  customers: Customer[];
  orders: Order[];
  onNavigate: (view: string) => void;
}

const capabilities = [
  {
    icon: "👥",
    title: "Klantenbeheer",
    view: "customers",
    items: [
      "Klanten opzoeken en raadplegen",
      "Klantprofiel bekijken (particulier of bedrijf)",
      "Contactpersonen van bedrijven inzien",
      "Bestelhistoriek per klant raadplegen",
      "Account deactiveren bij fraudevermoeden",
      "Facturatie- en leveringsadres wijzigen (historiek bewaard)",
    ],
  },
  {
    icon: "📦",
    title: "Bestellingen",
    view: "orders",
    items: [
      "Alle bestellingen overzien en filteren op status",
      "Besteldetails raadplegen (klant, betaling, adressen, artikelen)",
      "Bestellingen in status Lopend of Betaald bewerken",
      "Leveringsadres aanpassen",
      "Artikelen verwijderen of aantal verlagen",
      "Bestelling annuleren (enkel Lopend of Betaald)",
    ],
  },
  {
    icon: "🔒",
    title: "Beveiliging",
    view: "password",
    items: [
      "Eigen wachtwoord wijzigen",
      "Wachtwoorden worden gehasht opgeslagen (BCrypt)",
    ],
  },
];

export default function Dashboard({
  currentUser,
  customers,
  orders,
  onNavigate,
}: Props) {
  const activeCustomers = customers.filter((c) => c.accountActive).length;
  const openOrders = orders.filter(
    (o) => o.status === "Lopend" || o.status === "Betaald",
  ).length;
  const totalRevenue = orders
    .filter(isPaid)
    .reduce((sum, o) => sum + orderTotal(o.lines), 0);

  const firstName = currentUser.split(" ")[0];

  return (
    <div className="page-shell">
      {/* Welcome header */}
      <div className="dashboard-welcome">
        <div>
          <p className="eyebrow">Verkoopmodule</p>
          <h1 className="page-title">Welkom, {firstName}!</h1>
          <p className="page-subtitle">
            U bent aangemeld als medewerker van het verkoopteam. Hieronder vindt
            u een overzicht van wat u kunt doen.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{customers.length}</div>
          <div className="stat-label">Klanten totaal</div>
          <div className="stat-sub">{activeCustomers} actief</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Bestellingen totaal</div>
          <div className="stat-sub">{openOrders} openstaand</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {new Intl.NumberFormat("nl-BE", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }).format(totalRevenue)}
          </div>
          <div className="stat-label">Totale omzet</div>
          <div className="stat-sub">Enkel betaald</div>
        </div>
      </div>

      <TopCustomers customers={customers} orders={orders} />

      {/* Capabilities */}
      <h2 className="capabilities-heading">Wat kunt u doen?</h2>
      <div className="dashboard-caps">
        {capabilities.map((cap) => (
          <button
            key={cap.view}
            onClick={() => onNavigate(cap.view)}
            className="cap-card"
          >
            <div className="cap-icon">{cap.icon}</div>
            <div className="cap-title">{cap.title}</div>
            <ul className="cap-list">
              {cap.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="cap-cta">Ga naar {cap.title} →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
