function categoryColor(category) {
  if (["Bienestar", "Cardio", "Movimiento"].includes(category)) return "coral";
  if (["Trabajo", "Movilidad", "Estudio"].includes(category)) return "blue";
  return "";
}

function getTodayTasks() {
  return data.tasks.filter((task) => task.day === today).sort((a, b) => a.time.localeCompare(b.time));
}

function getWeekDates(referenceDate = today) {
  const current = new Date(`${referenceDate}T12:00:00`);
  const mondayOffset = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - mondayOffset);
  return weekdayNames.map((_, index) => {
    const date = new Date(current);
    date.setDate(current.getDate() + index);
    return dateKey(date);
  });
}

function renderItemActions(type, id, label) {
  return `<div class="item-actions"><button class="icon-button" data-action="edit" data-type="${type}" data-id="${id}" title="Editar" aria-label="Editar ${escapeHtml(label)}">✎</button><button class="icon-button" data-action="delete" data-type="${type}" data-id="${id}" title="Eliminar" aria-label="Eliminar ${escapeHtml(label)}">×</button></div>`;
}

function renderTaskRow(task, compact = false) {
  const tag = task.category ? `<span class="tag ${categoryColor(task.category)}">${escapeHtml(task.category)}</span>` : "";
  const reminderMark = task.reminder ? " · 🔔" : "";
  if (compact) return `<div class="task-row"><button class="check-button ${task.done ? "checked" : ""}" data-action="toggle-task" data-id="${task.id}" aria-label="${task.done ? "Marcar pendiente" : "Completar tarea"}">${task.done ? "✓" : ""}</button><div class="task-copy"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.time)}${reminderMark} · ${escapeHtml(task.category || "Sin categoría")}</span></div></div>`;
  return `<div class="agenda-item ${task.done ? "done" : ""}"><span class="agenda-time">${escapeHtml(task.time)}${reminderMark}</span><span class="agenda-marker ${categoryColor(task.category)}"></span><div class="agenda-item-copy"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.category || "Sin categoría")}</span></div>${tag}<button class="check-button ${task.done ? "checked" : ""}" data-action="toggle-task" data-id="${task.id}" aria-label="${task.done ? "Marcar pendiente" : "Completar tarea"}">${task.done ? "✓" : ""}</button>${renderItemActions("tasks", task.id, task.title)}</div>`;
}

function renderHabitRow(habit) {
  const done = habit.days.includes(today);
  return `<div class="habit-row"><span class="habit-symbol">${escapeHtml(habit.symbol || "◉")}</span><span class="habit-copy">${escapeHtml(habit.name)}</span><span class="habit-streak">${habit.days.length} días</span><button class="habit-check ${done ? "done" : ""}" data-action="toggle-habit" data-id="${habit.id}" aria-label="${done ? "Desmarcar" : "Completar"} ${escapeHtml(habit.name)}">${done ? "✓" : ""}</button></div>`;
}

function renderHome() {
  const tasks = getTodayTasks();
  const completedTasks = tasks.filter((task) => task.done).length;
  const completedHabits = data.habits.filter((habit) => habit.days.includes(today)).length;
  const week = getWeekDates();
  const completedWorkouts = data.workouts.filter((workout) => week.includes(workout.day) && workout.done).length;
  const spent = data.expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  const habits = data.habits.slice(0, 4);
  const visibleTasks = tasks.slice(0, 4);

  return `<div class="welcome-row"><div><span class="section-kicker">${escapeHtml(formatDate(today, { weekday: "long", day: "numeric", month: "long" }))}</span><h1>Hola, bienvenida a tu espacio.</h1><p>Un día con intención empieza con un paso pequeño.</p></div></div>
    <section class="hero-panel"><div class="hero-copy"><span class="section-kicker">ORGANIZA TU DÍA, VIVE A TU RITMO</span><h2>Hoy no tienes que hacerlo todo.<br />Solo empezar por algo.</h2><p>${tasks.length ? `${completedTasks} de ${tasks.length} tareas completadas hoy. Tu día, a tu manera.` : "Tu agenda está despejada. Disfruta el espacio o añade algo que quieras recordar."}</p></div><button class="hero-action" data-action="go-view" data-view="focus"><span class="hero-action-icon">◷</span><span>Un momento para ti</span></button></section>
    <div class="stat-grid"><article class="stat-card"><span class="stat-icon green">▤</span><div class="stat-copy"><strong class="stat-value">${completedTasks}<span style="color:#a7b0aa;font-size:13px;font-weight:500"> / ${tasks.length}</span></strong><span class="stat-label">tareas de hoy</span></div></article><article class="stat-card"><span class="stat-icon yellow">◉</span><div class="stat-copy"><strong class="stat-value">${completedHabits}<span style="color:#a7b0aa;font-size:13px;font-weight:500"> / ${data.habits.length}</span></strong><span class="stat-label">hábitos de hoy</span></div></article><article class="stat-card"><span class="stat-icon coral">↗</span><div class="stat-copy"><strong class="stat-value">${completedWorkouts}</strong><span class="stat-label">entrenos esta semana</span></div></article><article class="stat-card"><span class="stat-icon blue">$</span><div class="stat-copy"><strong class="stat-value">${money(spent)}</strong><span class="stat-label">gastos registrados</span></div></article></div>
    <div class="dashboard-grid"><div class="panel"><div class="panel-heading"><h2>El plan de hoy</h2><button class="text-button" data-action="go-view" data-view="tasks">Ver agenda →</button></div><div class="task-list">${visibleTasks.length ? visibleTasks.map((task) => renderTaskRow(task, true)).join("") : `<div class="empty-state"><span class="empty-icon">✳</span>Un día con espacio también es un buen plan.</div>`}</div></div><div class="stack"><div class="panel"><div class="panel-heading"><h2>Pequeños hábitos</h2><button class="text-button" data-action="go-view" data-view="habits">Ver todos →</button></div><div>${habits.length ? habits.map(renderHabitRow).join("") : `<div class="empty-state">Aún no tienes hábitos. Añade uno para empezar.</div>`}</div></div><div class="panel"><div class="panel-heading"><h2>Un rato de enfoque</h2><button class="text-button" data-action="go-view" data-view="focus">Abrir temporizador →</button></div><div class="focus-mini"><div class="focus-ring"><span>25′</span></div><div class="focus-mini-copy"><strong>${data.focusSessions} momentos completados</strong><span>Hazle espacio a una sola cosa.</span></div></div></div></div></div>`;
}

