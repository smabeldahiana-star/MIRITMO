function getDiaryMood(value) {
  return diaryMoods.find((mood) => mood.value === value);
}

function renderDiaryLocked(hasVault) {
  const error = diaryStatus ? `<p class="auth-message error" role="alert">${escapeHtml(diaryStatus)}</p>` : "";
  const cryptoUnavailable = !globalThis.crypto?.subtle;
  const fields = hasVault
    ? `<div class="form-field"><label for="diary-passphrase">Clave del diario</label><input class="field-input" id="diary-passphrase" name="passphrase" type="password" autocomplete="current-password" required /></div>`
    : `<div class="form-field"><label for="diary-passphrase">Crea una clave personal (mínimo 10 caracteres)</label><input class="field-input" id="diary-passphrase" name="passphrase" type="password" autocomplete="new-password" minlength="10" required /></div><div class="form-field"><label for="diary-passphrase-confirm">Confirma la clave</label><input class="field-input" id="diary-passphrase-confirm" name="confirmation" type="password" autocomplete="new-password" minlength="10" required /></div>`;
  return `<div class="view-heading"><div><span class="section-kicker">TU ESPACIO ÍNTIMO</span><h1>Diario emocional</h1><p>Un lugar privado para hacer una pausa y escucharte.</p></div></div><div class="diary-lock-layout"><section class="panel diary-lock-card"><span class="diary-lock-icon" aria-hidden="true">⌑</span><h2>${hasVault ? "Desbloquea tu diario" : "Crea tu diario privado"}</h2><p>${hasVault ? "Tus anotaciones están cifradas en este dispositivo. Ingresa tu clave para abrirlas." : "Elige una clave que puedas recordar. Tus anotaciones se cifrarán antes de guardarse en este dispositivo."}</p>${error}${cryptoUnavailable ? `<p class="auth-message error" role="alert">Este navegador no ofrece cifrado seguro en esta página. Ábrela mediante HTTPS para usar el diario.</p>` : ""}<form id="diary-unlock-form" class="modal-form">${fields}<button class="button button-primary" type="submit" ${cryptoUnavailable ? "disabled" : ""}>${hasVault ? "Desbloquear diario" : "Crear diario privado"}</button></form><p class="diary-privacy-note"><strong>Importante:</strong> la clave no se guarda. Si la olvidas, nadie podrá recuperar las anotaciones. El diario queda en este navegador y no se sincroniza con otros dispositivos.</p></section></div>`;
}

