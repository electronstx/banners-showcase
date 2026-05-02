# 🚀 Banners Showcase

Система хранения и демонстрации рекламных баннеров на базе GitHub Pages.
Автоматическая витрина доступна по адресу:
👉 **https://electronstx.github.io/banners-showcase/**

---

## 📂 Структура репозитория

```text
index.html          — витрина со списком всех баннеров
viewer.html         — интерактивный просмотрщик отдельного баннера
projects-list.json  — сгенерированный список баннеров для витрины
scripts/
└── generate-projects-list.mjs  — сборка projects-list.json из папки projects/
.github/workflows/
└── update-projects-list.yml    — CI: обновление JSON при изменениях в projects/
projects/
└── [имя-клиента]/
    └── [название-проекта]/
        └── index.html  (Single File Banner)
```

## 🛠 Как добавить новый баннер

1. Создать папку клиента в `/projects/` (если её нет).
2. Внутри создать папку для конкретной кампании.
3. Загрузить туда `index.html`.
4. После пуша в ветку `main` или `master` workflow **Update projects list** пересоберёт `projects-list.json` и при необходимости закоммитит его; затем GitHub Pages отдаст обновлённую главную (обычно 1–2 минуты). Без CI можно локально выполнить `node scripts/generate-projects-list.mjs` и закоммитить `projects-list.json` вручную.

## 📋 Главная страница (`index.html`)

Витрина загружает статический **`projects-list.json`** с того же сайта (без GitHub REST API и лимитов API у посетителей). В список попадают только пары папок `projects/[клиент]/[проект]/`, где есть `index.html`. Для каждого баннера доступны действия:

- **Просмотр** — открывает баннер в `viewer.html` с инструментами управления.
- **Копировать ссылку** — копирует ссылку на viewer в буфер обмена.
- **Напрямую** — открывает `index.html` баннера без обёртки.

## 🎬 Просмотр баннера (`viewer.html`)

Интерактивная страница для детального просмотра и тестирования отдельного баннера. Баннер загружается внутри `iframe` с песочницей (`sandbox`).

### Управление анимацией

Кнопки **Launch**, **Pause** и **Resume** вызывают одноимённые функции баннера (`client_message_launch`, `client_message_pause`, `client_message_resume`), если они реализованы в его коде.

### Пресеты размеров

| Пресет      | Размер (px)  |
| ----------- | ------------ |
| VK Desktop  | 1177 × 873   |
| VK TGB      | 158 × 300    |
| OK          | 1080 × 810   |
| Zen         | 1200 × 900   |
| Свой размер | произвольный |

### Масштабирование

Слайдер масштаба (25–200 %). При выборе пресета масштаб автоматически подстраивается, чтобы баннер помещался в окно просмотра.

### QR-код и копирование ссылки

- **QR-код** — открывает модальное окно с QR-кодом текущей страницы для быстрого просмотра на мобильном устройстве.
- **Копировать ссылку** — копирует URL текущего viewer в буфер обмена.

## 🔗 Прямые ссылки

**Viewer (рекомендуется):**  
`https://electronstx.github.io/banners-showcase/viewer.html?client=[имя-клиента]&project=[название-проекта]`

**Прямая ссылка на баннер:**  
`https://electronstx.github.io/banners-showcase/projects/[имя-клиента]/[название-проекта]/index.html`

## ⚙️ Техническая информация

**Frontend:** Vanilla JS; данные витрины — статический JSON.  
**Hosting:** GitHub Pages.  
**Зависимости:** [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (CDN).  
**Обновление списка:** workflow при изменениях в `projects/` запускает `scripts/generate-projects-list.mjs` и коммитит обновлённый `projects-list.json`, если файл изменился.

### Локальная проверка витрины

Открывайте сайт через HTTP (например `npx serve .`), а не через `file://`, иначе браузер может не загрузить `projects-list.json`.

### GitHub Actions

В настройках репозитория: **Settings → Actions → General → Workflow permissions** включите **Read and write permissions**, чтобы workflow мог пушить коммит с обновлённым `projects-list.json`.
