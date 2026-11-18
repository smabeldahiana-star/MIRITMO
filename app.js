window.MiRitmoData = {
  useProfile: useProfileData,
  getData: () => JSON.parse(JSON.stringify(data)),
  setCloudData: (profileId, cloudData) => {
    if (activeProfileId !== profileId) return false;
    if (!cloudData || typeof cloudData !== "object" || !Array.isArray(cloudData.tasks) || !Array.isArray(cloudData.habits) || !Array.isArray(cloudData.workouts) || !Array.isArray(cloudData.expenses)) {
      throw new Error("Los datos guardados en la nube tienen un formato inválido.");
    }
    data = { ...getSeedData(), ...cloudData };
    localStorage.setItem(storageKey, JSON.stringify(data));
    render();
    return true;
  },
  setCloudSync: (handler) => { cloudSyncHandler = handler; },
  setDisplayName,
  notify: showToast,
  lockDiary: () => {
    lockDiary();
    if (currentView === "diary") render();
  }
};

render();
startReminderChecks();
