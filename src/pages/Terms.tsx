import React from 'react';
import { useSeo } from '@/hooks/useSeo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  useSeo({
    title: 'Användarvillkor & Integritetspolicy | Hönsgården',
    description: 'Läs Hönsgårdens användarvillkor och integritetspolicy. Information om dataskydd, cookies och dina rättigheter enligt GDPR.',
    path: '/terms',
    noindex: true,
    jsonLd: [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://honsgarden.se' },
          { '@type': 'ListItem', position: 2, name: 'Användarvillkor & Integritetspolicy', item: 'https://honsgarden.se/terms' },
        ],
      },
    ],
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5 rounded-xl" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Tillbaka
      </Button>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6 sm:p-8 prose prose-sm max-w-none">
          {/* ========== DEL 1: ANVÄNDARVILLKOR ========== */}
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-1">Användarvillkor</h1>
          <p className="text-xs text-muted-foreground mb-6">honsgarden.se | Senast uppdaterad: 2026-04-09</p>

          <h2 className="font-serif text-lg text-foreground mt-6 mb-2">1. Allmänt</h2>
          <p className="text-sm text-foreground leading-relaxed">
            Dessa användarvillkor ("villkoren") gäller när du skapar ett konto och använder webbplatsen och tjänsten honsgarden.se ("vi", "oss", "tjänsten"). Tjänsten drivs av Hönsgården.
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            Genom att registrera ett konto bekräftar du att du har läst, förstått och godkänt dessa villkor samt vår integritetspolicy nedan.
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            Du måste vara minst 16 år gammal för att använda tjänsten. Om du är under 18 år krävs vårdnadshavares godkännande.
          </p>

          <h2 className="font-serif text-lg text-foreground mt-6 mb-2">2. Tjänstens omfattning</h2>
          <p className="text-sm text-foreground leading-relaxed">
            Hönsgården är en digital tjänst för att registrera äggproduktion, hantera höns och flockar, följa ekonomi samt ta del av tips och guider kopplade till hönsuppfödning. Tjänsten erbjuds i en gratisversion samt en premiumversion med utökade funktioner.
          </p>

          <h2 className="font-serif text-lg text-foreground mt-6 mb-2">3. Ditt konto</h2>
          <p className="text-sm text-foreground leading-relaxed">
            Du ansvarar för att hålla dina inloggningsuppgifter hemliga och för all aktivitet som sker under ditt konto. Om du misstänker obehörig åtkomst ska du omedelbart byta lösenord och kontakta oss.
          </p>

          <h2 className="font-serif text-lg text-foreground mt-6 mb-2">4. Användarinnehåll</h2>
          <p className="text-sm text-foreground leading-relaxed">
            Du behåller äganderätten till allt innehåll du lägger in i tjänsten (data om höns, ägg, ekonomi m.m.). Genom att använda tjänsten ger du oss en begränsad rätt att lagra och bearbeta ditt innehåll i syfte att tillhandahålla tjänsten.
          </p>

          <h2 className="font-serif text-lg text-foreground mt-6 mb-2">5. Ansvarsbegränsning</h2>
          <p className="text-sm text-foreground leading-relaxed">
            Tjänsten tillhandahålls "i befintligt skick" utan garantier av något slag. Vi garanterar inte oavbruten eller felfri drift och ansvarar inte för indirekt skada, utebliven vinst eller dataförlust utöver vad som följer av tvingande svensk lag.
          </p>

          <h2 className="font-serif text-lg text-foreground mt-6 mb-2">6. Ändringar av villkoren</h2>
          <p className="text-sm text-foreground leading-relaxed">
            Vi förbehåller oss rätten att ändra dessa villkor. Vid väsentliga förändringar meddelas du via e-post eller i tjänsten minst 30 dagar före ändringen träder i kraft. Fortsatt användning efter ändring innebär godkännande av de nya villkoren.
          </p>

          <h2 className="font-serif text-lg text-foreground mt-6 mb-2">7. Tillämplig lag & Tvistelösning</h2>
          <p className="text-sm text-foreground leading-relaxed">
            Dessa villkor regleras av svensk lag. Tvister ska i första hand lösas genom dialog. Om vi inte kan enas kan tvisten prövas av Allmänna reklamationsnämnden (ARN) för konsumenter, eller av allmän domstol i Sverige.
          </p>

          {/* ========== DEL 2: INTEGRITETSPOLICY ========== */}
          <div className="border-t border-border/50 mt-10 pt-8">
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-1">Integritetspolicy</h1>
            <p className="text-xs text-muted-foreground mb-6">I enlighet med EU:s dataskyddsförordning (GDPR) och den svenska dataskyddslagen (2018:218)</p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">1. Personuppgiftsansvarig</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Personuppgiftsansvarig för behandlingen av dina personuppgifter är:
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Hönsgården / honsgarden.se<br />
              E-post: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a><br />
              Webbplats: <a href="https://www.honsgarden.se" className="text-primary hover:underline">www.honsgarden.se</a>
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">2. Vilka personuppgifter vi samlar in</h2>
            <p className="text-sm text-foreground leading-relaxed">Vi samlar in följande kategorier av personuppgifter:</p>
            <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
              <li><strong>Kontouppgifter:</strong> Namn (visningsnamn) och e-postadress vid registrering</li>
              <li><strong>Användarskapat innehåll:</strong> Data du själv lägger in i tjänsten, t.ex. hönsdata, äggregistreringar, hälsologgar, ekonomiska transaktioner och anteckningar</li>
              <li><strong>Tekniska data:</strong> IP-adress, enhetstyp, webbläsare, operativsystem och sessionsinformation</li>
              <li><strong>Användningsdata:</strong> Sidvisningar, klickhändelser och navigeringsmönster (anonymiserat)</li>
              <li><strong>Betalningsuppgifter:</strong> Hanteras av Stripe – vi lagrar aldrig kortuppgifter</li>
            </ul>
            <p className="text-sm text-foreground leading-relaxed mt-2">
              Vi samlar inte in känsliga personuppgifter (t.ex. hälsodata, religiös övertygelse eller politisk tillhörighet).
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">3. Rättslig grund för behandlingen</h2>
            <p className="text-sm text-foreground leading-relaxed">Vi behandlar dina personuppgifter med stöd av följande rättsliga grunder (artikel 6 GDPR):</p>
            <ul className="text-sm text-foreground space-y-2 list-disc pl-5">
              <li><strong>Fullgörande av avtal (art. 6.1 b)</strong> – Behandling som är nödvändig för att tillhandahålla tjänsten du registrerat dig för, t.ex. lagring av dina äggregistreringar, hantering av ditt konto och betalning.</li>
              <li><strong>Samtycke (art. 6.1 a)</strong> – För utskick av nyhetsbrev och marknadsföring samt cookies för analys. Du kan när som helst återkalla ditt samtycke.</li>
              <li><strong>Berättigat intresse (art. 6.1 f)</strong> – För säkerhet, felsökning, missbruksskydd och förbättring av tjänsten. Vi har gjort en intresseavvägning och bedömt att vårt intresse inte väger tyngre än dina rättigheter.</li>
              <li><strong>Rättslig förpliktelse (art. 6.1 c)</strong> – När vi är skyldiga att spara uppgifter enligt lag, t.ex. bokföringslagen.</li>
            </ul>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">4. Hur vi använder dina uppgifter</h2>
            <p className="text-sm text-foreground leading-relaxed">Vi använder dina personuppgifter för att:</p>
            <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
              <li>Tillhandahålla, underhålla och förbättra tjänsten</li>
              <li>Skapa och hantera ditt konto</li>
              <li>Skicka tjänstrelaterade meddelanden (t.ex. lösenordsåterställning, veckorapporter)</li>
              <li>Skicka nyhetsbrev och erbjudanden (med ditt samtycke)</li>
              <li>Hantera betalningar och prenumerationer via Stripe</li>
              <li>Upptäcka och förhindra missbruk och säkerhetshot</li>
              <li>Analysera användningsmönster för att förbättra tjänsten (anonymiserat)</li>
            </ul>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">5. Delning med tredje part & underbiträden</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Vi säljer aldrig dina personuppgifter. Vi delar uppgifter med följande tjänsteleverantörer (underbiträden) som behövs för att driva tjänsten:
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="text-sm text-foreground w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 pr-4 font-semibold">Leverantör</th>
                    <th className="text-left py-2 pr-4 font-semibold">Syfte</th>
                    <th className="text-left py-2 font-semibold">Plats</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/30">
                    <td className="py-2 pr-4">Lovable Cloud (Supabase)</td>
                    <td className="py-2 pr-4">Databas, autentisering, backend-funktioner</td>
                    <td className="py-2">EU/EES</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="py-2 pr-4">Stripe</td>
                    <td className="py-2 pr-4">Betalningshantering</td>
                    <td className="py-2">USA (EU SCC)</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="py-2 pr-4">Brevo (Sendinblue)</td>
                    <td className="py-2 pr-4">E-postutskick, nyhetsbrev</td>
                    <td className="py-2">EU (Frankrike)</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="py-2 pr-4">Google (Gemini AI)</td>
                    <td className="py-2 pr-4">AI-funktioner (tips, chatt)</td>
                    <td className="py-2">USA (EU SCC)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-foreground leading-relaxed mt-2">
              Vid överföring av personuppgifter utanför EU/EES säkerställer vi att adekvat skyddsnivå upprätthålls genom EU:s standardavtalsklausuler (Standard Contractual Clauses, SCC) i enlighet med artikel 46.2 c GDPR.
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">6. Cookies och liknande tekniker</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Vi använder cookies i enlighet med lagen om elektronisk kommunikation (LEK, 2022:482).
            </p>

            <h3 className="font-serif text-base text-foreground mt-4 mb-1">Nödvändiga cookies (kräver ej samtycke):</h3>
            <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
              <li><strong>Autentisering</strong> – Sessionshantering för inloggade användare</li>
              <li><strong>Cookie-val</strong> – Sparar ditt val av cookieinställningar (<code>cookie-consent</code> i localStorage)</li>
            </ul>

            <h3 className="font-serif text-base text-foreground mt-4 mb-1">Valfria cookies (kräver samtycke):</h3>
            <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
              <li><strong>Analys</strong> – Anonymiserad sidvisningsstatistik för att förbättra tjänsten</li>
            </ul>
            <p className="text-sm text-foreground leading-relaxed mt-2">
              Du kan ändra dina cookieinställningar när som helst via cookie-bannern eller i din webbläsare. Att blockera nödvändiga cookies kan påverka tjänstens funktion.
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">7. Lagringstid</h2>
            <p className="text-sm text-foreground leading-relaxed">Vi lagrar dina personuppgifter enligt följande principer:</p>
            <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
              <li><strong>Kontodata och användarinnehåll:</strong> Så länge ditt konto är aktivt</li>
              <li><strong>Vid kontoavslut:</strong> Personuppgifter raderas inom 30 dagar</li>
              <li><strong>Ekonomiska transaktioner:</strong> Sparas i 7 år enligt bokföringslagen (1999:1078)</li>
              <li><strong>E-postloggar:</strong> Sparas i 90 dagar för felsökning</li>
              <li><strong>Anonymiserad statistik:</strong> Sparas utan tidsgräns (är inte personuppgifter)</li>
            </ul>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">8. Dina rättigheter</h2>
            <p className="text-sm text-foreground leading-relaxed">Enligt GDPR har du följande rättigheter:</p>
            <ul className="text-sm text-foreground space-y-2 list-disc pl-5">
              <li><strong>Rätt till tillgång (art. 15)</strong> – Du kan begära information om vilka personuppgifter vi behandlar om dig.</li>
              <li><strong>Rätt till rättelse (art. 16)</strong> – Du kan begära att felaktiga uppgifter korrigeras.</li>
              <li><strong>Rätt till radering (art. 17)</strong> – Du kan radera ditt konto och all tillhörande data via <em>Inställningar → Radera konto</em> i appen.</li>
              <li><strong>Rätt till begränsning (art. 18)</strong> – Du kan begära att behandlingen av dina uppgifter begränsas.</li>
              <li><strong>Rätt till dataportabilitet (art. 20)</strong> – Du kan exportera dina uppgifter som CSV-fil via <em>Inställningar → Exportera data</em>.</li>
              <li><strong>Rätt att invända (art. 21)</strong> – Du har rätt att invända mot behandling baserad på berättigat intresse.</li>
              <li><strong>Rätt att återkalla samtycke</strong> – Du kan när som helst återkalla samtycke för nyhetsbrev via avprenumerationslänken eller via inställningar i appen.</li>
            </ul>
            <p className="text-sm text-foreground leading-relaxed mt-2">
              Radering och export kan du göra direkt i appen. För övriga förfrågningar, kontakta oss på <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>. Vi besvarar din begäran inom 30 dagar.
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">9. Automatiserat beslutsfattande</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Vi använder inte automatiserat beslutsfattande eller profilering som har rättslig verkan eller på liknande sätt väsentligt påverkar dig (artikel 22 GDPR). AI-funktioner i appen (t.ex. dagliga tips) ger generella rekommendationer och fattar inga beslut som rör dig personligen.
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">10. Säkerhetsåtgärder</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Vi vidtar lämpliga tekniska och organisatoriska åtgärder för att skydda dina personuppgifter enligt artikel 32 GDPR, bland annat:
            </p>
            <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
              <li>Krypterad dataöverföring (HTTPS/TLS)</li>
              <li>Dataseparering genom Row Level Security (RLS) på databasnivå</li>
              <li>Hashade lösenord – vi lagrar aldrig lösenord i klartext</li>
              <li>Rate limiting för att förhindra missbruk</li>
              <li>Regelbunden säkerhetsgranskning av koden</li>
            </ul>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">11. Personuppgiftsincidenter</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Om en personuppgiftsincident inträffar som kan innebära risk för dina rättigheter och friheter, anmäler vi detta till Integritetsskyddsmyndigheten (IMY) inom 72 timmar i enlighet med artikel 33 GDPR. Om incidenten sannolikt medför hög risk för dig informeras du utan onödigt dröjsmål (artikel 34 GDPR).
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">12. E-postkommunikation</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Vi skiljer på tjänstemeddelanden och marknadsföring:
            </p>
            <h3 className="font-serif text-base text-foreground mt-4 mb-1">Tjänstemeddelanden (utan separat samtycke):</h3>
            <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
              <li>Kontobekräftelse och lösenordsåterställning</li>
              <li>Veckorapporter om din äggproduktion</li>
              <li>Påminnelser om prenumerationer och betalningar</li>
            </ul>
            <h3 className="font-serif text-base text-foreground mt-4 mb-1">Marknadsföring (med samtycke):</h3>
            <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
              <li>Nyhetsbrev med tips och nyheter om hönsuppfödning</li>
              <li>Erbjudanden och kampanjer</li>
              <li>Information om nya funktioner</li>
            </ul>
            <p className="text-sm text-foreground leading-relaxed mt-2">
              Du kan avprenumerera från marknadsföring via länken i varje utskick eller via inställningar i appen. Samtycke till marknadsföring påverkar inte tjänstemeddelanden.
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">13. Barns personuppgifter</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Tjänsten riktar sig inte till barn under 16 år. Vi samlar inte medvetet in personuppgifter från barn under 16 år. Om vi upptäcker att en person under 16 år har registrerat sig utan vårdnadshavares samtycke raderar vi uppgifterna.
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">14. Tillsynsmyndighet</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Om du anser att vår behandling av dina personuppgifter bryter mot GDPR har du rätt att lämna klagomål till:
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Integritetsskyddsmyndigheten (IMY)</strong><br />
              Box 8114, 104 20 Stockholm<br />
              <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.imy.se</a><br />
              E-post: <a href="mailto:imy@imy.se" className="text-primary hover:underline">imy@imy.se</a><br />
              Telefon: 08-657 61 00
            </p>

            <h2 className="font-serif text-lg text-foreground mt-6 mb-2">15. Kontakt</h2>
            <p className="text-sm text-foreground leading-relaxed">
              Frågor om denna policy eller dina personuppgifter? Kontakta oss:
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Hönsgården / honsgarden.se<br />
              E-post: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a><br />
              Webbplats: <a href="https://www.honsgarden.se" className="text-primary hover:underline">www.honsgarden.se</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
