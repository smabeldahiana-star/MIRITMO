function renderFocus() {
  const minutes = String(Math.floor(focusRemaining / 60)).padStart(2, "0");
  const seconds = String(focusRemaining % 60).padStart(2, "0");
  return `<div class="view-heading"><div><span class="section-kicker">UNA COSA A LA VEZ</span><h1>Tiempo de enfoque</h1><p>Un pequeño espacio para avanzar sin prisa.</p></div></div><div class="focus-layout"><div class="panel timer-panel"><span class="timer-mode">${focusRunning ? "MOMENTO EN CURSO" : "MOMENTO PARA TI"}</span><div class="timer-face" id="timer-face"><span id="timer-display">${minutes}:${seconds}</span></div><div class="timer-controls"><button class="button button-primary" id="timer-toggle">${focusRunning ? "Pausar" : "Empezar"}</button><button class="button button-quiet" id="timer-reset">Reiniciar</button></div><p class="timer-caption">Elige el tiempo que te venga bien hoy.</p><div class="duration-options">${[15, 25, 45].map((duration) => `<button class="duration-button ${focusDuration === duration * 60 ? "active" : ""}" data-duration="${duration}">${duration} min</button>`).join("")}</div></div><div class="stack"><div class="panel"><div class="panel-heading"><h2>Tu ritmo también cuenta</h2></div><p style="margin:0;color:var(--muted);font-size:12px;line-height:1.75">Elige una sola tarea para este rato. Cuando termines, puedes descansar, seguir o simplemente reconocer lo que avanzaste.</p></div><div class="panel"><div class="panel-heading"><h2>Momentos completados</h2></div><div class="focus-mini"><div class="focus-ring"><span>✓</span></div><div class="focus-mini-copy"><strong>${data.focusSessions} ${data.focusSessions === 1 ? "sesión" : "sesiones"}</strong><span>Cada pausa empieza por estar aquí.</span></div></div></div><div class="side-note"><strong>Sin presión.</strong><p>Puedes pausar o reiniciar cuando quieras. Este temporizador funciona solo en esta pantalla.</p></div></div></div>`;
}

function addFeatureLogo(heading, symbol, feature) {
  if (!heading || heading.querySelector(":scope > .feature-logo")) return;
  const logo = document.createElement("span");
  logo.className = "feature-logo";
  logo.dataset.feature = feature;
  logo.setAttribute("aria-hidden", "true");
  logo.textContent = symbol;
  heading.prepend(logo);
}

function decorateFeatureLogos(content) {
  const viewLogos = {
    home: "⌂",
    tasks: "▦",
    habits: "◉",
    workouts: "↗",
    expenses: "$",
    savings: "◇",
    diary: "♡",
    focus: "◷"
  };
  addFeatureLogo(content.querySelector(".view-heading h1, .welcome-row h1"), viewLogos[currentView], currentView);

  const sectionLogoRules = [
    { matches: (heading, title) => title === "El plan de hoy", symbol: "▤", feature: "tasks" },
    { matches: (heading, title) => title === "Pequeños hábitos", symbol: "◉", feature: "habits" },
    { matches: (heading, title) => title === "Un rato de enfoque" || title === "Tu ritmo también cuenta" || title === "Momentos completados", symbol: "◷", feature: "focus" },
    { matches: (heading, title) => title === "Calendario semanal" || heading.matches(".diary-month-heading h2"), symbol: "▦", feature: "calendar" },
    { matches: (heading, title) => title === "Objetivos deportivos" || title === "Próximos entrenamientos" || title === "Entrenamientos anteriores", symbol: "↗", feature: "workouts" },
    { matches: (heading, title) => title === "Resumen por categoría", symbol: "◉", feature: "category" },
    { matches: (heading, title) => title === "Presupuesto mensual", symbol: "$", feature: "budget" },
    { matches: (heading, title) => title === "Movimientos", symbol: "⇄", feature: "expenses" },
    { matches: (heading, title) => title.startsWith("Estadísticas de") || title.startsWith("Registros de") || title === "Tu registro" || title === "¿Cómo te sientes?" || heading.matches(".diary-lock-card h2"), symbol: "♡", feature: "diary" },
    { matches: (heading) => heading.matches(".savings-card-heading h2"), symbol: "◇", feature: "savings" }
  ];

  content.querySelectorAll(".panel-heading h2, .savings-card-heading h2, .diary-month-heading h2, .diary-lock-card h2").forEach((heading) => {
    const title = heading.textContent.trim();
    const rule = sectionLogoRules.find((candidate) => candidate.matches(heading, title));
    if (rule) addFeatureLogo(heading, rule.symbol, rule.feature);
  });
}

function renderNotificationControl() {
  if (!("Notification" in window)) {
    return `<section class="panel notification-panel"><div class="notification-copy"><h2>Notificaciones</h2><p>Este navegador no admite notificaciones.</p></div><span class="tag">No disponibles</span></section>`;
  }
  const description = Notification.permission === "granted"
    ? "El permiso está activo. Envía un aviso de prueba para comprobarlo."
    : Notification.permission === "denied"
      ? "El permiso está bloqueado. Cámbialo en la configuración del sitio."
      : "Activa los avisos para probar una notificación y recibir tus recordatorios.";
  const label = Notification.permission === "granted"
    ? "Probar notificación"
    : Notification.permission === "denied"
      ? "Cómo permitir notificaciones"
      : "Permitir notificaciones";
  const action = Notification.permission === "granted" ? "test-notifications" : "enable-notifications";
  return `<section class="panel notification-panel"><div class="notification-copy"><h2>Notificaciones</h2><p>${description}</p></div><button class="button button-quiet button-small" type="button" data-action="${action}">🔔 ${label}</button></section>`;
}

