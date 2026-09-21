import { useState } from "react";
import { ArticleDetail } from "./ArticleDetail";
export function Articles({
  articles,
  refresh,
}: {
  articles: any[];
  refresh: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const article = articles.find((a) => a.id === selected);
  const filtered = articles.filter((a) =>
    `${a.id} ${a.name} ${a.category} ${a.supplier}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  if (article)
    return (
      <ArticleDetail
        key={article.id}
        article={article}
        refresh={refresh}
        onBack={() => setSelected(null)}
      />
    );
  return (
    <div className="page-shell">
      <div className="list-heading">
        <div>
          <p className="eyebrow">Artikelbeheer</p>
          <h1 className="page-title">Artikelen</h1>
          <p className="page-subtitle">
            Alle geregistreerde artikelen. Open een artikel voor gegevens,
            reviews en veelgestelde vragen.
          </p>
        </div>
        <p className="result-count">
          {filtered.length} van {articles.length} artikelen
        </p>
      </div>
      <div className="list-card">
        <div className="toolbar">
          <input
            type="search"
            aria-label="Artikelen zoeken"
            placeholder="Zoeken op artikel, categorie of leverancier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Artikelnummer</th>
                <th>Artikelnaam</th>
                <th>Categorie</th>
                <th>Leverancier</th>
                <th>Reviews</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="click-row"
                  tabIndex={0}
                  onClick={() => setSelected(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(a.id);
                    }
                  }}
                >
                  <td className="reference-small">{a.id}</td>
                  <td>
                    <b>{a.name}</b>
                  </td>
                  <td>{a.category}</td>
                  <td>{a.supplier}</td>
                  <td>{a.reviews.length}</td>
                  <td className="chevron">›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <p className="empty-state">Geen artikelen gevonden.</p>
        )}
      </div>
    </div>
  );
}
