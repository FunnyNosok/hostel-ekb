/**
 * Админ-панель: управление хостелами и настройками сайта.
 * Данные хранятся в localStorage, основной сайт читает оттуда.
 */

const STORAGE_KEY_SITE = 'hostel_site';
const STORAGE_KEY_HOSTELS = 'hostels_data';
const STORAGE_KEY_AUTH = 'hostel_admin_auth';
const ADMIN_LOGIN = 'admin';
const ADMIN_PASS = 'hostel2026';

/* ---------- Auth ---------- */

function isLoggedIn() {
  return sessionStorage.getItem(STORAGE_KEY_AUTH) === '1';
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-content').style.display = 'none';
}

function showAdmin() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-content').style.display = '';
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');

  if (user === ADMIN_LOGIN && pass === ADMIN_PASS) {
    sessionStorage.setItem(STORAGE_KEY_AUTH, '1');
    err.classList.remove('visible');
    showAdmin();
    renderSiteSettings();
    renderHostelCards();
    addResetButton();
  } else {
    err.classList.add('visible');
    document.getElementById('login-pass').value = '';
    document.getElementById('login-pass').focus();
  }
});

if (isLoggedIn()) {
  showAdmin();
  renderSiteSettings();
  renderHostelCards();
  addResetButton();
} else {
  showLogin();
}

/* ---------- localStorage helpers ---------- */

function loadSite() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SITE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSite(data) {
  localStorage.setItem(STORAGE_KEY_SITE, JSON.stringify(data));
}

function loadHostels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOSTELS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveHostels(list) {
  localStorage.setItem(STORAGE_KEY_HOSTELS, JSON.stringify(list));
}

function getSiteData() {
  return loadSite() || { ...SITE };
}

function getHostelsData() {
  return loadHostels() || HOSTELS.map(h => ({ ...h, photos: [...h.photos] }));
}

/* ---------- Toast ---------- */

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('visible'), 2200);
}

/* ---------- Modal ---------- */

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');

function openModal(title) {
  modalTitle.textContent = title;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

/* ---------- Site settings ---------- */

function renderSiteSettings() {
  const data = getSiteData();
  document.getElementById('site-phone').value = data.phone || '';
  document.getElementById('site-phoneDisplay').value = data.phoneDisplay || '';
  document.getElementById('site-workHours').value = data.workHours || '';
  document.getElementById('site-city').value = data.city || '';
}

document.getElementById('site-settings-form').addEventListener('submit', (e) => {
  e.preventDefault();
  saveSite({
    phone: document.getElementById('site-phone').value.trim(),
    phoneDisplay: document.getElementById('site-phoneDisplay').value.trim(),
    workHours: document.getElementById('site-workHours').value.trim(),
    city: document.getElementById('site-city').value.trim(),
  });
  showToast('Настройки сохранены');
});

/* ---------- Hostel list ---------- */

function renderHostelCards() {
  const container = document.getElementById('hostel-cards');
  const list = getHostelsData();

  if (!list.length) {
    container.innerHTML = '<div class="empty-state"><p>Хостелов пока нет</p><p>Нажмите «Добавить хостел», чтобы создать первый</p></div>';
    return;
  }

  container.innerHTML = '';
  list.forEach((hostel, i) => {
    const card = document.createElement('div');
    card.className = 'hostel-card';

    const imgSrc = hostel.photos && hostel.photos[0] ? hostel.photos[0] : '';
    const img = imgSrc
      ? `<img class="hostel-card-img" src="${imgSrc}" alt="${hostel.name}">`
      : `<div class="hostel-card-img" style="background:#f0eeeb;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:1.5rem">📷</div>`;

    const priceText = hostel.price > 0 ? `от ${hostel.price} ₽/сут` : 'Звоните';

    card.innerHTML = `
      ${img}
      <div class="hostel-card-info">
        <h3>${hostel.name}</h3>
        <div class="addr">${hostel.address}</div>
        <div class="price">${priceText}</div>
      </div>
      <div class="hostel-card-actions">
        <button class="btn btn-outline btn-small edit-btn" data-index="${i}">Редактировать</button>
        <button class="btn btn-danger btn-small delete-btn" data-index="${i}">Удалить</button>
      </div>
    `;
    container.append(card);
  });

  container.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => openEdit(+btn.dataset.index));
  });
  container.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteHostel(+btn.dataset.index));
  });
}

/* ---------- Add / Edit ---------- */

function clearForm() {
  document.getElementById('h-index').value = '';
  document.getElementById('h-id').value = '';
  document.getElementById('h-name').value = '';
  document.getElementById('h-address').value = '';
  document.getElementById('h-price').value = '0';
  document.getElementById('h-description').value = '';
  document.getElementById('h-features').value = '';
  for (let i = 0; i < 3; i++) {
    document.getElementById(`h-photo${i}`).value = '';
    const prev = document.getElementById(`h-photo${i}-preview`);
    prev.src = '';
    prev.classList.remove('visible');
  }
}

