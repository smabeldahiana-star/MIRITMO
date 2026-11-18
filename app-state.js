function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback para navegadores antiguos que no tienen crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let storageKey = "miritmo-data-v1";
let activeProfileId = null;
let cloudSyncHandler = null;
const today = dateKey(new Date());
const viewNames = { home: "Resumen", tasks: "Agenda", habits: "Hábitos", workouts: "Entrenamiento", expenses: "Mis gastos", savings: "Mis ahorros", diary: "Diario emocional", focus: "Tiempo de enfoque" };
const viewIcons = { tasks: "▤", habits: "◉", workouts: "↗", expenses: "$", savings: "◇", diary: "♡", focus: "◷" };
const weekdayNames = ["L", "M", "X", "J", "V", "S", "D"];
const expenseCategories = ["Casa", "Comida", "Transporte", "Salud", "Servicios", "Educación", "Ocio", "Otros"];
const diaryMoods = [
  { value: "great", label: "Muy bien", icon: "😊", score: 5 },
  { value: "good", label: "Bien", icon: "🙂", score: 4 },
  { value: "okay", label: "Regular", icon: "😐", score: 3 },
  { value: "low", label: "Bajo", icon: "😔", score: 2 },
  { value: "hard", label: "Difícil", icon: "😣", score: 1 }
];
let currentView = "home";
let selectedDate = today;
let expenseFilter = "all";
let expenseMonth = today.slice(0, 7);
let greetingName = "";
let toastTimeout;
let reminderInterval = null;
const notifiedReminders = new Set();
let focusInterval = null;
let focusDuration = 25 * 60;
let focusRemaining = focusDuration;
let focusRunning = false;
let diaryKey = null;
let diaryEntries = [];
let diaryMonth = new Date(new Date(`${today}T12:00:00`).getFullYear(), new Date(`${today}T12:00:00`).getMonth(), 1);
let diarySelectedDate = today;
let diaryStatus = "";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function formatDate(value, options = { weekday: "long", day: "numeric", month: "long" }) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-ES", options);
}

function money(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

