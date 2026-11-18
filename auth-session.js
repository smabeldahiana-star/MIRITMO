function showApp(user = null) {
  const previousUserId = authUser?.id || null;
  const nextUserId = user?.id || null;
  const accountChanged = previousUserId !== nextUserId;
  authUser = user;
  localMode = !user;
  authScreen.hidden = true;
  appShell.hidden = false;
  if (user) {
    const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "Mi espacio";
    window.MiRitmoData?.setDisplayName(name);
    if (accountChanged) {
      activeCloudUserId = user.id;
      cloudSyncReady = false;
      appShell.inert = true;
      window.MiRitmoData?.useProfile(user.id);
      window.MiRitmoData?.notify("Cargando los datos de tu cuenta...");
      void loadCloudData(user.id).finally(() => {
        if (activeCloudUserId === user.id) appShell.inert = false;
      });
    }
    document.querySelector(".profile-copy strong").textContent = name;
    document.querySelector(".profile-copy span").textContent = user.email || "Cuenta conectada";
    setProfileAvatar(document.querySelector(".avatar"), name, null);
  } else {
    appShell.inert = false;
    if (accountChanged) {
      activeCloudUserId = null;
      cloudSyncReady = false;
      window.MiRitmoData?.setCloudSync(null);
      window.MiRitmoData?.useProfile(null);
    }
    const name = localProfile?.name || "Mi espacio";
    window.MiRitmoData?.setDisplayName(localProfile?.name);
    document.querySelector(".profile-copy strong").textContent = name;
    document.querySelector(".profile-copy span").textContent = localProfile ? "Perfil en este dispositivo" : "Datos en este dispositivo";
    setProfileAvatar(document.querySelector(".avatar"), name, localProfile?.photo);
  }
}

function getAuthRedirectUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function showAuth(mode = "login", message = "", isError = false) {
  window.MiRitmoData?.lockDiary();
  if (authUser) {
    authUser = null;
    activeCloudUserId = null;
    cloudSyncReady = false;
    window.MiRitmoData?.setCloudSync(null);
    window.MiRitmoData?.useProfile(null);
  }
  authMode = ["login", "signup", "reset", "password"].includes(mode) ? mode : "login";
  localMode = false;
  appShell.inert = false;
  appShell.hidden = true;
  authScreen.hidden = false;
  const modes = {
    login: { title: "Qué bueno verte", intro: "Inicia sesión para entrar a tu espacio personal.", button: "Iniciar sesión" },
    signup: { title: "Crea tu cuenta", intro: "Usa un correo al que puedas acceder para confirmar tu cuenta.", button: "Crear cuenta" },
    reset: { title: "Recupera tu acceso", intro: "Te enviaremos un correo para restablecer tu contraseña.", button: "Enviar correo de recuperación" },
    password: { title: "Elige una contraseña", intro: "Crea una nueva contraseña para tu cuenta.", button: "Guardar contraseña" }
  };
  const current = modes[authMode];
  const nameField = authMode === "signup" ? `<div class="form-field"><label for="auth-name">Nombre</label><input class="field-input" id="auth-name" name="name" autocomplete="name" maxlength="60" value="${escapeAuthText(localProfile?.name)}" required /></div>` : "";
  const emailField = authMode === "password" ? "" : `<div class="form-field"><label for="auth-email">Correo electrónico</label><input class="field-input" id="auth-email" name="email" type="email" autocomplete="email" value="${escapeAuthText(authMode === "login" ? pendingConfirmationEmail : "")}" required /></div>`;
  const passwordField = ["login", "signup", "password"].includes(authMode) ? `<div class="form-field"><label for="auth-password">${authMode === "password" ? "Nueva contraseña" : "Contraseña"}</label><input class="field-input" id="auth-password" name="password" type="password" autocomplete="${authMode === "login" ? "current-password" : "new-password"}" minlength="8" maxlength="72" required /></div>` : "";
  const confirmationField = ["signup", "password"].includes(authMode) ? `<div class="form-field"><label for="auth-password-confirmation">${authMode === "signup" ? "Confirma tu contraseña" : "Confirma la nueva contraseña"}</label><input class="field-input" id="auth-password-confirmation" name="passwordConfirmation" type="password" autocomplete="new-password" minlength="8" maxlength="72" required /></div>` : "";
  const messageBlock = message ? `<div class="auth-message ${isError ? "error" : ""}" role="status">${escapeAuthText(message)}</div>` : "";
  const localButton = `<div class="auth-divider">O CONTINÚA EN ESTE DISPOSITIVO</div><button class="button button-quiet auth-local" type="button" data-auth-action="local">Usar MiRitmo sin cuenta</button>`;
  const setupNote = !accountConfigured ? `<div class="auth-setup"><strong>Cuentas en línea no disponibles</strong>${escapeAuthText(accountSetupError || "Revisa la configuración del servicio.")} Puedes continuar en este dispositivo.</div>` : "";
  let links = "";
  if (authMode === "login") links = `<button class="auth-link" type="button" data-auth-mode="reset">¿Olvidaste tu contraseña?</button><button class="auth-link" type="button" data-auth-action="resend-confirmation">Reenviar confirmación</button><button class="auth-link" type="button" data-auth-mode="signup">Crear una cuenta</button>`;
  if (authMode === "signup" || authMode === "reset") links = `<button class="auth-link" type="button" data-auth-mode="login">Volver al inicio de sesión</button>`;

  authScreen.innerHTML = `<div class="auth-story"><a class="brand" href="#inicio" aria-label="MiRitmo"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>mi<span class="brand-accent">ritmo</span></span></a><div class="auth-story-copy"><span class="section-kicker">ORGANIZA TU DÍA, VIVE A TU RITMO</span><h1>Tu vida, a tu manera.</h1><p>Un espacio para tus planes, tus hábitos y todo eso que quieres cuidar.</p></div><div class="auth-story-foot">UN DÍA A LA VEZ.</div></div><div class="auth-pane"><div class="auth-card"><span class="eyebrow">TU ESPACIO PERSONAL</span><h2>${current.title}</h2><p class="auth-intro">${current.intro}</p>${messageBlock}<form class="auth-form" id="auth-form">${nameField}${emailField}${passwordField}${confirmationField}<button class="button button-primary" type="submit">${current.button}</button></form>${links ? `<div class="auth-links">${links}</div>` : ""}${setupNote}${localButton}</div></div>`;
}

function formatAuthError(error) {
  const message = (error?.message || "").toLowerCase();
  if (message.includes("invalid login credentials")) return "El correo o la contraseña no coinciden.";
  if (message.includes("email not confirmed")) return "Confirma tu correo antes de iniciar sesión.";
  if (message.includes("user already registered")) return "Ya existe una cuenta con ese correo.";
  if (message.includes("password should be at least")) return "La contraseña debe tener al menos 8 caracteres.";
  if (message.includes("rate limit") || message.includes("too many requests")) return "Has hecho varios intentos. Espera un poco y vuelve a probar.";
  return error?.message || "No se pudo completar la solicitud. Inténtalo de nuevo.";
}