function renderDiary() {
  let vault;
  try {
    vault = readDiaryVault();
  } catch (error) {
    lockDiary();
    diaryStatus = `No se pudo leer el diario cifrado: ${error.message}`;
    return renderDiaryLocked(true);
  }
  if (!diaryKey) return renderDiaryLocked(Boolean(vault));

  const year = diaryMonth.getFullYear();
  const month = diaryMonth.getMonth();
  const monthName = diaryMonth.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const monthEntries = diaryEntries.filter((entry) => entry.day?.startsWith(`${year}-${String(month + 1).padStart(2, "0")}-`)).sort((a, b) => b.day.localeCompare(a.day));
  const average = monthEntries.length
    ? (monthEntries.reduce((sum, entry) => sum + (getDiaryMood(entry.mood)?.score || 0), 0) / monthEntries.length).toFixed(1)
    : "—";
  const maxMoodCount = Math.max(1, ...diaryMoods.map((mood) => monthEntries.filter((entry) => entry.mood === mood.value).length));
  const stats = diaryMoods.map((mood) => {
    const count = monthEntries.filter((entry) => entry.mood === mood.value).length;
    return `<div class="diary-stat-row"><span>${mood.icon} ${mood.label}</span><span class="diary-stat-meter"><i style="width:${Math.round(count / maxMoodCount * 100)}%"></i></span><strong>${count}</strong></div>`;
  }).join("");
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: firstDayOffset }, () => `<span class="diary-calendar-empty" aria-hidden="true"></span>`),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const dayNumber = index + 1;
      const day = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
      const entry = diaryEntries.find((item) => item.day === day);
      const mood = entry && getDiaryMood(entry.mood);
      return `<button class="diary-calendar-day ${day === diarySelectedDate ? "selected" : ""} ${day === today ? "today" : ""} ${entry ? "has-entry" : ""}" type="button" data-action="select-diary-day" data-day="${day}" aria-label="${escapeHtml(formatDate(day))}${mood ? `, ánimo: ${mood.label}` : ", sin registro"}" aria-pressed="${day === diarySelectedDate}"><span>${dayNumber}</span>${mood ? `<span class="diary-day-mood" aria-hidden="true">${mood.icon}</span>` : ""}</button>`;
    })
  ].join("");
  const selectedEntry = diaryEntries.find((entry) => entry.day === diarySelectedDate);
  const status = diaryStatus ? `<p class="auth-message error diary-error" role="alert">${escapeHtml(diaryStatus)}</p>` : "";
  const moodOptions = diaryMoods.map((mood) => `<label class="diary-mood-option ${selectedEntry?.mood === mood.value ? "selected" : ""}"><input type="radio" name="mood" value="${mood.value}" ${selectedEntry?.mood === mood.value ? "checked" : ""} required /><span aria-hidden="true">${mood.icon}</span><small>${mood.label}</small></label>`).join("");
  const history = monthEntries.length
    ? monthEntries.map((entry) => {
      const mood = getDiaryMood(entry.mood);
      return `<button class="diary-history-item ${entry.day === diarySelectedDate ? "selected" : ""}" type="button" data-action="select-diary-day" data-day="${entry.day}"><span class="diary-history-mood" aria-hidden="true">${mood?.icon || "♡"}</span><span class="diary-history-copy"><strong>${escapeHtml(formatDate(entry.day, { weekday: "long", day: "numeric", month: "long" }))} · ${escapeHtml(mood?.label || "Sin ánimo")}</strong><span>${entry.note ? escapeHtml(entry.note) : "Sin nota personal"}</span></span></button>`;
    }).join("")
    : `<div class="empty-state">Todavía no hay registros este mes. Puedes empezar con una nota para hoy.</div>`;
  const currentMonth = new Date(new Date(`${today}T12:00:00`).getFullYear(), new Date(`${today}T12:00:00`).getMonth(), 1);
  const canGoForward = diaryMonth < currentMonth;

  return `<div class="view-heading"><div><span class="section-kicker">TU ESPACIO ÍNTIMO</span><h1>Diario emocional</h1><p>Registrar cómo te sientes también es cuidarte.</p></div><button class="button button-quiet button-small" type="button" data-action="lock-diary">Bloquear diario</button></div><div class="diary-privacy-banner"><span aria-hidden="true">🔒</span><span>Notas cifradas en este dispositivo. Solo se pueden leer con tu clave.</span></div>${status}<div class="diary-summary-grid"><article class="stat-card"><span class="stat-icon coral">♡</span><div class="stat-copy"><strong class="stat-value">${monthEntries.length}</strong><span class="stat-label">días registrados este mes</span></div></article><article class="stat-card"><span class="stat-icon yellow">☺</span><div class="stat-copy"><strong class="stat-value">${average}</strong><span class="stat-label">promedio emocional (1–5)</span></div></article></div><div class="diary-layout"><div class="stack"><section class="panel diary-calendar-panel"><div class="diary-month-heading"><button class="icon-button" type="button" data-action="change-diary-month" data-offset="-1" aria-label="Mes anterior">‹</button><h2>${escapeHtml(monthName)}</h2><button class="icon-button" type="button" data-action="change-diary-month" data-offset="1" aria-label="Mes siguiente" ${canGoForward ? "" : "disabled"}>›</button></div><div class="diary-calendar-grid diary-weekdays">${weekdayNames.map((day) => `<span>${day}</span>`).join("")}</div><div class="diary-calendar-grid">${calendarCells}</div><div class="diary-legend"><span>☺ Día con registro emocional</span><span>Selecciona un día para escribir o consultar</span></div></section><section class="panel"><div class="panel-heading"><h2>Estadísticas de ${escapeHtml(monthName)}</h2></div><div class="diary-stats">${stats}</div></section></div><div class="stack"><section class="panel diary-editor"><div class="panel-heading"><div><h2>${selectedEntry ? "Tu registro" : "¿Cómo te sientes?"}</h2><span class="diary-date-label">${escapeHtml(formatDate(diarySelectedDate))}</span></div>${selectedEntry ? `<button class="icon-button" type="button" data-action="delete-diary-entry" data-day="${diarySelectedDate}" title="Eliminar registro" aria-label="Eliminar registro">×</button>` : ""}</div><form id="diary-entry-form"><fieldset class="diary-mood-picker"><legend>Elige tu estado de ánimo</legend><div class="diary-mood-options">${moodOptions}</div></fieldset><div class="form-field"><label for="diary-note">Nota personal <span>(opcional)</span></label><textarea class="field-input diary-note-input" id="diary-note" name="note" maxlength="5000" placeholder="Escribe solo lo que quieras compartir contigo...">${escapeHtml(selectedEntry?.note || "")}</textarea><span class="diary-note-hint">Hasta 5.000 caracteres · se cifra al guardar</span></div><button class="button button-primary" type="submit">${selectedEntry ? "Actualizar registro" : "Guardar registro"}</button></form></section><section class="panel diary-history"><div class="panel-heading"><h2>Registros de ${escapeHtml(monthName)}</h2></div><div class="diary-history-list">${history}</div></section></div></div>`;
}

