function getSeedData() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    tasks: [
      { id: generateId(), title: "Revisar prioridades de la semana", time: "09:00", category: "Personal", day: today, done: false },
      { id: generateId(), title: "Paseo y pausa para respirar", time: "12:30", category: "Bienestar", day: today, done: false },
      { id: generateId(), title: "Llamar a Ana", time: "17:00", category: "Personal", day: today, done: false },
      { id: generateId(), title: "Preparar la lista del súper", time: "10:00", category: "Casa", day: dateKey(tomorrow), done: false }
    ],
    habits: [
      { id: generateId(), name: "Tomar agua", symbol: "◌", days: [] },
      { id: generateId(), name: "Leer 10 minutos", symbol: "▤", days: [] },
      { id: generateId(), name: "Estirar el cuerpo", symbol: "↗", days: [] }
    ],
    workouts: [
      { id: generateId(), title: "Caminata al aire libre", day: today, time: "07:30", duration: 30, type: "Cardio", done: false },
      { id: generateId(), title: "Movilidad y estiramientos", day: dateKey(tomorrow), time: "18:00", duration: 20, type: "Movilidad", done: false }
    ],
    expenses: [
      { id: generateId(), title: "Compra para la casa", amount: 28500, paidBy: "Yo", participants: "Yo y Alex", day: today },
      { id: generateId(), title: "Cena del viernes", amount: 42000, paidBy: "Alex", participants: "Yo y Alex", day: today }
    ],
    savings: [],
    monthlyBudget: 0,
    reminderHistory: [],
    focusSessions: 0,
    goals: []
  };
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.tasks) && Array.isArray(saved.habits) && Array.isArray(saved.workouts) && Array.isArray(saved.expenses)) {
      return { ...getSeedData(), ...saved };
    }
  } catch (error) {
    console.warn("No se pudieron leer los datos guardados.", error);
  }
  return getSeedData();
}

