// modules/ui-engine.js
// UI: рендер и взаимодействие. Комментарии на русском.

export class UIEngine {
  constructor({ mount, habitManager, aiCoach, config, storage }) {
    this.mount = mount;
    this.habitManager = habitManager;
    this.aiCoach = aiCoach;
    this.config = config;
    this.storage = storage;
    this.theme = this._loadTheme() || this.config.DEFAULT_THEME || 'light';
    this.currentAISuggestion = null;
  }

  renderShell() {
    // Базовая верстка — вставляем в mount
    this.mount.innerHTML = `
      <div class="header">
        <div class="header-top">
          <div class="title">${this.config.APP_NAME}</div>
          <div class="controls">
            <button id="theme-toggle" class="icon-btn" title="Сменить тему">🌙</button>
            <button id="open-add" class="icon-btn primary" title="Добавить привычку">+</button>
          </div>
        </div>
        <div class="progress">
          <div class="progress-bar"><div id="daily-fill" class="progress-fill"></div></div>
          <div id="daily-text" class="progress-text">0% выполнено</div>
        </div>
      </div>

      <main class="main">
        <section class="section today">
          <h2>Сегодня <small id="today-date" class="small"></small></h2>
          <div id="habits" class="habits"><div class="empty small">Загрузка...</div></div>
        </section>

        <section class="section ai">
          <h2>AI Коуч <small id="ai-credits" class="small"></small></h2>
          <div class="ai-box">
            <div class="ai-row">
              <input id="ai-input" class="ai-input" placeholder="Спросите совет у AI..." />
              <button id="ai-send" class="ai-btn">➤</button>
            </div>
            <div id="ai-response" style="margin-top:10px" class="small"></div>
          </div>
        </section>

        <section class="section stats">
          <h2>Статистика</h2>
          <div class="stat-grid">
            <div class="stat"><div id="stat-total" class="stat-value">0</div><div class="small">Всего привычек</div></div>
            <div class="stat"><div id="stat-completion" class="stat-value">0%</div><div class="small">Выполнение</div></div>
            <div class="stat"><div id="stat-streak" class="stat-value">0</div><div class="small">Дней подряд</div></div>
          </div>
        </section>
      </main>

      <!-- Add habit modal -->
      <div id="modal-add" class="modal-overlay">
        <div class="modal">
          <div class="modal-body">
            <h3>Создать привычку</h3>
            <div class="form-group"><label>Название</label><input id="habit-name" class="input" /></div>
            <div class="form-group"><label>Описание</label><textarea id="habit-desc" rows="3" class="input"></textarea></div>
            <div class="form-group"><label>Цвет</label>
              <div style="display:flex;gap:8px">
                <button data-color="#4CAF50" class="icon-btn color-option" style="background:#4CAF50"></button>
                <button data-color="#2196F3" class="icon-btn color-option" style="background:#2196F3"></button>
                <button data-color="#FF9800" class="icon-btn color-option" style="background:#FF9800"></button>
                <button data-color="#9C27B0" class="icon-btn color-option" style="background:#9C27B0"></button>
                <button data-color="#F44336" class="icon-btn color-option" style="background:#F44336"></button>
              </div>
            </div>
            <div class="form-group"><label>Повторение</label>
              <div style="display:flex;gap:8px">
                <button data-frequency="daily" class="icon-btn freq active">Ежедневно</button>
                <button data-frequency="weekdays" class="icon-btn freq">По будням</button>
                <button data-frequency="weekly" class="icon-btn freq">Выходные</button>
              </div>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end">
              <button id="cancel-add" class="btn-primary" style="background:#ccc;color:#000">Отмена</button>
              <button id="save-add" class="btn-primary">Сохранить</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Применяем тему
    this.applyTheme(this.theme);
  }

  async init() {
    // Привязка событий
    this._bindEvents();
    // Рендер данных
    this.renderAll();
  }

  _bindEvents() {
    // Тема
    this._qs('#theme-toggle').addEventListener('click', () => {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.theme);
      this._saveTheme();
    });

    // Открыть модалку
    this._qs('#open-add').addEventListener('click', () => this.showAddModal());

    // Добавление habit
    this._qs('#save-add').addEventListener('click', () => this._onSaveHabit());
    this._qs('#cancel-add').addEventListener('click', () => this.hideAddModal());

    // Цвета
    this._qsa('.color-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._qsa('.color-option').forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Частота
    this._qsa('.freq').forEach(btn => {
      btn.addEventListener('click', () => {
        this._qsa('.freq').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // AI send
    this._qs('#ai-send').addEventListener('click', () => this._onAISend());
    this._qs('#ai-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this._onAISend();
    });
  }

  _qs(sel) { return this.mount.querySelector(sel); }
  _qsa(sel) { return Array.from(this.mount.querySelectorAll(sel)); }

  renderAll() {
    this.renderDate();
    this.renderHabits();
    this.renderStats();
    this.renderAIStatus();
  }

  renderDate() {
    const el = this._qs('#today-date');
    const d = new Date();
    el.textContent = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  renderHabits() {
    const container = this._qs('#habits');
    const list = this.habitManager.getTodayHabits();
    container.innerHTML = '';
    if (!list.length) {
      container.innerHTML = `<div class="empty">Добавьте первую привычку — это займёт минуту</div>`;
      this._updateProgress();
      return;
    }
    list.forEach(h => {
      const div = document.createElement('div');
      div.className = 'habit';
      div.innerHTML = `
        <div class="habit-row">
          <div style="display:flex;gap:10px;align-items:center">
            <div class="habit-checkbox ${this.habitManager.isCompletedToday(h.id) ? 'checked' : ''}" data-id="${h.id}"></div>
            <div>
              <div class="habit-name">${this._esc(h.name)}</div>
              <div class="habit-desc">${this._esc(h.description || '')}</div>
            </div>
          </div>
          <div class="habit-actions">
            <button class="icon-btn stats" title="Статистика">📊</button>
            <button class="icon-btn del" title="Удалить">🗑️</button>
          </div>
        </div>
      `;
      // style accent
      div.style.borderLeft = `4px solid ${h.color || '#4CAF50'}`;
      // events
      div.querySelector('.habit-checkbox').addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        this.habitManager.toggleCompletion(id);
        this.renderAll();
      });
      div.querySelector('.del').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Удалить привычку?')) {
          const id = h.id;
          this.habitManager.delete(id);
          this.renderAll();
        }
      });
      div.querySelector('.stats').addEventListener('click', (e) => {
        e.stopPropagation();
        const stats = this.habitManager.getHabitStats(h.id);
        alert(`Статистика: \nСтрик: ${stats.streak} дн.\nВыполнений: ${stats.totalCompletions}\nПроцент: ${stats.completionRate}%`);
      });
      container.appendChild(div);
    });
    this._updateProgress();
  }

  _updateProgress() {
    const list = this.habitManager.getTodayHabits();
    const fill = this._qs('#daily-fill');
    const text = this._qs('#daily-text');
    if (!list.length) {
      fill.style.width = '0%';
      text.textContent = '0% выполнено';
      return;
    }
    const completed = list.filter(h => this.habitManager.isCompletedToday(h.id)).length;
    const percent = Math.round((completed / list.length) * 100);
    fill.style.width = percent + '%';
    text.textContent = percent + '% выполнено';
  }

  renderStats() {
    const s = this.habitManager.getOverallStats();
    this._qs('#stat-total').textContent = s.totalHabits;
    this._qs('#stat-completion').textContent = s.overallCompletionRate + '%';
    this._qs('#stat-streak').textContent = s.longestStreak || s.longestStreak === 0 ? s.longestStreak : 0;
  }

  renderAIStatus() {
    const u = this.aiCoach.getUsageStats();
    this._qs('#ai-credits').textContent = `${u.remainingToday} запросов осталось`;
  }

  showAddModal() {
    const m = this._qs('#modal-add');
    m.classList.add('active');
    // сброс полей
    this._qs('#habit-name').value = '';
    this._qs('#habit-desc').value = '';
    // выбрать первый цвет
    const colors = this._qsa('.color-option');
    colors.forEach((c,i) => { c.classList.toggle('selected', i===0); });
    this._qsa('.freq').forEach((f,i)=>f.classList.toggle('active', i===0));
  }

  hideAddModal() {
    const m = this._qs('#modal-add');
    m.classList.remove('active');
  }

  _onSaveHabit() {
    const name = this._qs('#habit-name').value.trim();
    if (!name) { alert('Введите название привычки'); return; }
    const description = this._qs('#habit-desc').value.trim();
    const color = (this._qs('.color-option.selected') || this._qs('.color-option')).getAttribute('data-color') || '#4CAF50';
    const freq = (this._qs('.freq.active') || this._qs('.freq')).getAttribute('data-frequency') || 'daily';
    try {
      this.habitManager.create({ name, description, color, frequency: freq });
      this.hideAddModal();
      this.renderAll();
    } catch (e) {
      alert(e.message || 'Ошибка сохранения привычки');
    }
  }

  async _onAISend() {
    const input = this._qs('#ai-input');
    const text = input.value.trim();
    if (!text) return;
    const resp = this._qs('#ai-response');
    resp.textContent = 'Загружаю ответ...';
    try {
      const answer = await this.aiCoach.getAdvice(text, {});
      resp.textContent = answer;
      input.value = '';
      this.renderAIStatus();
    } catch (e) {
      resp.textContent = e.message || 'Ошибка AI';
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  _saveTheme() {
    this.storage.setItem('theme', this.theme);
  }

  _loadTheme() {
    const t = this.storage.getItem('theme');
    return t;
  }

  _esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}