/* ═══════════════════════════════════════════════════════════════
   Telegram Mini App — Магазин координат
   ═══════════════════════════════════════════════════════════════ */

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();    // Раскрыть на весь экран

// ═══════════════════════════════════════════════════════════════
//  КАТАЛОГ — ДОБАВЛЯЙ СВОИ ОБЪЕКТЫ СЮДА
// ═══════════════════════════════════════════════════════════════

const CATALOG = {
    // ─── Заброшки ───
    abandoned: {
        title: '🏚 Заброшки',
        icon: '🏚',
        items: [
            {
                id: 'abn_1',
                name: 'Заброшенный завод',
                icon: '🏭',
                description:
                    'Старый промышленный завод на окраине города.\nТерритория большая, много корпусов.\nОхрана: нет.',
                coords_price: '100₽',
                full_price: '250₽',
            },
            {
                id: 'abn_2',
                name: 'Заброшенная больница',
                icon: '🏥',
                description:
                    'Бывшая городская больница, закрыта с 2005 года.\n3 этажа, подвал доступен.\nОхрана: сторож ночью.',
                coords_price: '150₽',
                full_price: '300₽',
            },
            {
                id: 'abn_3',
                name: 'Заброшенная школа',
                icon: '🏫',
                description:
                    'Сельская школа, пустует уже 10 лет.\n2 этажа, спортзал.\nОхрана: нет.',
                coords_price: '80₽',
                full_price: '200₽',
            },
        ],
    },

    // ─── Бомбоубежища ───
    bunkers: {
        title: '🛡 Бомбоубежища',
        icon: '🛡',
        items: [
            {
                id: 'bnk_1',
                name: 'Бомбоубежище #14',
                icon: '🏗',
                description:
                    'Подземное убежище советских времён.\nГлубина: ~15 м, несколько залов.\nСостояние: хорошее.',
                coords_price: '200₽',
                full_price: '400₽',
            },
            {
                id: 'bnk_2',
                name: 'Бомбоубежище #7',
                icon: '🚇',
                description:
                    'Убежище под жилым кварталом.\nДлинные коридоры, вентиляционные шахты.\nСостояние: среднее.',
                coords_price: '180₽',
                full_price: '350₽',
            },
            {
                id: 'bnk_3',
                name: 'Бомбоубежище #22',
                icon: '🔒',
                description:
                    'Крупный бункер военного назначения.\nМножество комнат, командный пункт.\nСостояние: отличное.',
                coords_price: '300₽',
                full_price: '500₽',
            },
        ],
    },
};

// ═══════════════════════════════════════════════════════════════
//  НАВИГАЦИЯ ПО СТРАНИЦАМ
// ═══════════════════════════════════════════════════════════════

let currentCategory = null;
let currentItem = null;
let pageHistory = [];

function showPage(pageId, addToHistory = true) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach((p) => (p.classList.remove('active')));

    // Показать нужную
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.remove('active');
        // Принудительный reflow для перезапуска анимации
        void page.offsetWidth;
        page.classList.add('active');
    }

    // История навигации
    if (addToHistory) {
        pageHistory.push(pageId);
    }

    // Тактильная обратная связь
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// ═══════════════════════════════════════════════════════════════
//  КАТАЛОГ — отображение списка объектов
// ═══════════════════════════════════════════════════════════════

function showCatalog(categoryKey) {
    currentCategory = categoryKey;
    const cat = CATALOG[categoryKey];
    if (!cat) return;

    document.getElementById('catalog-title').textContent = cat.title;
    document.getElementById('catalog-subtitle').textContent =
        `Найдено объектов: ${cat.items.length}`;

    const list = document.getElementById('catalog-list');
    list.innerHTML = '';

    cat.items.forEach((item) => {
        const btn = document.createElement('button');
        btn.className = 'catalog-item';
        btn.innerHTML = `
      <span class="catalog-item-icon">${item.icon}</span>
      <div class="catalog-item-info">
        <div class="catalog-item-name">${item.name}</div>
        <div class="catalog-item-price">от ${item.coords_price}</div>
      </div>
      <span class="catalog-item-arrow">›</span>
    `;
        btn.addEventListener('click', () => showItem(item));
        list.appendChild(btn);
    });

    showPage('page-catalog');
}

// ═══════════════════════════════════════════════════════════════
//  КАРТОЧКА ОБЪЕКТА
// ═══════════════════════════════════════════════════════════════

function showItem(item) {
    currentItem = item;

    document.getElementById('item-title').textContent = `${item.icon} ${item.name}`;
    document.getElementById('item-description').textContent = item.description;
    document.getElementById('item-coords-price').textContent = item.coords_price;
    document.getElementById('item-full-price').textContent = item.full_price;
    document.getElementById('btn-coords-price').textContent = item.coords_price;
    document.getElementById('btn-full-price').textContent = item.full_price;

    // Кнопка назад к каталогу
    document.getElementById('item-back-btn').onclick = () => {
        showCatalog(currentCategory);
    };

    // Кнопки покупки
    document.getElementById('btn-buy-coords').onclick = () => {
        showBuyPage(item, 'coords');
    };
    document.getElementById('btn-buy-full').onclick = () => {
        showBuyPage(item, 'full');
    };

    showPage('page-item');
}

// ═══════════════════════════════════════════════════════════════
//  СТРАНИЦА ПОКУПКИ
// ═══════════════════════════════════════════════════════════════

function showBuyPage(item, type) {
    const isCoords = type === 'coords';

    document.getElementById('buy-title').textContent = isCoords
        ? '🗺 Покупка координат'
        : '📋 Покупка полной информации';
    document.getElementById('buy-icon').textContent = isCoords ? '🗺' : '📋';
    document.getElementById('buy-object').textContent = `${item.icon} ${item.name}`;
    document.getElementById('buy-total').textContent = isCoords
        ? item.coords_price
        : item.full_price;
    document.getElementById('buy-code').textContent = `Код: ${item.id}_${type}`;

    document.getElementById('buy-back-btn').onclick = () => {
        showItem(item);
    };

    showPage('page-buy');

    // Тактильная обратная связь
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// ═══════════════════════════════════════════════════════════════
//  КОПИРОВАНИЕ ШАБЛОНА ПРЕДЛОЖКИ
// ═══════════════════════════════════════════════════════════════

function copyTemplate() {
    const template =
        '1. Название объекта: \n2. Краткая информация: \n3. Корды: \n4. Цена (доп.): ';

    navigator.clipboard
        .writeText(template)
        .then(() => {
            const btn = document.querySelector('.copy-btn');
            btn.textContent = '✅ Скопировано!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = '📋 Скопировать шаблон';
                btn.classList.remove('copied');
            }, 2000);

            if (tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
        })
        .catch(() => {
            // Fallback для старых версий
            const btn = document.querySelector('.copy-btn');
            btn.textContent = '⚠️ Скопируй вручную';
            setTimeout(() => {
                btn.textContent = '📋 Скопировать шаблон';
            }, 2000);
        });
}

// ═══════════════════════════════════════════════════════════════
//  ИНИЦИАЛИЗАЦИЯ
// ═══════════════════════════════════════════════════════════════

// Показать главную страницу
showPage('page-main', false);
