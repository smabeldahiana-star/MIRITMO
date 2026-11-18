async function submitAuth(form) {
  if (!supabaseClient) {
    showAuth(authMode, accountSetupError || "El acceso en línea no está configurado.", true);
    return;
  }
  const values = Object.fromEntries(new FormData(form).entries());
  const email = values.email?.toString().trim();
  const password = values.password?.toString();
  if (["signup", "password"].includes(authMode) && password !== values.passwordConfirmation) {
    showAuth(authMode, "Las contraseñas no coinciden.", true);
    return;
  }
  const submitButton = form.querySelector("[type=submit]");
  submitButton.disabled = true;
  try {
    if (authMode === "signup") {
      const { data: result, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: values.name.trim() },
          emailRedirectTo: getAuthRedirectUrl()
        }
      });
      if (error) throw error;
      if (result.session?.user) {
        pendingConfirmationEmail = "";
        showApp(result.session.user);
        return;
      }
      pendingConfirmationEmail = email;
      showAuth("login", "Cuenta creada. Revisa tu correo para confirmar la dirección y luego inicia sesión.");
      return;
    }
    if (authMode === "login") {
      const { data: result, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showApp(result.user);
      return;
    }
    if (authMode === "reset") {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: getAuthRedirectUrl() });
      if (error) throw error;
      showAuth("login", "Te enviamos un correo para restablecer la contraseña.");
      return;
    }
    const { data: result, error } = await supabaseClient.auth.updateUser({ password });
    if (error) throw error;
    passwordRecoveryPending = false;
    showApp(result.user);
  } catch (error) {
    showAuth(authMode, formatAuthError(error), true);
  }
}

async function resendConfirmation() {
  const email = document.getElementById("auth-email")?.value.trim();
  if (!email) {
    showAuth("login", "Escribe el correo de la cuenta para reenviar la confirmación.", true);
    return;
  }
  if (!supabaseClient) {
    showAuth("login", accountSetupError || "El acceso en línea no está configurado.", true);
    return;
  }
  try {
    const { error } = await supabaseClient.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: getAuthRedirectUrl() }
    });
    if (error) throw error;
    pendingConfirmationEmail = email;
    showAuth("login", "Si la cuenta aún no está confirmada, enviamos otro correo. Revisa también spam.");
  } catch (error) {
    showAuth("login", formatAuthError(error), true);
  }
}

