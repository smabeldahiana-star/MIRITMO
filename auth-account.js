function renderAccount() {
  if (!authUser) {
    if (localMode || !accountConfigured) {
      const name = localProfile?.name || "Mi espacio";
      pendingProfilePhoto = isProfilePhoto(localProfile?.photo) ? localProfile.photo : null;
      accountContent.innerHTML = `<form id="local-profile-form" class="account-profile">
        <div class="form-field"><label for="local-profile-name">¿Cómo te llamamos?</label><input class="field-input" id="local-profile-name" name="name" autocomplete="name" maxlength="60" value="${escapeAuthText(localProfile?.name)}" required placeholder="Tu nombre" /></div>
        <div class="form-grid">
          <div class="form-field"><label for="local-profile-gender">Género <span style="font-weight:400">(opcional)</span></label><select class="field-select" id="local-profile-gender" name="gender">${renderGenderOptions(localProfile?.gender)}</select></div>
          <div class="form-field"><label for="local-profile-birth-date">Fecha de nacimiento <span style="font-weight:400">(opcional)</span></label><input class="field-input" id="local-profile-birth-date" name="birthDate" type="date" max="${todayDateInputValue()}" value="${escapeAuthText(localProfile?.birthDate)}" data-age-output="local-profile-age" /></div>
        </div>
        <div class="profile-age" role="status" aria-live="polite"><span>Edad</span><strong id="local-profile-age"></strong></div>
        <div class="form-field"><label for="local-profile-photo">Foto de perfil</label><div class="profile-photo-editor"><div class="avatar profile-avatar-preview" id="local-profile-avatar"></div><div class="profile-photo-controls"><input class="field-input" id="local-profile-photo" type="file" accept="image/jpeg,image/png,image/webp" /><button class="auth-link" type="button" data-account-action="remove-photo">Quitar foto</button></div></div><p class="account-hint">JPG, PNG o WebP; se ajusta para guardarse en este dispositivo.</p><p class="account-hint profile-photo-status" id="profile-photo-status" role="status" aria-live="polite"></p></div>
        <p class="account-hint">Este perfil se guarda solo en este dispositivo. Género y fecha de nacimiento son opcionales; la edad se calcula automáticamente.</p>
        ${accountConfigured ? `<button class="auth-link" type="button" data-account-action="access">Crear o usar una cuenta en línea</button>` : ""}
        <div class="modal-actions"><button class="button button-quiet" type="button" data-account-action="close">Cerrar</button><button class="button button-primary" type="submit">Guardar perfil</button></div>
      </form>`;
      setProfileAvatar(document.getElementById("local-profile-avatar"), name, pendingProfilePhoto);
      updateProfileAge(document.getElementById("local-profile-birth-date"));
      return;
    }
    accountContent.innerHTML = `<p class="account-hint">Inicia sesión para administrar tu perfil.</p><div class="modal-actions"><button class="button button-quiet" type="button" data-account-action="close">Cerrar</button><button class="button button-primary" type="button" data-account-action="access">Iniciar sesión</button></div>`;
    return;
  }
  const metadata = authUser.user_metadata || {};
  const birthDate = calculateProfileAge(metadata.birth_date) === null ? "" : metadata.birth_date;
  accountContent.innerHTML = `<form id="profile-form" class="account-profile">
    <div class="form-field"><label for="profile-name">Nombre</label><input class="field-input" id="profile-name" name="name" maxlength="60" value="${escapeAuthText(metadata.display_name)}" required /></div>
    <div class="form-field"><label for="profile-email">Correo electrónico</label><input class="field-input" id="profile-email" name="email" type="email" autocomplete="email" value="${escapeAuthText(authUser.email)}" required /><span class="account-email">Si cambias el correo, el proveedor solicitará confirmación.</span></div>
    <div class="form-grid">
      <div class="form-field"><label for="profile-gender">Género <span style="font-weight:400">(opcional)</span></label><select class="field-select" id="profile-gender" name="gender">${renderGenderOptions(metadata.gender)}</select></div>
      <div class="form-field"><label for="profile-birth-date">Fecha de nacimiento <span style="font-weight:400">(opcional)</span></label><input class="field-input" id="profile-birth-date" name="birthDate" type="date" max="${todayDateInputValue()}" value="${escapeAuthText(birthDate)}" data-age-output="profile-age" /></div>
    </div>
    <div class="profile-age" role="status" aria-live="polite"><span>Edad</span><strong id="profile-age"></strong></div>
    <p class="account-hint">Género y fecha de nacimiento son opcionales; la edad se calcula automáticamente.</p>
    <div class="modal-actions"><button class="button button-quiet" type="button" data-account-action="logout">Cerrar sesión</button><button class="button button-primary" type="submit">Guardar perfil</button></div>
  </form>`;
  updateProfileAge(document.getElementById("profile-birth-date"));
}

function openAccount() {
  if (accountConfigured && !authUser && !localMode) {
    showAuth("login");
    return;
  }
  renderAccount();
  accountBackdrop.hidden = false;
}

