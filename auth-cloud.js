async function persistCloudData(userId, snapshot) {
  if (!supabaseClient || activeCloudUserId !== userId) return;
  try {
    const { error } = await supabaseClient.from(CLOUD_DATA_TABLE).upsert({
      user_id: userId,
      data: snapshot,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (error) throw error;
  } catch (error) {
    console.error("No se pudieron sincronizar los datos de la cuenta.", error);
    window.MiRitmoData?.notify("Tus cambios siguen guardados en este dispositivo, pero no se sincronizaron.");
  }
}

function flushCloudSave() {
  if (cloudSaveTimer) {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = null;
  }
  if (pendingCloudSave) {
    const pending = pendingCloudSave;
    pendingCloudSave = null;
    cloudSaveQueue = cloudSaveQueue.then(() => persistCloudData(pending.userId, pending.snapshot));
  }
  return cloudSaveQueue;
}

function queueCloudSave(userId, snapshot) {
  if (!cloudSyncReady || activeCloudUserId !== userId) return;
  pendingCloudSave = { userId, snapshot };
  if (cloudSaveTimer) clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(flushCloudSave, 500);
}

async function loadCloudData(userId) {
  try {
    const { data: record, error } = await supabaseClient
      .from(CLOUD_DATA_TABLE)
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (activeCloudUserId !== userId) return;

    if (record) {
      window.MiRitmoData?.setCloudData(userId, record.data);
    } else {
      const { error: saveError } = await supabaseClient.from(CLOUD_DATA_TABLE).upsert({
        user_id: userId,
        data: window.MiRitmoData?.getData(),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      if (saveError) throw saveError;
    }

    if (activeCloudUserId !== userId) return;
    cloudSyncReady = true;
    window.MiRitmoData?.setCloudSync(queueCloudSave);
    window.MiRitmoData?.notify("Tu espacio está conectado a tu cuenta.");
  } catch (error) {
    if (activeCloudUserId !== userId) return;
    cloudSyncReady = false;
    console.error("No se pudieron cargar los datos de la cuenta.", error);
    window.MiRitmoData?.notify("No se pudieron sincronizar tus datos. Revisa la configuración de la base de datos.");
  }
}