function renderTasks() {
  const week = getWeekDates(selectedDate);
  const dayTasks = data.tasks.filter((task) => task.day === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  const done = dayTasks.filter((task) => task.done).length;
  const active = dayTasks.filter((task) => !task.done).length;
  const weekDays = week.map((day) => {
    const tasks = data.tasks.filter((task) => task.day === day).sort((a, b) => a.time.localeCompare(b.time));
    const events = tasks.length
      ? tasks.slice(0, 3).map((task) => `<span class="${task.done ? "done" : ""}">${escapeHtml(task.time)} · ${escapeHtml(task.title)}</span>`).join("")
      : `<span class="week-calendar-empty">Libre</span>`;
    return `<article class="week-calendar-day"><button class="week-calendar-select ${day === selectedDate ? "active" : ""}" type="button" data-action="select-agenda-day" data-day="${day}" aria-pressed="${day === selectedDate}"><strong>${escapeHtml(formatDate(day, { weekday: "short", day: "numeric", month: "short" }))}</strong><span>${tasks.length} ${tasks.length === 1 ? "tarea" : "tareas"}</span></button><div class="week-calendar-events">${events}${tasks.length > 3 ? `<span class="week-calendar-more">+${tasks.length - 3} más</span>` : ""}</div></article>`;
  }).join("");
  return `<div class="view-heading"><div><span class="section-kicker">UN DÍA A LA VEZ</span><h1>Tu agenda</h1><p>Haz sitio para lo importante y deja espacio para respirar.</p></div><div class="heading-actions"><input class="date-input" id="agenda-date" type="date" value="${selectedDate}" aria-label="Elegir fecha" /><button class="button button-primary" data-action="add" data-type="tasks">＋ Añadir tarea</button></div></div><div class="content-columns"><div class="panel large-panel"><div class="panel-heading"><h2>${escapeHtml(formatDate(selectedDate))}</h2><span class="tag">${done} de ${dayTasks.length} listas</span></div><div class="agenda-date">${active ? `${active} ${active === 1 ? "pendiente" : "pendientes"} para hoy` : "Todo listo por ahora"}</div>${dayTasks.length ? dayTasks.map((task) => renderTaskRow(task)).join("") : `<div class="empty-state"><span class="empty-icon">✳</span>Este día está libre.<br />Puedes dejarlo así o planear algo con calma.</div>`}</div><div class="stack"><div class="panel"><div class="panel-heading"><h2>Calendario semanal</h2></div><div class="week-calendar">${weekDays}</div></div><div class="side-note"><strong>Recuerda dejar margen.</strong><p>Una agenda amable también cuenta con pausas, imprevistos y tiempo para ti.</p></div></div></div>`;
}

function renderHabits() {
  const week = getWeekDates();
  const doneToday = data.habits.filter((habit) => habit.days.includes(today)).length;
  return `<div class="view-heading"><div><span class="section-kicker">CONSTANCIA, NO PERFECCIÓN</span><h1>Hábitos que te hacen bien</h1><p>Las pequeñas acciones también construyen grandes cambios.</p></div><button class="button button-primary" data-action="add" data-type="habits">＋ Nuevo hábito</button></div><div class="workout-summary"><div class="summary-tile"><strong>${doneToday}/${data.habits.length}</strong><span>completados hoy</span></div><div class="summary-tile"><strong>${data.habits.length}</strong><span>hábitos activos</span></div><div class="summary-tile"><strong>${data.habits.reduce((sum, habit) => sum + habit.days.length, 0)}</strong><span>pequeños logros</span></div></div>${data.habits.length ? `<div class="habit-grid">${data.habits.map((habit) => `<article class="habit-card"><div class="habit-card-top"><span class="habit-big-symbol">${escapeHtml(habit.symbol || "◉")}</span>${renderItemActions("habits", habit.id, habit.name)}</div><h2>${escapeHtml(habit.name)}</h2><p>${habit.days.includes(today) ? "Completado por hoy. Bien hecho." : "Un pequeño paso cuenta."}</p><div class="week-dots">${week.map((day, index) => { const done = habit.days.includes(day); return `<div class="week-day"><span>${weekdayNames[index]}</span><span class="week-dot ${done ? "done" : ""} ${day === today ? "today" : ""}">${done ? "✓" : "·"}</span></div>`; }).join("")}</div><button class="text-button" data-action="toggle-habit" data-id="${habit.id}">${habit.days.includes(today) ? "Desmarcar hoy" : "Marcar como hecho hoy"}</button></article>`).join("")}</div>` : `<div class="panel empty-state"><span class="empty-icon">◉</span>Aún no hay hábitos en tu lista. Empieza por uno sencillo.</div>`}`;
}

function renderWorkoutRow(workout) {
  const time = workout.time ? `${escapeHtml(workout.time)} · ` : "";
  return `<div class="entry-row"><button class="check-button ${workout.done ? "checked" : ""}" data-action="toggle-workout" data-id="${workout.id}" aria-label="${workout.done ? "Marcar pendiente" : "Registrar como realizada"}">${workout.done ? "✓" : ""}</button><div class="entry-copy"><strong>${escapeHtml(workout.title)}</strong><span>${escapeHtml(formatDate(workout.day, { weekday: "long", day: "numeric", month: "long" }))} · ${time}${escapeHtml(workout.type)}</span></div><span class="tag coral">${Number(workout.duration)} min</span>${renderItemActions("workouts", workout.id, workout.title)}</div>`;
}

function renderWorkouts() {
  const week = getWeekDates();
  const weekly = data.workouts.filter((workout) => week.includes(workout.day) && workout.done);
  const minutes = weekly.reduce((total, workout) => total + Number(workout.duration), 0);
  const upcoming = data.workouts.filter((workout) => workout.day >= today && !workout.done).sort((first, second) => first.day.localeCompare(second.day) || String(first.time || "").localeCompare(String(second.time || "")));
  const history = data.workouts.filter((workout) => workout.day < today || workout.done).sort((first, second) => second.day.localeCompare(first.day) || String(second.time || "").localeCompare(String(first.time || "")));
  const goals = data.goals || [];
  const goalRows = goals.map((goal) => {
    const progress = goal.unit === "minutes" ? minutes : weekly.length;
    const percentage = Math.min(Math.round(progress / goal.target * 100), 100);
    const unitLabel = goal.unit === "minutes" ? "min" : "sesiones";
    return `<article class="goal-row"><div class="goal-heading"><strong>${escapeHtml(goal.title)}</strong>${renderItemActions("goals", goal.id, goal.title)}</div><div class="goal-meter"><span style="width:${percentage}%"></span></div><span class="goal-progress">${progress} de ${Number(goal.target)} ${unitLabel} esta semana</span></article>`;
  }).join("");
  return `<div class="view-heading"><div><span class="section-kicker">MOVIMIENTO A TU MANERA</span><h1>Agenda deportiva</h1><p>Programa, registra y consulta tu progreso.</p></div><div class="heading-actions sport-actions"><button class="button button-quiet" data-action="add" data-type="activities">＋ Registrar actividad</button><button class="button button-primary" data-action="add" data-type="workouts">＋ Programar entrenamiento</button></div></div><div class="workout-summary"><div class="summary-tile"><strong>${weekly.length}</strong><span>sesiones realizadas esta semana</span></div><div class="summary-tile"><strong>${minutes} min</strong><span>de movimiento esta semana</span></div><div class="summary-tile"><strong>${upcoming.length}</strong><span>entrenamientos por hacer</span></div></div><div class="panel large-panel goal-panel"><div class="panel-heading"><h2>Objetivos deportivos</h2><button class="text-button" data-action="add" data-type="goals">＋ Nuevo objetivo</button></div>${goalRows ? `<div class="goal-list">${goalRows}</div>` : `<div class="empty-state">Crea un objetivo semanal de sesiones o minutos para seguir tu avance.</div>`}</div><div class="sports-columns"><div class="panel large-panel"><div class="panel-heading"><h2>Próximos entrenamientos</h2></div>${upcoming.length ? `<div class="entry-list">${upcoming.map(renderWorkoutRow).join("")}</div>` : `<div class="empty-state">No tienes entrenamientos pendientes. Puedes programar uno o registrar una actividad ya realizada.</div>`}</div><div class="panel large-panel"><div class="panel-heading"><h2>Entrenamientos anteriores</h2><span class="tag blue">${history.length}</span></div>${history.length ? `<div class="entry-list">${history.map(renderWorkoutRow).join("")}</div>` : `<div class="empty-state">Cuando registres una actividad o completes una sesión, aparecerá aquí.</div>`}</div></div>`;
}

