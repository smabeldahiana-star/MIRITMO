function isProfilePhoto(value) {
  return typeof value === "string"
    && value.length <= 1500000
    && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
}

function loadLocalProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY));
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) return null;
    return {
      name: typeof profile.name === "string" ? profile.name : "",
      photo: isProfilePhoto(profile.photo) ? profile.photo : null,
      gender: PROFILE_GENDERS.includes(profile.gender) ? profile.gender : "",
      birthDate: calculateProfileAge(profile.birthDate) === null ? "" : profile.birthDate
    };
  } catch {
    return null;
  }
}

function escapeAuthText(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function todayDateInputValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function calculateProfileAge(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day || value > todayDateInputValue()) return null;
  let age = today.getFullYear() - year;
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age -= 1;
  return age;
}

function renderGenderOptions(selectedGender) {
  return `<option value="">Elige una opción (opcional)</option>${PROFILE_GENDERS.map((gender) => `<option value="${gender}"${gender === selectedGender ? " selected" : ""}>${gender}</option>`).join("")}`;
}

function updateProfileAge(input) {
  const output = document.getElementById(input.dataset.ageOutput);
  if (!output) return;
  const age = calculateProfileAge(input.value);
  output.textContent = input.value
    ? age === null ? "Revisa la fecha" : `${age} ${age === 1 ? "año" : "años"}`
    : "Se calculará al indicar la fecha.";
}

function setProfileAvatar(avatar, name, photo) {
  const safePhoto = isProfilePhoto(photo) ? photo : null;
  avatar.textContent = safePhoto ? "" : (name.trim().charAt(0).toUpperCase() || "M");
  avatar.style.backgroundImage = safePhoto ? `url("${safePhoto}")` : "";
  avatar.setAttribute("role", "img");
  avatar.setAttribute("aria-label", safePhoto ? `Foto de perfil de ${name}` : `Inicial de ${name}`);
}

async function resizeProfilePhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Elige una imagen JPG, PNG o WebP.");
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    throw new Error("La foto debe pesar menos de 8 MB.");
  }
  if (!window.createImageBitmap) {
    throw new Error("Este navegador no permite preparar la foto. Prueba con otro navegador.");
  }

  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, PROFILE_PHOTO_MAX_DIMENSION / image.width, PROFILE_PHOTO_MAX_DIMENSION / image.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la foto. Inténtalo de nuevo.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL("image/jpeg", 0.82);
    if (!isProfilePhoto(photo)) throw new Error("No se pudo procesar la foto. Inténtalo con otra imagen.");
    return photo;
  } finally {
    image.close();
  }
}

function setPhotoStatus(message) {
  const status = document.getElementById("profile-photo-status");
  if (status) status.textContent = message;
}

