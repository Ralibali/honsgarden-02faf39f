// Genererar omfattande, unikt innehåll per ort för /salja-agg/:ort
// Mål: minst ~1000 ord per sida, varierat per region/län/storlek.

import type { Ort } from './saljaAggOrter';

// Enkel deterministisk hash för att variera innehåll per ort
function seed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(slug: string, salt: string, arr: T[]): T {
  return arr[seed(slug + salt) % arr.length];
}

function pickN<T>(slug: string, salt: string, arr: T[], n: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let i = 0;
  while (out.length < Math.min(n, arr.length) && i < arr.length * 4) {
    const idx = seed(slug + salt + i) % arr.length;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(arr[idx]);
    }
    i++;
  }
  return out;
}

const REGION_KLIMAT: Record<string, string> = {
  Götaland:
    'milt kustklimat med långa, ljusa somrar och relativt korta vintrar – perfekta förutsättningar för värpning från tidig vår till sen höst',
  Svealand:
    'tydliga årstider med varma somrar och kalla, snörika vintrar – vilket gör värmeisolering och belysning i hönshuset extra viktigt under vintern',
  Norrland:
    'långa, ljusa sommarnätter och kalla, mörka vintrar – många hönsägare här kompletterar med lampor från november till februari för att hålla värpningen igång',
};

const REGION_KOPARTYP: Record<string, string[]> = {
  Götaland: [
    'matintresserade familjer från villaområdena',
    'restauranger och caféer som vill profilera sig med svenska råvaror',
    'pensionärer som minns smaken från barndomens lantliga ägg',
    'småbarnsfamiljer som söker tryggare uppfödning än industriägg',
  ],
  Svealand: [
    'sommargäster och fritidshusägare som handlar lokalt på helgen',
    'matintresserade familjer från närliggande villaområden',
    'restauranger och bagerier som vill ha en lokal leverantör',
    'pensionärer som föredrar att handla direkt från gården',
  ],
  Norrland: [
    'sommargäster som vill ha närproducerat under semestern',
    'lokala matbutiker och gårdsbutiker i området',
    'familjer som värdesätter spårbarhet i råvaror',
    'pendlare som passar på att handla på vägen hem',
  ],
};

const VARDAG_SCEN = [
  'klockan halv sex på morgonen när du redan är ute med foderhinken',
  'mitt under en söndagslunch när telefonen vibrerar fem gånger på en kvart',
  'när du står i ladugården och plötsligt får tre sms samtidigt om “har du ägg kvar?”',
  'sent på en torsdagskväll efter att kvällsmaten är klar',
];

const SALJSTALLE = [
  'lokala Facebookgrupperna',
  'köp-och-sälj-grupper på Facebook',
  'anslagstavlan på ICA, Coop eller bygdegården',
  'små QR-skyltar längs vägen ut till tomten',
  'lokala matmarknader och torgdagar',
];

const TIPS_PRIS = [
  'Sätt ett pris som ligger på eller strax under priset för ekologiska ägg i din lokala matbutik – då känns ditt pris tryggt och förståeligt.',
  'Räkna med foderkostnad, strö och tid när du sätter pris. En bra tumregel är att foder utgör ungefär 60–70 % av kostnaden per ägg.',
  'Erbjud lägre pris vid avhämtning av flera kartor – t.ex. 50 kr för en, 90 kr för två och 130 kr för tre – det driver upp snittordervärdet.',
  'Om du har frigående höns och utehage – tveka inte att ta lite mer betalt. Köpare betalar gärna extra för bättre djurvälfärd.',
];

const TIPS_LEVERANS = [
  'Ange tydligt på säljsidan när hämtning sker. Två fasta hämtdagar i veckan är enklare för dig än “när det passar”.',
  'Lägg ut en sval låda eller kylbox vid grinden så köpare kan hämta även när du inte är hemma – många löser det med Swish-bekräftelse på säljsidan.',
  'Om du levererar lokalt, sätt en minimibeställning (t.ex. 3 kartor) för att det ska gå runt rent tidsmässigt.',
  'Skriv tydliga instruktioner med adress, hämtdagar och eventuell GPS-pinne så slipper du svara på samma fråga gång på gång.',
];

const TIPS_HYGIEN = [
  'Tvätta inte äggen direkt efter värpning – det förstör äggens naturliga skyddshinna. Borsta bara av eventuell smuts strax innan försäljning.',
  'Förvara äggen svalt (under 12 °C) men inte i kylen om de ska säljas inom en vecka. Då håller de både smak och hållbarhet bäst.',
  'Märk varje karta med värpdatum eller åtminstone vecka. Det skapar förtroende och påminner köparen om att äggen är färska.',
  'Återanvänd kartonger så länge de är hela och rena – det är både bra för miljön och uppskattat av återkommande kunder.',
];

const KOPARFRÅGOR = [
  'Är hönsen frigående hela året?',
  'Har de tillgång till utevistelse?',
  'Vilket foder får de?',
  'Hur länge håller äggen?',
  'Kan jag prenumerera på en karta i veckan?',
  'Säljer ni även köttkycklingar eller ankor?',
];

export type OrtSeoContent = {
  intro: string;
  marknadAvsnitt: string;
  saResonerarKöpare: string;
  prisIOrt: string;
  saSäljerDuMer: string;
  vardagsexempel: string;
  prisTips: string[];
  leveransTips: string[];
  hygienTips: string[];
  vanligaFragor: string[];
  klimatNot: string;
  longTailKeywords: string[];
};

