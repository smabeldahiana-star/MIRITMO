package com.miritmo;

import com.codename1.io.JSONWriter;
import com.codename1.io.Preferences;
import com.codename1.security.Cipher;
import com.codename1.security.Hmac;
import com.codename1.security.SecureRandom;
import com.codename1.security.SecretKey;
import com.codename1.util.Base64;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class DiaryCrypto {
    private static final int ITERATIONS = 310000;

    private DiaryCrypto() { }

    static List<Map<String, Object>> parseEntries(Object value) {
        if (!(value instanceof List<?>)) {
            throw new IllegalStateException("El diario cifrado no contiene una lista de registros.");
        }
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        for (Object item : (List<?>) value) {
            if (!(item instanceof Map<?, ?>)) {
                throw new IllegalStateException("El diario cifrado contiene un registro no válido.");
            }
            Map<String, Object> entry = new HashMap<String, Object>();
            for (Map.Entry<?, ?> field : ((Map<?, ?>) item).entrySet()) {
                if (!(field.getKey() instanceof String)) {
                    throw new IllegalStateException("El diario cifrado contiene una clave no válida.");
                }
                entry.put((String) field.getKey(), field.getValue());
            }
            result.add(entry);
        }
        return result;
    }

    static byte[] deriveKey(String passphrase, byte[] salt) throws Exception {
        byte[] password = passphrase.getBytes("UTF-8");
        byte[] block = new byte[salt.length + 4];
        System.arraycopy(salt, 0, block, 0, salt.length);
        block[block.length - 1] = 1;
        byte[] u = null;
        try {
            u = Hmac.sha256(password, block);
            byte[] result = u.clone();
            for (int i = 1; i < ITERATIONS; i++) {
                byte[] previous = u;
                u = Hmac.sha256(password, previous);
                for (int j = 0; j < previous.length; j++) previous[j] = 0;
                for (int j = 0; j < result.length; j++) result[j] ^= u[j];
            }
            return result;
        } finally {
            for (int i = 0; i < password.length; i++) password[i] = 0;
            for (int i = 0; i < block.length; i++) block[i] = 0;
            if (u != null) {
                for (int i = 0; i < u.length; i++) u[i] = 0;
            }
        }
    }

    static void persist(String vaultKey, List<Map<String, Object>> entries, byte[] salt, byte[] encryptionKey) throws Exception {
        byte[] nonce = SecureRandom.bytes(12);
        Map<String, Object> payload = new HashMap<String, Object>();
        payload.put("entries", entries);
        byte[] plaintext = JSONWriter.toJson(payload).getBytes("UTF-8");
        byte[] ciphertext = Cipher.aesEncrypt(
                Cipher.AES_GCM,
                new SecretKey("AES", encryptionKey),
                nonce,
                null,
                plaintext
        );
        Map<String, Object> updated = new HashMap<String, Object>();
        updated.put("salt", Base64.encodeNoNewline(salt));
        updated.put("nonce", Base64.encodeNoNewline(nonce));
        updated.put("data", Base64.encodeNoNewline(ciphertext));
        Preferences.set(vaultKey, JSONWriter.toJson(updated));
    }
}
