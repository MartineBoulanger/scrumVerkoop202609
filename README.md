# Prularia verkoopmodule · versie 2.1

Refactor van de aangeleverde React/TypeScript-app, uitgebreid met een lokale Node/Express-backend. De groene huisstijl, zijbalk, kaarten, formulieren en tabellen zijn behouden. Alle schermen gebruiken gewone CSS; Tailwind is volledig uit de applicatie en build verwijderd.

Gelieve alle stappen hier te volgen om het project werkend te krijgen!
In the .env.example staat ook informatie.

Het beste is om het project te clonen in VSC, niet VS.

## Starten

Gebruik Node.js 22.13 of hoger (liefst 24 sinds dat de LTS versie is). Open een terminal in deze map:

```sh
npm ci
```

Stel bij de **eerste start** een eigen beheerderswachtwoord in (minimaal 12 tekens, maximaal 72 UTF-8-bytes). Dit wachtwoord wordt met BCrypt cost 12 gehasht opgeslagen.

macOS/Linux:

```sh
npm run dev
```

PowerShell:

```powershell
npm run dev
```

Open http://127.0.0.1:5173 en meld aan als `admin` of als `website.medewerker` met uw eigen wachtwoord (zie ook the .env.example file). Latere starts: `npm run dev`. De oude hardcoded accounts en wachtwoorden zijn verwijderd. De beheerder kan medewerkers aanmaken bij **Gebruikers**.

```sh
npm test
npm run build
npm start
```

`npm start` serveert de gebouwde app op http://127.0.0.1:3001. Startcommando's moeten vanuit deze projectmap worden uitgevoerd. De backend start zonder `ADMIN_PASSWORD` zodra er een bestaande gebruikersopslag is.

## Functionaliteit

- **Bestellingen:** filters voor betaald/niet geleverd, levering meer dan 5 dagen na betaling, onbetaald meer dan 5 dagen, plus de bestaande status- en klantfilters. Afzonderlijke kolommen voor het exacte aantal dagen sinds bestelling en de leverstatus met tekst/kleur: 0–5 OK, 6–10 oranje, vanaf 11 rood. Magazijn-PDF met exact alle bestellingen uit de gefilterde lijst, inclusief de betaalstatus, berekende betaaldatum, leverstatus en eventuele achterstallige betaling. Besteldetails bevatten de actie ‘Markeer als geleverd’.
- **Klanten:** filter en markering voor meer dan één kalendermaand zonder bestelling, PDF met contactgegevens en laatste besteldatum, bestaande klant- en adresfunctionaliteit en een aparte tab **Top 5 artikelen** met artikelnaam en totaal aantal gekochte stuks per artikel.
- **Facturen:** bedrijfsgegevens instellen via **Gebruikers → Facturatie**. Stel daar ook in of de bestaande bestelprijzen inclusief of exclusief btw zijn. Vul per artikel het toepasselijke btw-percentage in bij **Artikelen**. Daarna maakt **Factuur bekijken** een genummerde factuur met btw-specificatie en bewaart een momentopname. De PDF wordt met PDF.js in de bestelpagina getoond (ook zonder ingebouwde browser-PDF-viewer), met een aparte **PDF downloaden**-knop en een link om het document in een nieuw tabblad te openen. Voorbeeld en download gebruiken exact hetzelfde PDF-document. De factuur bevat bestel- en betaalgegevens, klantnaam, klantnummer, e-mail, telefoon, facturatie- en leveringsadres, artikeltabel, btw-specificatie en totalen. Herhaald bekijken of downloaden geeft hetzelfde factuurnummer en dezelfde gegevens. De bestelling kan daarna niet meer gewijzigd of geannuleerd worden; geleverd markeren blijft mogelijk. De bron bevat geen bedrijfs-/btw-gegevens; die worden niet verzonnen. Deze implementatie genereert PDF's, geen elektronische factuuruitwisseling of boekhoudkoppeling.
- **Dashboard en rapporten:** geordende top 5 klanten op betaald bestelbedrag, verkochte aantallen per categorie met naam en leverancier, maandomzet per jaar tot en met de huidige maand.
- **Gebruikers:** toevoegen met BCrypt, gebruikers- en gekoppelde personeelsaccountstatus samen uitschakelen, securitygroepen beheren vanuit gebruiker én groep. Adminrechten worden op de server gecontroleerd. Uitgeschakelde accounts en verwijderde Cwebsite-toegang verliezen ook toegang met bestaande sessies.
- **Artikelen:** doorzoekbare lijst van alle geregistreerde artikelen, met doorklik naar een volledige detailpagina; categorie, leverancier en btw instellen; meerdere bestaande reviews tonen en spam verwijderen; FAQ's met zichtbare antwoorden tonen en vraag/antwoord toevoegen. Alleen aangemelde, actieve medewerkers met Cwebsite-toegang kunnen de API gebruiken. De bron bevat geen reviews of FAQ's, daarom starten deze lijsten leeg.
- **Chat:** medewerker kiest klant en maakt een klantlink. Open die link in een andere browser om als klant te antwoorden. De berichten worden om de 2 seconden opgehaald en blijven opgeslagen. De klantlink verloopt na 24 uur, bij serverherstart of bij aanmaken van een vervangende link. Alleen Admin/Klantendienst heeft toegang tot de medewerkerskant. Er worden geen mails of uitnodigingen automatisch verstuurd.

## Toegepaste berekeningen

