package com.miritmo;

import com.codename1.io.JSONParser;
import com.codename1.io.Preferences;
import com.codename1.security.Cipher;
import com.codename1.security.SecureRandom;
import com.codename1.security.SecretKey;
import com.codename1.util.Base64;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

final class DiaryVault {
    private static final String VAULT_KEY = "miritmo.diary.v1";
    private byte[] encryptionKey;
    private List<Map<String, Object>> entries = new ArrayList<Map<String, Object>>();

    boolean exists() {
        return Preferences.get(VAULT_KEY, null) != null;
    }

    boolean isUnlocked() {
        return encryptionKey != null;
    }

    List<Map<String, Object>> getEntries() {
        return entries;
    }

    void lock() {
        if (encryptionKey != null) {
            for (int i = 0; i < encryptionKey.length; i++) encryptionKey[i] = 0;
        }
        encryptionKey = null;
        entries = new ArrayList<Map<String, Object>>();
    }

    void create(String passphrase) throws Exception {
        if (exists()) throw new IllegalStateException("Ya existe un diario protegido en este dispositivo.");
        if (passphrase == null || passphrase.length() < 10) {
            throw new IllegalArgumentException("La clave debe tener al menos 10 caracteres.");
        }
        byte[] salt = SecureRandom.bytes(16);
        encryptionKey = DiaryCrypto.deriveKey(passphrase, salt);
        entries = new ArrayList<Map<String, Object>>();
        try {
            DiaryCrypto.persist(VAULT_KEY, entries, salt, encryptionKey);
        } catch (Exception error) {
            lock();
            throw error;
        }
    }

    void unlock(String passphrase) throws Exception {
        String raw = Preferences.get(VAULT_KEY, null);
        if (raw == null) throw new IllegalStateException("Primero crea tu diario privado.");
        Map<?, ?> vault = new JSONParser().parseJSON(new StringReader(raw));
        byte[] salt = Base64.decode(((String) vault.get("salt")).getBytes("UTF-8"));
        byte[] nonce = Base64.decode(((String) vault.get("nonce")).getBytes("UTF-8"));
        byte[] ciphertext = Base64.decode(((String) vault.get("data")).getBytes("UTF-8"));
        byte[] candidateKey = DiaryCrypto.deriveKey(passphrase, salt);
        try {
            byte[] plaintext = Cipher.aesDecrypt(
                    Cipher.AES_GCM, new SecretKey("AES", candidateKey), nonce, null, ciphertext);
            Map<?, ?> decoded = new JSONParser().parseJSON(new StringReader(new String(plaintext, "UTF-8")));
            List<Map<String, Object>> decodedEntries = DiaryCrypto.parseEntries(decoded.get("entries"));
            encryptionKey = candidateKey;
            entries = decodedEntries;
        } catch (Exception error) {
            for (int i = 0; i < candidateKey.length; i++) candidateKey[i] = 0;
            throw error;
        }
    }

    void save() throws Exception {
        if (encryptionKey == null) throw new IllegalStateException("El diario está bloqueado.");
        byte[] salt;
        String raw = Preferences.get(VAULT_KEY, null);
        if (raw == null) {
            throw new IllegalStateException("El diario todavía no se ha creado.");
        }
        Map<?, ?> vault = new JSONParser().parseJSON(new StringReader(raw));
        salt = Base64.decode(((String) vault.get("salt")).getBytes("UTF-8"));
        DiaryCrypto.persist(VAULT_KEY, entries, salt, encryptionKey);
    }

}
