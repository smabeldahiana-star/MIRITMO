package com.miritmo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class MiRitmoStoreValues {
    private MiRitmoStoreValues() { }

    static Map<String, Object> entry(String... fields) {
        Map<String, Object> item = new HashMap<String, Object>();
        for (int i = 0; i + 1 < fields.length; i += 2) item.put(fields[i], fields[i + 1]);
        return item;
    }

    static String string(Map<String, Object> item, String key) {
        Object value = item.get(key);
        return value == null ? "" : String.valueOf(value);
    }

    static boolean bool(Map<String, Object> item, String key) {
        Object value = item.get(key);
        return Boolean.TRUE.equals(value) || "true".equals(String.valueOf(value));
    }

    static double number(Map<String, Object> item, String key) {
        Object value = item.get(key);
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return 0;
        }
    }

    static List<String> stringList(Object value) {
        List<String> result = new ArrayList<String>();
        if (value instanceof List<?>) {
            for (Object item : (List<?>) value) result.add(String.valueOf(item));
        }
        return result;
    }
}