document.getElementById('add-hostel-btn').addEventListener('click', () => {
  clearForm();
  openModal('Новый хостел');
});

function openEdit(index) {
  const list = getHostelsData();
  const h = list[index];
  if (!h) return;

  clearForm();
  document.getElementById('h-index').value = index;
  document.getElementById('h-id').value = h.id || '';
  document.getElementById('h-name').value = h.name || '';
  document.getElementById('h-address').value = h.address || '';
  document.getElementById('h-price').value = h.price ?? 0;
  document.getElementById('h-description').value = h.description || '';
  document.getElementById('h-features').value = (h.features || []).join(', ');

  (h.photos || []).slice(0, 3).forEach((src, i) => {
    document.getElementById(`h-photo${i}`).value = src;
    const prev = document.getElementById(`h-photo${i}-preview`);
    prev.src = src;
    prev.classList.add('visible');
  });

  openModal('Редактировать хостел');
}

function deleteHostel(index) {
  const list = getHostelsData();
  const h = list[index];
  if (!h) return;
  if (!confirm(`Удалить «${h.name}»?`)) return;

  list.splice(index, 1);
  saveHostels(list);
  renderHostelCards();
  showToast('Хостел удалён');
}

/* ---------- Form submit ---------- */

document.getElementById('hostel-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const indexStr = document.getElementById('h-index').value;
  const isEdit = indexStr !== '';
  const index = isEdit ? +indexStr : -1;

  const id = document.getElementById('h-id').value.trim();
  const name = document.getElementById('h-name').value.trim();
  const address = document.getElementById('h-address').value.trim();
  const price = parseInt(document.getElementById('h-price').value, 10) || 0;
  const description = document.getElementById('h-description').value.trim();
  const featuresRaw = document.getElementById('h-features').value.trim();
  const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : [];

  if (!id || !name || !address) {
    alert('Заполните ID, название и адрес');
    return;
  }

  // check unique id
  const list = getHostelsData();
  const dup = list.findIndex((h, i) => h.id === id && i !== index);
  if (dup !== -1) {
    alert('Хостел с таким ID уже существует');
    return;
  }

  const photos = [];
  for (let i = 0; i < 3; i++) {
    const src = document.getElementById(`h-photo${i}`).value.trim();
    if (src) photos.push(src);
  }

  const hostel = { id, name, address, price, description, features, photos };

  if (isEdit) {
    list[index] = hostel;
  } else {
    list.push(hostel);
  }

  saveHostels(list);
  closeModal();
  renderHostelCards();
  showToast(isEdit ? 'Хостел обновлён' : 'Хостел добавлен');
});

/* ---------- Photo preview + file upload ---------- */

for (let i = 0; i < 3; i++) {
  const input = document.getElementById(`h-photo${i}`);
  const preview = document.getElementById(`h-photo${i}-preview`);

  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (val) {
      preview.src = val;
      preview.classList.add('visible');
    } else {
      preview.src = '';
      preview.classList.remove('visible');
    }
  });
}

document.getElementById('h-photo-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const targetIdx = document.getElementById('h-photo-target').value;

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    document.getElementById(`h-photo${targetIdx}`).value = dataUrl;
    const prev = document.getElementById(`h-photo${targetIdx}-preview`);
    prev.src = dataUrl;
    prev.classList.add('visible');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

/* ---------- Reset to defaults ---------- */

function addResetButton() {
  const panel = document.querySelector('.panel');
  const resetDiv = document.createElement('div');
  resetDiv.style.cssText = 'margin-top:16px;padding-top:16px;border-top:1px solid #f0eeeb;display:flex;gap:12px;flex-wrap:wrap;';
  resetDiv.innerHTML = `
    <button class="btn btn-outline btn-small" id="reset-data">Сбросить к начальным данным</button>
    <button class="btn btn-outline btn-small" id="export-data">Экспорт JSON</button>
    <button class="btn btn-outline btn-small" id="import-data">Импорт JSON</button>
    <input type="file" id="import-file" accept=".json" hidden>
  `;
  panel.append(resetDiv);

  document.getElementById('reset-data').addEventListener('click', () => {
    if (!confirm('Сбросить все данные к начальным? Изменения будут потеряны.')) return;
    localStorage.removeItem(STORAGE_KEY_SITE);
    localStorage.removeItem(STORAGE_KEY_HOSTELS);
    renderSiteSettings();
    renderHostelCards();
    showToast('Данные сброшены');
  });

  document.getElementById('export-data').addEventListener('click', () => {
    const data = {
      site: getSiteData(),
      hostels: getHostelsData(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hostel-ekb-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON экспортирован');
  });

  document.getElementById('import-data').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.site) saveSite(data.site);
        if (data.hostels) saveHostels(data.hostels);
        renderSiteSettings();
        renderHostelCards();
        showToast('Данные импортированы');
      } catch {
        alert('Ошибка: неверный JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}
