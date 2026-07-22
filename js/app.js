/**
 * Рендеринг страницы из данных (js/data.js).
 * Никакой разметки хостелов в index.html нет — всё строится здесь.
 */

/* ---------- helpers ---------- */

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function phoneLink(text, className) {
  const a = el('a', className || 'phone-btn');
  a.href = 'tel:' + SITE.phone;
  a.textContent = text;
  return a;
}

function formatPrice(price) {
  return `от ${price} ₽ <small>/ сутки</small>`;
}

/* ---------- карточка в горизонтальной ленте ---------- */

function renderCard(hostel) {
  const card = el('article', 'card');

  const img = el('img');
  img.src = hostel.photos[0];
  img.alt = hostel.name;
  img.loading = 'lazy';

  const body = el('div', 'card-body');
  body.append(
    el('h3', '', hostel.name),
    el('div', 'addr', hostel.address),
    el('div', 'price', formatPrice(hostel.price)),
  );

  card.append(img, body);
  card.addEventListener('click', () => {
    document.getElementById(hostel.id)?.scrollIntoView({ behavior: 'smooth' });
  });
  return card;
}

/* ---------- развёрнутый блок в колонке ---------- */

function renderFull(hostel) {
  const section = el('article', 'hostel-full');
  section.id = hostel.id;

  // галерея: главное фото + два маленьких
  const gallery = el('div', 'gallery');
  const main = el('img');
  main.src = hostel.photos[0];
  main.alt = hostel.name;
  main.loading = 'lazy';

  const side = el('div', 'side');
  hostel.photos.slice(1, 3).forEach((src) => {
    const img = el('img');
    img.src = src;
    img.alt = hostel.name;
    img.loading = 'lazy';
    side.append(img);
  });
  gallery.append(main, side);

  // описание
  const body = el('div', 'full-body');
  body.append(
    el('h3', '', hostel.name),
    el('div', 'addr', '📍 ' + hostel.address),
    el('p', '', hostel.description),
  );

  const features = el('div', 'features');
  hostel.features.forEach((f) => features.append(el('span', '', f)));
  body.append(features);

  const footer = el('div', 'full-footer');
  footer.append(el('div', 'price', formatPrice(hostel.price)));
  footer.append(phoneLink('Забронировать по телефону'));
  body.append(footer);

  section.append(gallery, body);
  return section;
}

/* ---------- сборка страницы ---------- */

function renderPage() {
  const carousel = document.getElementById('carousel');
  const list = document.getElementById('hostel-list');

  HOSTELS.forEach((hostel) => {
    carousel.append(renderCard(hostel));
    list.append(renderFull(hostel));
  });

  // телефон во всех местах с data-phone
  document.querySelectorAll('[data-phone]').forEach((node) => {
    node.href = 'tel:' + SITE.phone;
    if (node.dataset.phone === 'display') {
      node.textContent = (node.classList.contains('phone-btn') ? '📞 ' : '') + SITE.phoneDisplay;
    }
  });
  document.querySelectorAll('[data-work-hours]').forEach((node) => {
    node.textContent = SITE.workHours;
  });
}

/* ---------- управление лентой ---------- */

function scrollCarousel(dir) {
  document.getElementById('carousel')
    .scrollBy({ left: dir * 320, behavior: 'smooth' });
}

function scrollToAll() {
  document.getElementById('all').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', renderPage);
