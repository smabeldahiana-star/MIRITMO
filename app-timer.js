function toggleTimer() {
  focusRunning = !focusRunning;
  if (focusRunning) {
    focusInterval = setInterval(() => {
      focusRemaining -= 1;
      if (focusRemaining <= 0) {
        focusRemaining = 0;
        clearInterval(focusInterval);
        focusRunning = false;
        data.focusSessions += 1;
        saveData();
        showToast("Buen trabajo. Tómate un momento para respirar.");
      }
      updateTimerDisplay();
    }, 1000);
  } else {
    clearInterval(focusInterval);
  }
  render();
}

function updateTimerDisplay() {
  const display = document.getElementById("timer-display");
  if (!display) return;
  display.textContent = `${String(Math.floor(focusRemaining / 60)).padStart(2, "0")}:${String(focusRemaining % 60).padStart(2, "0")}`;
  const toggleButton = document.getElementById("timer-toggle");
  if (toggleButton) toggleButton.textContent = focusRunning ? "Pausar" : "Empezar";
  const mode = document.querySelector(".timer-mode");
  if (mode) mode.textContent = focusRunning ? "MOMENTO EN CURSO" : "MOMENTO PARA TI";
}

function resetTimer() {
  clearInterval(focusInterval);
  focusRunning = false;
  focusRemaining = focusDuration;
  render();
}

function setDuration(minutes) {
  clearInterval(focusInterval);
  focusRunning = false;
  focusDuration = minutes * 60;
  focusRemaining = focusDuration;
  render();
}

