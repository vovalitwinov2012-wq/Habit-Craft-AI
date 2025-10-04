// modules/ui-engine.js — интерфейс HabitCraft AI
import { CONFIG } from '../config.js';

export default class UIEngine {
    constructor(habits, aiCoach) {
        this.habitManager = habits;
        this.aiCoach = aiCoach;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderHabits();
    }

    cacheDOM() {
        this.addBtn = document.getElementById('add-habit-btn');
        this.saveBtn = document.getElementById('save-habit');
        this.modal = document.getElementById('add-habit-modal');
        this.closeBtn = document.getElementById('close-modal');
        this.habitName = document.getElementById('habit-name');
        this.habitDesc = document.getElementById('habit-description');
        this.habitsContainer = document.getElementById('today-habits');
        this.aiInput = document.getElementById('ai-input');
        this.aiSend = document.getElementById('ai-send-btn');
        this.aiResponse = document.getElementById('ai-response');
    }

    bindEvents() {
        this.addBtn?.addEventListener('click', () => this.openModal());
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        this.saveBtn?.addEventListener('click', () => this.saveHabit());
        this.aiSend?.addEventListener('click', () => this.askAI());
    }

    openModal() {
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    saveHabit() {
        const name = this.habitName.value.trim();
        if (!name) return alert('Введите название привычки');

        this.habitManager.addHabit({ name, description: this.habitDesc.value.trim(), color: '#4CAF50' });
        this.renderHabits();
        this.closeModal();
    }

    renderHabits() {
        this.habitsContainer.innerHTML = '';
        const habits = this.habitManager.getTodayHabits();
        if (!habits.length) {
            this.habitsContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Нет привычек</p>';
            return;
        }
        habits.forEach(h => {
            const done = h.completedDates.includes(new Date().toISOString().split('T')[0]);
            const el = document.createElement('div');
            el.className = `habit-card ${done ? 'completed' : ''}`;
            el.innerHTML = `
                <div class="habit-header">
                    <span>${h.name}</span>
                    <button data-id="${h.id}" class="icon-btn toggle">${done ? '✅' : '⬜'}</button>
                </div>
                <p class="habit-description">${h.description}</p>
            `;
            el.querySelector('.toggle').addEventListener('click', () => {
                this.habitManager.toggleCompletion(h.id);
                this.renderHabits();
            });
            this.habitsContainer.appendChild(el);
        });
    }

    async askAI() {
        const text = this.aiInput.value.trim();
        if (!text) return;
        this.aiResponse.innerHTML = '⌛ Думаю...';
        const advice = await this.aiCoach.getAdvice(text);
        this.aiResponse.innerHTML = `<p>${advice}</p>`;
    }
}