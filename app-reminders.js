function requestReminderPermission(sendTest = false) {
  if (!("Notification" in window)) {
    showToast("Este navegador no admite notificaciones.");
    return;
  }
  if (window.isSecureContext === false) {
    showToast("Para permitir notificaciones, abre MiRitmo desde HTTPS o localhost.");
    return;
  }
  if (Notification.permission === "granted") {
    startReminderChecks();
    if (sendTest) showTestNotification();
    return;
  }
  if (Notification.permission === "denied") {
    showToast("Abre los permisos del sitio en tu navegador y permite las notificaciones.");
    return;
  }
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      startReminderChecks();
      if (sendTest) showTestNotification();
      showToast("Notificaciones permitidas.");
    } else {
      showToast("No se activaron las notificaciones; puedes seguir usando la app.");
    }
    render();
  }).catch((error) => {
    console.warn("No se pudo solicitar permiso para las notificaciones.", error);
    showToast("No se pudo activar el permiso de notificaciones.");
  });
}

function showTestNotification() {
  try {
    const notification = new Notification("MiRitmo", { body: "Las notificaciones están activadas correctamente." });
    notification.onclick = () => window.focus();
    showToast("Notificación de prueba enviada.");
  } catch (error) {
    console.warn("No se pudo mostrar la notificación de prueba.", error);
    showToast("No se pudo mostrar la notificación de prueba.");
  }
}

function sendReminder(key, title, body) {
  if (notifiedReminders.has(key) || data.reminderHistory.includes(key)) return;
  try {
    const notification = new Notification(title, { body });
    notification.onclick = () => window.focus();
    notifiedReminders.add(key);
    data.reminderHistory.push(key);
    data.reminderHistory = data.reminderHistory.slice(-200);
    saveData();
  } catch (error) {
    console.warn("No se pudo mostrar un recordatorio.", error);
    showToast("No se pudo mostrar un recordatorio.");
  }
}

function checkReminders() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (!Array.isArray(data.reminderHistory)) data.reminderHistory = [];
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  for (const task of data.tasks) {
    if (task.reminder && !task.done && task.day === today && task.time <= time) {
      sendReminder(`task:${task.id}:${task.day}:${task.time}`, task.title, `Tu tarea está programada para las ${task.time}.`);
    }
  }
  for (const expense of data.expenses) {
    if (expense.reminder && expense.day === today && time >= "09:00") {
      sendReminder(`expense:${expense.id}:${expense.day}`, `Recordatorio: ${expense.title}`, `Tienes este gasto anotado para hoy por ${money(Number(expense.amount))}.`);
    }
  }
}

function startReminderChecks() {
  if (reminderInterval) return;
  checkReminders();
  reminderInterval = setInterval(checkReminders, 30000);
}

