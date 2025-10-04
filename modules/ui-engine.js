export default class UIEngine {
  constructor(habitManager, aiCoach) {
    this.hm = habitManager;
    this.ai = aiCoach;
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  cacheDOM() {
    this.addBtn = document.getElementById("add-habit-btn");
    this.modal = document.getElementById("add-habit-modal");
    this.closeBtn = document.getElementById("close-modal");
    this.saveBtn = document.getElementById("save-habit");
    this.habitName = document.getElementById("habit-name");
    this.habitDesc = document.getElementById("habit-description");
    this.container = document.getElementById("today-habits");
    this.aiInput = document.getElementById("ai-input");
    this.aiSend = document.getElementById("ai-send-btn");
    this.aiResponse = document.getElementById("ai-response");
  }

  bindEvents() {
    this.addBtn.onclick = () => this.openModal();
    this.closeBtn.onclick = () => this.closeModal();
    this.saveBtn.onclick = () => this.saveHabit();
    this.aiSend.onclick = () => this.askAI();
  }

  openModal() {
    this.modal.classList.add("active");
  }

  closeModal() {
    this.modal.classList.remove("active");
  }

  saveHabit() {
    const name = this.habitName.value.trim();
    if (!name) return alert("Введите название привычки");
    this.hm.addHabit({ name, description: this.habitDesc.value.trim(), color: "#4CAF50" });
    this.render();
    this.closeModal();
  }

  render() {
    this.container.innerHTML = "";
    const habits = this.hm.getAll();
    if (!habits.length) {
      this.container.innerHTML = "<p style='text-align:center;'>Нет привычек</p>";
      return;
    }
    habits.forEach((h) => {
      const done = h.completedDates.includes(new Date().toISOString().split("T")[0]);
      const el = document.createElement("div");
      el.className = `habit-card ${done ? "completed" : ""}`;
      el.innerHTML = `
        <div class="habit-header">
          <span>${h.name}</span>
          <button class="toggle" data-id="${h.id}">${done ? "✅" : "⬜"}</button>
        </div>
        <p>${h.description}</p>`;
      el.querySelector(".toggle").onclick = () => {
        this.hm.toggleCompletion(h.id);
        this.render();
      };
      this.container.appendChild(el);
    });
  }

  async askAI() {
    const text = this.aiInput.value.trim();
    if (!text) return;
    this.aiResponse.textContent = "⌛ Думаю...";
    const msg = await this.ai.getAdvice(text);
    this.aiResponse.textContent = msg;
  }
}