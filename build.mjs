// Pixelpelula landing — static build, no dependencies.
// Reads i18n/*.json, writes dist/{pt,en,es}/index.html + dist/index.html + assets.
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const BASE_URL = 'https://pixelpelula.com';
const LANGS = ['pt', 'en', 'es'];

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONOGRAM = (cls) => `
<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <rect x="16" y="4" width="16" height="16" rx="2" fill="currentColor"/>
  <rect x="16" y="24" width="16" height="16" rx="2" fill="currentColor"/>
  <rect x="16" y="44" width="16" height="16" rx="2" fill="currentColor"/>
  <path d="M38 4 H44 A8 8 0 0 1 52 12 V18 A2 2 0 0 1 50 20 H38 A2 2 0 0 1 36 18 V6 A2 2 0 0 1 38 4 Z" fill="currentColor"/>
  <path d="M38 24 H50 A2 2 0 0 1 52 26 V32 A8 8 0 0 1 44 40 H38 A2 2 0 0 1 36 38 V26 A2 2 0 0 1 38 24 Z" fill="var(--accent)"/>
</svg>`;

const WORDMARK = `<span class="wordmark"><span class="wordmark-pixel">pixel</span><span class="wordmark-pelula">pélula</span></span>`;

const langSwitch = (current) =>
  LANGS.map(
    (l) =>
      `<a href="${BASE_URL}/${l}/" hreflang="${l}" lang="${l}"${l === current ? ' aria-current="page" class="active"' : ''}>${l.toUpperCase()}</a>`
  ).join('');

const spine = `<div class="film-spine" aria-hidden="true">${'<span></span>'.repeat(14)}</div>`;

