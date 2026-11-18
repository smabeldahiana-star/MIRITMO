function saveData() {
  const serialized = JSON.stringify(data);
  localStorage.setItem(storageKey, serialized);
  if (activeProfileId && cloudSyncHandler) cloudSyncHandler(activeProfileId, JSON.parse(serialized));
}

function materializeRecurringExpenses() {
  const currentPeriod = today.slice(0, 7);
  let changed = false;
  for (const template of data.expenses.filter((expense) => expense.recurrence === "monthly" && !expense.recurringSourceId)) {
    const [startYear, startMonth, startDay] = template.day.split("-").map(Number);
    let year = startYear;
    let month = startMonth;
    while (`${year}-${String(month).padStart(2, "0")}` < currentPeriod) {
      month += 1;
      if (month > 12) {
        year += 1;
        month = 1;
      }
      const period = `${year}-${String(month).padStart(2, "0")}`;
      const lastDay = new Date(year, month, 0).getDate();
      const day = `${period}-${String(Math.min(startDay, lastDay)).padStart(2, "0")}`;
      if (day > today || data.expenses.some((expense) => expense.recurringSourceId === template.id && expense.recurringPeriod === period)) continue;
      data.expenses.push({
        ...template,
        id: generateId(),
        day,
        recurrence: "none",
        recurringSourceId: template.id,
        recurringPeriod: period,
        shares: Array.isArray(template.shares) ? template.shares.map((share) => ({ ...share })) : []
      });
      changed = true;
    }
  }
  if (changed) saveData();
}

function useProfileData(profileId) {
  lockDiary();
  const nextStorageKey = profileId ? `miritmo-data-v1-${profileId}` : "miritmo-data-v1";
  const localDataMigrated = localStorage.getItem("miritmo-cloud-data-migrated-v1");
  if (profileId && !localDataMigrated && storageKey === "miritmo-data-v1") {
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      if (!localStorage.getItem(nextStorageKey)) localStorage.setItem(nextStorageKey, localData);
      localStorage.setItem("miritmo-cloud-data-migrated-v1", profileId);
    }
  }
  storageKey = nextStorageKey;
  activeProfileId = profileId || null;
  data = loadData();
  materializeRecurringExpenses();
  render();
}

function setDisplayName(name) {
  greetingName = name || "";
}

let data = loadData();
materializeRecurringExpenses();
