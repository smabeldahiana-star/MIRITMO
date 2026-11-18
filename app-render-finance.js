function isSharedExpense(expense) {
  return expense.shared !== false;
}

function getExpenseParticipantNames(participants) {
  return String(participants || "")
    .split(/,|\s+y\s+/i)
    .map((name) => name.trim())
    .filter(Boolean);
}

function renderExpenseShares(expense) {
  if (!Array.isArray(expense.shares) || !expense.shares.length) {
    return `<span class="expense-share-pending">Reparto pendiente; edita el gasto para asignar importes.</span>`;
  }
  return `<span class="expense-share-list">${expense.shares.map((share) => `${escapeHtml(share.name)}: ${money(Number(share.amount))}`).join(" · ")}</span>`;
}

function renderExpenses() {
  const expenses = [...data.expenses].sort((a, b) => b.day.localeCompare(a.day));
  const sharedExpenses = expenses.filter(isSharedExpense);
  const personalExpenses = expenses.filter((expense) => !isSharedExpense(expense));
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const personalTotal = personalExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const sharedTotal = sharedExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const monthlyExpenses = expenses.filter((expense) => expense.day?.startsWith(expenseMonth));
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const categoryTotals = monthlyExpenses.reduce((totals, expense) => {
    const category = expense.category || "Otros";
    totals[category] = (totals[category] || 0) + Number(expense.amount);
    return totals;
  }, {});
  const maxCategoryTotal = Math.max(1, ...Object.values(categoryTotals));
  const categoryRows = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([category, amount]) => `<div class="expense-category-row"><div class="expense-category-heading"><strong>${escapeHtml(category)}</strong><span>${money(amount)}</span></div><div class="expense-category-meter"><span style="width:${Math.round(amount / maxCategoryTotal * 100)}%"></span></div></div>`).join("");
  const monthlyBudget = Number(data.monthlyBudget || 0);
  const remainingBudget = monthlyBudget - monthlyTotal;
  const budgetProgress = monthlyBudget > 0 ? Math.min(Math.round(monthlyTotal / monthlyBudget * 100), 100) : 0;
  const monthLabel = new Date(`${expenseMonth}-01T12:00:00`).toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const filteredExpenses = expenseFilter === "personal" ? personalExpenses
    : expenseFilter === "shared" ? sharedExpenses
      : expenses;
  const filters = [
    { value: "all", label: `Todos (${expenses.length})` },
    { value: "personal", label: `Personales (${personalExpenses.length})` },
    { value: "shared", label: `Compartidos (${sharedExpenses.length})` }
  ].map(({ value, label }) => `<button class="expense-filter ${expenseFilter === value ? "active" : ""}" type="button" data-action="filter-expenses" data-filter="${value}" aria-pressed="${expenseFilter === value}">${label}</button>`).join("");
  const rows = filteredExpenses.map((expense) => {
    const shared = isSharedExpense(expense);
    const recurring = expense.recurrence === "monthly" || Boolean(expense.recurringSourceId);
    const category = expense.category || "Otros";
    const reminder = expense.reminder ? " · Con recordatorio" : "";
    const details = shared
      ? `<span>${escapeHtml(formatDate(expense.day, { weekday: "short", day: "numeric", month: "short" }))} · ${escapeHtml(category)}${recurring ? " · Recurrente" : ""}${reminder} · ${escapeHtml(expense.participants || "")}</span>${renderExpenseShares(expense)}<span class="expense-payer">Pagó ${escapeHtml(expense.paidBy || "Yo")}</span>`
      : `<span>${escapeHtml(formatDate(expense.day, { weekday: "short", day: "numeric", month: "short" }))} · ${escapeHtml(category)}${recurring ? " · Recurrente" : ""}${reminder}</span><span class="expense-payer">Gasto personal</span>`;
    return `<div class="entry-row"><span class="stat-icon blue">$</span><div class="entry-copy"><strong>${escapeHtml(expense.title)}</strong>${details}</div><span class="tag ${shared ? "coral" : "blue"}">${shared ? "Compartido" : "Personal"}</span><span class="expense-amount">${money(Number(expense.amount))}</span>${renderItemActions("expenses", expense.id, expense.title)}</div>`;
  }).join("");
  const emptyMessage = expenses.length ? "No hay gastos en esta categoría." : "Aún no registras gastos. Añade uno personal o compartido.";
  return `<div class="view-heading"><div><span class="section-kicker">LAS CUENTAS, CLARAS</span><h1>Mis gastos</h1><p>Registra tus gastos y marca los que compartes para llevar las cuentas.</p></div><button class="button button-primary" data-action="add" data-type="expenses">＋ Añadir gasto</button></div><div class="expense-summary"><div class="summary-tile"><strong>${money(total)}</strong><span>total registrado</span></div><div class="summary-tile"><strong>${money(personalTotal)}</strong><span>gastos personales</span></div><div class="summary-tile"><strong>${money(sharedTotal)}</strong><span>gastos compartidos</span></div></div><div class="expense-dashboard-grid"><section class="panel"><div class="panel-heading"><h2>Resumen por categoría</h2><label class="month-picker"><span>Mes</span><input class="field-input" type="month" id="expense-month" value="${expenseMonth}" /></label></div><p class="expense-month-total">${escapeHtml(monthLabel)} · <strong>${money(monthlyTotal)}</strong></p>${categoryRows ? `<div class="expense-category-list">${categoryRows}</div>` : `<div class="empty-state">No hay gastos en ${escapeHtml(monthLabel)}.</div>`}</section><section class="panel"><div class="panel-heading"><h2>Presupuesto mensual</h2></div><form class="budget-form" id="monthly-budget-form"><label for="monthly-budget">Tu límite de gasto para el mes (COP $)</label><div class="budget-form-row"><input class="field-input" id="monthly-budget" name="monthlyBudget" type="number" min="0" max="1000000000000" step="1" value="${monthlyBudget || ""}" placeholder="Ej. 800000" /><button class="button button-primary button-small" type="submit">Guardar</button></div></form>${monthlyBudget ? `<div class="budget-meter"><span class="${remainingBudget < 0 ? "over" : ""}" style="width:${budgetProgress}%"></span></div><p class="budget-status ${remainingBudget < 0 ? "over" : ""}">${remainingBudget >= 0 ? `Te quedan ${money(remainingBudget)} en ${escapeHtml(monthLabel)}.` : `Excediste el límite por ${money(Math.abs(remainingBudget))}.`}</p>` : `<p class="budget-status">Define un límite para ver cuánto te queda este mes.</p>`}</section></div><div class="expense-filters" role="group" aria-label="Filtrar gastos">${filters}</div><div class="panel large-panel"><div class="panel-heading"><h2>Movimientos</h2><span class="tag blue">${filteredExpenses.length} registros</span></div>${filteredExpenses.length ? `<div class="entry-list">${rows}</div>` : `<div class="empty-state">${emptyMessage}</div>`}</div><div class="side-note" style="margin-top:16px"><strong>Un apunte práctico</strong><p>Los gastos recurrentes se agregan una vez al mes cuando llega su fecha, mientras abras la app. Los recordatorios de tareas y gastos solo aparecen con tu permiso y mientras la app esté abierta.</p></div>`;
}