export function buildOrtContent(ort: Ort): OrtSeoContent {
  const klimat = REGION_KLIMAT[ort.region];
  const kopartyper = REGION_KOPARTYP[ort.region];
  const koparBeskr = pickN(ort.slug, 'kopare', kopartyper, 3).join(', ');
  const scen = pick(ort.slug, 'scen', VARDAG_SCEN);
  const saljstalle = pickN(ort.slug, 'saljstalle', SALJSTALLE, 3).join(', ');
  const stadsstorlek = ort.invanare
    ? `Med cirka ${ort.invanare} invånare`
    : `I ${ort.name}`;

  const intro = `${stadsstorlek} finns det en växande efterfrågan på lokalt producerade ägg från frigående höns. Allt fler i ${ort.name} och resten av ${ort.lan} vill veta exakt var maten kommer ifrån, hur djuren mår och hur långt äggen har transporterats innan de hamnar på frukostbordet. Den här guiden samlar allt du behöver veta för att börja sälja ägg lokalt i ${ort.name} – från prissättning och bokningssystem till hygienregler, kundkommunikation och hur du marknadsför dig utan att betala dyra avgifter till mellanhänder.`;

  const marknadAvsnitt = `Marknaden för lokalt producerade ägg i ${ort.name} ser annorlunda ut idag jämfört med för bara fem år sedan. Människor som tidigare köpte sina ägg på rutin i den stora matbutiken söker nu aktivt efter alternativ. De googlar uttryckligen på “sälja ägg ${ort.name.toLowerCase()}”, “färska ägg ${ort.name.toLowerCase()}” eller “lokala ägg ${ort.lan.toLowerCase()}”. Just därför är det så värdefullt att ha en egen säljsida som rankar på dessa sökord – istället för att hoppas att någon ska se ditt inlägg i en Facebookgrupp innan det försvinner i flödet efter några timmar.`;

  const saResonerarKöpare = `De som handlar ägg direkt från hönsägare i ${ort.name} är ofta ${koparBeskr}. De är beredda att betala lite mer per karta om de får en tydlig historia om var äggen kommer ifrån, hur hönsen lever och om de har en chans att hämta nära hemmet. En egen säljsida på Hönsgården ger dig möjligheten att berätta hela den historien – med foton från hönshuset, en kort beskrivning av rasen och en karta som visar exakt var hämtning sker.`;

  const prisIOrt = `Prisbilden för ägg i ${ort.name} följer i stort sett samma mönster som i resten av ${ort.region}: en karta med sex frigående ägg ligger oftast mellan 35 och 55 kronor, medan ekologiska ägg i butik kan kosta upp emot 60–70 kronor för en sexpack. Direkt från gården ligger du oftast bra till runt 40–55 kronor per karta beroende på säsong, efterfrågan och hur mycket du producerar. Under vintern, när värpningen sjunker naturligt, är det helt rimligt att höja priset något eftersom efterfrågan ofta är högre än tillgången.`;

  const saSäljerDuMer = `För att sälja mer i ${ort.name} räcker det inte med att bara ha bra ägg – köparna måste också hitta dig. De flesta lokala hönsägare lyckas bäst genom att kombinera tre kanaler: ${saljstalle}. Med Hönsgården skapar du en kort, snygg länk som du kan klistra in överallt. Köparen klickar, väljer hämtdag och antal kartor, och betalar via Swish när de hämtar. Du slipper bollandet med sms och du har alltid en aktuell lagerstatus så du inte lovar bort fler ägg än du har.`;

  const vardagsexempel = `Föreställ dig ${scen}. Istället för att svara på “har du ägg kvar?” en i taget kan du peka på din säljsida. Köparen ser direkt om det finns kartor kvar denna vecka, vilken dag det går att hämta och vad det kostar. Du får en notis när bokningen är gjord och pengarna ligger på Swish när de hämtar. På så sätt frigörs både din tid och köparens tid – något som är extra värdefullt för dig som driver hönseriet vid sidan av jobb eller familj.`;

  const klimatNot = `Eftersom ${ort.name} ligger i ${ort.region} har du ${klimat}. Det påverkar både hur du planerar säsongen och hur du kommunicerar med kunder – t.ex. genom att informera om eventuella vinterstopp eller minskad värpning under de mörkaste månaderna direkt på säljsidan, så slipper besvikna köpare.`;

  return {
    intro,
    marknadAvsnitt,
    saResonerarKöpare,
    prisIOrt,
    saSäljerDuMer,
    vardagsexempel,
    klimatNot,
    prisTips: pickN(ort.slug, 'pris', TIPS_PRIS, 3),
    leveransTips: pickN(ort.slug, 'lev', TIPS_LEVERANS, 3),
    hygienTips: pickN(ort.slug, 'hyg', TIPS_HYGIEN, 3),
    vanligaFragor: pickN(ort.slug, 'fragor', KOPARFRÅGOR, 4),
    longTailKeywords: [
      `sälja ägg ${ort.name.toLowerCase()}`,
      `färska ägg ${ort.name.toLowerCase()}`,
      `gårdsägg ${ort.name.toLowerCase()}`,
      `frigående hönsägg ${ort.lan.toLowerCase()}`,
      `äggförsäljning Swish ${ort.name.toLowerCase()}`,
    ],
  };
}
