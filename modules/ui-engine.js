// modules/ui-engine.js — ui engine, связывает DOM и логику
import StorageManager from './storage.js';
import { CONFIG } from '../config.js';

export default class UIEngine {
  constructor(habitManager, aiCoach) {
    this.habitManager = habitManager;
    this.aiCoach = aiCoach;
    this.storage = new StorageManager();
    this.currentAISuggestion = null;
    this.currentTheme = this._loadTheme();
    this._elements = {};
  }

  init() {
    this._cacheElements();
    this.applyTheme();
    this._setupEventListeners();
    this._setupTabsAndControls();
    this.render();
  }

  _cacheElements() {
    const ids = [
      'theme-toggle','today-date','today-habits','daily-progress-fill','daily-progress-text',
      'add-habit-btn','create-first-habit','add-habit-modal','close-modal','cancel-habit','save-habit',
      'habit-name','habit-description','ai-habit-description','generate-with-ai','ai-loading-spinner','generate-text',
      'ai-suggestion','suggestion-name','suggestion-description','suggestion-color','suggestion-frequency','use-suggestion',
      'ai-input','ai-send-btn','ai-response','ai-credits','view-all-stats','stats-modal','close-stats','calendar-view','habits-stats'
    ];
    ids.forEach(id => this._elements[id] = document.getElementById(id) || null);
  }

  _loadTheme() {
    const saved = this.storage.getItem(CONFIG.STORAGE_KEYS.THEME);
    return saved || CONFIG.DEFAULT_THEME;
  }

  saveTheme(theme) {
    this.currentTheme = theme;
    this.storage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
  }

  applyTheme() {
    try {
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      const themeIcon = document.querySelector('.theme-icon');
      if (themeIcon) themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    } catch (e) {}
  }

