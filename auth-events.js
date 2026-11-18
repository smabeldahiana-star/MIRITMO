document.addEventListener("click", async (event) => {
  const modeButton = event.target.closest("[data-auth-mode]");
  if (modeButton) showAuth(modeButton.dataset.authMode);
  const actionButton = event.target.closest("[data-auth-action], [data-account-action]");
  if (!actionButton) return;
  if (actionButton.dataset.authAction === "resend-confirmation") {
    void resendConfirmation();
    return;
  }
  if (actionButton.dataset.authAction === "local") {
    showApp();
    return;
  }
  const action = actionButton.dataset.accountAction;
  if (action === "remove-photo") {
    pendingProfilePhoto = null;
    const input = document.getElementById("local-profile-photo");
    if (input) input.value = "";
    const name = document.getElementById("local-profile-name")?.value || "Mi espacio";
    setProfileAvatar(document.getElementById("local-profile-avatar"), name, null);
    setPhotoStatus("La foto se quitará cuando guardes el perfil.");
  }
  if (action === "close") accountBackdrop.hidden = true;
  if (action === "access") {
    accountBackdrop.hidden = true;
    showAuth("login");
  }
  if (action === "logout") {
    await flushCloudSave();
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      window.alert(formatAuthError(error));
      return;
    }
    accountBackdrop.hidden = true;
    showApp();
    window.MiRitmoData?.notify("Has cerrado sesión. Puedes seguir usando MiRitmo en este dispositivo.");
  }
});

document.addEventListener("input", (event) => {
  const input = event.target;
  if (input instanceof HTMLInputElement && input.dataset.ageOutput) updateProfileAge(input);
});

document.addEventListener("change", async (event) => {
  if (event.target.id !== "local-profile-photo") return;
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  input.disabled = true;
  setPhotoStatus("");
  try {
    pendingProfilePhoto = await resizeProfilePhoto(file);
    const name = document.getElementById("local-profile-name")?.value || "Mi espacio";
    setProfileAvatar(document.getElementById("local-profile-avatar"), name, pendingProfilePhoto);
    setPhotoStatus("Vista previa lista. Guarda el perfil para conservar la foto.");
  } catch (error) {
    input.value = "";
    setPhotoStatus(error instanceof Error ? error.message : "No se pudo procesar la foto.");
  } finally {
    input.disabled = false;
  }
});

