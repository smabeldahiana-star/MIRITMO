package com.miritmo;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

final class DiaryHistory {
    private final MiRitmoApp app;

    DiaryHistory(MiRitmoApp app) { this.app = app; }

    List<Map<String, Object>> entriesForMonth(int year, int month) {
        String prefix = MiRitmoStore.dateKey(year, month, 1).substring(0, 7);
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> entry : app.diary.getEntries()) {
            if (MiRitmoStore.string(entry, "day").startsWith(prefix)) result.add(entry);
        }
        Collections.sort(result, (first, second) ->
                MiRitmoStore.string(second, "day").compareTo(MiRitmoStore.string(first, "day")));
        return result;
    }

    Map<String, Object> findEntry(String day) {
        for (Map<String, Object> entry : app.diary.getEntries()) {
            if (day.equals(MiRitmoStore.string(entry, "day"))) return entry;
        }
        return null;
    }

    void changeMonth(int amount) {
        int[] selected = MiRitmoStore.parseDate(app.state.selectedDiaryDate);
        Calendar calendar = Calendar.getInstance();
        calendar.set(selected[0], selected[1] - 1, 1, 12, 0, 0);
        calendar.add(Calendar.MONTH, amount);
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH) + 1;
        Calendar now = Calendar.getInstance();
        if (year > now.get(Calendar.YEAR)
                || (year == now.get(Calendar.YEAR) && month > now.get(Calendar.MONTH) + 1)) return;
        int day = Math.min(selected[2], calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
        app.state.selectedDiaryDate = MiRitmoStore.dateKey(year, month, day);
        app.showDiary();
    }

    String moodStats(List<Map<String, Object>> entries) {
        if (entries.isEmpty()) return "Este mes todavía no tiene registros.";
        int[] counts = new int[MiRitmoTheme.MOOD_NAMES.length];
        int total = countMoods(entries, counts);
        StringBuilder stats = new StringBuilder(entries.size() + " días registrados · promedio ");
        stats.append(String.format(Locale.US, "%.1f", total / (double) entries.size())).append("/5\n");
        for (int i = 0; i < counts.length; i++) appendMoodCount(stats, counts, i);
        return stats.toString();
    }

    private int countMoods(List<Map<String, Object>> entries, int[] counts) {
        int total = 0;
        for (Map<String, Object> entry : entries) {
            int mood = moodIndex(MiRitmoStore.string(entry, "mood"));
            if (mood >= 0) {
                counts[mood]++;
                total += mood + 1;
            }
        }
        return total;
    }

    private void appendMoodCount(StringBuilder stats, int[] counts, int index) {
        stats.append(MiRitmoTheme.MOOD_FACES[index]).append(" ")
                .append(MiRitmoTheme.MOOD_NAMES[index]).append(": ").append(counts[index]);
        if (index + 1 < counts.length) stats.append(" · ");
    }

    String moodFace(String mood) {
        int index = moodIndex(mood);
        return index < 0 ? "·" : MiRitmoTheme.MOOD_FACES[index];
    }

    private int moodIndex(String mood) {
        for (int i = 0; i < MiRitmoTheme.MOOD_NAMES.length; i++) {
            if (MiRitmoTheme.MOOD_NAMES[i].equals(mood)) return i;
        }
        return -1;
    }
}
