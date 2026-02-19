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

let currentBuyItem = null;
let currentBuyType = null;
let appliedPromo = null;

function showBuyPage(item, type) {
    const isCoords = type === 'coords';
    currentBuyItem = item;
    currentBuyType = type;
    appliedPromo = null; // Сброс при новом открытии

    document.getElementById('buy-title').textContent = isCoords
        ? '🗺 Покупка координат'
        : '📋 Покупка полной информации';
    document.getElementById('buy-icon').textContent = isCoords ? '🗺' : '📋';
    document.getElementById('buy-object').textContent = `${item.icon} ${item.name}`;
    
    // Сброс полей промокода
    const promoInput = document.getElementById('buy-promo-input');
    if (promoInput) promoInput.value = '';
    const promoResult = document.getElementById('buy-promo-result');
    if (promoResult) promoResult.textContent = '';
    
    updateBuyPriceDisplay();

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

function updateBuyPriceDisplay() {
    const isCoords = currentBuyType === 'coords';
    let basePriceStr = isCoords ? currentBuyItem.coords_price : currentBuyItem.full_price;
    let basePrice = parseInt(basePriceStr.replace(/\D/g, '')) || 0;
    
    let finalPrice = basePrice;
    
    if (appliedPromo) {
        let discountVal = parseInt(appliedPromo.discount.replace(/\D/g, '')) || 0;
        if (appliedPromo.discount.includes('%')) {
            finalPrice = finalPrice - (finalPrice * (discountVal / 100));
        } else {
            finalPrice = finalPrice - discountVal;
        }
        if (finalPrice < 0) finalPrice = 0;
    }
    
    const buyTotalEl = document.getElementById('buy-total');
    if (appliedPromo) {
        buyTotalEl.innerHTML = `<s style="font-size: 18px; color: var(--text-hint);">${basePriceStr}</s> ${Math.round(finalPrice)}₽`;
    } else {
        buyTotalEl.textContent = basePriceStr;
    }
}

function applyBuyPromocode() {
    const input = document.getElementById('buy-promo-input');
    const resultDiv = document.getElementById('buy-promo-result');
    if (!input || !resultDiv) return;
    
    const code = input.value.trim().toUpperCase();

    if (!code) {
        resultDiv.textContent = 'Введите промокод!';
        resultDiv.style.color = '#ff6b6b';
        return;
    }

    if (appliedPromo && appliedPromo.code === code) {
        resultDiv.textContent = 'Этот промокод уже применён!';
        resultDiv.style.color = '#ff6b6b';
        return;
    }

    const promo = PROMOCODES.find(p => p.code === code);

    if (promo) {
        if (promo.uses > 0) {
            promo.uses--; // Уменьшаем количество использований
            appliedPromo = promo;
            updateBuyPriceDisplay();
            
            resultDiv.textContent = `✅ Скидка ${promo.discount} применена!`;
            resultDiv.style.color = '#4caf50';
            
            if (tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
        } else {
            resultDiv.textContent = '❌ Лимит исчерпан.';
            resultDiv.style.color = '#ff6b6b';
            
            if (tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
        }
    } else {
        resultDiv.textContent = '❌ Неверный промокод.';
        resultDiv.style.color = '#ff6b6b';
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
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
//  ПРОМОКОДЫ
// ═══════════════════════════════════════════════════════════════

const PROMOCODES = [
    { code: 'STALKER2026', uses: 10, discount: '20%' },
    { code: 'BUNKERFREE', uses: 5, discount: '100%' },
    { code: 'TEST', uses: 100, discount: '10%' }
];

// ═══════════════════════════════════════════════════════════════
//  ИНИЦИАЛИЗАЦИЯ
// ═══════════════════════════════════════════════════════════════

function setRandomGreeting() {
    const greetings = [
        { text: "Привет сталкер!", weight: 100 },
        { text: "Привет дигер!", weight: 100 },
        { text: "Привет Руфер!", weight: 100 },
        { text: "Привет от Vexo!", weight: 100 },
        { text: "Привет всем сабам 4к!", weight: 100 },
        { text: "Привет зацепер!", weight: 100 },
        { text: "Промокод STALKER2026 (Маленький шанс на него)!", weight: 5 } // Маленький шанс
    ];

    let totalWeight = greetings.reduce((sum, g) => sum + g.weight, 0);
    let rand = Math.random() * totalWeight;
    let selected = greetings[0].text;
    
    for (const g of greetings) {
        if (rand < g.weight) {
            selected = g.text;
            break;
        }
        rand -= g.weight;
    }
    
    const greetingEl = document.getElementById('main-greeting');
    if (greetingEl) {
        greetingEl.textContent = selected;
    }
}

// Показать главную страницу
setRandomGreeting();
showPage('page-main', false);
