import { setupUI, renderHabits } from "./ui.js";
import { loadData } from "./utils.js";

export function initApp() {
  setupUI();
  renderHabits();

  // Проверка админа (условная)
  const initData = Telegram.WebApp.initDataUnsafe;
  const isAdmin = initData?.user?.id === parseInt(process.env.ADMIN_USER_ID || "0"); // ← В Vercel
  if (isAdmin) {
    const title = document.getElementById("app-title");
    title.insertAdjacentHTML("afterend", `<button id="admin-btn">Admin</button>`);
    document.getElementById("admin-btn").addEventListener("click", () => {
      import("./admin.js").then(mod => mod.showAdminPanel());
    });
  }
}