document.addEventListener("keydown", (event) => { if (event.key === "Escape") accountBackdrop.hidden = true; });

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      passwordRecoveryPending = true;
      showAuth("password");
      return;
    }
    if (event === "SIGNED_IN" && session?.user) {
      passwordRecoveryPending = false;
      showApp(session.user);
    } else if (event === "SIGNED_OUT") {
      passwordRecoveryPending = false;
      accountBackdrop.hidden = true;
      showApp();
    }
  });
}
showApp();

window.MiRitmoAuth = { openAccount };