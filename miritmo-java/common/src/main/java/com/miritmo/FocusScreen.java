package com.miritmo;

import com.codename1.ui.Dialog;
import com.codename1.ui.Font;
import com.codename1.ui.Form;
import com.codename1.ui.Label;
import com.codename1.ui.layouts.GridLayout;
import com.codename1.ui.Container;
import com.codename1.ui.util.UITimer;

final class FocusScreen {
    private final MiRitmoApp app;

    FocusScreen(MiRitmoApp app) { this.app = app; }

    void show() {
        Form form = app.newScreen("Tiempo de enfoque");
        form.add(app.layout.header("Tiempo de enfoque", "Una cosa a la vez, a tu ritmo."));
        form.add(app.layout.sectionTitle("MOMENTO PARA TI"));
        app.state.focusDisplay = new Label(app.support.formatTime(app.state.focusSeconds));
        app.state.focusDisplay.getAllStyles().setFgColor(MiRitmoTheme.PINK_DARK);
        app.state.focusDisplay.getAllStyles().setFont(
                Font.createSystemFont(Font.FACE_SYSTEM, Font.STYLE_BOLD, Font.SIZE_LARGE));
        form.add(app.state.focusDisplay);
        app.controls.addButton(form, app.state.focusRunning ? "Pausar" : "Empezar",
                this::toggle, true);
        app.controls.addButton(form, "Reiniciar", this::reset, false);
        Container durations = new Container(new GridLayout(1, 3));
        for (int minutes : new int[] { 15, 25, 45 }) {
            app.controls.addButton(durations, minutes + " min",
                    () -> setDuration(minutes), minutes == app.state.focusDuration);
        }
        form.add(durations);
        form.add(app.layout.body(app.store.getInt("focusSessions") + " momentos completados."));
        form.show();
    }

    private void toggle() {
        app.state.focusRunning = !app.state.focusRunning;
        if (!app.state.focusRunning && app.state.focusTimer != null) {
            app.state.focusTimer.cancel();
        }
        show();
        if (app.state.focusRunning) startTimer();
    }

    private void startTimer() {
        if (app.state.focusTimer != null) app.state.focusTimer.cancel();
        app.state.focusTimer = new UITimer(() -> tick());
        app.state.focusTimer.schedule(1000, true, app.state.currentForm);
    }

    private void tick() {
        if (!app.state.focusRunning) return;
        app.state.focusSeconds--;
        if (app.state.focusSeconds <= 0) complete();
        if ("Tiempo de enfoque".equals(app.state.currentScreen)
                && app.state.focusDisplay != null) {
            app.state.focusDisplay.setText(app.support.formatTime(app.state.focusSeconds));
            if (!app.state.focusRunning) show();
        }
    }

    private void complete() {
        app.state.focusSeconds = 0;
        app.state.focusRunning = false;
        if (app.state.focusTimer != null) app.state.focusTimer.cancel();
        app.store.setInt("focusSessions", app.store.getInt("focusSessions") + 1);
        app.store.save();
        Dialog.show("¡Buen trabajo!", "Terminaste tu momento de enfoque. Tómate una pausa.",
                "Continuar", null);
    }

    private void reset() {
        app.state.focusRunning = false;
        if (app.state.focusTimer != null) app.state.focusTimer.cancel();
        app.state.focusSeconds = app.state.focusDuration * 60;
        show();
    }

    private void setDuration(int minutes) {
        app.state.focusRunning = false;
        if (app.state.focusTimer != null) app.state.focusTimer.cancel();
        app.state.focusDuration = minutes;
        app.state.focusSeconds = minutes * 60;
        show();
    }
}
