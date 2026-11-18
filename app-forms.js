const formConfigs = {
  tasks: { title: "Añadir una tarea", editTitle: "Editar tarea", eyebrow: "AGENDA", fields: `<div class="form-field"><label for="entry-title">¿Qué quieres recordar?</label><input class="field-input" id="entry-title" name="title" maxlength="90" required placeholder="Ej. Preparar la semana" /></div><div class="form-grid"><div class="form-field"><label for="entry-time">Hora</label><input class="field-input" id="entry-time" name="time" type="time" value="09:00" required /></div><div class="form-field"><label for="entry-day">Día</label><input class="field-input" id="entry-day" name="day" type="date" value="${today}" required /></div></div><div class="form-field"><label for="entry-category">Categoría</label><select class="field-select" id="entry-category" name="category"><option>Personal</option><option>Trabajo</option><option>Bienestar</option><option>Casa</option><option>Estudio</option></select></div><label class="inline-checkbox"><input type="checkbox" name="reminder" value="true" />Avisarme a la hora de esta tarea</label><span class="reminder-note">Requiere permiso del navegador y MiRitmo debe estar abierta.</span>` },
  habits: { title: "Crear un hábito", editTitle: "Editar hábito", eyebrow: "HÁBITOS", fields: `<div class="form-field"><label for="entry-title">¿Qué hábito quieres cuidar?</label><input class="field-input" id="entry-title" name="title" maxlength="55" required placeholder="Ej. Salir a caminar" /></div><div class="form-field"><label for="entry-symbol">Símbolo</label><select class="field-select" id="entry-symbol" name="symbol"><option value="◉">Bienestar</option><option value="▤">Lectura</option><option value="◌">Agua</option><option value="↗">Movimiento</option><option value="✳">Otro</option></select></div>` },
  workouts: { title: "Programar entrenamiento", editTitle: "Editar entrenamiento", eyebrow: "AGENDA DEPORTIVA", fields: `<div class="form-field"><label for="entry-title">Entrenamiento</label><input class="field-input" id="entry-title" name="title" maxlength="70" required placeholder="Ej. Paseo en bicicleta" /></div><div class="form-grid"><div class="form-field"><label for="entry-day">Fecha</label><input class="field-input" id="entry-day" name="day" type="date" value="${today}" required /></div><div class="form-field"><label for="entry-time">Hora</label><input class="field-input" id="entry-time" name="time" type="time" value="07:30" required /></div></div><div class="form-grid"><div class="form-field"><label for="entry-duration">Duración (min)</label><input class="field-input" id="entry-duration" name="duration" type="number" min="1" max="600" value="30" required /></div><div class="form-field"><label for="entry-category">Actividad</label><select class="field-select" id="entry-category" name="category"><option>Cardio</option><option>Fuerza</option><option>Movilidad</option><option>Yoga</option><option>Natación</option><option>Otro</option></select></div></div>` },
  activities: { title: "Registrar actividad", eyebrow: "ACTIVIDAD REALIZADA", fields: `<div class="form-field"><label for="entry-title">¿Qué actividad hiciste?</label><input class="field-input" id="entry-title" name="title" maxlength="70" required placeholder="Ej. Caminata por el parque" /></div><div class="form-grid"><div class="form-field"><label for="entry-day">Fecha</label><input class="field-input" id="entry-day" name="day" type="date" value="${today}" required /></div><div class="form-field"><label for="entry-time">Hora</label><input class="field-input" id="entry-time" name="time" type="time" value="07:30" required /></div></div><div class="form-grid"><div class="form-field"><label for="entry-duration">Duración (min)</label><input class="field-input" id="entry-duration" name="duration" type="number" min="1" max="600" value="30" required /></div><div class="form-field"><label for="entry-category">Actividad</label><select class="field-select" id="entry-category" name="category"><option>Cardio</option><option>Fuerza</option><option>Movilidad</option><option>Yoga</option><option>Natación</option><option>Otro</option></select></div></div>` },
  goals: { title: "Crear objetivo deportivo", editTitle: "Editar objetivo deportivo", eyebrow: "OBJETIVOS SEMANALES", fields: `<div class="form-field"><label for="entry-title">Objetivo</label><input class="field-input" id="entry-title" name="title" maxlength="60" required placeholder="Ej. Mantenerme en movimiento" /></div><div class="form-grid"><div class="form-field"><label for="entry-target">Meta por semana</label><input class="field-input" id="entry-target" name="target" type="number" min="1" max="10000" value="3" required /></div><div class="form-field"><label for="entry-unit">Medir en</label><select class="field-select" id="entry-unit" name="unit"><option value="sessions">sesiones</option><option value="minutes">minutos</option></select></div></div>` },
  savings: { title: "Crear meta de ahorro", editTitle: "Actualizar meta de ahorro", eyebrow: "MIS AHORROS", fields: `<div class="form-field"><label for="entry-title">¿Para qué estás ahorrando?</label><input class="field-input" id="entry-title" name="title" maxlength="70" required placeholder="Ej. Viaje, computador, emergencias" /></div><div class="form-grid"><div class="form-field"><label for="entry-target">Meta (COP $)</label><input class="field-input" id="entry-target" name="target" type="number" min="1" max="1000000000000" step="1" required placeholder="0" /></div><div class="form-field"><label for="entry-savedAmount">¿Cuánto llevas? (COP $)</label><input class="field-input" id="entry-savedAmount" name="savedAmount" type="number" min="0" max="1000000000000" step="1" value="0" required /></div></div>` },
  expenses: { title: "Registrar un gasto", editTitle: "Editar gasto", eyebrow: "MIS GASTOS", fields: `<div class="form-field"><label for="entry-title">¿En qué fue?</label><input class="field-input" id="entry-title" name="title" maxlength="80" required placeholder="Ej. Compra para la casa" /></div><div class="form-grid"><div class="form-field"><label for="entry-amount">Importe (COP $)</label><input class="field-input" id="entry-amount" name="amount" type="number" min="1" max="1000000000000" step="1" required placeholder="0" /></div><div class="form-field"><label for="entry-day">Fecha</label><input class="field-input" id="entry-day" name="day" type="date" value="${today}" required /></div></div><div class="form-grid"><div class="form-field"><label for="entry-category">Categoría</label><select class="field-select" id="entry-category" name="category">${expenseCategories.map((category) => `<option>${escapeHtml(category)}</option>`).join("")}</select></div><div class="form-field"><label for="entry-recurrence">Frecuencia</label><select class="field-select" id="entry-recurrence" name="recurrence"><option value="none">Una sola vez</option><option value="monthly">Cada mes</option></select></div></div><div class="form-field"><label for="entry-shared">Tipo de gasto</label><select class="field-select" id="entry-shared" name="shared"><option value="false" selected>Personal</option><option value="true">Compartido</option></select></div><div class="form-grid" id="shared-expense-fields" hidden><div class="form-field"><label for="entry-payer">¿Quién pagó?</label><input class="field-input" id="entry-payer" name="paidBy" maxlength="35" value="Yo" /></div><div class="form-field"><label for="entry-people">Participantes (separados por coma)</label><input class="field-input" id="entry-people" name="participants" maxlength="70" placeholder="Yo, Alex" /></div></div><div class="expense-share-fields" id="expense-share-fields" hidden><div class="expense-share-heading"><strong>¿Cuánto aporta cada persona?</strong><span>Asigna el total completo entre los participantes.</span></div><div class="expense-share-inputs" id="expense-share-inputs"></div><p class="expense-share-total" id="expense-share-total" aria-live="polite"></p></div><label class="inline-checkbox"><input type="checkbox" name="reminder" value="true" />Recordarme este gasto en su fecha</label><span class="reminder-note">Requiere permiso del navegador y MiRitmo debe estar abierta.</span>` }
};

