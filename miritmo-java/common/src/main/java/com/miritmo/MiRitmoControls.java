package com.miritmo;

import com.codename1.ui.Button;
import com.codename1.ui.Command;
import com.codename1.ui.Component;
import com.codename1.ui.Container;
import com.codename1.ui.Dialog;
import com.codename1.ui.Font;
import com.codename1.ui.Form;
import com.codename1.ui.TextArea;
import com.codename1.ui.layouts.FlowLayout;
import com.codename1.ui.layouts.BoxLayout;
import com.codename1.ui.plaf.Style;
import java.util.ArrayList;
import java.util.List;

final class MiRitmoControls {
    private final MiRitmoApp app;

    MiRitmoControls(MiRitmoApp app) {
        this.app = app;
    }

    Button addButton(Container parent, String text, Runnable action, boolean primary) {
        Button button = new Button(text);
        Style style = button.getAllStyles();
        style.setBgColor(primary ? MiRitmoTheme.PINK : MiRitmoTheme.PINK_LIGHT);
        style.setBgTransparency(255);
        style.setFgColor(primary ? 0xFFFFFF : MiRitmoTheme.PINK_DARK);
        button.addActionListener(event -> action.run());
        parent.add(button);
        return button;
    }

    void addEntryRow(Form form, String title, String subtitle, String primaryText, Runnable primaryAction,
            String editText, Runnable editAction, String deleteText, Runnable deleteAction) {
        Container row = new Container(BoxLayout.y());
        row.setUIID("EntryCard");
        com.codename1.ui.Label heading = new com.codename1.ui.Label(title);
        heading.getAllStyles().setFgColor(MiRitmoTheme.INK);
        heading.getAllStyles().setFont(Font.createSystemFont(
                Font.FACE_SYSTEM, Font.STYLE_BOLD, Font.SIZE_MEDIUM));
        row.add(heading);
        if (subtitle != null && !subtitle.isEmpty()) row.add(app.layout.smallText(subtitle));
        Container actions = new Container(new FlowLayout(Component.LEFT));
        if (primaryAction != null && primaryText != null) addButton(actions, primaryText, primaryAction, true);
        if (editAction != null && editText != null) addButton(actions, editText, editAction, false);
        if (deleteAction != null && deleteText != null) addButton(actions, deleteText, deleteAction, false);
        if (actions.getComponentCount() > 0) row.add(actions);
        form.add(row);
    }

    String[] ask(String title, String[] labels, String[] initial) {
        Container fields = new Container(BoxLayout.y());
        List<TextArea> controls = new ArrayList<TextArea>();
        for (int i = 0; i < labels.length; i++) {
            fields.add(app.layout.smallText(labels[i]));
            TextArea input = new TextArea(initial[i], 1, 28);
            input.setSingleLineTextArea(true);
            input.setHint(labels[i]);
            input.setUIID("TextField");
            controls.add(input);
            fields.add(input);
        }
        Command save = new Command("Guardar");
        Command cancel = new Command("Cancelar");
        if (Dialog.show(title, fields, save, cancel) != save) return null;
        return readValues(labels, controls);
    }

    private String[] readValues(String[] labels, List<TextArea> controls) {
        String[] values = new String[controls.size()];
        for (int i = 0; i < controls.size(); i++) values[i] = controls.get(i).getText();
        for (int i = 0; i < values.length; i++) {
            if (values[i] == null || values[i].trim().isEmpty()) {
                showMessage("Completa el campo: " + labels[i]);
                return null;
            }
        }
        return values;
    }

    void showMessage(String message) {
        Dialog.show("MiRitmo", message, "Aceptar", null);
    }
}
