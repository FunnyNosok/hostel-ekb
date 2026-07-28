/**
 * Данные сайта — единственное место, которое нужно править
 * при изменении телефона, цен или списка хостелов.
 */

/* ---------- Значения по умолчанию (fallback) ---------- */

const SITE_DEFAULTS = {
  phone: '+79126922068',
  phoneDisplay: '+7 (912) 692-20-68',
  workHours: 'Звоните ежедневно с 8:00 до 22:00',
  city: 'Екатеринбург',
};

const HOSTELS_DEFAULTS = [
  {
    id: 'krasnoflottsev',
    name: 'Хостел «Краснофлотцев»',
    address: 'ул. Краснофлотцев, 9',
    price: 0,
    description:
      'Чистый хостел в Екатеринбурге. Удобное расположение, всё необходимое для комфортного проживания.',
    features: ['Кухня', 'Постельное бельё включено'],
    photos: [
      'assets/img/photo_7_2026-07-22_20-36-24.jpg',
      'assets/img/photo_8_2026-07-22_20-36-24.jpg',
      'assets/img/photo_1_2026-07-22_20-36-24.jpg',
    ],
  },
  {
    id: 'bolshakov',
    name: 'Хостел «Старых Большевиков»',
    address: 'ул. Старых Большевиков, 18',
    price: 217,
    description:
      'Койко-место в 4-комнатной квартире, 14 этаж. 20 м². Долгосрочная аренда от 6 500 ₽/мес.',
    features: ['Кухня', 'Постельное бельё включено', 'Долгосрочная аренда'],
    photos: [
      'assets/img/photo_4_2026-07-22_20-36-24.jpg',
      'assets/img/photo_5_2026-07-22_20-36-24.jpg',
      'assets/img/photo_6_2026-07-22_20-36-24.jpg',
    ],
  },
  {
    id: 'baumana',
    name: 'Хостел «Баумана»',
    address: 'мкр-н Эльмаш, ул. Баумана, 2А',
    price: 1300,
    description:
      'Отдельная комната 15 м² в 1-комнатной квартире, 34 этаж. Всё необходимое для проживания.',
    features: ['Кухня', 'Постельное бельё включено'],
    photos: [
      'assets/img/photo_13_2026-07-22_20-36-24.jpg',
      'assets/img/photo_14_2026-07-22_20-36-24.jpg',
      'assets/img/photo_2_2026-07-22_20-36-24.jpg',
    ],
  },
];

/* ---------- Загрузка из localStorage (если админка сохраняла данные) ---------- */

function _loadFromStorage(key, defaults) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaults;
  } catch {
    return defaults;
  }
}

var SITE = _loadFromStorage('hostel_site', SITE_DEFAULTS);
var HOSTELS = _loadFromStorage('hostels_data', HOSTELS_DEFAULTS);
