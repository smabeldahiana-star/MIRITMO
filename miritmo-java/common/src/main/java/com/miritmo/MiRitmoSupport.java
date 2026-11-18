package com.miritmo;

import com.codename1.io.Log;
import com.codename1.ui.Dialog;
import java.text.NumberFormat;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

final class MiRitmoSupport {
    private final MiRitmoApp app;

    MiRitmoSupport(MiRitmoApp app) {
        this.app = app;
    }

    void deleteEntry(String listName, Map<String, Object> entry, Runnable refresh) {
        if (!Dialog.show("Eliminar", "¿Quieres eliminar este elemento?", "Eliminar", "Cancelar")) return;
        app.store.getList(listName).remove(entry);
        persistAndShow(refresh);
    }

    void persistAndShow(Runnable refresh) {
        try {
            app.store.save();
            refresh.run();
        } catch (Exception error) {
            Log.e(error);
            app.controls.showMessage("No se pudieron guardar los cambios: " + error.getMessage());
        }
    }

    boolean validDate(String value) {
        try {
            MiRitmoStore.parseDate(value.trim());
            return true;
        } catch (Exception error) {
            app.controls.showMessage("Escribe una fecha válida con formato AAAA-MM-DD.");
            return false;
        }
    }

    boolean validTime(String value) {
        if (value == null || !value.matches("[0-2][0-9]:[0-5][0-9]")) {
            app.controls.showMessage("Escribe una hora válida con formato HH:MM.");
            return false;
        }
        if (Integer.parseInt(value.substring(0, 2)) > 23) {
            app.controls.showMessage("La hora debe estar entre 00:00 y 23:59.");
            return false;
        }
        return true;
    }

    boolean validPositiveNumber(String value) {
        try {
            return Double.parseDouble(value.trim()) > 0;
        } catch (Exception error) {
            app.controls.showMessage("Escribe un número mayor que cero.");
            return false;
        }
    }

    String formatMoney(double amount) {
        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.getDefault());
        format.setMaximumFractionDigits(0);
        format.setMinimumFractionDigits(0);
        return format.format(amount);
    }

    String formatTime(int seconds) {
        int minutes = seconds / 60;
        int remainder = seconds % 60;
        return twoDigits(minutes) + ":" + twoDigits(remainder);
    }

    int countForToday(List<Map<String, Object>> entries) {
        int count = 0;
        for (Map<String, Object> entry : entries) {
            if (MiRitmoStore.today().equals(MiRitmoStore.string(entry, "day"))) count++;
        }
        return count;
    }

    void sortByDay(List<Map<String, Object>> entries) {
        Collections.sort(entries, (first, second) ->
                MiRitmoStore.string(first, "day").compareTo(MiRitmoStore.string(second, "day")));
    }

    private String twoDigits(int value) { return value < 10 ? "0" + value : String.valueOf(value); }

    String newId() { return java.util.UUID.randomUUID().toString(); }

    List<String> stringList(Object value) {
        return MiRitmoStoreValues.stringList(value);
    }
}
