import { mockArticleDetails } from "../../src/data/mockCatalog";
import express from "express";
import { db, save } from "../store";
export function registerarticles(app: express.Express) {
  app.put("/api/articles/:id", (req, res) => {
    const a = db.articles.find((a: any) => a.id === req.params.id);
    if (!a) return res.status(404).json({ error: "Artikel niet gevonden" });
    const b = req.body;
    if (
      typeof b.category !== "string" ||
      !b.category.trim() ||
      typeof b.supplier !== "string" ||
      !b.supplier.trim() ||
      !Array.isArray(b.faqs) ||
      !b.faqs.every(
        (f: any) =>
          typeof f.question === "string" &&
          f.question.trim() &&
          typeof f.answer === "string" &&
          f.answer.trim(),
      ) ||
      !Array.isArray(b.reviews) ||
      !b.reviews.every((r: any) =>
        a.reviews.some((old: any) => old.id === r.id),
      )
    )
      return res.status(400).json({ error: "Ongeldige artikelgegevens" });
    Object.assign(a, {
      ...mockArticleDetails(a.id),
      faqs: b.faqs,
      reviews: a.reviews.filter((r: any) =>
        b.reviews.some((x: any) => x.id === r.id),
      ),
    });
    save();
    res.json(a);
  });
}
