package com.miritmo;

import com.codename1.ui.Form;
import java.util.List;
import java.util.Map;

final class WorkoutsScreen {
    private final MiRitmoApp app;

    WorkoutsScreen(MiRitmoApp app) { this.app = app; }

    void show() {
        Form form = app.newScreen("Entrenamiento");
        form.add(app.layout.header("Agenda deportiva",
                "Programa entrenamientos y registra tu movimiento."));
        app.controls.addButton(form, "＋ Programar entrenamiento",
                app.workoutEditor::addWorkout, true);
        app.controls.addButton(form, "＋ Registrar actividad realizada",
                app.workoutEditor::addActivity, false);
        List<Map<String, Object>> workouts = app.store.getList("workouts");
        app.support.sortByDay(workouts);
        for (Map<String, Object> workout : workouts) addWorkout(form, workout);
        if (workouts.isEmpty()) {
            form.add(app.layout.body("Tu movimiento, a tu manera. Registra aquí tu próxima actividad."));
        }
        addGoals(form);
        form.show();
    }

    private void addWorkout(Form form, Map<String, Object> workout) {
        String details = MiRitmoStore.displayDate(MiRitmoStore.string(workout, "day"))
                + " · " + MiRitmoStore.string(workout, "time") + " · "
                + MiRitmoStore.string(workout, "duration") + " min · "
                + MiRitmoStore.string(workout, "type");
        app.controls.addEntryRow(form, MiRitmoStore.string(workout, "title"), details,
                MiRitmoStore.bool(workout, "done") ? "Realizado" : "Completar",
                () -> toggle(workout), "Editar", () -> app.workoutEditor.editWorkout(workout),
                "Eliminar", () -> app.support.deleteEntry("workouts", workout, this::show));
    }

    private void toggle(Map<String, Object> workout) {
        workout.put("done", Boolean.valueOf(!MiRitmoStore.bool(workout, "done")));
        app.support.persistAndShow(this::show);
    }

    private void addGoals(Form form) {
        form.add(app.layout.sectionTitle("Objetivos semanales"));
        app.controls.addButton(form, "＋ Nuevo objetivo", app.workoutEditor::addGoal, false);
        for (Map<String, Object> goal : app.store.getList("goals")) {
            String target = MiRitmoStore.string(goal, "target") + " "
                    + MiRitmoStore.string(goal, "unit") + " por semana";
            app.controls.addEntryRow(form, MiRitmoStore.string(goal, "title"), target,
                    null, null, null, null, "Eliminar",
                    () -> app.support.deleteEntry("goals", goal, this::show));
        }
    }
}
