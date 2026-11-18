package com.miritmo;

import com.codename1.ui.Button;
import com.codename1.ui.Container;
import com.codename1.ui.Dialog;
import com.codename1.ui.Form;
import com.codename1.ui.TextArea;
import com.codename1.ui.layouts.GridLayout;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

final class DiaryMoodEditor {
    private final MiRitmoApp app;

    DiaryMoodEditor(MiRitmoApp app) { this.app = app; }

    void addTo(Form form, DiaryEntrySaver saveEntry, Runnable saveDiary) {
        Map<String, Object> current = app.diaryHistory.findEntry(app.state.selectedDiaryDate);
        app.state.selectedDiaryMood = current == null
                ? "" : MiRitmoStore.string(current, "mood");
        addMoodButtons(form);
        TextArea note = new TextArea(current == null ? "" : MiRitmoStore.string(current, "note"), 4, 30);
        note.setHint("Nota personal (opcional)");
        note.setGrowByContent(false);
        form.add(note);
        String label = current == null ? "Guardar registro cifrado" : "Actualizar registro cifrado";
        app.controls.addButton(form, label, () -> saveSelected(note, saveEntry), true);
        if (current != null) addDeleteButton(form, current, saveDiary);
    }

    private void addMoodButtons(Form form) {
        Container options = new Container(new GridLayout(1, 5));
        List<Button> buttons = new ArrayList<Button>();
        for (int i = 0; i < MiRitmoTheme.MOOD_NAMES.length; i++) {
            addMoodButton(options, buttons, i);
        }
        form.add(options);
    }

    private void addMoodButton(Container options, List<Button> buttons, int index) {
        String mood = MiRitmoTheme.MOOD_NAMES[index];
        Button option = new Button(MiRitmoTheme.MOOD_FACES[index] + "\n" + mood);
        option.setUIID(mood.equals(app.state.selectedDiaryMood)
                ? "DiaryMoodSelected" : "DiaryMood");
        buttons.add(option);
        option.addActionListener(event -> {
            app.state.selectedDiaryMood = mood;
            updateMoodButtons(buttons, options);
        });
        options.add(option);
    }

    private void updateMoodButtons(List<Button> buttons, Container options) {
        for (int i = 0; i < buttons.size(); i++) {
            String uiid = MiRitmoTheme.MOOD_NAMES[i].equals(app.state.selectedDiaryMood)
                    ? "DiaryMoodSelected" : "DiaryMood";
            buttons.get(i).setUIID(uiid);
        }
        options.repaint();
    }

    private void saveSelected(TextArea note, DiaryEntrySaver saveEntry) {
        if (app.state.selectedDiaryMood.isEmpty()) {
            app.controls.showMessage("Elige primero cómo te sientes.");
            return;
        }
        saveEntry.save(app.state.selectedDiaryMood, note.getText());
    }

    private void addDeleteButton(Form form, Map<String, Object> current, Runnable saveDiary) {
        app.controls.addButton(form, "Eliminar registro", () -> {
            if (!Dialog.show("Eliminar registro",
                    "¿Quieres borrar este día del diario?", "Eliminar", "Cancelar")) return;
            app.diary.getEntries().remove(current);
            saveDiary.run();
        }, false);
    }
}

interface DiaryEntrySaver {
    void save(String mood, String note);
}
