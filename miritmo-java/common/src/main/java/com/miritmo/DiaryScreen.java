package com.miritmo;

import com.codename1.ui.Button;
import com.codename1.ui.Form;
import com.codename1.io.Log;
import java.util.List;
import java.util.Map;

final class DiaryScreen {
    private final MiRitmoApp app;

    DiaryScreen(MiRitmoApp app) { this.app = app; }

    void show() {
        if (!app.diary.isUnlocked()) {
            app.showDiaryLock();
            return;
        }
        Form form = app.newScreen("Diario emocional");
        form.add(app.layout.header("Diario emocional", "Un espacio privado para escucharte."));
        app.layout.addCard(form, "PRIVACIDAD",
                "Tus notas se cifran con AES-GCM antes de guardarse en este dispositivo.");
        app.controls.addButton(form, "Bloquear diario", () -> {
            app.diary.lock();
            app.showDiaryLock();
        }, false);
        addMonthNavigation(form);
        int[] selected = MiRitmoStore.parseDate(app.state.selectedDiaryDate);
        form.add(app.layout.sectionTitle(
                MiRitmoStore.monthLabel(selected[0], selected[1])));
        form.add(app.diaryCalendar.render(selected[0], selected[1]));
        List<Map<String, Object>> entries = app.diaryHistory.entriesForMonth(
                selected[0], selected[1]);
        app.layout.addCard(form, "ESTADÍSTICAS DEL MES", app.diaryHistory.moodStats(entries));
        app.controls.addButton(form, "Mes siguiente ›",
                () -> app.diaryHistory.changeMonth(1), false);
        addEntrySection(form, entries);
        form.show();
    }

    private void addMonthNavigation(Form form) {
        app.controls.addButton(form, "‹ Mes anterior",
                () -> app.diaryHistory.changeMonth(-1), false);
    }

    private void addEntrySection(Form form, List<Map<String, Object>> entries) {
        form.add(app.layout.sectionTitle(
                "Registro · " + MiRitmoStore.displayDate(app.state.selectedDiaryDate)));
        app.diaryMoodEditor.addTo(form, this::saveEntry, this::save);
        form.add(app.layout.sectionTitle("Registros anteriores"));
        if (entries.isEmpty()) {
            form.add(app.layout.body("Todavía no hay registros en este mes."));
        }
        for (Map<String, Object> entry : entries) addHistoryButton(form, entry);
    }

    private void addHistoryButton(Form form, Map<String, Object> entry) {
        String day = MiRitmoStore.string(entry, "day");
        String mood = MiRitmoStore.string(entry, "mood");
        Button history = new Button(MiRitmoStore.displayDate(day) + " · " + mood);
        history.setUIID("DiaryHistoryButton");
        history.addActionListener(event -> {
            app.state.selectedDiaryDate = day;
            show();
        });
        form.add(history);
    }

    private void saveEntry(String mood, String note) {
        Map<String, Object> entry = app.diaryHistory.findEntry(app.state.selectedDiaryDate);
        if (entry == null) {
            entry = MiRitmoStore.entry("id", app.support.newId(),
                    "day", app.state.selectedDiaryDate);
            app.diary.getEntries().add(entry);
        }
        entry.put("mood", mood);
        entry.put("note", note == null ? "" : note.trim());
        save();
    }

    private void save() {
        try {
            app.diary.save();
            show();
        } catch (Exception error) {
            Log.e(error);
            app.controls.showMessage("No se pudo guardar el diario cifrado: " + error.getMessage());
        }
    }
}