function renderSavings() {
  const savings = Array.isArray(data.savings) ? data.savings : [];
  const totalSaved = savings.reduce((sum, goal) => sum + Number(goal.savedAmount || 0), 0);
  const totalTarget = savings.reduce((sum, goal) => sum + Number(goal.target), 0);
  const goals = savings.map((goal) => {
    const saved = Number(goal.savedAmount || 0);
    const target = Number(goal.target);
    const progress = Math.min(Math.round(saved / target * 100), 100);
    const remaining = Math.max(target - saved, 0);
    return `<article class="savings-card"><div class="savings-card-heading"><div><span class="section-kicker">META DE AHORRO</span><h2>${escapeHtml(goal.title)}</h2></div>${renderItemActions("savings", goal.id, goal.title)}</div><div class="savings-progress-label"><strong>${money(saved)}</strong><span>de ${money(target)}</span></div><div class="savings-meter"><span style="width:${progress}%"></span></div><p>${remaining ? `Faltan ${money(remaining)}` : "¡Meta alcanzada!"}</p></article>`;
  }).join("");
  return `<div class="view-heading"><div><span class="section-kicker">POCO A POCO TAMBIÉN SE LLEGA</span><h1>Metas de ahorro</h1><p>Define una meta y actualiza cuánto llevas ahorrado.</p></div><button class="button button-primary" data-action="add" data-type="savings">＋ Nueva meta</button></div><div class="workout-summary"><div class="summary-tile"><strong>${savings.length}</strong><span>metas activas</span></div><div class="summary-tile"><strong>${money(totalSaved)}</strong><span>ahorrado en total</span></div><div class="summary-tile"><strong>${money(Math.max(totalTarget - totalSaved, 0))}</strong><span>por alcanzar</span></div></div>${goals.length ? `<div class="savings-grid">${goals}</div>` : `<div class="panel empty-state"><span class="empty-icon">◇</span>Aún no tienes metas de ahorro. Crea una y registra tu avance.</div>`}`;
}

