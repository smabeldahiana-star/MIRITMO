package com.miritmo;

import com.codename1.io.JSONWriter;
import com.codename1.io.Preferences;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class MiRitmoStore {
    private static final String DATA_KEY = "miritmo.data.v1";
    private final Map<String, Object> data = new HashMap<String, Object>();
    private final Map<String, List<Map<String, Object>>> lists = new HashMap<String, List<Map<String, Object>>>();

    MiRitmoStore() {
        MiRitmoStoreData.load(data, DATA_KEY);
        getInt("focusSessions");
    }

    List<Map<String, Object>> getList(String name) {
        List<Map<String, Object>> cached = lists.get(name);
        if (cached != null) return cached;

        Object value = data.get(name);
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        if (value instanceof List<?>) {
            for (Object item : (List<?>) value) {
                if (!(item instanceof Map<?, ?>)) {
                    throw new IllegalStateException("Los datos guardados para " + name + " no tienen un formato válido.");
                }
                list.add(MiRitmoStoreData.stringKeyedMap((Map<?, ?>) item, name));
            }
        }
        data.put(name, list);
        lists.put(name, list);
        return list;
    }

    void save() {
        Preferences.set(DATA_KEY, JSONWriter.toJson(data));
    }

    int getInt(String name) {
        Object value = data.get(name);
        return value instanceof Number ? ((Number) value).intValue() : 0;
    }

    void setInt(String name, int value) {
        data.put(name, Integer.valueOf(value));
    }

    static Map<String, Object> entry(String... fields) {
        return MiRitmoStoreValues.entry(fields);
    }

    static String string(Map<String, Object> item, String key) {
        return MiRitmoStoreValues.string(item, key);
    }

    static boolean bool(Map<String, Object> item, String key) {
        return MiRitmoStoreValues.bool(item, key);
    }

    static double number(Map<String, Object> item, String key) {
        return MiRitmoStoreValues.number(item, key);
    }

    static String today() {
        return MiRitmoDates.today();
    }

    static String dateKey(int year, int month, int day) {
        return MiRitmoDates.dateKey(year, month, day);
    }

    static int[] parseDate(String value) {
        return MiRitmoDates.parseDate(value);
    }

    static String monthLabel(int year, int month) {
        return MiRitmoDates.monthLabel(year, month);
    }

    static String displayDate(String value) {
        return MiRitmoDates.displayDate(value);
    }
}
