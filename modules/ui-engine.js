// UI Engine
class UIEngine {
    constructor(habitManager, aiCoach) {
        this.habitManager = habitManager;
        this.aiCoach = aiCoach;
        this.currentTheme = this.loadTheme();
        this.currentAISuggestion = null;
        console.log('🎨 UIEngine initialized');
    }

    init() {
        console.log('🚀 Initializing UI...');
        this.applyTheme();
        this.setupEventListeners();
        this.render();
        console.log('✅ UI initialized successfully');
    }

    loadTheme() {
        const saved = new StorageManager().getItem('theme');
        const theme = saved || CONFIG.DEFAULT_THEME;
        console.log('🎨 Theme loaded:', theme);
        return theme;
    }

    saveTheme(theme) {
        this.currentTheme = theme;
        new StorageManager().setItem('theme', theme);
        console.log('💾 Theme saved:', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log('🌙 Toggling theme to:', newTheme);
        this.saveTheme(newTheme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
        console.log('🎨 Theme applied:', this.currentTheme);
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            console.log('🎨 Theme button clicked');
            this.toggleTheme();
        });
        
        // Add habit buttons
        document.getElementById('add-habit-btn').addEventListener('click', () => {
            console.log('➕ Add habit button clicked');
            this.openAddHabitModal();
        });
        
        document.getElementById('create-first-habit').addEventListener('click', () => {
            console.log('🚀 Create first habit button clicked');
            this.openAddHabitModal();
        });
        
        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            console.log('❌ Close modal clicked');
            this.closeModals();
        });
        
        document.getElementById('cancel-habit').addEventListener('click', () => {
            console.log('❌ Cancel habit clicked');
            this.closeModals();
        });
        
        document.getElementById('close-stats').addEventListener('click', () => {
            console.log('❌ Close stats clicked');
            this.closeModals();
        });
        
        document.getElementById('save-habit').addEventListener('click', () => {
            console.log('💾 Save habit clicked');
            this.saveHabit();
        });
        
        // AI generation
        document.getElementById('generate-with-ai').addEventListener('click', () => {
            console.log('🤖 Generate with AI clicked');
            this.generateHabitWithAI();
        });
        
        document.getElementById('use-suggestion').addEventListener('click', () => {
            console.log('✅ Use suggestion clicked');
            this.useAISuggestion();
        });
        
        // AI chat
        document.getElementById('ai-send-btn').addEventListener('click', () => {
            console.log('➤ AI send clicked');
            this.sendAIMessage();
        });
        
        document.getElementById('ai-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('↩️ AI input enter pressed');
                this.sendAIMessage();
            }
        });
        
        // Stats view
        document.getElementById('view-all-stats').addEventListener('click', () => {
            console.log('📊 View all stats clicked');
            this.openStatsModal();
        });
        
        // Modal overlay close
        document.getElementById('add-habit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-habit-modal') {
                console.log('🎯 Modal overlay clicked');
                this.closeModals();
            }
        });
        
        document.getElementById('stats-modal').addEventListener('click', (e) => {
            if (e.target.id === 'stats-modal') {
                console.log('🎯 Stats modal overlay clicked');
                this.closeModals();
            }
        });
        
        // Tabs
        this.setupTabs();
        
        // Color picker and frequency selector
        this.setupFormControls();
        
        console.log('✅ Event listeners setup complete');
    }

    setupTabs() {
        console.log('📑 Setting up tabs...');
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                console.log('📑 Tab clicked:', tabName);
                this.switchTab(tabName);
            });
        });
    }

    setupFormControls() {
        console.log('🎛️ Setting up form controls...');
        
        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                console.log('🎨 Color selected:', e.target.getAttribute('data-color'));
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.classList.add('selected');
            });
        });
        
        // Frequency selector
        document.querySelectorAll('.frequency-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const frequency = e.target.getAttribute('data-frequency');
                console.log('📅 Frequency selected:', frequency);
                document.querySelectorAll('.frequency-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
            });
        });
    }

    switchTab(tabName) {
        console.log('🔄 Switching to tab:', tabName);
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    render() {
        console.log('🔄 Rendering UI...');
        this.renderTodayDate();
        this.renderHabits();
        this.renderStats();
        this.renderAIStatus();
        this.checkEmptyState();
        console.log('✅ UI rendered');
    }

    renderTodayDate() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = today.toLocaleDateString('ru-RU', options);
        document.getElementById('today-date').textContent = dateString;
        console.log('📅 Today date rendered:', dateString);
    }

    renderHabits() {
        const container = document.getElementById('today-habits');
        const habits = this.habitManager.getTodayHabits();
        
        console.log('📋 Rendering habits:', habits.length);
        container.innerHTML = '';

        if (habits.length === 0) {
            container.innerHTML = '<div class="text-center" style="color: var(--text-secondary); padding: var(--space-xl);">Нет привычек на сегодня</div>';
            this.updateDailyProgress();
            return;
        }

        habits.forEach(habit => {
            const habitElement = this.createHabitElement(habit);
            container.appendChild(habitElement);
        });

        this.updateDailyProgress();
    }

    createHabitElement(habit) {
        const div = document.createElement('div');
        const isCompleted = this.habitManager.isHabitCompletedToday(habit.id);
        div.className = `habit-card ${isCompleted ? 'completed' : ''}`;
        div.style.borderLeft = `4px solid ${habit.color}`;

        const stats = this.habitManager.getHabitStats(habit.id);

        div.innerHTML = `
            <div class="habit-header">
                <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                <div class="habit-actions">
                    <button class="icon-btn stats-btn" data-habit-id="${habit.id}">📊</button>
                    <button class="icon-btn delete-btn" data-habit-id="${habit.id}">🗑️</button>
                </div>
            </div>
            <div class="habit-description">${this.escapeHtml(habit.description)}</div>
            <div class="habit-progress">
                <div class="habit-checkbox ${isCompleted ? 'checked' : ''}" data-habit-id="${habit.id}"></div>
                <div class="habit-stats">
                    <div class="streak-counter">
                        <span>🔥</span>
                        <span>${stats.streak} дн.</span>
                    </div>
                    <div class="completion-rate">${stats.completionRate}% выполнено</div>
                </div>
            </div>
        `;

        // Add event listeners
        const checkbox = div.querySelector('.habit-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('☑️ Habit checkbox clicked:', habit.id);
            this.toggleHabitCompletion(habit.id);
        });

        const statsBtn = div.querySelector('.stats-btn');
        statsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('📊 Habit stats clicked:', habit.id);
            this.showHabitStats(habit);
        });

        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🗑️ Delete habit clicked:', habit.id);
            this.deleteHabit(habit.id);
        });

        console.log('✅ Habit element created:', habit.id);
        return div;
    }

    toggleHabitCompletion(habitId) {
        console.log('🔄 Toggling habit completion:', habitId);
        const completed = this.habitManager.toggleHabitCompletion(habitId);
        
        if (completed) {
            console.log('🎉 Habit completed, showing celebration');
            this.showCelebration();
        }
        
        this.render();
    }

    showCelebration() {
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            z-index: 1001;
            pointer-events: none;
            animation: celebrate 1s ease-out;
        `;
        celebration.textContent = '🎉';
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 1000);
    }

    deleteHabit(habitId) {
        if (confirm('Удалить эту привычку? Это действие нельзя отменить.')) {
            console.log('🗑️ Deleting habit:', habitId);
            this.habitManager.deleteHabit(habitId);
            this.render();
            this.showNotification('Привычка удалена');
        }
    }

    renderStats() {
        const stats = this.habitManager.getOverallStats();
        document.getElementById('total-habits').textContent = stats.totalHabits;
        document.getElementById('completion-rate').textContent = stats.overallCompletionRate + '%';
        document.getElementById('current-streak').textContent = stats.longestStreak;
        console.log('📊 Stats rendered');
    }

    updateDailyProgress() {
        const habits = this.habitManager.getTodayHabits();
        if (habits.length === 0) {
            document.getElementById('daily-progress-fill').style.width = '0%';
            document.getElementById('daily-progress-text').textContent = '0% выполнено';
            return;
        }

        const completed = habits.filter(habit => 
            this.habitManager.isHabitCompletedToday(habit.id)
        ).length;

        const percentage = Math.round((completed / habits.length) * 100);
        document.getElementById('daily-progress-fill').style.width = percentage + '%';
        document.getElementById('daily-progress-text').textContent = percentage + '% выполнено';
        console.log('📈 Daily progress updated:', percentage + '%');
    }

    renderAIStatus() {
        const usage = this.aiCoach.getUsageStats();
        document.getElementById('ai-credits').textContent = `${usage.remainingToday} запросов осталось`;
        console.log('🤖 AI status rendered');
    }

    checkEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const mainContent = document.getElementById('main-content');
        
        if (this.habitManager.habits.length === 0) {
            emptyState.classList.add('active');
            mainContent.style.display = 'none';
            console.log('🌟 Empty state shown');
        } else {
            emptyState.classList.remove('active');
            mainContent.style.display = 'block';
            console.log('📱 Main content shown');
        }
    }

    openAddHabitModal() {
        console.log('📝 Opening add habit modal');
        document.getElementById('add-habit-modal').classList.add('active');
        this.switchTab('manual');
        document.getElementById('habit-name').value = '';
        document.getElementById('habit-description').value = '';
        document.getElementById('ai-habit-description').value = '';
        document.getElementById('ai-suggestion').style.display = 'none';
        
        // Reset form controls
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.querySelector('.color-option').classList.add('selected');
        
        document.querySelectorAll('.frequency-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.frequency-btn').classList.add('active');
    }

    closeModals() {
        console.log('🔒 Closing all modals');
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    async generateHabitWithAI() {
        const description = document.getElementById('ai-habit-description').value.trim();
        console.log('🤖 Generating habit with AI description:', description);
        
        if (!description) {
            this.showNotification('Введите описание привычки');
            return;
        }

        const generateBtn = document.getElementById('generate-with-ai');
        const spinner = document.getElementById('ai-loading-spinner');
        const generateText = document.getElementById('generate-text');

        generateBtn.disabled = true;
        spinner.style.display = 'inline-block';
        generateText.textContent = 'Генерация...';

        try {
            const habitSuggestion = await this.aiCoach.generateHabit(description);
            this.displayAISuggestion(habitSuggestion);
        } catch (error) {
            if (error.message === 'DAILY_LIMIT_REACHED') {
                this.showNotification('Достигнут дневной лимит AI запросов');
            } else {
                this.showNotification('Ошибка генерации. Попробуйте позже.');
            }
        } finally {
            generateBtn.disabled = false;
            spinner.style.display = 'none';
            generateText.textContent = 'Сгенерировать с AI';
        }
    }

    displayAISuggestion(suggestion) {
        console.log('💡 Displaying AI suggestion:', suggestion);
        document.getElementById('suggestion-name').textContent = suggestion.name;
        document.getElementById('suggestion-description').textContent = suggestion.description;
        
        const colorBadge = document.getElementById('suggestion-color');
        colorBadge.style.backgroundColor = suggestion.color;
        colorBadge.textContent = this.getColorName(suggestion.color);
        
        document.getElementById('suggestion-frequency').textContent = this.getFrequencyText(suggestion.frequency);
        document.getElementById('ai-suggestion').style.display = 'block';
        
        this.currentAISuggestion = suggestion;
    }

    useAISuggestion() {
        if (!this.currentAISuggestion) return;

        console.log('✅ Using AI suggestion:', this.currentAISuggestion);
        this.switchTab('manual');
        document.getElementById('habit-name').value = this.currentAISuggestion.name;
        document.getElementById('habit-description').value = this.currentAISuggestion.description;
        
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.getAttribute('data-color') === this.currentAISuggestion.color) {
                opt.classList.add('selected');
            }
        });
        
        document.querySelectorAll('.frequency-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-frequency') === this.currentAISuggestion.frequency) {
                btn.classList.add('active');
            }
        });

        this.showNotification('AI предложение применено');
    }

    saveHabit() {
        const name = document.getElementById('habit-name').value.trim();
        const description = document.getElementById('habit-description').value.trim();
        const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color');
        const selectedFrequency = document.querySelector('.frequency-btn.active')?.getAttribute('data-frequency');

        console.log('💾 Saving habit:', { name, description, selectedColor, selectedFrequency });

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
        } catch (error) {
            this.showNotification(error.message);
        }
    }

    async sendAIMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        console.log('🤖 Sending AI message:', message);
        
        if (!message) return;

        const responseDiv = document.getElementById('ai-response');
        const sendBtn = document.getElementById('ai-send-btn');

        responseDiv.innerHTML = '<div class="loading-spinner" style="margin: 20px auto;"></div>';
        input.disabled = true;
        sendBtn.disabled = true;

        try {
            const context = {
                habits: this.habitManager.habits.length,
                streak: this.habitManager.getOverallStats().longestStreak
            };

            const response = await this.aiCoach.getAdvice(message, context);
            
            responseDiv.innerHTML = `
                <div style="padding: var(--space-sm);">
                    <div style="font-weight: 500; margin-bottom: var(--space-sm); color: var(--primary);">AI Коуч:</div>
                    <div>${this.escapeHtml(response)}</div>
                </div>
            `;
            
            input.value = '';
            this.renderAIStatus();
        } catch (error) {
            if (error.message === 'DAILY_LIMIT_REACHED') {
                responseDiv.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Достигнут дневной лимит запросов. Попробуйте завтра!</div>';
            } else {
                responseDiv.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Ошибка соединения с AI. Попробуйте позже.</div>';
            }
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    openStatsModal() {
        console.log('📊 Opening stats modal');
        document.getElementById('stats-modal').classList.add('active');
        this.renderDetailedStats();
    }

    renderDetailedStats() {
        const stats = this.habitManager.getOverallStats();
        const calendarView = document.getElementById('calendar-view');
        const habitsStats = document.getElementById('habits-stats');
        
        calendarView.innerHTML = this.renderCalendar();
        habitsStats.innerHTML = this.habitManager.habits.map(habit => {
            const habitStats = this.habitManager.getHabitStats(habit.id);
            return `
                <div class="habit-stat-item" style="border-left: 4px solid ${habit.color}; padding-left: 12px; margin-bottom: 16px;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${habit.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        Стрик: ${habitStats.streak} дн. • Выполнение: ${habitStats.completionRate}%
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('📈 Detailed stats rendered');
    }

    renderCalendar() {
        const today = new Date();
        let calendarHTML = `
            <div style="font-weight: 600; margin-bottom: 16px;">
                ${today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <div class="calendar-grid">
        `;
        
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayNames.forEach(day => {
            calendarHTML += `<div style="text-align: center; font-size: 12px; color: var(--text-secondary); padding: 4px;">${day}</div>`;
        });
        
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarHTML += '<div></div>';
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day);
            const dateKey = this.habitManager.getDateKey(date);
            const isToday = date.toDateString() === today.toDateString();
            
            const hasCompletion = this.habitManager.habits.some(habit => 
                habit.completedDates.includes(dateKey)
            );
            
            calendarHTML += `
                <div class="calendar-day ${hasCompletion ? 'completed' : ''} ${isToday ? 'today' : ''}">
                    ${day}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        return calendarHTML;
    }

    showNotification(message) {
        console.log('💬 Showing notification:', message);
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius-md);
            z-index: 1001;
            max-width: 300px;
            box-shadow: var(--shadow-lg);
            font-weight: 500;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getColorName(color) {
        const colors = {
            '#4CAF50': 'Зеленый',
            '#2196F3': 'Синий', 
            '#FF9800': 'Оранжевый',
            '#9C27B0': 'Фиолетовый',
            '#F44336': 'Красный'
        };
        return colors[color] || 'Зеленый';
    }

    getFrequencyText(frequency) {
        const frequencies = {
            'daily': 'Ежедневно',
            'weekdays': 'По будням',
            'weekly': 'По выходным'
        };
        return frequencies[frequency] || 'Ежедневно';
    }
}

window.UIEngine = UIEngine;
console.log('✅ UIEngine module loaded');