- Kalenderdagen, niet werkdagen; huidige datum in `Europe/Brussels`.
- Betaald: status `Betaald`, `Ingepakt`, `Verzonden` of `Geleverd`. `Lopend` blijft onbetaald, ook bij overschrijving. `Geannuleerd` wordt uitgesloten van opvolging, omzet en rankings.
- Berekende betaaldatum: besteldatum bij Visa, Bancontact en iDEAL; besteldatum + 1 kalenderdag bij overschrijving. De oorspronkelijke data heeft geen aparte daadwerkelijke betaaldatum.
- **Verzonden is niet hetzelfde als geleverd.** De toegevoegde status `Geleverd` sluit een order uit van leveringsopvolging. Op exact dag 5 nog binnen termijn; vanaf dag 6 te laat.
- De leeftijdskolom gebruikt besteldatum; de leveringswaarschuwing gebruikt betaaldatum. Een order kan daardoor al oranje zijn terwijl zijn levertermijn nog niet overschreden is.
- Inactief: laatste niet-geannuleerde bestelling ouder dan één kalendermaand. Bij maandultimo wordt de vorige maand op zijn laatste bestaande dag begrensd. Klanten zonder bestellingen krijgen ‘Nog nooit besteld’ en vallen niet onder dit filter.
- Artikeltop 5: som van aantallen, geannuleerde bestellingen uitgesloten. Best verkochte artikelen per categorie en topklanten: alleen betaalde bestellingen.
- Omzet per maand gebruikt de berekende betaaldatum en de oorspronkelijke bestelbedragen. Historische jaren tonen 12 maanden, huidig jaar alleen januari t/m huidige maand. Bedragen worden op centen afgerond.

## Opbouw

- `src/components/`: één implementatie per scherm, plus gedeelde UI.
- `src/lib/sales.ts`: centrale bedrijfsregels en aggregaties.
- `src/lib/api.ts`: gedeelde API-client met foutmeldingen.
- `src/lib/pdf.ts`: PDF-opmaak, paginering en exports.
- `src/styles/layout.css`: oorspronkelijke huisstijl en responsive layout.
- `src/styles/components.css`: gewone CSS voor gedeelde en bestaande componenten, met klassen zoals `nav-item`, `login-field`, `status-badge` en `quantity-field`.
- `src/styles/modules.css`: filters, opvolgkleuren, nieuwe schermen en grafiek.
- `server/store.ts`: gegevensopslag en eerste beheerder.
- `server/routes/`: authenticatie, account, orders/klanten, artikelen, admin, facturen en chat afzonderlijk.
- `tests/`: grensgevallen van berekeningen en integratietests met een geïsoleerde tijdelijke backend.

Verwijderd: dubbele implementaties en dataset onder `src/imports/`, ongebruikte `CustomerDashboard` en `OrderDashboard`, Figma-specifieke deployconfiguratie, hardcoded wachtwoorden en Tailwind-buildconfiguratie. Het logo is verplaatst naar `src/assets/`. Inline styling en hover-events zijn vervangen door CSS; de grafiekhoogte is de enige dynamische stijl.

## Data en uitvoering

De eerste start neemt de **ongewijzigde voorbeeldklanten en bestellingen** uit de oorspronkelijke zip over. Deze dateren uit 2024–2025: open bestellingen zijn vandaag dus oud, en de grafiek voor 2026 is leeg. Kies 2024 of 2025 om historische omzet te zien. Categorieën en leveranciers staan op ‘Niet ingesteld’ totdat u ze invult.

Gegevens worden atomair naar `server/data/store.json` geschreven. Dit is een lokale, zelfstandige implementatie voor één serverproces, zonder externe database of bestaande klantenwebsite. Maak een back-up van dit bestand. Sessies en tijdelijke klantlinks staan in het servergeheugen; na een herstart moet men opnieuw aanmelden. Voor productie met meerdere processen moet deze opslag door een database en gedeelde sessieopslag vervangen worden en moeten klanten vanuit uw eigen klantenportaal worden gekoppeld. De server luistert standaard alleen op 127.0.0.1; een klantlink is pas extern bereikbaar wanneer de applicatie bewust gehost wordt.

Optionele omgevingsvariabelen: `DATA_DIR`, `PORT`, `SESSION_SECRET`, `APP_ORIGIN`. Bij `NODE_ENV=production` worden Secure-cookies gebruikt: plaats dan HTTPS vóór de server, stel `APP_ORIGIN` op het exacte publieke adres in en gebruik een vaste sterke `SESSION_SECRET`. De backend vertrouwt alleen een lokale reverse proxy. Er is geen `.env`-loader; geef variabelen via de shell of uw procesbeheerder door.

## Controle

`npm run build` controleert TypeScript voor frontend, backend en tests en bouwt de app. `npm test` controleert kleur- en datumgrenzen, betaal-/leverregels, maandultimo, rankings, BCrypt, rechten, accountblokkering, ordervalidatie, reviewverwijdering, FAQ, btw/factuurnummering en tweerichtingschat. Tests gebruiken tijdelijke data; uw gebruikersopslag blijft onaangeroerd.

## Wijzigingen in versie 2.1

- Leverstatus en exact aantal dagen staan in aparte kolommen.
- Magazijnexport neemt exact de huidige filterselectie over.
- Factuurvoorbeeld in de bestelpagina, met afzonderlijke lokale PDF-download.
- Artikeltop 5 in een eigen klantprofieltab.
- Top 5 klanten op het dashboard; gedeelde berekening met de rapporten.
- Artikellijst met zoeken en aparte artikelpagina, reviews en zichtbare FAQ-antwoorden.
- Extra regressietests voor de nieuwe acceptatiecriteria en PDF-inhoud.