function readExpenseShareInputs(form) {
  return [...form.querySelectorAll("[data-expense-share-name]")].map((input) => ({
    name: input.dataset.expenseShareName,
    amount: input.value
  }));
}

function updateExpenseShareTotal(form) {
  const totalLabel = form.querySelector("#expense-share-total");
  if (!totalLabel) return;
  const shares = readExpenseShareInputs(form);
  const values = shares.map((share) => Number(share.amount));
  const sum = values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
  const expenseAmount = Number(form.elements.namedItem("amount")?.value || 0);
  const complete = shares.length > 0 && shares.every((share) => share.amount !== "" && Number.isInteger(Number(share.amount)) && Number(share.amount) >= 0) && sum === expenseAmount;
  totalLabel.textContent = `Asignado: ${money(sum)} de ${money(expenseAmount)}${complete ? " · Cuadra" : ""}`;
  totalLabel.classList.toggle("complete", complete);
}

function syncExpenseShareInputs(form, initialShares = null) {
  const inputContainer = form.querySelector("#expense-share-inputs");
  if (!inputContainer) return;
  const previousShares = initialShares || readExpenseShareInputs(form);
  const amounts = new Map(previousShares.map((share) => [share.name.trim().toLocaleLowerCase(), share.amount]));
  const names = getExpenseParticipantNames(form.elements.namedItem("participants")?.value);
  inputContainer.innerHTML = names.map((name, index) => `<div class="expense-share-row"><label for="expense-share-${index}">${escapeHtml(name)}</label><input class="field-input" id="expense-share-${index}" data-expense-share-name="${escapeHtml(name)}" type="number" min="0" step="1" required aria-label="Importe que aporta ${escapeHtml(name)}" placeholder="0" /></div>`).join("");
  inputContainer.querySelectorAll("[data-expense-share-name]").forEach((input) => {
    const amount = amounts.get(input.dataset.expenseShareName.trim().toLocaleLowerCase());
    if (amount !== undefined) input.value = amount;
    input.required = form.elements.namedItem("shared").value === "true";
  });
  updateExpenseShareTotal(form);
}

