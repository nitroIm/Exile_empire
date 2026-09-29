Держи полную заметку для Firebase Console (или отдельного файла). Можешь сохранить её в README.md в репозитории — тогда всегда под рукой.

---

📘 EXILE EMPIRE — ПРОЕКТНАЯ ЗАМЕТКА

🎮 О проекте

Название: Exile Empire (Империя Изгнанника)
Жанр: Пошаговая космическая стратегия
Платформа: Telegram Mini App
Сюжет: Адмирал предан Канцлером, выжил на мёртвой планете, строит империю и мстит.

🛠️ Технологии

Компонент Что используется
Движок Phaser 3 (в дальнейшем) + HTML/CSS/JS
Хостинг GitHub Pages
Репозиторий nitroIm.github.io/Exile_empire (большая I)
Бот Telegram @Exile's Empire
База данных Firebase Firestore
Авторизация Firebase Anonymous Auth
Звук Howler.js 2.2.3 (CDN)

📁 Структура проекта

```
Exile_empire/
├── index.html              ← главный HTML
├── css/
│   └── style.css           ← все стили
├── js/
│   ├── game.js             ← логика (движение, звуки, звания)
│   └── firebase.js         ← подключение БД, авторизация
├── assets/
│   ├── splash.PNG          ← заставка
│   └── Planet.PNG          ← фон меню
├── ui/                     ← интерфейс
│   ├── profile_frame.PNG   ← рамка профиля (маленькая)
│   ├── profile_frame_big.PNG ← рамка профиля (большая)
│   ├── avatar_default.PNG  ← аватар по умолчанию
│   ├── panel_frame.PNG     ← рамка нижней панели
│   ├── icon_base.PNG       ← БАЗА
│   ├── icon_army.PNG       ← значок армии (для полосы сверху)
│   ├── icon_army_menu.PNG  ← казарма (для нижней кнопки)
│   ├── icon_fight.PNG      ← БОЙ (череп + мечи)
│   ├── icon_science.PNG    ← НАУКА
│   ├── icon_shop.PNG       ← МАГАЗИН
│   ├── icon_metal.PNG      ← металл
│   ├── icon_crystal.PNG    ← кристалл
│   ├── icon_energy.PNG     ← энергия
│   ├── icon_gear.PNG       ← шестерёнка
│   ├── menu_button_play.PNG
│   ├── menu_button_profile.PNG
│   ├── menu_button_shop.PNG
│   ├── menu_button_settings.PNG
│   └── ranks/              ← звания
│       ├── rank_01.PNG     ← 1 шеврон серый (Рядовой)
│       ├── rank_02.PNG     ← 1 шеврон золотой (Ефрейтор)
│       ├── rank_03.PNG     ← 2 шеврона (Мл. сержант)
│       └── ...
├── maps/
│   ├── map_01.PNG          ← 1024×1024
│   ├── map_2.PNG
│   ├── map_3.PNG
│   └── map_4.PNG
├── characters/hero/        ← спрайты героя
│   ├── up_1.PNG, up_2.PNG
│   ├── down_1.PNG, down_2.PNG
│   ├── left_1.PNG, left_2.PNG
│   └── right_1.PNG, right_2.PNG
└── sounds/
    ├── music_menu.mp3
    └── click.mp3
```

🔥 Firebase — настройки

Конфиг проекта

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAaAMt8O1pNfF7O2TJkWSyyvv6Ndp5XHfU",
  authDomain: "exile-empire.firebaseapp.com",
  projectId: "exile-empire",
  storageBucket: "exile-empire.firebasestorage.app",
  messagingSenderId: "465765692374",
  appId: "1:465765692374:web:c6b984f3ba91ecc22c2a77"
};
```

Прямые ссылки Firebase Console

Что Ссылка
Firestore Data console.firebase.google.com/project/exile-empire/firestore
Firestore Rules console.firebase.google.com/project/exile-empire/firestore/rules
Authentication console.firebase.google.com/project/exile-empire/authentication/providers
Project Settings console.firebase.google.com/project/exile-empire/settings/general

Firestore Rules (текущие)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.auth.uid == playerId
                   && isValidPlayerData(request.resource.data);
    }
  }
}

function isValidPlayerData(data) {
  return data.name is string
      && data.name.size() <= 15
      && (data.metal is int && data.metal >= 0 && data.metal <= 1000000)
      && (data.crystal is int && data.crystal >= 0 && data.crystal <= 1000000)
      && (data.army is int && data.army >= 0 && data.army <= 1000000);
}
```

