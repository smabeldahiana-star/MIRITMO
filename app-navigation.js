function render() {
  const content = document.getElementById("page-content");
  const renderers = { home: renderHome, tasks: renderTasks, habits: renderHabits, workouts: renderWorkouts, expenses: renderExpenses, savings: renderSavings, diary: renderDiary, focus: renderFocus };
  content.innerHTML = renderers[currentView]();
  if (currentView === "home" && greetingName) content.querySelector(".welcome-row h1").textContent = `Hola, ${greetingName}.`;
  if (currentView === "home") content.querySelector(".welcome-row")?.insertAdjacentHTML("afterend", renderNotificationControl());
  decorateFeatureLogos(content);
  const breadcrumbCurrent = document.getElementById("breadcrumb-current");
  breadcrumbCurrent.textContent = viewNames[currentView];
  breadcrumbCurrent.dataset.view = currentView;
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === currentView));
  document.getElementById("top-add").hidden = currentView === "diary";
  bindViewControls();
}

function bindViewControls() {
  const dateInput = document.getElementById("agenda-date");
  if (dateInput) dateInput.addEventListener("change", () => { selectedDate = dateInput.value || today; render(); });
  const monthInput = document.getElementById("expense-month");
  if (monthInput) monthInput.addEventListener("change", () => { expenseMonth = monthInput.value || today.slice(0, 7); render(); });
  const budgetForm = document.getElementById("monthly-budget-form");
  if (budgetForm) budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!budgetForm.reportValidity()) return;
    data.monthlyBudget = Number(new FormData(budgetForm).get("monthlyBudget"));
    saveData();
    render();
    showToast("Presupuesto mensual guardado.");
  });
  const toggleButton = document.getElementById("timer-toggle");
  if (toggleButton) toggleButton.addEventListener("click", toggleTimer);
  const resetButton = document.getElementById("timer-reset");
  if (resetButton) resetButton.addEventListener("click", resetTimer);
  document.querySelectorAll("[data-duration]").forEach((button) => button.addEventListener("click", () => setDuration(Number(button.dataset.duration))));
  const unlockForm = document.getElementById("diary-unlock-form");
  if (unlockForm) unlockForm.addEventListener("submit", unlockDiaryFromForm);
  const diaryForm = document.getElementById("diary-entry-form");
  if (diaryForm) diaryForm.addEventListener("submit", saveDiaryEntryFromForm);
}

function navigate(view) {
  if (!viewNames[view]) return;
  if (currentView === "diary" && view !== "diary") lockDiary();
  currentView = view;
  document.getElementById("sidebar").classList.remove("open");
  render();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
}