function syncSharedExpenseFields(form, initialShares = null) {
  const sharedField = form.elements.namedItem("shared");
  const fields = form.querySelector("#shared-expense-fields");
  if (!sharedField || !fields) return;
  const shared = sharedField.value === "true";
  fields.hidden = !shared;
  fields.querySelectorAll("input").forEach((input) => { input.required = shared; });
  form.querySelector("#expense-share-fields").hidden = !shared;
  form.querySelectorAll("[data-expense-share-name]").forEach((input) => { input.required = shared; });
  syncExpenseShareInputs(form, initialShares);
}

function openModal(type, entry = null) {
  const config = formConfigs[type];
  if (!config) return;
  const backdrop = document.getElementById("modal-backdrop");
  document.getElementById("modal-title").textContent = entry ? config.editTitle : config.title;
  document.getElementById("modal-eyebrow").textContent = config.eyebrow;
  const form = document.getElementById("entry-form");
  form.dataset.type = type;
  form.dataset.editId = entry?.id || "";
  form.innerHTML = `<div class="modal-form">${config.fields}<div class="modal-actions"><button class="button button-quiet" type="button" id="modal-cancel">Cancelar</button><button class="button button-primary" type="submit">${entry ? "Guardar cambios" : "Guardar"}</button></div></div>`;
  const recurrenceLabel = form.querySelector('label[for="entry-recurrence"]');
  if (recurrenceLabel) addFeatureLogo(recurrenceLabel, "↻", "recurrence");
  const reminderLabel = form.querySelector("label.inline-checkbox");
  const reminderCheckbox = reminderLabel?.querySelector('input[type="checkbox"]');
  if (reminderLabel && reminderCheckbox) addFeatureLogo(reminderLabel, "🔔", "reminder");
  if (entry) {
    const values = type === "habits" ? { ...entry, title: entry.name }
      : type === "workouts" ? { ...entry, category: entry.type }
        : type === "expenses" ? { ...entry, shared: String(isSharedExpense(entry)), category: entry.category || "Otros", recurrence: entry.recurrence || "none" }
        : entry;
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      if (field?.type === "checkbox") field.checked = value === true || value === "true";
      else if (field) field.value = value;
    }
  }
  if (type === "expenses") syncSharedExpenseFields(form, entry?.shares || []);
  backdrop.hidden = false;
  form.querySelector("input")?.focus();
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
}

function closeModal() {
  document.getElementById("modal-backdrop").hidden = true;
}

