function validateExpenseShares(form) {
  const names = getExpenseParticipantNames(form.elements.namedItem("participants").value);
  const normalizedNames = names.map((name) => name.toLocaleLowerCase());
  if (names.length < 2) {
    showToast("Añade al menos dos participantes para el gasto compartido.");
    return null;
  }
  if (new Set(normalizedNames).size !== names.length) {
    showToast("Cada participante debe aparecer una sola vez.");
    return null;
  }
  const shares = readExpenseShareInputs(form);
  if (shares.length !== names.length || shares.some((share) => share.amount === "" || !Number.isInteger(Number(share.amount)) || Number(share.amount) < 0)) {
    showToast("Completa un importe válido para cada participante.");
    return null;
  }
  const amount = Number(form.elements.namedItem("amount").value);
  const allocated = shares.reduce((total, share) => total + Number(share.amount), 0);
  if (allocated !== amount) {
    showToast(`Los importes deben sumar el total del gasto: ${money(amount)}.`);
    return null;
  }
  return shares.map((share) => ({ name: share.name.trim(), amount: Number(share.amount) }));
}

function addEntry(type, values) {
  const id = generateId();
  if (type === "tasks") data.tasks.push({ id, title: values.title.trim(), time: values.time, day: values.day, category: values.category, done: false, reminder: values.reminder === "true" });
  if (type === "habits") data.habits.push({ id, name: values.title.trim(), symbol: values.symbol, days: [] });
  if (type === "workouts" || type === "activities") data.workouts.push({ id, title: values.title.trim(), day: values.day, time: values.time, duration: Number(values.duration), type: values.category, done: type === "activities" });
  if (type === "goals") data.goals.push({ id, title: values.title.trim(), target: Number(values.target), unit: values.unit });
  if (type === "savings") data.savings.push({ id, title: values.title.trim(), target: Number(values.target), savedAmount: Number(values.savedAmount) });
  if (type === "expenses") {
    const shared = values.shared === "true";
    data.expenses.push({
      id,
      title: values.title.trim(),
      amount: Number(values.amount),
      day: values.day,
      category: values.category || "Otros",
      shared,
      paidBy: shared ? values.paidBy.trim() : "",
      participants: shared ? values.participants.trim() : "",
      shares: shared ? values.shares : [],
      recurrence: values.recurrence || "none",
      reminder: values.reminder === "true"
    });
  }
  saveData();
  if (type === "expenses") materializeRecurringExpenses();
  closeModal();
  render();
  showToast("Guardado. Ya está en tu espacio.");
}

function updateEntry(type, id, values) {
  const entries = Array.isArray(data[type]) ? data[type] : null;
  const entry = entries?.find((item) => item.id === id);
  if (!entry || !formConfigs[type]) {
    showToast("No se encontró el elemento para editar.");
    return;
  }
  if (type === "tasks") Object.assign(entry, { title: values.title.trim(), time: values.time, day: values.day, category: values.category, reminder: values.reminder === "true" });
  if (type === "habits") Object.assign(entry, { name: values.title.trim(), symbol: values.symbol });
  if (type === "workouts") Object.assign(entry, { title: values.title.trim(), day: values.day, time: values.time, duration: Number(values.duration), type: values.category });
  if (type === "goals") Object.assign(entry, { title: values.title.trim(), target: Number(values.target), unit: values.unit });
  if (type === "savings") Object.assign(entry, { title: values.title.trim(), target: Number(values.target), savedAmount: Number(values.savedAmount) });
  if (type === "expenses") {
    const shared = values.shared === "true";
    Object.assign(entry, {
      title: values.title.trim(),
      amount: Number(values.amount),
      day: values.day,
      category: values.category || "Otros",
      shared,
      paidBy: shared ? values.paidBy.trim() : "",
      participants: shared ? values.participants.trim() : "",
      shares: shared ? values.shares : [],
      recurrence: values.recurrence || "none",
      reminder: values.reminder === "true"
    });
  }
  saveData();
  if (type === "expenses") materializeRecurringExpenses();
  closeModal();
  render();
  showToast("Cambios guardados.");
}

