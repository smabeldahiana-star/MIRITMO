package com.miritmo;

import com.codename1.ui.Form;
import java.util.List;
import java.util.Map;

final class HabitsScreen {
    private final MiRitmoApp app;

    HabitsScreen(MiRitmoApp app) { this.app = app; }

    void show() {
        Form form = app.newScreen("Hábitos");
        form.add(app.layout.header("Hábitos que te hacen bien",
                "La constancia también se construye con pasos pequeños."));
        app.controls.addButton(form, "＋ Nuevo hábito", this::add, true);
        List<Map<String, Object>> habits = app.store.getList("habits");
        for (Map<String, Object> habit : habits) addHabit(form, habit);
        if (habits.isEmpty()) {
            form.add(app.layout.body("Aún no tienes hábitos. Puedes empezar por uno sencillo."));
        }
        form.show();
    }

    private void addHabit(Form form, Map<String, Object> habit) {
        List<String> days = app.support.stringList(habit.get("days"));
        boolean done = days.contains(MiRitmoStore.today());
        app.controls.addEntryRow(form, MiRitmoStore.string(habit, "name"),
                days.size() + " días registrados", done ? "Desmarcar hoy" : "Marcar hoy",
                () -> toggle(habit, days), null, null, "Eliminar",
                () -> app.support.deleteEntry("habits", habit, this::show));
    }

    private void toggle(Map<String, Object> habit, List<String> days) {
        if (days.contains(MiRitmoStore.today())) days.remove(MiRitmoStore.today());
        else days.add(MiRitmoStore.today());
        habit.put("days", days);
        app.support.persistAndShow(this::show);
    }

    private void add() {
        String[] values = app.controls.ask("Crear hábito",
                new String[] { "Nombre del hábito" }, new String[] { "" });
        if (values == null) return;
        Map<String, Object> habit = MiRitmoStore.entry(
                "id", app.support.newId(), "name", values[0].trim());
        habit.put("days", new java.util.ArrayList<String>());
        app.store.getList("habits").add(habit);
        app.support.persistAndShow(this::show);
    }
}
