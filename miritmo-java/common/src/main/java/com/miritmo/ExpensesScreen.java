package com.miritmo;

import com.codename1.ui.Form;
import java.util.List;
import java.util.Map;

final class ExpensesScreen {
    private final MiRitmoApp app;

    ExpensesScreen(MiRitmoApp app) { this.app = app; }

    void show() {
        Form form = app.newScreen("Gastos compartidos");
        form.add(app.layout.header("Gastos compartidos", "Las cuentas claras, en pesos colombianos."));
        List<Map<String, Object>> expenses = app.store.getList("expenses");
        addTotals(form, expenses);
        app.controls.addButton(form, "＋ Añadir gasto", () -> saveExpense(null), true);
        app.support.sortByDay(expenses);
        for (Map<String, Object> expense : expenses) addExpense(form, expense);
        if (expenses.isEmpty()) form.add(app.layout.body("Aún no hay gastos registrados."));
        form.show();
    }

    private void addTotals(Form form, List<Map<String, Object>> expenses) {
        double total = 0;
        double myTotal = 0;
        for (Map<String, Object> expense : expenses) {
            double amount = MiRitmoStore.number(expense, "amount");
            total += amount;
            if ("Yo".equals(MiRitmoStore.string(expense, "paidBy"))) myTotal += amount;
        }
        app.layout.addCard(form, "TOTAL REGISTRADO", app.support.formatMoney(total));
        app.layout.addCard(form, "PAGADO POR TI",
                app.support.formatMoney(myTotal) + " · " + expenses.size() + " gastos");
    }

    private void addExpense(Form form, Map<String, Object> expense) {
        String details = MiRitmoStore.displayDate(MiRitmoStore.string(expense, "day"))
                + " · Pagó " + MiRitmoStore.string(expense, "paidBy") + " · "
                + MiRitmoStore.string(expense, "participants") + " · "
                + app.support.formatMoney(MiRitmoStore.number(expense, "amount"));
        app.controls.addEntryRow(form, MiRitmoStore.string(expense, "title"), details,
                null, null, "Editar", () -> saveExpense(expense),
                "Eliminar", () -> app.support.deleteEntry("expenses", expense, this::show));
    }

    private void saveExpense(Map<String, Object> existing) {
        String[] defaults = existing == null
                ? new String[] { "", "", MiRitmoStore.today(), "Yo", "" }
                : new String[] { MiRitmoStore.string(existing, "title"),
                    MiRitmoStore.string(existing, "amount"), MiRitmoStore.string(existing, "day"),
                    MiRitmoStore.string(existing, "paidBy"), MiRitmoStore.string(existing, "participants") };
        String[] values = app.controls.ask(existing == null ? "Añadir gasto" : "Editar gasto",
                new String[] { "¿En qué fue?", "Importe (COP)", "Fecha (AAAA-MM-DD)",
                    "¿Quién pagó?", "Personas del grupo" }, defaults);
        if (values == null || !app.support.validPositiveNumber(values[1])
                || !app.support.validDate(values[2])
                || values[3].trim().isEmpty()
                || values[4].trim().isEmpty()) {
            if (values != null && (values[3].trim().isEmpty() || values[4].trim().isEmpty())) {
                app.controls.showMessage("¿Quién pagó? y Personas del grupo son obligatorios.");
            }
            return;
        }
        Map<String, Object> expense = existing == null
                ? MiRitmoStore.entry("id", app.support.newId()) : existing;
        expense.put("title", values[0].trim());
        expense.put("amount", values[1].trim());
        expense.put("day", values[2].trim());
        expense.put("paidBy", values[3].trim());
        expense.put("participants", values[4].trim());
        if (existing == null) app.store.getList("expenses").add(expense);
        app.support.persistAndShow(this::show);
    }
}
