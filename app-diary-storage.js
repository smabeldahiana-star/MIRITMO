function diaryStorageKey() {
  return `${storageKey}-diary-v1`;
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function deriveDiaryKey(passphrase, salt) {
  if (!crypto.subtle) throw new Error("El navegador no permite cifrado seguro aquí. Abre MiRitmo desde una conexión HTTPS.");
  const passphraseBytes = new TextEncoder().encode(passphrase);
  const material = await crypto.subtle.importKey("raw", passphraseBytes, "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptDiary(entries, key, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(entries));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    version: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext))
  };
}

function readDiaryVault() {
  const raw = localStorage.getItem(diaryStorageKey());
  if (!raw) return null;
  const vault = JSON.parse(raw);
  if (vault?.version !== 1 || !vault.salt || !vault.iv || !vault.ciphertext) {
    throw new Error("El archivo cifrado del diario no tiene un formato válido.");
  }
  return vault;
}

function lockDiary() {
  diaryKey = null;
  diaryEntries = [];
  diaryStatus = "";
}

async function unlockDiary(passphrase, create = false) {
  const vault = readDiaryVault();
  const salt = vault ? base64ToBytes(vault.salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveDiaryKey(passphrase, salt);
  if (vault) {
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(vault.iv) }, key, base64ToBytes(vault.ciphertext));
    const entries = JSON.parse(new TextDecoder().decode(plaintext));
    if (!Array.isArray(entries)) throw new Error("El contenido cifrado del diario no es válido.");
    diaryEntries = entries;
  } else if (create) {
    localStorage.setItem(diaryStorageKey(), JSON.stringify(await encryptDiary([], key, salt)));
    diaryEntries = [];
  } else {
    return false;
  }
  diaryKey = key;
  diaryStatus = "";
  return true;
}

async function saveDiaryEntries() {
  const vault = readDiaryVault();
  if (!vault || !diaryKey) throw new Error("El diario está bloqueado. Desbloquéalo antes de guardar.");
  const encrypted = await encryptDiary(diaryEntries, diaryKey, base64ToBytes(vault.salt));
  localStorage.setItem(diaryStorageKey(), JSON.stringify(encrypted));
}

