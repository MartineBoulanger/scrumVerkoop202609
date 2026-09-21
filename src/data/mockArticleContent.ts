/** Fictieve reviews en FAQ's voor de demo; geen echte klantbeoordelingen of productspecificaties. */
export interface MockReview {
  id: string;
  author: string;
  rating: number;
  text: string;
}
export interface MockFaq {
  id: string;
  question: string;
  answer: string;
}
interface ArticleContent {
  reviews: MockReview[];
  faqs: MockFaq[];
}

const content: Record<string, ArticleContent> = {
  'KAN-0044': {
    reviews: [
      {
        id: 'demo-review-KAN-0044-1',
        author: 'Eva Peeters',
        rating: 5,
        text: 'Stevige ringmap voor onze projectdossiers. De vier ringen sluiten netjes en de documenten blijven goed op hun plaats.',
      },
      {
        id: 'demo-review-KAN-0044-2',
        author: 'Lars De Smet',
        rating: 4,
        text: 'Handig voor dagelijks gebruik. De kaft voelt degelijk aan, al had ik graag een iets groter etiketvak op de rug gehad.',
      },
    ],
    faqs: [
      {
        id: 'demo-faq-KAN-0044-1',
        question: 'Voor welk papierformaat is deze ringmap geschikt?',
        answer:
          'Deze ringmap is bedoeld voor A4-documenten met een perforatie voor vier ringen. U kunt ook A4-insteekhoezen met een passende perforatie gebruiken.',
      },
      {
        id: 'demo-faq-KAN-0044-2',
        question: 'Kan ik tabbladen in deze map gebruiken?',
        answer:
          'Ja, A4-tabbladen met een viergaats- of universele perforatie kunnen in deze map worden gebruikt.',
      },
    ],
  },
  'PAP-1120': {
    reviews: [
      {
        id: 'demo-review-PAP-1120-1',
        author: 'Noor Verhaegen',
        rating: 5,
        text: 'Prima papier voor onze dagelijkse afdrukken. Tekst is scherp en het papier loopt vlot door onze kantoorprinter.',
      },
      {
        id: 'demo-review-PAP-1120-2',
        author: 'Bram Jacobs',
        rating: 4,
        text: 'Goede prijs voor een pak van 500 vellen. Voor gewone documenten ideaal; voor presentaties gebruik ik liever wat dikker papier.',
      },
      {
        id: 'demo-review-PAP-1120-3',
        author: 'Mila Claes',
        rating: 3,
        text: 'Doet wat het moet doen. Bij dubbelzijdig afdrukken met grote donkere vlakken schijnt de achterkant bij mij een beetje door.',
      },
    ],
    faqs: [
      {
        id: 'demo-faq-PAP-1120-1',
        question: 'Hoeveel vellen zitten er in één verpakking?',
        answer:
          'Eén verpakking bevat 500 vellen A4-papier van 80 gram per vierkante meter.',
      },
      {
        id: 'demo-faq-PAP-1120-2',
        question: 'Hoe kan ik ongebruikt papier het beste bewaren?',
        answer:
          'Bewaar het papier vlak en droog, bij voorkeur in de gesloten verpakking. Zo helpt u voorkomen dat de vellen vocht opnemen of kromtrekken.',
      },
    ],
  },
  'PEN-0007': {
    reviews: [
      {
        id: 'demo-review-PEN-0007-1',
        author: 'Jelle Maes',
        rating: 5,
        text: 'Handige voorraad voor onze vergaderzalen. De pennen schrijven prettig en de blauwe inkt is goed leesbaar.',
      },
      {
        id: 'demo-review-PEN-0007-2',
        author: 'Lotte Goossens',
        rating: 4,
        text: 'Betrouwbare pennen voor notities. Bij langdurig schrijven vind ik een pen met een zachte grip wel wat comfortabeler.',
      },
    ],
    faqs: [
      {
        id: 'demo-faq-PEN-0007-1',
        question: 'Bevat de verpakking verschillende inktkleuren?',
        answer: 'Nee, deze verpakking bevat 50 balpennen met blauwe inkt.',
      },
      {
        id: 'demo-faq-PEN-0007-2',
        question: 'Zijn de pennen afzonderlijk verpakt?',
        answer:
          'Nee, de 50 pennen worden samen in één doos geleverd. Elke pen heeft een eigen dop.',
      },
    ],
  },
  'MBL-0012': {
    reviews: [
      {
        id: 'demo-review-MBL-0012-1',
        author: 'Sofie Hendrickx',
        rating: 5,
        text: 'Mijn bureau is eindelijk overzichtelijk. Pennen, notitieblaadjes en kleine accessoires hebben nu allemaal een eigen plek.',
      },
      {
        id: 'demo-review-MBL-0012-2',
        author: 'Niels Wouters',
        rating: 4,
        text: 'Mooie natuurlijke uitstraling. Voor grote scharen zijn de vakken wat klein, maar voor gewone bureauaccessoires is hij erg praktisch.',
      },
    ],
    faqs: [
      {
        id: 'demo-faq-MBL-0012-1',
        question: 'Moet ik de bureau-organizer zelf monteren?',
        answer:
          'Nee, de organizer wordt gemonteerd geleverd en kan meteen op uw bureau worden geplaatst.',
      },
      {
        id: 'demo-faq-MBL-0012-2',
        question: 'Hoe maak ik de houten organizer schoon?',
        answer:
          'Gebruik een zachte, licht vochtige doek en droog het oppervlak daarna af. Dompel de organizer niet onder in water en vermijd schurende reinigingsmiddelen.',
      },
    ],
  },
  'CHR-0003': {
    reviews: [
      {
        id: 'demo-review-CHR-0003-1',
        author: 'Thomas De Vos',
        rating: 5,
        text: 'Een comfortabele stoel voor mijn thuiswerkplek. Vooral de verstelbare zithoogte maakt het makkelijk om goed aan mijn bureau te zitten.',
      },
      {
        id: 'demo-review-CHR-0003-2',
        author: 'Lien Martens',
        rating: 4,
        text: 'De montage was goed te doen en de stoel zit prettig. Ik moest even zoeken naar de juiste instelling van de rugleuning.',
      },
      {
        id: 'demo-review-CHR-0003-3',
        author: 'Ruben Willems',
        rating: 3,
        text: 'Degelijke stoel, maar de zitting voelt voor mij wat stevig aan. Voor kortere werkdagen vind ik hem prima.',
      },
    ],
    faqs: [
      {
        id: 'demo-faq-CHR-0003-1',
        question: 'Wordt de bureaustoel volledig gemonteerd geleverd?',
        answer:
          'Nee, de stoel wordt in onderdelen geleverd. Een montagehandleiding en het benodigde bevestigingsmateriaal zitten in de verpakking.',
      },
      {
        id: 'demo-faq-CHR-0003-2',
        question: 'Kan ik de zithoogte aanpassen?',
        answer:
          'Ja, de zithoogte kan met de hendel onder de zitting worden aangepast. Stel de stoel zo in dat uw voeten comfortabel op de vloer rusten.',
      },
    ],
  },
  'LAM-0041': {
    reviews: [
      {
        id: 'demo-review-LAM-0041-1',
        author: 'Fleur Van Damme',
        rating: 5,
        text: 'Fijne lamp voor mijn werkhoek. De dimfunctie is handig: helder licht om te werken en wat zachter licht in de avond.',
      },
      {
        id: 'demo-review-LAM-0041-2',
        author: 'Arne Smits',
        rating: 4,
        text: 'Geeft mooi gericht licht zonder veel plaats op mijn bureau in te nemen. Het snoer mocht voor mijn opstelling iets langer zijn.',
      },
    ],
    faqs: [
      {
        id: 'demo-faq-LAM-0041-1',
        question: 'Kan ik de helderheid van deze lamp aanpassen?',
        answer:
          'Ja, de lamp heeft een dimfunctie waarmee u de lichtsterkte kunt aanpassen aan uw werkplek.',
      },
      {
        id: 'demo-faq-LAM-0041-2',
        question: 'Werkt deze bureaulamp op batterijen?',
        answer:
          'Nee, deze uitvoering gebruikt een aansluiting op het elektriciteitsnet. De bijbehorende voedingsadapter wordt meegeleverd.',
      },
    ],
  },
};

/** Nieuwe objecten voorkomen dat bewerkingen de oorspronkelijke voorbeelden wijzigen. */
export function mockArticleContent(articleNumber: string): ArticleContent {
  const entry = content[articleNumber];
  return {
    reviews: entry?.reviews.map((review) => ({ ...review })) ?? [],
    faqs: entry?.faqs.map((faq) => ({ ...faq })) ?? [],
  };
}
