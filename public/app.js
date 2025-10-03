import { renderTodayHabits } from "./habit-tracker.js";
import { getAICoachAdvice } from "./ai-coach.js";
import { setupUI } from "./ui.js";

window.habit = {
  toggleHabit: (id) => {
    import("./habit-tracker.js").then(module => {
      module.toggleHabit(id);
    });
  }
};

export function initApp() {
  setupUI();
  renderTodayHabits();
  getAICoachAdvice();
}