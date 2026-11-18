document.addEventListener("submit", async (event) => {
  if (event.target.id === "local-profile-form") {
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const values = Object.fromEntries(new FormData(event.target).entries());
    const updatedProfile = {
      name: values.name.trim(),
      photo: pendingProfilePhoto,
      gender: PROFILE_GENDERS.includes(values.gender) ? values.gender : "",
      birthDate: calculateProfileAge(values.birthDate) === null ? "" : values.birthDate
    };
    try {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updatedProfile));
    } catch {
      setPhotoStatus("No se pudo guardar el perfil en este dispositivo. Libera espacio del navegador e inténtalo de nuevo.");
      return;
    }
    localProfile = updatedProfile;
    accountBackdrop.hidden = true;
    showApp();
    window.MiRitmoData?.notify("Tu perfil quedó guardado en este dispositivo.");
    return;
  }
  if (event.target.id === "auth-form") {
    event.preventDefault();
    if (event.target.reportValidity()) await submitAuth(event.target);
  }
  if (event.target.id === "profile-form") {
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const values = Object.fromEntries(new FormData(event.target).entries());
    const changes = {
      data: {
        display_name: values.name.trim(),
        gender: PROFILE_GENDERS.includes(values.gender) ? values.gender : "",
        birth_date: calculateProfileAge(values.birthDate) === null ? "" : values.birthDate
      }
    };
    if (values.email !== authUser.email) changes.email = values.email.trim();
    const button = event.target.querySelector("[type=submit]");
    button.disabled = true;
    const { data: result, error } = await supabaseClient.auth.updateUser(changes);
    if (error) {
      button.disabled = false;
      window.alert(formatAuthError(error));
      return;
    }
    authUser = result.user;
    showApp(authUser);
    renderAccount();
    window.alert("Perfil actualizado.");
  }
});

document.getElementById("account-open").addEventListener("click", openAccount);
document.getElementById("account-close").addEventListener("click", () => { accountBackdrop.hidden = true; });
accountBackdrop.addEventListener("click", (event) => { if (event.target === accountBackdrop) accountBackdrop.hidden = true; });
