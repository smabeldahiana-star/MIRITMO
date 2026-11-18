package com.miritmo;

import com.codename1.components.SpanLabel;
import com.codename1.io.Log;
import com.codename1.ui.Form;
import com.codename1.ui.TextField;
import com.codename1.ui.Display;
import com.codename1.ui.layouts.BoxLayout;

final class DiaryAccess {
    private final MiRitmoApp app;

    DiaryAccess(MiRitmoApp app) { this.app = app; }

    void show() {
        boolean exists = app.diary.exists();
        Form form = app.newScreen("Diario emocional");
        form.add(app.layout.header("Diario emocional",
                exists ? "Desbloquea tus anotaciones." : "Crea tu diario privado."));
        String message = exists
                ? "Escribe la clave personal que elegiste al crear el diario."
                : "Elige una clave personal de al menos 10 caracteres. "
                        + "Si la olvidas, no se podrán recuperar las notas.";
        form.add(app.layout.body(message));
        TextField password = new TextField("", "Clave personal", 40, TextField.PASSWORD);
        form.add(password);
        addAccessControls(form, password, exists);
        form.add(app.layout.body(
                "El diario se guarda cifrado localmente; no se sube a una cuenta ni se sincroniza."));
        form.show();
    }

    private void addAccessControls(Form form, TextField password, boolean exists) {
        if (exists) {
            app.controls.addButton(form, "Desbloquear diario",
                    () -> runCrypto(() -> app.diary.unlock(password.getText())), true);
            return;
        }
        TextField confirmation = new TextField("", "Confirma la clave", 40, TextField.PASSWORD);
        form.add(confirmation);
        app.controls.addButton(form, "Crear diario privado", () -> {
            if (!password.getText().equals(confirmation.getText())) {
                app.controls.showMessage("Las claves no coinciden.");
                return;
            }
            runCrypto(() -> app.diary.create(password.getText()));
        }, true);
    }

    private void runCrypto(DiaryAction action) {
        Form waiting = new Form("Protegiendo tu diario", BoxLayout.y());
        waiting.add(new SpanLabel("Preparando el cifrado seguro. Esto puede tardar un momento."));
        waiting.show();
        Display.getInstance().startThread(() -> finishCrypto(action), "MiRitmo-Diary-Crypto");
    }

    private void finishCrypto(DiaryAction action) {
        String errorMessage = null;
        try {
            action.run();
        } catch (Exception error) {
            Log.e(error);
            errorMessage = error.getMessage() == null
                    ? "No se pudo procesar el diario." : error.getMessage();
        }
        final String result = errorMessage;
        Display.getInstance().callSerially(() -> {
            if (result != null) {
                app.controls.showMessage("No se pudo abrir el diario: " + result);
            } else {
                app.showDiary();
            }
        });
    }
}

interface DiaryAction {
    void run() throws Exception;
}
