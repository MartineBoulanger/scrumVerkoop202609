import { useEffect, useState } from "react";
import { Admin } from "./components/Admin";
import { Articles } from "./components/Articles";
import ChangePassword from "./components/ChangePassword";
import { Chat } from "./components/Chat";
import { CustomerChat } from "./components/CustomerChat";
import CustomerDetail from "./components/CustomerDetail";
import CustomerList from "./components/CustomerList";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import LoginScreen from "./components/LoginScreen";
import OrderDetail from "./components/OrderDetail";
import OrderList from "./components/OrderList";
import { Reports } from "./components/Reports";
import { type Customer, type Order } from "./data/mockData";
import { api } from "./lib/api";

export type View = string;

export default function App() {
  const token = new URLSearchParams(location.search).get("chat");
  return token ? <CustomerChat token={token} /> : <SalesApp />;
}
function SalesApp() {
  const [user, setUser] = useState<any>(null);
  const loggedIn = !!user;
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  async function refresh() {
    const d = await api("/data");
    setCustomers(d.customers);
    setOrders(d.orders);
    setArticles(d.articles);
    setLoaded(true);
  }
  useEffect(() => {
    api("/me")
      .then((u) => {
        setUser(u);
        setCurrentUser(u.name);
        refresh().catch((e) => setError(e.message));
      })
      .catch(() => {});
  }, []);
  const [currentUser, setCurrentUser] = useState("An Janssen");
  const [view, setView] = useState<View>("dashboard");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  function navigate(next: View) {
    setView(next);
    window.scrollTo(0, 0);
  }

  async function updateCustomer(updated: Customer) {
    try {
      await api(`/customers/${updated.id}`, "PUT", updated);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function updateOrder(updated: Order) {
    try {
      await api(`/orders/${updated.id}`, "PUT", updated);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={(u) => {
          setCurrentUser(u.name);
          setUser(u);
          refresh().catch((e) => setError(e.message));
        }}
      />
    );
  }

  function renderContent() {
    if (!loaded)
      return (
        <div className="page-shell">
          Gegevens laden…{" "}
          <button
            className="action-button"
            onClick={() => refresh().catch((e) => setError(e.message))}
          >
            Opnieuw proberen
          </button>
        </div>
      );
    if (view === "reports")
      return (
        <Reports customers={customers} orders={orders} articles={articles} />
      );
    if (view === "articles")
      return <Articles articles={articles} refresh={refresh} />;
    if (view === "admin")
      return user.groups.includes("Admin") ? <Admin /> : <p>Geen toegang</p>;
    if (view === "chat") return <Chat customers={customers} />;
    if (view === "dashboard") {
      return (
        <Dashboard
          currentUser={currentUser}
          customers={customers}
          orders={orders}
          onNavigate={navigate}
        />
      );
    }
    if (view === "customers") {
      return (
        <CustomerList
          customers={customers}
          orders={orders}
          onSelect={(id) => navigate(`customer-${id}`)}
        />
      );
    }
    if (view.startsWith("customer-")) {
      const id = parseInt(view.replace("customer-", ""));
      return (
        <CustomerDetail
          key={id}
          customer={customers.find((c) => c.id === id)}
          orders={orders}
          onBack={() => navigate("customers")}
          onOpenOrder={(oid) => navigate(`order-${oid}`)}
          onUpdate={updateCustomer}
        />
      );
    }
    if (view === "orders") {
      return (
        <OrderList
          orders={orders}
          customers={customers}
          onSelect={(id) => navigate(`order-${id}`)}
        />
      );
    }
    if (view.startsWith("order-")) {
      const id = parseInt(view.replace("order-", ""));
      return (
        <OrderDetail
          key={id}
          order={orders.find((o) => o.id === id)}
          customers={customers}
          onBack={() => navigate("orders")}
          onOpenCustomer={(cid) => navigate(`customer-${cid}`)}
          onUpdate={updateOrder}
          onRefresh={refresh}
        />
      );
    }
    if (view === "password") {
      return <ChangePassword />;
    }
    return null;
  }

  return (
    <Layout
      groups={user.groups}
      view={view}
      onNavigate={navigate}
      currentUser={currentUser}
      onLogout={() => {
        api("/logout", "POST")
          .then(() => {
            setUser(null);
            setView("dashboard");
          })
          .catch((e) => setError(e.message));
      }}
    >
      {error && (
        <div role="alert" className="error-notice">
          {error}
          <button onClick={() => setError("")}>Sluiten</button>
        </div>
      )}
      {renderContent()}
    </Layout>
  );
}
