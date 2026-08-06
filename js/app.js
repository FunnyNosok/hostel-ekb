/**
 * Сборка страницы из данных (js/data.js).
 * Разметки хостелов в index.html нет — всё строится здесь.
 */

/* ---------- помощники ---------- */

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function rub(value) {
  return value.toLocaleString('ru-RU');
}

/** Крупная цена: «6 500 ₽ / месяц» либо «Цена по запросу». */
function priceHtml(price) {
  if (price.ask) return 'Цена по запросу';
  return `${rub(price.value)} ₽ <small>/ ${price.unit}</small>`;
}

/** Пояснение под ценой: за что платят и сколько это в сутки. */
function priceNote(price) {
  if (price.ask) return 'Скажем по телефону — зависит от срока и комнаты';
  const parts = [];
  if (price.per) parts.push(price.per);
  if (price.perDay) parts.push(`≈ ${rub(Math.round(price.value / 30))} ₽ в сутки`);
  return parts.join(' · ');
}

/** Короткая цена для линии адресов. */
function priceShort(price) {
  if (price.ask) return 'цена по запросу';
  return `${rub(price.value)} ₽ / ${price.unit === 'месяц' ? 'мес' : 'сутки'}`;
}

function img(src, alt) {
  const node = el('img');
  node.src = src;
  node.alt = alt;
  node.loading = 'lazy';
  return node;
}

/* ---------- первый экран ---------- */

function renderHero() {
  const figure = document.querySelector('[data-hero-shot]');
  if (!figure) return;

  const shot = img(HERO_SHOT.src, 'Комната в хостеле на ' + HERO_SHOT.street);
  shot.loading = 'eager';

  const caption = el('figcaption', 'hero-caption');
  caption.innerHTML = `<b>${HERO_SHOT.street}</b> · ${HERO_SHOT.note}`;

  figure.append(shot, caption);
}

/* ---------- полоса фактов ---------- */

function renderFacts() {
  const box = document.getElementById('facts');
  FACTS.forEach((f) => {
    const item = el('div', 'fact');
    item.append(el('div', 'val', f.val), el('div', 'key', f.key));
    box.append(item);
  });
}

/* ---------- линия трёх адресов ---------- */

function renderRoute() {
  const box = document.getElementById('route');
  HOSTELS.forEach((h) => {
    const stop = el('a', 'route-stop');
    stop.href = '#' + h.id;
    stop.append(
      el('div', 'street', h.street),
      el('div', 'meta', priceShort(h.price)),
    );
    box.append(stop);
  });
}

/* ---------- карточки ---------- */

