package com.miritmo;

import com.codename1.ui.Form;
import com.codename1.ui.Label;
import java.util.List;
import java.util.Map;

final class TasksScreen {
    private final MiRitmoApp app;

    TasksScreen(MiRitmoApp app) { this.app = app; }

    void show() {
        Form form = app.newScreen("Agenda");
        form.add(app.layout.header("Tu agenda", "Organiza tus tareas, un día a la vez."));
        app.controls.addButton(form, "＋ Añadir tarea", this::add, true);
        List<Map<String, Object>> tasks = app.store.getList("tasks");
        app.support.sortByDay(tasks);
        if (tasks.isEmpty()) {
            form.add(app.layout.body("Todavía no hay tareas. Añade una para empezar."));
        } else {
            addTasks(form, tasks);
        }
        form.show();
    }

    private void addTasks(Form form, List<Map<String, Object>> tasks) {
        String today = MiRitmoStore.today();
        for (Map<String, Object> task : tasks) {
            String date = MiRitmoStore.string(task, "day");
            String details = MiRitmoStore.displayDate(date) + " · "
                    + MiRitmoStore.string(task, "time") + " · "
                    + MiRitmoStore.string(task, "category");
            app.controls.addEntryRow(form, MiRitmoStore.string(task, "title"), details,
                    MiRitmoStore.bool(task, "done") ? "Lista" : "Completar",
                    () -> toggle(task), "Editar", () -> edit(task),
                    "Eliminar", () -> app.support.deleteEntry("tasks", task, this::show));
            if (date.compareTo(today) < 0 && !MiRitmoStore.bool(task, "done")) {
                Label overdue = app.layout.smallText("Pendiente de un día anterior");
                overdue.getAllStyles().setFgColor(MiRitmoTheme.PINK_DARK);
                form.add(overdue);
            }
        }
    }

    private void toggle(Map<String, Object> task) {
        task.put("done", Boolean.valueOf(!MiRitmoStore.bool(task, "done")));
        app.support.persistAndShow(this::show);
    }

    private void add() {
        String[] values = app.controls.ask("Añadir tarea",
                new String[] { "¿Qué quieres recordar?", "Fecha (AAAA-MM-DD)", "Hora (HH:MM)", "Categoría" },
                new String[] { "", MiRitmoStore.today(), "09:00", "Personal" });
        if (values == null || !app.support.validDate(values[1]) || !app.support.validTime(values[2])) return;
        Map<String, Object> task = MiRitmoStore.entry(
                "id", app.support.newId(), "title", values[0].trim(), "day", values[1].trim(),
                "time", values[2].trim(), "category", values[3].trim());
        task.put("done", Boolean.FALSE);
        app.store.getList("tasks").add(task);
        app.support.persistAndShow(this::show);
    }

    private void edit(Map<String, Object> task) {
        String[] values = app.controls.ask("Editar tarea",
                new String[] { "¿Qué quieres recordar?", "Fecha (AAAA-MM-DD)", "Hora (HH:MM)", "Categoría" },
                new String[] { MiRitmoStore.string(task, "title"), MiRitmoStore.string(task, "day"),
                    MiRitmoStore.string(task, "time"), MiRitmoStore.string(task, "category") });
        if (values == null || !app.support.validDate(values[1]) || !app.support.validTime(values[2])) return;
        task.put("title", values[0].trim());
        task.put("day", values[1].trim());
        task.put("time", values[2].trim());
        task.put("category", values[3].trim());
        app.support.persistAndShow(this::show);
    }
}
