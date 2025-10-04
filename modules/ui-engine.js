// modules/ui-engine.js — интерфейс приложения, связывает HabitManager и AICoach с DOM
// Экспортируем класс UIEngine

import StorageManager from './storage.js';
import { CONFIG } from '../config.js';

export class UIEngine {
    constructor(habitManager, aiCoach) {
        this.habitManager = habitManager;
        this.aiCoach = aiCoach;
        this.storage = new StorageManager();
        this.currentTheme = this._loadTheme();
        this.currentAISuggestion = null;
        // кэш элементов
        this.elements = {};
    }

    init() {
        // находим элементы по id и при необходимости пропускаем отсутствующие
        this._cacheElements();
        this.applyTheme();
        this._bindUIActions();
        this.render();
    }

    // Кэширование часто используемых элементов (с проверками)
    _cacheElements() {
        const ids = [
            'theme-toggle','today-date','today-habits','daily-progress-fill','daily-progress-text',
            'add-habit-btn','create-first-habit','add-habit-modal','close-modal','cancel-habit','save-habit',
            'habit-name','habit-description','ai-habit-description','generate-with-ai','ai-loading-spinner','generate-text',
            'ai-suggestion','suggestion-name','suggestion-description','suggestion-color','suggestion-frequency','use-suggestion',
            'ai-input','ai-send-btn','ai-response','ai-credits','view-all-stats','stats-modal','close-stats','calendar-view','habits-stats',
            'color-picker','frequency-selector','today-date','empty-state','main-content'
        ];
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id) || null;
        });
    }

    // Тема: грузим/сохраняем
    _loadTheme() {
        const saved = this.storage.getItem(CONFIG.STORAGE_KEYS.THEME);
        return saved || CONFIG.DEFAULT_THEME;
    }

    saveTheme(theme) {
        this.currentTheme = theme;
        this.storage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.saveTheme(newTheme);
        this.applyTheme();
    }

    applyTheme() {
        try {
            document.documentElement.setAttribute('data-theme', this.currentTheme);
            const icon = document.querySelector('.theme-icon');
            if (icon) icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        } catch (e) { /* ignore */ }
    }

    // Навешиваем обработчики (с проверкой наличия элементов)
    _bindUIActions() {
        // Theme toggle
        if (this.elements['theme-toggle']) {
            this.elements['theme-toggle'].addEventListener('click', () => this.toggleTheme());
        }

        // Open add habit
        if (this.elements['add-habit-btn']) {
            this.elements['add-habit-btn'].addEventListener('click', () => this.openAddHabitModal());
        }
        if (this.elements['create-first-habit']) {
            this.elements['create-first-habit'].addEventListener('click', () => this.openAddHabitModal());
        }

        // Modal controls
        if (this.elements['close-modal']) this.elements['close-modal'].addEventListener('click', () => this.closeModals());
        if (this.elements['cancel-habit']) this.elements['cancel-habit'].addEventListener('click', () => this.closeModals());
        if (this.elements['save-habit']) this.elements['save-habit'].addEventListener('click', () => this.saveHabit());

        // Generate with AI
        if (this.elements['generate-with-ai']) {
            this.elements['generate-with-ai'].addEventListener('click', () => this.generateHabitWithAI());
        }
        if (this.elements['use-suggestion']) {
            this.elements['use-suggestion'].addEventListener('click', () => this.useAISuggestion());
        }

        // AI chat
        if (this.elements['ai-send-btn'] && this.elements['ai-input']) {
            this.elements['ai-send-btn'].addEventListener('click', () => this.sendAIMessage());
            this.elements['ai-input'].addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendAIMessage();
            });
        }

        // Stats modal
        if (this.elements['view-all-stats']) this.elements['view-all-stats'].addEventListener('click', () => this.openStatsModal());
        if (this.elements['close-stats']) this.elements['close-stats'].addEventListener('click', () => this.closeModals());

        // Modal overlay clicks - закрытие при клике вне модалки
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModals();
            });
        });

        // Tabs и form controls
        this._setupTabsAndControls();

        // Делегирование кликов по списку привычек (checkbox / delete / stats)
        const habitsContainer = this.elements['today-habits'];
        if (habitsContainer) {
            habitsContainer.addEventListener('click', (e) => {
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
                    const habit = this.habitManager.habits.find(h => h.id === id);
                    if (habit) this.showHabitStats(habit);
                }
            });
        }
    }

    _setupTabsAndControls() {
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `${tabName}-tab`));
            });
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        // Frequency selector
        document.querySelectorAll('.frequency-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.frequency-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // Рендер всего интерфейса
    render() {
        this._renderTodayDate();
        this._renderHabits();
        this._renderStats();
        this._renderAIStatus();
        this._checkEmptyState();
    }

    _renderTodayDate() {
        const el = this.elements['today-date'];
        if (!el) return;
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        el.textContent = today.toLocaleDateString('ru-RU', options);
    }

    _renderHabits() {
        const container = this.elements['today-habits'];
        if (!container) return;
        const habits = this.habitManager.getTodayHabits();
        container.innerHTML = '';

        if (!habits.length) {
            container.innerHTML = `<div class="text-center" style="color: var(--text-secondary); padding: var(--space-xl);">Нет привычек на сегодня</div>`;
            this._updateDailyProgress();
            return;
        }

        habits.forEach(h => {
            const isCompleted = this.habitManager.isHabitCompletedToday(h.id);
            const stats = this.habitManager.getHabitStats(h.id);
            const card = document.createElement('div');
            card.className = `habit-card ${isCompleted ? 'completed' : ''}`;
            card.style.borderLeft = `4px solid ${h.color || '#4CAF50'}`;
            card.innerHTML = `
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
                        <div class="streak-counter"><span>🔥</span><span>${stats?.streak || 0} дн.</span></div>
                        <div class="completion-rate">${stats?.completionRate || 0}% выполнено</div>
                    </div>
                </div>
            `;
            container.appendChild(card);
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
        const el = this.elements['ai-credits'];
        if (!el) return;
        const usage = this.aiCoach.getUsageStats();
        el.textContent = `${usage.remainingToday} запросов осталось`;
    }

    _updateDailyProgress() {
        const fill = this.elements['daily-progress-fill'];
        const text = this.elements['daily-progress-text'];
        const habits = this.habitManager.getTodayHabits();
        if (!fill || !text) return;

        if (!habits.length) {
            fill.style.width = '0%';
            text.textContent = '0% выполнено';
            return;
        }
        const completed = habits.filter(h => this.habitManager.isHabitCompletedToday(h.id)).length;
        const percent = Math.round((completed / habits.length) * 100);
        fill.style.width = `${percent}%`;
        text.textContent = `${percent}% выполнено`;
    }

    openAddHabitModal() {
        const modal = this.elements['add-habit-modal'];
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        // сброс полей
        this._resetAddHabitForm();
        // открываем вкладку вручную
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
        const name = this.elements['habit-name'];
        const desc = this.elements['habit-description'];
        const aiDesc = this.elements['ai-habit-description'];
        if (name) name.value = '';
        if (desc) desc.value = '';
        if (aiDesc) aiDesc.value = '';
        document.querySelectorAll('.color-option').forEach((o, i) => {
            o.classList.toggle('selected', i === 0);
        });
        document.querySelectorAll('.frequency-btn').forEach((b, i) => {
            b.classList.toggle('active', i === 0);
        });
        const aiSug = this.elements['ai-suggestion'];
        if (aiSug) aiSug.style.display = 'none';
    }

    async generateHabitWithAI() {
        const descEl = this.elements['ai-habit-description'];
        if (!descEl) return;
        const text = descEl.value.trim();
        if (!text) {
            this.showNotification('Введите описание привычки для генерации');
            return;
        }

        const btn = this.elements['generate-with-ai'];
        const spinner = this.elements['ai-loading-spinner'];
        const generateText = document.getElementById('generate-text');

        if (btn) btn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (generateText) generateText.textContent = 'Генерация...';

        try {
            const suggestion = await this.aiCoach.generateHabit(text);
            // suggestion может быть объектом или строкой (mock)
            this.displayAISuggestion(suggestion);
        } catch (err) {
            if (err.message === 'DAILY_LIMIT_REACHED') {
                this.showNotification('Достигнут дневной лимит AI запросов');
            } else {
                console.error('generateHabitWithAI error', err);
                this.showNotification('Ошибка генерации. Попробуйте позже');
            }
        } finally {
            if (btn) btn.disabled = false;
            if (spinner) spinner.style.display = 'none';
            if (generateText) generateText.textContent = 'Сгенерировать с AI';
        }
    }

    displayAISuggestion(suggestion) {
        const el = this.elements['ai-suggestion'];
        if (!el || !suggestion) return;
        const name = document.getElementById('suggestion-name');
        const desc = document.getElementById('suggestion-description');
        const color = document.getElementById('suggestion-color');
        const freq = document.getElementById('suggestion-frequency');

        name.textContent = suggestion.name || 'Предложение';
        desc.textContent = suggestion.description || '';
        if (color) {
            color.style.backgroundColor = suggestion.color || '#4CAF50';
        }
        if (freq) {
            freq.textContent = this._frequencyText(suggestion.frequency);
        }
        el.style.display = 'block';
        this.currentAISuggestion = suggestion;
    }

    useAISuggestion() {
        if (!this.currentAISuggestion) return;
        // переключаем на ручной таб и заполняем поля
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === 'manual'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'manual-tab'));

        const nameEl = this.elements['habit-name'];
        const descEl = this.elements['habit-description'];

        if (nameEl) nameEl.value = this.currentAISuggestion.name || '';
        if (descEl) descEl.value = this.currentAISuggestion.description || '';

        // color
        document.querySelectorAll('.color-option').forEach(opt => {
            if (opt.getAttribute('data-color') === this.currentAISuggestion.color) {
                opt.classList.add('selected');
            } else opt.classList.remove('selected');
        });

        // frequency
        document.querySelectorAll('.frequency-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-frequency') === this.currentAISuggestion.frequency);
        });

        this.showNotification('AI предложение применено');
    }

    saveHabit() {
        const nameEl = this.elements['habit-name'];
        const descEl = this.elements['habit-description'];
        const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color') || '#4CAF50';
        const selectedFrequency = document.querySelector('.frequency-btn.active')?.getAttribute('data-frequency') || 'daily';

        const name = nameEl?.value?.trim();
        const description = descEl?.value?.trim() || '';

        if (!name) {
            this.showNotification('Введите название привычки');
            return;
        }

        try {
            this.habitManager.createHabit({
                name,
                description,
                color: selectedColor,
                frequency: selectedFrequency
            });
            this.closeModals();
            this.render();
            this.showNotification('Привычка создана! 🎉');
        } catch (err) {
            this.showNotification(err.message || 'Ошибка при сохранении привычки');
        }
    }

    async sendAIMessage() {
        const input = this.elements['ai-input'];
        const responseDiv = this.elements['ai-response'];
        const sendBtn = this.elements['ai-send-btn'];

        if (!input || !responseDiv) return;
        const message = input.value.trim();
        if (!message) return;

        // UI: загрузка
        responseDiv.innerHTML = '<div class="loading-spinner" style="margin: 20px auto;"></div>';
        input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;

        try {
            const context = {
                habits: this.habitManager.habits.length,
                streak: this.habitManager.getOverallStats().longestStreak
            };
            const answer = await this.aiCoach.getAdvice(message, context);
            responseDiv.innerHTML = `
                <div style="padding: var(--space-sm);">
                    <div style="font-weight: 500; margin-bottom: var(--space-sm); color: var(--primary);">AI Коуч:</div>
                    <div>${this._escape(answer)}</div>
                </div>
            `;
            input.value = '';
            this._renderAIStatus();
        } catch (err) {
            if (err.message === 'DAILY_LIMIT_REACHED') {
                responseDiv.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px">Достигнут дневной лимит запросов. Попробуйте завтра.</div>';
            } else {
                responseDiv.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px">Ошибка соединения с AI. Попробуйте позже.</div>';
            }
        } finally {
            input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            input.focus();
        }
    }

    // Открываем подробную статистику
    openStatsModal() {
        const modal = this.elements['stats-modal'];
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        this.renderDetailedStats();
    }

    renderDetailedStats() {
        const calendarView = this.elements['calendar-view'];
        const habitsStats = this.elements['habits-stats'];
        if (!calendarView || !habitsStats) return;

        calendarView.innerHTML = this._renderCalendarHTML();
        const html = this.habitManager.habits.map(h => {
            const stats = this.habitManager.getHabitStats(h.id) || {};
            const streak = stats.streak || 0;
            const rate = stats.completionRate || 0;
            return `
                <div class="habit-stat-item" style="border-left: 4px solid ${h.color}; padding-left: 12px; margin-bottom: 16px;">
                    <div style="font-weight:600; margin-bottom:4px;">${this._escape(h.name)}</div>
                    <div style="font-size:12px; color:var(--text-secondary);">
                        Стрик: ${streak} дн. • Выполнение: ${rate}%
                    </div>
                </div>
            `;
        }).join('');
        habitsStats.innerHTML = html;
    }

    _renderCalendarHTML() {
        const today = new Date();
        const monthYear = today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

        let html = `<div style="font-weight:600; margin-bottom:16px;">${monthYear}</div><div class="calendar-grid">`;
        dayNames.forEach(d => html += `<div style="text-align:center; font-size:12px; color:var(--text-secondary); padding:4px;">${d}</div>`);

        // firstDay.getDay(): 0 (Sun) .. 6 (Sat) — нам нужен смещённый для Пн..Вс
        const shift = (firstDay.getDay() + 6) % 7; // 0 -> Mon index 0
        for (let i = 0; i < shift; i++) html += '<div></div>';

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day);
            const key = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === new Date().toDateString();
            const has = this.habitManager.habits.some(h => h.completedDates.includes(key));
            html += `<div class="calendar-day ${has ? 'completed' : ''} ${isToday ? 'today' : ''}">${day}</div>`;
        }
        html += '</div>';
        return html;
    }

    // Отображение статистики отдельной привычки (быстрое окно)
    showHabitStats(habit) {
        const stats = this.habitManager.getHabitStats(habit.id) || {};
        const modalHtml = `
            <div style="padding:16px">
                <div style="font-weight:700; margin-bottom:8px;">${this._escape(habit.name)}</div>
                <div style="color:var(--text-secondary); margin-bottom:8px;">${this._escape(habit.description || '')}</div>
                <div style="font-size:13px; color:var(--text-secondary);">Стрик: ${stats.streak || 0} дн. • Выполнений: ${stats.totalCompletions || 0} • ${stats.completionRate || 0}%</div>
            </div>
        `;
        // временное модальное уведомление
        this.showNotification(modalHtml, { rawHtml: true, duration: 4000 });
    }

    deleteHabit(habitId) {
        if (!confirm('Удалить эту привычку? Это действие нельзя отменить.')) return;
        const ok = this.habitManager.deleteHabit(habitId);
        if (ok) {
            this.render();
            this.showNotification('Привычка удалена');
        } else {
            this.showNotification('Не удалось удалить привычку');
        }
    }

    toggleHabitCompletion(habitId) {
        const completed = this.habitManager.toggleHabitCompletion(habitId);
        if (completed) this._celebrate();
        this.render();
    }

    // Небольшая анимация иконки при выполнении
    _celebrate() {
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed; left:50%; top:40%; transform:translate(-50%,-50%); font-size:48px; z-index:1001; pointer-events:none;
            animation: pop 900ms ease-out;
        `;
        el.textContent = '🎉';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    // Показываем уведомление в правом верхнем углу
    showNotification(message, { duration = 2500, rawHtml = false } = {}) {
        const n = document.createElement('div');
        n.className = 'app-notification';
        n.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 2000; padding: 12px 16px; border-radius: 12px;
            background: var(--bg-secondary); color: var(--text-primary); box-shadow: var(--shadow-lg);
        `;
        if (rawHtml) n.innerHTML = message;
        else n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.style.opacity = '0', duration - 200);
        setTimeout(() => n.remove(), duration);
    }

    _checkEmptyState() {
        const empty = this.elements['empty-state'];
        const main = this.elements['main-content'];
        if (!empty || !main) return;
        if (!this.habitManager.habits.length) {
            empty.classList.add('active');
            main.style.display = 'none';
        } else {
            empty.classList.remove('active');
            main.style.display = 'block';
        }
    }

    // Утилиты
    _safeSetText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    _escape(text) {
        if (text == null) return '';
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    _frequencyText(key) {
        switch (key) {
            case 'daily': return 'Ежедневно';
            case 'weekdays': return 'По будням';
            case 'weekly': return 'По выходным';
            default: return key;
        }
    }
}

export default UIEngine;