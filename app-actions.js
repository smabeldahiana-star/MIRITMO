function handleAction(button) {
  const { action, id, type, view } = button.dataset;
  if (action === "enable-notifications") {
    requestReminderPermission(true);
    return;
  }
  if (action === "test-notifications") {
    requestReminderPermission(true);
    return;
  }
  if (action === "go-view") return navigate(view);
  if (action === "add") return openModal(type);
  if (action === "filter-expenses") {
    expenseFilter = ["all", "personal", "shared"].includes(button.dataset.filter) ? button.dataset.filter : "all";
    render();
    return;
  }
  if (action === "select-agenda-day") {
    selectedDate = button.dataset.day;
    render();
    return;
  }
  if (action === "edit") {
    const entries = Array.isArray(data[type]) ? data[type] : null;
    const entry = entries?.find((item) => item.id === id);
    if (!entry || !formConfigs[type]) {
      showToast("No se encontró el elemento para editar.");
      return;
    }
    return openModal(type, entry);
  }
  if (action === "toggle-task") {
    const task = data.tasks.find((entry) => entry.id === id);
    if (task) task.done = !task.done;
  }
  if (action === "toggle-workout") {
    const workout = data.workouts.find((entry) => entry.id === id);
    if (workout) workout.done = !workout.done;
  }
  if (action === "toggle-habit") {
    const habit = data.habits.find((entry) => entry.id === id);
    if (habit) habit.days = habit.days.includes(today) ? habit.days.filter((day) => day !== today) : [...habit.days, today];
  }
  if (action === "delete") {
    const entries = Array.isArray(data[type]) ? data[type] : null;
    const entry = entries?.find((item) => item.id === id);
    if (!entries || !entry) {
      showToast("No se encontró el elemento para eliminar.");
      return;
    }
    if (!window.confirm(`¿Quieres eliminar "${entry.title || entry.name}"?`)) return;
    data[type] = entries.filter((item) => item.id !== id);
    showToast("Elemento eliminado.");
  }
  saveData();
  render();
}