  _setupEventListeners() {
    // theme toggle
    this._elements['theme-toggle']?.addEventListener('click', () => this._toggleTheme());

    // open add habit
    this._elements['add-habit-btn']?.addEventListener('click', () => this.openAddHabitModal());
    this._elements['create-first-habit']?.addEventListener('click', () => this.openAddHabitModal());

    // modal controls
    this._elements['close-modal']?.addEventListener('click', () => this.closeModals());
    this._elements['cancel-habit']?.addEventListener('click', () => this.closeModals());
    this._elements['save-habit']?.addEventListener('click', () => this.saveHabit());

    // AI generation & suggestion
    this._elements['generate-with-ai']?.addEventListener('click', () => this.generateHabitWithAI());
    this._elements['use-suggestion']?.addEventListener('click', () => this.useAISuggestion());

    // AI chat
    this._elements['ai-send-btn']?.addEventListener('click', () => this.sendAIMessage());
    this._elements['ai-input']?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendAIMessage();
    });

    // view stats
    this._elements['view-all-stats']?.addEventListener('click', () => this.openStatsModal());
    this._elements['close-stats']?.addEventListener('click', () => this.closeModals());

    // overlay click close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModals();
      });
    });

    // delegated habit actions
    const container = document.getElementById('today-habits');
    if (container) {
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-habit-id');
        if (!action || !id) return;
        if (action === 'toggle') {
          this.toggleHabitCompletion(id);
        } else if (action === 'delete') {
          this.deleteHabit(id);
        } else if (action === 'stats') {
          const h = this.habitManager.habits.find(x => x.id === id);
          if (h) this.showHabitStats(h);
        }
      });
    }
  }

  _setupTabsAndControls() {
    // tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `${tabName}-tab`));
      });
    });

    // color picker
    document.querySelectorAll('.color-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // frequency selector
    document.querySelectorAll('.frequency-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.frequency-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  render() {
    this._renderTodayDate();
    this._renderHabits();
    this._renderStats();
    this._renderAIStatus();
    this._checkEmptyState();
  }

  _renderTodayDate() {
    const el = this._elements['today-date'];
    if (!el) return;
    const today = new Date();
    el.textContent = today.toLocaleDateString('ru-RU', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }

  _renderHabits() {
    const container = this._elements['today-habits'];
    if (!container) return;
    const habits = this.habitManager.getTodayHabits();
    container.innerHTML = '';
    if (!habits.length) {
      container.innerHTML = '<div class="text-center" style="color:var(--text-secondary);padding:var(--space-xl);">Нет привычек на сегодня</div>';
      this._updateDailyProgress();
      return;
    }
    habits.forEach(h => {
      const isCompleted = this.habitManager.isHabitCompletedToday(h.id);
      const stats = this.habitManager.getHabitStats(h.id);
      const div = document.createElement('div');
      div.className = `habit-card ${isCompleted ? 'completed' : ''}`;
      div.style.borderLeft = `4px solid ${h.color || '#4CAF50'}`;
      div.innerHTML = `
        <div class="habit-header">
          <div class="habit-name">${this._escape(h.name)}</div>
          <div class="habit-actions">
            <button class="icon-btn" data-action="stats" data-habit-id="${h.id}" title="Статистика">📊</button>
            <button class="icon-btn" data-action="delete" data-habit-id="${h.id}" title="Удалить">🗑️</button>
          </div>
        </div>
        <div class="habit-description">${this._escape(h.description || '')}</div>
        <div class="habit-progress">
          <button class="habit-checkbox ${isCompleted ? 'checked' : ''}" data-action="toggle" data-habit-id="${h.id}" aria-pressed="${isCompleted ? 'true' : 'false'}"></button>
          <div class="habit-stats">
            <div class="streak-counter">🔥 <span style="margin-left:6px">${stats?.streak || 0} дн.</span></div>
            <div class="completion-rate">${stats?.completionRate || 0}% выполнено</div>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
    this._updateDailyProgress();
  }

  _renderStats() {
    const s = this.habitManager.getOverallStats();
    this._safeSetText('total-habits', s.totalHabits);
    this._safeSetText('completion-rate', (s.overallCompletionRate || 0) + '%');
    this._safeSetText('current-streak', s.longestStreak || 0);
  }

  _renderAIStatus() {
    const el = this._elements['ai-credits'];
    if (!el) return;
    const usage = this.aiCoach.getUsageStats();
    el.textContent = `${usage.remainingToday} запросов осталось`;
  }

  _updateDailyProgress() {
    const habits = this.habitManager.getTodayHabits();
    const fill = this._elements['daily-progress-fill'];
    const text = this._elements['daily-progress-text'];
    if (!fill || !text) return;
    if (!habits.length) {
      fill.style.width = '0%';
      text.textContent = '0% выполнено';
      return;
    }
    const completed = habits.filter(h => this.habitManager.isHabitCompletedToday(h.id)).length;
    const percent = Math.round((completed / habits.length) * 100);
    fill.style.width = percent + '%';
    text.textContent = percent + '% выполнено';
  }

  openAddHabitModal() {
    const modal = this._elements['add-habit-modal'];
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    this._resetAddHabitForm();
    // default to manual
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === 'manual'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'manual-tab'));
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.remove('active');
      m.setAttribute('aria-hidden', 'true');
    });
  }

  _resetAddHabitForm() {
    const name = this._elements['habit-name'];
    const desc = this._elements['habit-description'];
    const aiDesc = this._elements['ai-habit-description'];
    if (name) name.value = '';
    if (desc) desc.value = '';
    if (aiDesc) aiDesc.value = '';
    document.querySelectorAll('.color-option').forEach((o,i) => o.classList.toggle('selected', i===0));
    document.querySelectorAll('.frequency-btn').forEach((b,i) => b.classList.toggle('active', i===0));
    const aiSug = this._elements['ai-suggestion'];
    if (aiSug) aiSug.style.display = 'none';
    this.currentAISuggestion = null;
  }

  async generateHabitWithAI() {
    const description = this._elements['ai-habit-description']?.value?.trim();
    if (!description) { this.showNotification('Введите описание для генерации'); return; }
    const btn = this._elements['generate-with-ai'];
    const spinner = this._elements['ai-loading-spinner'];
    const genText = document.getElementById('generate-text');
    if (btn) btn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';
    if (genText) genText.textContent = 'Генерация...';

    try {
      const suggestion = await this.aiCoach.generateHabit(description);
      if (!suggestion) { this.showNotification('AI не вернул предложение'); return; }
      this.displayAISuggestion(suggestion);
    } catch (err) {
      if (err.message === 'DAILY_LIMIT_REACHED') this.showNotification('Достигнут дневной лимит AI запросов');
      else this.showNotification('Ошибка генерации. Попробуйте позже.');
    } finally {
      if (btn) btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (genText) genText.textContent = 'Сгенерировать с AI';
    }
  }

  displayAISuggestion(s) {
    const el = this._elements['ai-suggestion'];
    if (!el) return;
    const name = document.getElementById('suggestion-name');
    const desc = document.getElementById('suggestion-description');
    const color = document.getElementById('suggestion-color');
    const freq = document.getElementById('suggestion-frequency');
    if (name) name.textContent = s.name || 'Предложение';
    if (desc) desc.textContent = s.description || '';
    if (color) color.style.backgroundColor = s.color || '#4CAF50';
    if (freq) freq.textContent = this._frequencyText(s.frequency);
    el.style.display = 'block';
    this.currentAISuggestion = s;
  }

  useAISuggestion() {
    if (!this.currentAISuggestion) return;
    // fill manual form
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === 'manual'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'manual-tab'));
    const nameEl = this._elements['habit-name'];
    const descEl = this._elements['habit-description'];
    if (nameEl) nameEl.value = this.currentAISuggestion.name || '';
    if (descEl) descEl.value = this.currentAISuggestion.description || '';
    document.querySelectorAll('.color-option').forEach(opt => {
      opt.classList.toggle('selected', opt.getAttribute('data-color') === this.currentAISuggestion.color);
    });
    document.querySelectorAll('.frequency-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-frequency') === this.currentAISuggestion.frequency);
    });
    this.showNotification('AI предложение применено');
  }

  saveHabit() {
    const name = this._elements['habit-name']?.value?.trim();
    const description = this._elements['habit-description']?.value?.trim() || '';
    const color = document.querySelector('.color-option.selected')?.getAttribute('data-color') || '#4CAF50';
    const frequency = document.querySelector('.frequency-btn.active')?.getAttribute('data-frequency') || 'daily';
    if (!name) { this.showNotification('Введите название привычки'); return; }
    try {
      this.habitManager.createHabit({ name, description, color, frequency });
      this.closeModals();
      this.render();
      this.showNotification('Привычка создана! 🎉');
    } catch (err) {
      this.showNotification(err.message || 'Ошибка при сохранении привычки');
    }
  }

  async sendAIMessage() {
    const input = this._elements['ai-input'];
    const responseDiv = this._elements['ai-response'];
    const sendBtn = this._elements['ai-send-btn'];
    if (!input || !responseDiv) return;
    const message = input.value.trim();
    if (!message) return;
    responseDiv.innerHTML = '<div class="loading-spinner" style="margin:20px auto"></div>';
    input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    try {
      const context = { habits: this.habitManager.habits.length, streak: this.habitManager.getOverallStats().longestStreak };
      const answer = await this.aiCoach.getAdvice(message, context);
      responseDiv.innerHTML = `<div style="padding:var(--space-sm)"><div style="font-weight:500;margin-bottom:var(--space-sm);color:var(--primary)">AI Коуч:</div><div>${this._escape(answer)}</div></div>`;
      input.value = '';
      this._renderAIStatus();
    } catch (err) {
      if (err.message === 'DAILY_LIMIT_REACHED') responseDiv.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px">Достигнут дневной лимит запросов</div>';
      else responseDiv.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px">Ошибка соединения с AI. Попробуйте позже.</div>';
    } finally {
      input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    }
  }

  openStatsModal() {
    const modal = this._elements['stats-modal'];
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    this.renderDetailedStats();
  }

  renderDetailedStats() {
    const calendarView = this._elements['calendar-view'];
    const habitsStats = this._elements['habits-stats'];
    if (!calendarView || !habitsStats) return;
    calendarView.innerHTML = this._renderCalendar();
    habitsStats.innerHTML = this.habitManager.habits.map(habit => {
      const stats = this.habitManager.getHabitStats(habit.id) || {};
      return `<div class="habit-stat-item" style="border-left:4px solid ${habit.color};padding-left:12px;margin-bottom:16px"><div style="font-weight:600">${this._escape(habit.name)}</div><div style="font-size:12px;color:var(--text-secondary)">Стрик: ${stats.streak} дн. • Выполнение: ${stats.completionRate}%</div></div>`;
    }).join('');
  }

  _renderCalendar() {
    const today = new Date();
    const monthYear = today.toLocaleDateString('ru-RU', { month:'long', year:'numeric' });
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth()+1, 0);
    const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    let html = `<div style="font-weight:600;margin-bottom:16px">${monthYear}</div><div class="calendar-grid">`;
    dayNames.forEach(d => html += `<div style="text-align:center;font-size:12px;color:var(--text-secondary);padding:4px">${d}</div>`);
    const shift = (firstDay.getDay() + 6) % 7;
    for (let i=0;i<shift;i++) html += '<div></div>';
    for (let d = 1; d<= lastDay.getDate(); d++){
      const date = new Date(today.getFullYear(), today.getMonth(), d);
      const key = date.toISOString().split('T')[0];
      const isToday = date.toDateString() === new Date().toDateString();
      const has = this.habitManager.habits.some(h => h.completedDates.includes(key));
      html += `<div class="calendar-day ${has ? 'completed' : ''} ${isToday ? 'today' : ''}">${d}</div>`;
    }
    html += '</div>';
    return html;
  }

  showHabitStats(habit) {
    const stats = this.habitManager.getHabitStats(habit.id) || {};
    const html = `<div style="padding:16px"><div style="font-weight:700;margin-bottom:8px">${this._escape(habit.name)}</div><div style="color:var(--text-secondary);margin-bottom:8px">${this._escape(habit.description || '')}</div><div style="font-size:13px;color:var(--text-secondary)">Стрик: ${stats.streak || 0} дн. • Выполнений: ${stats.totalCompletions || 0} • ${stats.completionRate || 0}%</div></div>`;
    this.showNotification(html, { rawHtml:true, duration:4000});
  }

  deleteHabit(habitId) {
    if (!confirm('Удалить эту привычку? Это действие нельзя отменить.')) return;
    this.habitManager.deleteHabit(habitId);
    this.render();
    this.showNotification('Привычка удалена');
  }

  toggleHabitCompletion(habitId) {
    const completed = this.habitManager.toggleHabitCompletion(habitId);
    if (completed) this._celebrate();
    this.render();
  }

  _celebrate() {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);font-size:48px;z-index:1001;pointer-events:none;animation:pop 900ms ease-out';
    el.textContent = '🎉';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),900);
  }

  showNotification(message, { duration = 2500, rawHtml = false } = {}) {
    const n = document.createElement('div');
    n.className = 'app-notification';
    if (rawHtml) n.innerHTML = message;
    else n.textContent = message;
    document.body.appendChild(n);
    setTimeout(()=>n.style.opacity='0', duration - 200);
    setTimeout(()=>n.remove(), duration);
  }

  _toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.saveTheme(this.currentTheme);
    this.applyTheme();
  }

  _frequencyText(f) {
    if (f==='daily') return 'Ежедневно';
    if (f==='weekdays') return 'По будням';
    if (f==='weekly') return 'По выходным';
    return f;
  }

  _safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  _escape(s) {
    if (s == null) return '';
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }
}