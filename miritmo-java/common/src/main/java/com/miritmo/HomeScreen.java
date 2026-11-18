package com.miritmo;

import com.codename1.ui.Form;
import java.util.List;
import java.util.Map;

final class HomeScreen {
    private final MiRitmoApp app;

    HomeScreen(MiRitmoApp app) { this.app = app; }

    void show() {
        Form form = app.newScreen("MiRitmo");
        form.add(app.layout.header(
                "Hola, bienvenida a tu espacio.",
                "Un día con intención empieza con un paso pequeño."));
        app.layout.addCard(form, "ORGANIZA TU DÍA, VIVE A TU RITMO",
                "Hoy no tienes que hacerlo todo. Solo empezar por algo.");
        int tasks = app.support.countForToday(app.store.getList("tasks"));
        int habits = app.store.getList("habits").size();
        int workouts = app.store.getList("workouts").size();
        List<Map<String, Object>> expenses = app.store.getList("expenses");
        double spent = 0;
        for (Map<String, Object> expense : expenses) {
            spent += MiRitmoStore.number(expense, "amount");
        }
        app.layout.addCard(form, "TU DÍA",
                tasks + " tareas · " + habits + " hábitos · " + workouts
                        + " entrenamientos · " + app.support.formatMoney(spent) + " en gastos");
        app.controls.addButton(form, "Abrir agenda", app::showTasks, true);
        app.controls.addButton(form, "Cuidar mis hábitos", app::showHabits, false);
        app.controls.addButton(form, "Ver entrenamiento", app::showWorkouts, false);
        app.controls.addButton(form, "Registrar gastos", app::showExpenses, false);
        app.controls.addButton(form, "Abrir diario emocional", app::showDiary, false);
        app.controls.addButton(form, "Tiempo de enfoque", app::showFocus, false);
        form.show();
    }
}