function renderCard(hostel) {
  const card = el('button', 'card reveal');
  card.type = 'button';

  const shot = el('div', 'card-shot');
  shot.append(
    img(hostel.photos[0], hostel.name),
    el('span', 'card-count', `${hostel.photos.length} фото`),
  );

  const body = el('div', 'card-body');
  body.append(
    el('div', 'eyebrow', hostel.area),
    el('h3', '', 'ул. ' + hostel.street),
    el('div', 'type', hostel.type),
  );

  const foot = el('div', 'card-foot');
  const priceBox = el('div');
  priceBox.append(
    el('div', 'price', priceHtml(hostel.price)),
    el('div', 'price-note', priceNote(hostel.price)),
  );
  foot.append(priceBox, el('span', 'go', 'Подробнее →'));
  body.append(foot);

  card.append(shot, body);
  card.addEventListener('click', () => {
    document.getElementById(hostel.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  return card;
}

/* ---------- подробный блок ---------- */

function renderGallery(hostel) {
  const gallery = el('div', 'gallery');

  const main = el('button', 'gallery-main');
  main.type = 'button';
  main.setAttribute('aria-label', 'Открыть фотографии: ' + hostel.name);
  main.append(img(hostel.photos[0], hostel.name), el('span', 'zoom', 'Смотреть фото'));
  main.addEventListener('click', () => openLightbox(hostel, 0));
  gallery.append(main);

  const rest = hostel.photos.slice(1, 5);
  if (rest.length) {
    const thumbs = el('div', 'gallery-thumbs');
    rest.forEach((src, i) => {
      const index = i + 1;
      const btn = el('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Фото ${index + 1} из ${hostel.photos.length}`);
      btn.append(img(src, hostel.name));

      // на последней миниатюре показываем, сколько фото осталось
      const hidden = hostel.photos.length - 5;
      if (hidden > 0 && index === 4) btn.append(el('span', 'thumb-more', `+${hidden}`));

      btn.addEventListener('click', () => openLightbox(hostel, index));
      thumbs.append(btn);
    });
    gallery.append(thumbs);
  }

  return gallery;
}

function renderHostel(hostel) {
  const section = el('article', 'hostel reveal');
  section.id = hostel.id;

  const head = el('div', 'hostel-head');
  const title = el('div');
  title.append(
    el('div', 'eyebrow', hostel.area),
    el('h3', '', hostel.name),
    el('div', 'addr', hostel.address + ' · ' + SITE.city),
  );
  head.append(title);

  const grid = el('div', 'hostel-grid');
  const info = el('div', 'hostel-info');

  info.append(el('p', '', hostel.description));

  const specs = el('dl', 'specs');
  hostel.specs.forEach((s) => {
    const row = el('div');
    row.append(el('dt', '', s.dt), el('dd', '', s.dd));
    specs.append(row);
  });
  info.append(specs);

  const tags = el('div', 'tags');
  hostel.features.forEach((f) => tags.append(el('span', '', f)));
  info.append(tags);

  const book = el('div', 'book');
  const bookText = el('div');
  bookText.append(
    el('div', 'price', priceHtml(hostel.price)),
    el('div', 'eyebrow', priceNote(hostel.price) || 'Свободные места уточняйте по телефону'),
  );
  const bookBtn = el('a', 'btn', 'Позвонить');
  bookBtn.href = 'tel:' + SITE.phone;
  book.append(bookText, bookBtn);
  info.append(book);

  grid.append(renderGallery(hostel), info);
  section.append(head, grid);
  return section;
}

/* ---------- шаги, условия, подвал ---------- */

function renderSteps() {
  const box = document.getElementById('steps');
  STEPS.forEach((s, i) => {
    const step = el('div', 'step reveal');
    step.append(
      el('div', 'num', `Шаг ${i + 1}`),
      el('h3', '', s.title),
      el('p', '', s.text),
    );
    box.append(step);
  });
}

function renderRules() {
  const box = document.getElementById('rules');
  RULES.forEach((r) => {
    const row = el('div');
    row.append(el('dt', '', r.dt), el('dd', '', r.dd));
    box.append(row);
  });
}

function renderFooterAddresses() {
  const box = document.getElementById('footer-addr');
  HOSTELS.forEach((h) => {
    const link = el('a', '', `${h.address} — ${h.type.toLowerCase()}`);
    link.href = '#' + h.id;
    box.append(link);
  });
}

function applyContacts() {
  document.querySelectorAll('[data-phone]').forEach((node) => {
    node.href = 'tel:' + SITE.phone;
    if (node.dataset.phone === 'display') {
      node.textContent = (node.dataset.prefix || '') + SITE.phoneDisplay;
    }
  });
  document.querySelectorAll('[data-work-hours]').forEach((n) => { n.textContent = SITE.workHours; });
  document.querySelectorAll('[data-district]').forEach((n) => { n.textContent = SITE.city; });
  document.querySelectorAll('[data-district-line]').forEach((n) => {
    n.textContent = `${SITE.city} · ${SITE.district}`;
  });
  document.querySelectorAll('[data-city-line]').forEach((n) => {
    n.textContent = `${SITE.city}, ${SITE.district}`;
  });
}

/* ---------- просмотр фотографий ---------- */

const lb = {
  root: null, image: null, counter: null,
  photos: [], index: 0, alt: '',
};

function openLightbox(hostel, index) {
  lb.photos = hostel.photos;
  lb.alt = hostel.name;
  lb.index = index;
  lb.root.classList.add('open');
  document.body.style.overflow = 'hidden';
  showPhoto();
}

function closeLightbox() {
  lb.root.classList.remove('open');
  document.body.style.overflow = '';
}

function showPhoto() {
  lb.image.src = lb.photos[lb.index];
  lb.image.alt = lb.alt;
  lb.counter.textContent = `${lb.index + 1} / ${lb.photos.length}`;
}

function stepPhoto(dir) {
  lb.index = (lb.index + dir + lb.photos.length) % lb.photos.length;
  showPhoto();
}

function initLightbox() {
  lb.root = document.getElementById('lightbox');
  lb.image = document.getElementById('lb-img');
  lb.counter = document.getElementById('lb-counter');

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', () => stepPhoto(-1));
  document.getElementById('lb-next').addEventListener('click', () => stepPhoto(1));

  // клик по фону закрывает
  lb.root.addEventListener('click', (e) => {
    if (e.target === lb.root) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.root.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepPhoto(-1);
    if (e.key === 'ArrowRight') stepPhoto(1);
  });

  // перелистывание свайпом
  let startX = null;
  lb.root.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lb.root.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) stepPhoto(dx < 0 ? 1 : -1);
    startX = null;
  });
}

/* ---------- появление при прокрутке ---------- */

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((n) => n.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((n) => io.observe(n));
}

/* ---------- сборка ---------- */

function renderPage() {
  renderHero();
  renderFacts();
  renderRoute();

  const cards = document.getElementById('cards');
  const list = document.getElementById('hostel-list');
  HOSTELS.forEach((hostel) => {
    cards.append(renderCard(hostel));
    list.append(renderHostel(hostel));
  });

  renderSteps();
  renderRules();
  renderFooterAddresses();
  applyContacts();
  initLightbox();
  initReveal();
}

document.addEventListener('DOMContentLoaded', renderPage);
