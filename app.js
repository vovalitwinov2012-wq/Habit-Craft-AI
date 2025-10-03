class HabitCraftApp {
    constructor() {
        this.habitManager = new HabitManager();
        this.aiCoach = new AICoach();
        this.currentLanguage = CONFIG.LANGUAGE;
        this.init();
    }

    init() {
        this.setupTelegram();
        this.loadUserPreferences();
        this.setupEventListeners();
        this.render();
    }

    setupTelegram() {
        if (window.Telegram?.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            
            // Set theme based on Telegram
            const theme = Telegram.WebApp.colorScheme;
            this.setTheme(theme);
        }
    }

    loadUserPreferences() {
        const savedLanguage = Utils.loadData('language');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
            this.updateTranslations();
        }

        const savedTheme = Utils.loadData('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Utils.saveData('theme', theme);
    }

    setupEventListeners() {
        // Add habit button
        document.getElementById('add-habit-btn').addEventListener('click', () => this.openAddHabitModal());
        document.getElementById('first-habit-btn').addEventListener('click', () => this.openAddHabitModal());

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => this.closeModals());
        document.getElementById('cancel-habit').addEventListener('click', () => this.closeModals());
        document.getElementById('close-stats').addEventListener('click', () => this.closeModals());
        document.getElementById('save-habit').addEventListener('click', () => this.saveHabit());

        // Language switch
        document.getElementById('lang-switch').addEventListener('click', () => this.toggleLanguage());

        // AI Coach
        document.getElementById('ai-send-btn').addEventListener('click', () => this.sendAIMessage());
        document.getElementById('ai-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendAIMessage();
        });

        // AI generation toggle
        document.getElementById('habit-ai-generate').addEventListener('change', (e) => {
            this.toggleAIGeneration(e.target.checked);
        });

        // Modal overlay close
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') this.closeModals();
        });
        document.getElementById('stats-modal').addEventListener('click', (e) => {
            if (e.target.id === 'stats-modal') this.closeModals();
        });
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ru' ? 'en' : 'ru';
        Utils.saveData('language', this.currentLanguage);
        this.updateTranslations();
        this.render();
    }

    updateTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (TRANSLATIONS[this.currentLanguage][key]) {
                element.textContent = TRANSLATIONS[this.currentLanguage][key];
            }
        });

        // Update placeholders
        const placeholders = document.querySelectorAll('[data-i18n-ph]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-ph');
            if (TRANSLATIONS[this.currentLanguage][key]) {
                element.placeholder = TRANSLATIONS[this.currentLanguage][key];
            }
        });

        // Update language switch button
        document.getElementById('lang-switch').textContent = 
            TRANSLATIONS[this.currentLanguage]['language'];
    }

    render() {
        this.renderHabits();
        this.renderEmptyState();
        this.updateAICounter();
    }

    renderHabits() {
        const container = document.getElementById('habits-list');
        const habits = this.habitManager.getHabits();
        
        container.innerHTML = '';

        habits.forEach(habit => {
            const habitElement = this.createHabitElement(habit);
            container.appendChild(habitElement);
        });
    }

    createHabitElement(habit) {
        const div = document.createElement('div');
        div.className = 'habit-card';
        div.style.borderLeft = `4px solid ${habit.color}`;

        const dates = Utils.getWeekDates();
        const progress = this.habitManager.getHabitProgressForDates(habit.id, dates);
        const todayKey = Utils.getTodayKey();
        const completionRate = this.habitManager.getCompletionRate(habit.id);

        div.innerHTML = `
            <div class="habit-header">
                <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                <div class="habit-actions">
                    <button class="icon-btn stats-btn" data-habit-id="${habit.id}">📊</button>
                    <button class="icon-btn delete-btn" data-habit-id="${habit.id}">🗑️</button>
                </div>
            </div>
            <div class="habit-motivation">${this.escapeHtml(habit.motivation)}</div>
            <div class="progress-section">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionRate}%; background: ${habit.color}"></div>
                </div>
                <div class="calendar-days">
                    ${dates.map(date => {
                        const dateKey = Utils.getDateKey(date);
                        const isToday = dateKey === todayKey;
                        const isCompleted = progress[dateKey];
                        const isFuture = date > new Date();
                        
                        return `
                            <div class="calendar-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} 
                                ${isFuture ? 'future' : ''}" 
                                data-habit-id="${habit.id}" 
                                data-date="${dateKey}">
                                ${Utils.formatDate(date)}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        div.querySelector('.stats-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showStatsModal(habit);
        });

        div.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteHabit(habit.id);
        });

        // Add click handlers for calendar days
        div.querySelectorAll('.calendar-day:not(.future)').forEach(day => {
            day.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleHabitCompletion(
                    day.getAttribute('data-habit-id'),
                    day.getAttribute('data-date')
                );
            });
        });

        return div;
    }

    toggleHabitCompletion(habitId, dateKey) {
        const habit = this.habitManager.habits.find(h => h.id === habitId);
        if (!habit) return;

        const currentCompletion = !!habit.progress?.[dateKey];
        const newCompletion = !currentCompletion;

        if (this.habitManager.updateHabitProgress(habitId, dateKey, newCompletion)) {
            this.render();
            Utils.showNotification(
                newCompletion ? 'Habit completed!' : 'Habit unchecked',
                newCompletion ? 'info' : 'info'
            );
        }
    }

    renderEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const mainContent = document.getElementById('main-content');
        const habits = this.habitManager.getHabits();

        if (habits.length === 0) {
            emptyState.style.display = 'block';
            mainContent.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            mainContent.style.display = 'block';
        }
    }

    openAddHabitModal() {
        document.getElementById('modal-overlay').style.display = 'flex';
        document.getElementById('habit-name').value = '';
        document.getElementById('habit-motivation').value = '';
        document.getElementById('habit-ai-generate').checked = false;
        this.toggleAIGeneration(false);
    }

    toggleAIGeneration(enabled) {
        const nameInput = document.getElementById('habit-name');
        const motivationInput = document.getElementById('habit-motivation');
        
        if (enabled) {
            nameInput.placeholder = TRANSLATIONS[this.currentLanguage]['aiThinking'];
            motivationInput.placeholder = TRANSLATIONS[this.currentLanguage]['aiThinking'];
            nameInput.disabled = true;
            motivationInput.disabled = true;
            
            // Generate habit with AI
            this.generateHabitWithAI();
        } else {
            nameInput.placeholder = TRANSLATIONS[this.currentLanguage]['habitNamePlaceholder'];
            motivationInput.placeholder = TRANSLATIONS[this.currentLanguage]['motivationPlaceholder'];
            nameInput.disabled = false;
            motivationInput.disabled = false;
        }
    }

    async generateHabitWithAI() {
        try {
            const habit = await this.aiCoach.generateHabitFromDescription('daily habit');
            document.getElementById('habit-name').value = habit.name;
            document.getElementById('habit-motivation').value = habit.motivation;
            
            // Set the color
            const colorOption = document.querySelector(`.color-option[data-color="${habit.color}"]`);
            if (colorOption) {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                colorOption.classList.add('selected');
            }
            
            Utils.showNotification(TRANSLATIONS[this.currentLanguage]['habitGenerated']);
        } catch (error) {
            Utils.showNotification(TRANSLATIONS[this.currentLanguage]['aiError'], 'error');
            document.getElementById('habit-ai-generate').checked = false;
            this.toggleAIGeneration(false);
        }
    }

    saveHabit() {
        const name = document.getElementById('habit-name').value.trim();
        const motivation = document.getElementById('habit-motivation').value.trim();
        const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color') || '#4CAF50';

        if (!name) {
            Utils.showNotification('Please enter habit name', 'error');
            return;
        }

        const result = this.habitManager.addHabit({
            name,
            motivation,
            color: selectedColor
        });

        if (result.success) {
            this.closeModals();
            this.render();
            Utils.showNotification('Habit created successfully!');
        } else {
            if (result.error === 'free_limit_reached') {
                Utils.showNotification(TRANSLATIONS[this.currentLanguage]['freeLimitReached'], 'error');
            }
        }
    }

    deleteHabit(habitId) {
        if (confirm(TRANSLATIONS[this.currentLanguage]['confirmDelete'])) {
            if (this.habitManager.deleteHabit(habitId)) {
                this.render();
                Utils.showNotification('Habit deleted');
            }
        }
    }

    showStatsModal(habit) {
        const modal = document.getElementById('stats-modal');
        const title = document.getElementById('stats-title');
        const calendar = document.getElementById('habit-calendar');
        const currentStreak = document.getElementById('current-streak');
        const completionRate = document.getElementById('completion-rate');

        title.textContent = habit.name;
        currentStreak.textContent = `${this.habitManager.getHabitStreak(habit.id)} ${this.currentLanguage === 'ru' ? 'дней' : 'days'}`;
        completionRate.textContent = `${this.habitManager.getCompletionRate(habit.id)}%`;

        // Render calendar (last 30 days)
        calendar.innerHTML = this.renderCalendar(habit);
        
        modal.style.display = 'flex';
    }

    renderCalendar(habit) {
        const dates = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
        }

        return dates.map(date => {
            const dateKey = Utils.getDateKey(date);
            const isCompleted = !!habit.progress?.[dateKey];
            
            return `
                <div class="calendar-day-small ${isCompleted ? 'completed' : ''}" 
                     title="${Utils.formatDate(date)}">
                    ${date.getDate()}
                </div>
            `;
        }).join('');
    }

    closeModals() {
        document.getElementById('modal-overlay').style.display = 'none';
        document.getElementById('stats-modal').style.display = 'none';
    }

    async sendAIMessage() {
        const input = document.getElementById('ai-input');
        const responseDiv = document.getElementById('ai-response');
        const message = input.value.trim();

        if (!message) return;

        if (!this.aiCoach.canMakeRequest()) {
            Utils.showNotification(TRANSLATIONS[this.currentLanguage]['dailyLimitReached'], 'error');
            return;
        }

        input.disabled = true;
        responseDiv.textContent = TRANSLATIONS[this.currentLanguage]['aiThinking'];

        try {
            const response = await this.aiCoach.getAICoachAdvice(message);
            responseDiv.textContent = response;
            input.value = '';
            this.updateAICounter();
        } catch (error) {
            responseDiv.textContent = TRANSLATIONS[this.currentLanguage]['aiError'];
        } finally {
            input.disabled = false;
        }
    }

    updateAICounter() {
        const remaining = this.aiCoach.getRemainingRequests();
        const aiSection = document.getElementById('ai-section');
        const title = aiSection.querySelector('h3');
        
        title.textContent = `${TRANSLATIONS[this.currentLanguage]['aiCoach']} (${remaining}/${CONFIG.AI_REQUESTS_PER_DAY})`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Color picker initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.style.backgroundColor = option.getAttribute('data-color');
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // Initialize the app
    window.app = new HabitCraftApp();
});