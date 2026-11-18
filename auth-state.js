const authScreen = document.getElementById("auth-screen");
const appShell = document.querySelector(".app-shell");
const accountBackdrop = document.getElementById("account-backdrop");
const accountContent = document.getElementById("account-content");
const authConfig = window.MIRITMO_AUTH_CONFIG;
let supabaseClient = null;
let accountSetupError = "";
if (!authConfig?.supabaseUrl || !authConfig?.supabaseAnonKey) {
  accountSetupError = "Falta la configuración de Supabase.";
} else if (!window.supabase?.createClient) {
  accountSetupError = "No se pudo cargar el servicio de cuentas. Revisa tu conexión.";
} else {
  try {
    supabaseClient = window.supabase.createClient(authConfig.supabaseUrl, authConfig.supabaseAnonKey);
  } catch (error) {
    console.error("No se pudo iniciar el servicio de cuentas.", error);
    accountSetupError = "No se pudo iniciar el servicio de cuentas. Revisa la configuración.";
  }
}
const accountConfigured = Boolean(supabaseClient);
const CLOUD_DATA_TABLE = "miritmo_user_data";
let authUser = null;
let authMode = "login";
let localMode = false;
let passwordRecoveryPending = false;
let pendingConfirmationEmail = "";
let activeCloudUserId = null;
let cloudSyncReady = false;
let pendingCloudSave = null;
let cloudSaveTimer = null;
let cloudSaveQueue = Promise.resolve();
const LOCAL_PROFILE_KEY = "miritmo-profile-v1";
const PROFILE_PHOTO_MAX_BYTES = 8 * 1024 * 1024;
const PROFILE_PHOTO_MAX_DIMENSION = 512;
const PROFILE_GENDERS = ["Mujer", "Hombre", "No binario", "Otro", "Prefiero no decirlo"];
let localProfile = loadLocalProfile();
let pendingProfilePhoto = null;
