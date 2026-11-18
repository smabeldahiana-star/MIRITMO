async function unlockDiaryFromForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form).entries());
  const submitButton = form.querySelector("[type=submit]");
  submitButton.disabled = true;
  diaryStatus = "";
  try {
    const vault = readDiaryVault();
    if (!vault && values.passphrase !== values.confirmation) {
      diaryStatus = "Las claves no coinciden.";
      render();
      return;
    }
    await unlockDiary(values.passphrase, !vault);
    render();
  } catch (error) {
    diaryStatus = error.name === "OperationError"
      ? "La clave no coincide o el diario está dañado. Comprueba la clave e inténtalo de nuevo."
      : `No se pudo abrir el diario: ${error.message}`;
    render();
  } finally {
    submitButton.disabled = false;
  }
}

async function saveDiaryEntryFromForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  if (!diaryKey) {
    lockDiary();
    render();
    return;
  }
  const values = Object.fromEntries(new FormData(form).entries());
  const previousEntries = diaryEntries;
  const entry = diaryEntries.find((item) => item.day === diarySelectedDate);
  const updatedEntry = {
    ...(entry || { id: generateId(), createdAt: new Date().toISOString() }),
    day: diarySelectedDate,
    mood: values.mood,
    note: values.note,
    updatedAt: new Date().toISOString()
  };
  diaryEntries = entry
    ? diaryEntries.map((item) => item.day === diarySelectedDate ? updatedEntry : item)
    : [...diaryEntries, updatedEntry];
  const submitButton = form.querySelector("[type=submit]");
  submitButton.disabled = true;
  try {
    await saveDiaryEntries();
    diaryStatus = "";
    render();
    showToast("Registro guardado y cifrado.");
  } catch (error) {
    diaryEntries = previousEntries;
    diaryStatus = `No se pudo guardar el registro: ${error.message}`;
    render();
  } finally {
    submitButton.disabled = false;
  }
}

