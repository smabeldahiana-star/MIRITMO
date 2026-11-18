package com.miritmo;

import com.codename1.io.JSONParser;
import com.codename1.io.Preferences;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class MiRitmoStoreData {
    private MiRitmoStoreData() { }

    static void load(Map<String, Object> data, String key) {
        String saved = Preferences.get(key, null);
        if (saved != null && !saved.trim().isEmpty()) {
            try {
                Map<?, ?> parsed = new JSONParser().parseJSON(new StringReader(saved));
                for (Map.Entry<?, ?> entry : parsed.entrySet()) {
                    if (!(entry.getKey() instanceof String)) {
                        throw new IllegalStateException("Los datos guardados de MiRitmo contienen una clave no válida.");
                    }
                    data.put((String) entry.getKey(), entry.getValue());
                }
                validateLists(data);
            } catch (Exception error) {
                throw new IllegalStateException("No se pudieron leer los datos guardados de MiRitmo.", error);
            }
        }
        for (String name : new String[] { "tasks", "habits", "workouts", "expenses", "goals" }) {
            ensureList(data, name);
        }
    }

    static Map<String, Object> stringKeyedMap(Map<?, ?> source, String listName) {
        Map<String, Object> result = new HashMap<String, Object>();
        for (Map.Entry<?, ?> entry : source.entrySet()) {
            if (!(entry.getKey() instanceof String)) {
                throw new IllegalStateException("Los datos guardados para " + listName + " contienen una clave no válida.");
            }
            result.put((String) entry.getKey(), entry.getValue());
        }
        return result;
    }

    private static void validateLists(Map<String, Object> data) {
        String[] expectedLists = { "tasks", "habits", "workouts", "expenses", "goals" };
        for (String listName : expectedLists) {
            Object value = data.get(listName);
            if (value != null && !(value instanceof List<?>)) {
                throw new IllegalStateException("La lista guardada '" + listName + "' no tiene un formato válido.");
            }
            if (value instanceof List<?>) {
                for (Object item : (List<?>) value) {
                    if (!(item instanceof Map<?, ?>)) {
                        throw new IllegalStateException("La lista guardada '" + listName + "' contiene un elemento no válido.");
                    }
                }
            }
        }
    }

    private static void ensureList(Map<String, Object> data, String name) {
        if (!(data.get(name) instanceof List)) data.put(name, new ArrayList<Map<String, Object>>());
    }
}
