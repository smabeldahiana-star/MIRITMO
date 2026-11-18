package com.miritmo;

import java.util.Map;

final class WorkoutEditor {
    private final MiRitmoApp app;

    WorkoutEditor(MiRitmoApp app) { this.app = app; }

    void addWorkout() { saveWorkout(false); }
    void addActivity() { saveWorkout(true); }

    private void saveWorkout(boolean done) {
        String[] values = app.controls.ask(done ? "Registrar actividad" : "Programar entrenamiento",
                new String[] { "Actividad", "Fecha (AAAA-MM-DD)", "Hora (HH:MM)",
                    "Duración en minutos", "Tipo" },
                new String[] { "", MiRitmoStore.today(), "07:30", "30", "Movimiento" });
        if (values == null || !validWorkout(values)) return;
        Map<String, Object> workout = MiRitmoStore.entry(
                "id", app.support.newId(), "title", values[0].trim(), "day", values[1].trim(),
                "time", values[2].trim(), "duration", values[3].trim(), "type", values[4].trim());
        workout.put("done", Boolean.valueOf(done));
        app.store.getList("workouts").add(workout);
        app.support.persistAndShow(app::showWorkouts);
    }

    void editWorkout(Map<String, Object> workout) {
        String[] values = app.controls.ask("Editar entrenamiento",
                new String[] { "Actividad", "Fecha (AAAA-MM-DD)", "Hora (HH:MM)",
                    "Duración en minutos", "Tipo" },
                new String[] { MiRitmoStore.string(workout, "title"),
                    MiRitmoStore.string(workout, "day"), MiRitmoStore.string(workout, "time"),
                    MiRitmoStore.string(workout, "duration"), MiRitmoStore.string(workout, "type") });
        if (values == null || !validWorkout(values)) return;
        workout.put("title", values[0].trim());
        workout.put("day", values[1].trim());
        workout.put("time", values[2].trim());
        workout.put("duration", values[3].trim());
        workout.put("type", values[4].trim());
        app.support.persistAndShow(app::showWorkouts);
    }

    private boolean validWorkout(String[] values) {
        return app.support.validDate(values[1]) && app.support.validTime(values[2])
                && app.support.validPositiveNumber(values[3]);
    }

    void addGoal() {
        String[] values = app.controls.ask("Objetivo semanal",
                new String[] { "Objetivo", "Meta", "Medir en" },
                new String[] { "", "3", "sesiones" });
        if (values == null || !app.support.validPositiveNumber(values[1])) return;
        app.store.getList("goals").add(MiRitmoStore.entry(
                "id", app.support.newId(), "title", values[0].trim(),
                "target", values[1].trim(), "unit", values[2].trim()));
        app.support.persistAndShow(app::showWorkouts);
    }
}