Структура данных в Firestore

```
players/
├── test_user_1/          ← тестовый игрок (браузер)
│   ├── name: "Адмирал"
│   ├── avatar: ""
│   ├── metal: 500
│   ├── crystal: 200
│   ├── army: 0
│   ├── soundOn: true
│   ├── musicOn: true
│   ├── soundVol: 100
│   └── musicVol: 40
└── tg_1208264549/        ← игрок из Telegram
    └── ... те же поля
```

🎯 Что уже реализовано

Фича Статус
✅ Заставка с загрузчиком Готово
✅ Главное меню (PLAY, PROFILE, SHOP, SETTINGS) Готово
✅ Экран профиля (имя, аватар, звук, музыка) Готово
✅ Firebase: сохранение профиля Готово
✅ Firebase: Anonymous Auth Готово
✅ Правила Firestore (защита) Готово
✅ Звуки через Howler.js (клик + музыка) Готово
✅ Громкость музыки (−/+) Готово
✅ Карта 2048×2048 (4 тайла) Готово
✅ Герой ходит по карте (4 направления) Готово
✅ Свайп карты + зум Готово
✅ Верхняя панель: профиль + 3 ресурса + армия Готово
✅ Шестерёнка (меню выхода) Готово
✅ Нижняя панель: БАЗА, АРМИЯ, БОЙ, НАУКА, МАГАЗИН Готово
✅ Система званий (Рядовой → Майор) Готово
⏳ Постройка зданий В планах
⏳ Бой В планах
⏳ PvP В планах

🎖️ Система званий (по числу армии)

№ Звание Армия Файл
1 Рядовой 0 rank_01.PNG
2 Ефрейтор 10 rank_02.PNG
3 Младший сержант 20 rank_03.PNG
4 Сержант 50 rank_04.PNG
5 Старший сержант 100 rank_05.PNG
6 Старшина 200 rank_06.PNG
7 Прапорщик 400 rank_07.PNG
8 Лейтенант 700 rank_08.PNG
9 Капитан 1000 rank_09.PNG
10 Майор 2000 rank_10.PNG

Позже: Полковник, Генерал, Маршал, Повелитель Планеты, Повелитель Галактики, Повелитель Космоса, Бессмертный, Легенда.

⚠️ Что важно помнить

1. GitHub Pages регистрозависим. nitroIm.github.io — с большой I. Не путать с nitroim.
2. Файлы: splash.PNG, Planet.PNG — большими .PNG. icon_base.PNG — маленькими icon_, большими .PNG.
3. Firebase обновляется не сразу — иногда нужно 1-2 минуты.
4. Telegram кэширует — закрывать приложение полностью для обновления.
5. Browser localStorage — если что-то не работает, проверить в инкогнито.

📌 Правила для новых полей (когда будем добавлять)

Новые поля (еда, топливо, опыт) — добавляются без правки правил. Правила пропускают любые поля, кроме обязательных (name, metal, crystal, army).

Новые коллекции (кланы, ивенты, чаты) — потребуют правки правил. Добавлять блок match /clans/{clanId} { ... }.

🚀 Что дальше

1. Постройка зданий — слоты на карте, меню постройки, спрайты зданий.
2. Бой — простая система «сила армии vs сила врага».
3. PvP — асинхронные атаки на других игроков.
4. Кланы — объединения игроков.
5. Расширение званий — до 18 рангов.

📞 Контакты проекта

· Владелец: nitroIm (GitHub)
· Бот Telegram: @Exile's Empire
· Публичная ссылка игры: nitroIm.github.io/Exile_empire/

---

Дата создания заметки: сентябрь 2026
Последнее обновление: сентябрь 2026