function page(t) {
  const proofRows = t.proof.cards
    .map(
      (c) => `
      <div class="proof-row">
        <p class="proof-figure${c.after ? '' : ' proof-figure--plain'}"><span class="proof-before">${esc(c.before)}</span>${
          c.after ? ` <span class="proof-arrow" aria-hidden="true">→</span> <span class="proof-after">${esc(c.after)}</span>` : ''
        }</p>
        <p class="proof-text">${esc(c.text)}</p>
      </div>`
    )
    .join('');

  // Números do H1 em mono ("números, não opiniões") — sem alterar o copy.
  const h1 = esc(t.hero.h1).replace(
    /(\d+x|\d+\s+(?:semanas|weeks))/g,
    '<span class="h1-num">$1</span>'
  );

  const offerItems = t.offer.items
    .map(
      (i) => `
        <li class="offer-item">
          <p><span class="offer-lead">${esc(i.lead)}</span> <span class="offer-dash" aria-hidden="true">—</span> ${esc(i.text)}</p>
        </li>`
    )
    .join('');

  const steps = t.how.steps
    .map(
      (s, i) => `
        <li class="step">
          <span class="step-num" aria-hidden="true">0${i + 1}</span>
          <h3 class="step-lead">${esc(s.lead)}</h3>
          <p class="step-text">${esc(s.text)}</p>
        </li>`
    )
    .join('');

  const faq = t.faq
    .map(
      (f) => `
        <details class="faq-item">
          <summary>${esc(f.q)}<span class="faq-marker" aria-hidden="true"></span></summary>
          <p>${esc(f.a)}</p>
        </details>`
    )
    .join('');

  const hreflang =
    LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/" />`).join('\n  ') +
    `\n  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/" />`;

  return `<!DOCTYPE html>
<html lang="${t.lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(t.meta.title)}</title>
  <meta name="description" content="${esc(t.meta.description)}" />
  <link rel="canonical" href="${BASE_URL}/${t.lang}/" />
  ${hreflang}
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(t.meta.title)}" />
  <meta property="og:description" content="${esc(t.meta.description)}" />
  <meta property="og:url" content="${BASE_URL}/${t.lang}/" />
  <meta property="og:locale" content="${t.locale}" />
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  <link rel="preload" href="/assets/fonts/InstrumentSerif-400.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/JetBrainsMono-500.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/style.css" />
</head>
<body>
  ${spine}

  <header class="site-header">
    <a class="brand" href="${BASE_URL}/${t.lang}/">
      ${MONOGRAM('brand-mark')}
      ${WORDMARK}
    </a>
    <nav class="lang-switch" aria-label="Language / Idioma / Língua">
      ${langSwitch(t.lang)}
    </nav>
  </header>

  <main>
    <!-- Hero -->
    <section class="hero">
      <div class="wrap">
        <h1>${h1}</h1>
        <p class="hero-sub">${esc(t.hero.sub)}</p>
        <div class="hero-actions">
          <a class="btn" href="${t.finalCta.calUrl}">${esc(t.hero.cta)}</a>
          <a class="link-quiet" href="#como-funciona">${esc(t.hero.ctaSecondary)}</a>
        </div>
      </div>
    </section>

    <!-- 01 · O problema -->
    <section class="section" id="problema" aria-labelledby="h-problema">
      <div class="wrap">
        <div class="sec-head"><span class="sec-num">01</span></div>
        <h2 id="h-problema">${esc(t.problem.h2)}</h2>
        <p class="prose">${esc(t.problem.text)}</p>
      </div>
    </section>

    <!-- 02 · Prova -->
    <section class="section" id="prova" aria-labelledby="h-prova">
      <div class="wrap">
        <div class="sec-head"><span class="sec-num">02</span></div>
        <h2 id="h-prova">${esc(t.proof.h2)}</h2>
        <div class="proof-list">${proofRows}
        </div>
        <p class="proof-closing">${esc(t.proof.closing)}</p>
      </div>
    </section>

    <!-- 03 · A oferta -->
    <section class="section" id="oferta" aria-labelledby="h-oferta">
      <div class="wrap">
        <div class="sec-head"><span class="sec-num">03</span></div>
        <h2 id="h-oferta">${esc(t.offer.h2)}</h2>
        <div class="spec-frame">
          <p class="offer-intro">${esc(t.offer.intro)}</p>
          <ul class="offer-list">${offerItems}
          </ul>
          <p class="offer-note">${esc(t.offer.notIncluded)}</p>
          <div class="price-block">
            <p class="price">${esc(t.offer.price)}</p>
            <p class="price-note">${esc(t.offer.priceNote)}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 04 · Como funciona -->
    <section class="section" id="como-funciona" aria-labelledby="h-como">
      <div class="wrap">
        <div class="sec-head"><span class="sec-num">04</span></div>
        <h2 id="h-como">${esc(t.how.h2)}</h2>
        <ol class="steps">${steps}
        </ol>
      </div>
    </section>

    <!-- 05 · Sobre -->
    <section class="section" id="sobre" aria-labelledby="h-sobre">
      <div class="wrap">
        <div class="sec-head"><span class="sec-num">05</span></div>
        <h2 id="h-sobre">${esc(t.about.h2)}</h2>
        <p class="prose">${esc(t.about.text)}</p>
      </div>
    </section>

    <!-- 06 · FAQ -->
    <section class="section" id="faq" aria-labelledby="h-faq">
      <div class="wrap">
        <div class="sec-head"><span class="sec-num">06</span></div>
        <h2 id="h-faq" class="visually-hidden">FAQ</h2>
        <div class="faq-list">${faq}
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="final-cta" id="contato" aria-labelledby="h-contato">
      <div class="wrap">
        <h2 id="h-contato">${esc(t.finalCta.h2)}</h2>
        <div class="hero-actions">
          <a class="btn" href="${t.finalCta.calUrl}">${esc(t.finalCta.cta)}</a>
        </div>
        <p class="contact-line">
          <a href="mailto:${t.finalCta.email}">${esc(t.finalCta.email)}</a>
          <span aria-hidden="true"> · </span>
          <a href="${t.finalCta.calUrl}">${esc(t.finalCta.calLabel)}</a>
        </p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="wrap footer-row">
      <span class="footer-brand">${WORDMARK}</span>
      <span class="footer-meta">
        <a href="mailto:${t.footer.email}">${esc(t.footer.email)}</a>
        <span aria-hidden="true"> · </span>${esc(t.footer.year)}
      </span>
    </div>
  </footer>
</body>
</html>
`;
}

const rootPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pixelpelula</title>
  <meta name="description" content="Release Health Check: a 2-week diagnostic that measures where your delivery pipeline bleeds and hands you a 90-day plan. Numbers, not opinions." />
  <meta http-equiv="refresh" content="0; url=/en/" />
  <link rel="canonical" href="${BASE_URL}/en/" />
  ${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/" />`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/" />
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  <style>
    body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #F7F4ED; color: #182024;
           display: grid; place-items: center; min-height: 100vh; margin: 0; }
    p { font-size: 14px; } a { color: #B0490A; margin: 0 8px; }
  </style>
</head>
<body>
  <p>Pixelpelula — <a href="/pt/" hreflang="pt">PT</a>·<a href="/en/" hreflang="en">EN</a>·<a href="/es/" hreflang="es">ES</a></p>
  <script>
    (function () {
      var l = (navigator.language || 'en').slice(0, 2).toLowerCase();
      location.replace('/' + (l === 'pt' || l === 'es' ? l : 'en') + '/');
    })();
  </script>
</body>
</html>
`;

// --- build ---
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true });

for (const lang of LANGS) {
  const t = JSON.parse(readFileSync(join(ROOT, 'i18n', `${lang}.json`), 'utf8'));
  mkdirSync(join(DIST, lang), { recursive: true });
  writeFileSync(join(DIST, lang, 'index.html'), page(t));
  console.log(`✓ dist/${lang}/index.html`);
}
writeFileSync(join(DIST, 'index.html'), rootPage);
console.log('✓ dist/index.html (redirect, fallback EN)');
