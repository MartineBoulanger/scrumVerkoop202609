import { customers, orders } from "../src/data/mockData";
import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
test("API: authenticatie, rechten, opslag, facturen en chat", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "prularia-test-"));
  const articles = [
    ...new Map(
      orders
        .flatMap((o) => o.lines)
        .map((l) => [
          l.articleNumber,
          {
            id: l.articleNumber,
            name: l.articleName,
            category: "Niet ingesteld",
            supplier: "Niet ingesteld",
            faqs: [],
            reviews: [
              {
                id: "review-1",
                author: "Testklant",
                rating: 5,
                text: "Nuttige review",
              },
              { id: "review-2", author: "Spamtest", rating: 1, text: "Spam" },
            ],
          },
        ]),
    ).values(),
  ];
  writeFileSync(
    join(dir, "store.json"),
    JSON.stringify({ customers, orders, articles, users: [], messages: [] }),
  );
  const port = 39171;
  const server = spawn(
    process.execPath,
    ["--import", "tsx", "server/index.ts"],
    {
      cwd: resolve("."),
      env: {
        ...process.env,
        PORT: String(port),
        DATA_DIR: dir,
        ADMIN_PASSWORD: "Test-Admin-Password-2026!",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  t.after(async () => {
    server.kill();
    await once(server, "exit");
    rmSync(dir, { recursive: true, force: true });
  });
  await new Promise<void>((ok, bad) => {
    const timer = setTimeout(
      () => bad(new Error("Server start timeout")),
      15000,
    );
    server.stdout.on("data", () => {
      clearTimeout(timer);
      ok();
    });
    server.once("exit", (code) => {
      clearTimeout(timer);
      bad(new Error("Server exit " + code));
    });
  });
  async function request(
    path: string,
    method = "GET",
    body?: unknown,
    cookie = "",
  ) {
    const r = await fetch(`http://127.0.0.1:${port}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: r.status,
      data: await r.json(),
      cookie: r.headers.get("set-cookie")?.split(";")[0] || "",
    };
  }
  assert.equal((await request("/data")).status, 401);
  const login = await request("/login", "POST", {
    username: "admin",
    password: "Test-Admin-Password-2026!",
  });
  assert.equal(login.status, 200);
  const admin = login.cookie;
  assert.ok(!("passwordHash" in login.data));
  await t.test(
    "Gebruiker, BCrypt, adminrechten en blokkeren van sessies",
    async () => {
      const created = await request(
        "/admin/users",
        "POST",
        {
          username: "tester",
          name: "Test Medewerker",
          password: "Test-User-Password-2026!",
        },
        admin,
      );
      assert.equal(created.status, 200);
      const u = created.data;
      const added = await request(
        `/admin/users/${u.id}`,
        "PUT",
        { ...u, groups: [...u.groups, "Magazijn"] },
        admin,
      );
      assert.equal(added.status, 200);
      assert.ok(added.data.groups.includes("Magazijn"));
      const removed = await request(`/admin/users/${u.id}`, "PUT", u, admin);
      assert.equal(removed.status, 200);
      assert.ok(!removed.data.groups.includes("Magazijn"));

      const stored = JSON.parse(readFileSync(join(dir, "store.json"), "utf8"));
      assert.match(
        stored.users.find((x: any) => x.id === u.id).passwordHash,
        /^\$2[aby]\$12\$/,
      );
      assert.ok(!JSON.stringify(stored).includes("Test-User-Password-2026!"));
      const session = await request("/login", "POST", {
        username: "tester",
        password: "Test-User-Password-2026!",
      });
      assert.equal(session.status, 200);
      assert.equal(
        (
          await request(
            `/admin/users/${u.id}`,
            "PUT",
            { ...u, groups: ["Admin", "Cwebsite"] },
            session.cookie,
          )
        ).status,
        403,
      );
      const article = (await request("/data", "GET", undefined, session.cookie))
        .data.articles[0];
      const withFaq = {
        ...article,
        faqs: [
          ...article.faqs,
          { id: "staff-faq", question: "Testvraag?", answer: "Testantwoord." },
        ],
      };
      assert.equal(
        (await request(`/articles/${article.id}`, "PUT", withFaq)).status,
        401,
      );
      assert.equal(
        (
          await request(
            `/articles/${article.id}`,
            "PUT",
            withFaq,
            session.cookie,
          )
        ).status,
        200,
      );

      assert.equal(
        (await request("/admin/users", "GET", undefined, session.cookie))
          .status,
        403,
      );
      assert.equal(
        (await request("/chat/1", "GET", undefined, session.cookie)).status,
        403,
      );
      assert.equal(
        (
          await request(
            "/password",
            "POST",
            {
              oldPw: "Test-User-Password-2026!",
              newPw: "Changed-Password-2026!",
            },
            session.cookie,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request("/login", "POST", {
            username: "tester",
            password: "Test-User-Password-2026!",
          })
        ).status,
        401,
      );
      assert.equal(
        (
          await request("/login", "POST", {
            username: "tester",
            password: "Changed-Password-2026!",
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `/admin/users/${u.id}`,
            "PUT",
            { ...u, active: false },
            admin,
          )
        ).data.employeeActive,
        false,
      );
      assert.equal(
        (await request("/data", "GET", undefined, session.cookie)).status,
        401,
      );
    },
  );
  // await t.test(
  //   "Alle reviews tonen en alleen geselecteerde spam verwijderen",
  //   async () => {
  //     const d = (await request("/data", "GET", undefined, admin)).data;
  //     const a = d.articles[0];
  //     assert.equal(a.reviews.length, 4);
  //     const saved = await request(
  //       `/articles/${a.id}`,
  //       "PUT",
  //       { ...a, reviews: a.reviews.filter((r: any) => r.id !== "review-2") },
  //       admin,
  //     );
  //     assert.equal(saved.status, 200);
  //     assert.equal(saved.data.reviews.length, 1);
  //     assert.equal(saved.data.reviews[0].id, "review-1");
  //   },
  // );
  await t.test("Bestellijnen worden serverzijdig gevalideerd", async () => {
    const d = (await request("/data", "GET", undefined, admin)).data;
    const o = d.orders.find((o: any) => o.status === "Lopend");
    assert.equal(
      (
        await request(
          `/orders/${o.id}`,
          "PUT",
          {
            ...o,
            lines: o.lines.map((l: any) => ({
              ...l,
              quantity: l.quantity + 1,
            })),
          },
          admin,
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await request(
          `/orders/${o.id}`,
          "PUT",
          { ...o, lines: [o.lines[0], o.lines[0]] },
          admin,
        )
      ).status,
      400,
    );
  });
  // await t.test(
  //   "FAQ, factuurgegevens, BTW, stabiele nummering en factuurvergrendeling",
  //   async () => {
  //     let d = (await request("/data", "GET", undefined, admin)).data;
  //     const o = d.orders.find((o: any) => o.status === "Betaald");
  //     assert.equal(
  //       (await request(`/invoices/${o.id}`, "POST", {}, admin)).status,
  //       200,
  //     );
  //     assert.equal(
  //       (
  //         await request(
  //           "/admin/invoice-settings",
  //           "PUT",
  //           {
  //             name: "Test BV",
  //             address: "Teststraat 1, 1000 Brussel",
  //             companyNumber: "TEST",
  //             vatNumber: "TEST",
  //             iban: "TEST",
  //             pricesIncludeVat: true,
  //           },
  //           admin,
  //         )
  //       ).status,
  //       200,
  //     );
  //     for (const a of d.articles) {
  //       assert.equal(
  //         (
  //           await request(
  //             `/articles/${a.id}`,
  //             "PUT",
  //             {
  //               ...a,
  //               vatRate: 21,
  //               category: "Testcategorie",
  //               supplier: "Testleverancier",
  //               faqs: [
  //                 {
  //                   id: "faq-1",
  //                   question: "Testvraag?",
  //                   answer: "Testantwoord.",
  //                 },
  //               ],
  //             },
  //             admin,
  //           )
  //         ).status,
  //         200,
  //       );
  //     }
  //     const inv = await request(`/invoices/${o.id}`, "POST", {}, admin);
  //     assert.equal(inv.status, 200);
  //     assert.equal(inv.data.gross, 580);
  //     assert.equal(Math.round((inv.data.net + inv.data.vat) * 100), 58000);
  //     const again = await request(`/invoices/${o.id}`, "POST", {}, admin);
  //     assert.equal(again.data.number, inv.data.number);
  //     assert.equal(
  //       (
  //         await request(
  //           `/orders/${o.id}`,
  //           "PUT",
  //           { ...o, status: "Geannuleerd" },
  //           admin,
  //         )
  //       ).status,
  //       400,
  //     );
  //     assert.equal(
  //       (
  //         await request(
  //           `/orders/${o.id}`,
  //           "PUT",
  //           { ...o, status: "Geleverd" },
  //           admin,
  //         )
  //       ).status,
  //       200,
  //     );
  //   },
  // );
  await t.test(
    "Chat werkt in twee richtingen en schermt andere klanten af",
    async () => {
      const invite = await request("/chat/1/invite", "POST", {}, admin);
      assert.equal(invite.status, 200);
      const token = invite.data.token;
      assert.equal(
        (
          await request("/public/chat/" + token, "POST", {
            text: "Testbericht van klant",
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "/chat/1",
            "POST",
            { text: "Testantwoord van medewerker" },
            admin,
          )
        ).status,
        200,
      );
      const messages = await request("/public/chat/" + token);
      assert.equal(messages.data.length, 2);
      assert.equal(
        (await request("/chat/2", "GET", undefined, admin)).data.length,
        0,
      );
      await request("/chat/1/invite", "POST", {}, admin);
      assert.equal((await request("/public/chat/" + token)).status, 403);
    },
  );
});
