async function handleDiaryAction(button) {
  const { action, day, offset } = button.dataset;
  if (action === "lock-diary") {
    lockDiary();
    render();
    return;
  }
  if (!diaryKey) {
    lockDiary();
    render();
    return;
  }
  if (action === "change-diary-month") {
    diaryMonth = new Date(diaryMonth.getFullYear(), diaryMonth.getMonth() + Number(offset), 1);
    diarySelectedDate = dateKey(diaryMonth);
    render();
    return;
  }
  if (action === "select-diary-day") {
    diarySelectedDate = day;
    const selected = new Date(`${day}T12:00:00`);
    diaryMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
    render();
    return;
  }
  if (action === "delete-diary-entry") {
    if (!window.confirm("¿Quieres eliminar de forma permanente el registro de este día?")) return;
    const previousEntries = diaryEntries;
    diaryEntries = diaryEntries.filter((entry) => entry.day !== day);
    try {
      await saveDiaryEntries();
      render();
      showToast("Registro eliminado.");
    } catch (error) {
      diaryEntries = previousEntries;
      diaryStatus = `No se pudo eliminar el registro: ${error.message}`;
      render();
    }
  }
}

