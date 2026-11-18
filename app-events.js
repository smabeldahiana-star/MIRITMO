document.getElementById("today-label").textContent = formatDate(today);
document.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", () => navigate(link.dataset.view)));
document.querySelectorAll(".breadcrumb-link").forEach((link) => link.addEventListener("click", () => navigate(link.dataset.view)));
document.getElementById("top-add").addEventListener("click", () => openModal(["habits", "workouts", "expenses", "savings"].includes(currentView) ? currentView : "tasks"));
document.getElementById("menu-toggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("account-open").addEventListener("click", () => window.MiRitmoAuth?.openAccount());
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-backdrop").addEventListener("click", (event) => { if (event.target.id === "modal-backdrop") closeModal(); });
document.getElementById("entry-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form).entries());
  if (form.dataset.type === "expenses" && values.shared === "true") {
    values.shares = validateExpenseShares(form);
    if (!values.shares) return;
  }
  if (values.reminder === "true") requestReminderPermission();
  if (form.dataset.editId) {
    updateEntry(form.dataset.type, form.dataset.editId, values);
    return;
  }
  addEntry(form.dataset.type, values);
});
document.getElementById("entry-form").addEventListener("change", (event) => {
  if (event.target.name === "shared") syncSharedExpenseFields(event.currentTarget);
});
document.getElementById("entry-form").addEventListener("input", (event) => {
  const form = event.currentTarget;
  if (event.target.name === "participants") syncExpenseShareInputs(form);
  if (event.target.name === "amount" || event.target.matches("[data-expense-share-name]")) updateExpenseShareTotal(form);
});
document.getElementById("page-content").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (["lock-diary", "change-diary-month", "select-diary-day", "delete-diary-entry"].includes(button.dataset.action)) {
    handleDiaryAction(button);
    return;
  }
  handleAction(button);
});
document.getElementById("export-data").addEventListener("click", () => {
  const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = `miritmo-copia-${today}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Copia de tus datos descargada.");
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });

if ("serviceWorker" in navigator && ["http:", "https:"].includes(location.protocol)) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("No se pudo activar el modo sin conexión.", error)));
}
