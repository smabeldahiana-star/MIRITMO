package com.miritmo;

import com.codename1.components.SpanLabel;
import com.codename1.ui.Component;
import com.codename1.ui.Container;
import com.codename1.ui.Form;
import com.codename1.ui.Font;
import com.codename1.ui.Label;
import com.codename1.ui.Toolbar;
import com.codename1.ui.layouts.BoxLayout;

final class MiRitmoLayout {
    private final MiRitmoApp app;

    MiRitmoLayout(MiRitmoApp app) {
        this.app = app;
    }

    Form newScreen(String title) {
        if ("Diario emocional".equals(app.state.currentScreen)
                && !"Diario emocional".equals(title)) app.diary.lock();
        if ("Tiempo de enfoque".equals(app.state.currentScreen)
                && !"Tiempo de enfoque".equals(title) && app.state.focusRunning) {
            app.state.focusRunning = false;
            if (app.state.focusTimer != null) app.state.focusTimer.cancel();
        }
        app.state.currentScreen = title;
        Form form = new Form(title, BoxLayout.y());
        form.setScrollableY(true);
        form.getContentPane().getAllStyles().setBgColor(MiRitmoTheme.PAPER);
        form.getContentPane().getAllStyles().setBgTransparency(255);
        addNavigation(form.getToolbar());
        app.state.currentForm = form;
        return form;
    }

    private void addNavigation(Toolbar toolbar) {
        toolbar.addCommandToSideMenu("Resumen", null, event -> app.showHome());
        toolbar.addCommandToSideMenu("Agenda", null, event -> app.showTasks());
        toolbar.addCommandToSideMenu("Hábitos", null, event -> app.showHabits());
        toolbar.addCommandToSideMenu("Entrenamiento", null, event -> app.showWorkouts());
        toolbar.addCommandToSideMenu("Gastos compartidos", null, event -> app.showExpenses());
        toolbar.addCommandToSideMenu("Diario emocional", null, event -> app.showDiary());
        toolbar.addCommandToSideMenu("Tiempo de enfoque", null, event -> app.showFocus());
    }

    void addCard(Form form, String heading, String text) {
        Container card = new Container(BoxLayout.y());
        card.setUIID("FeatureCard");
        Label title = new Label(heading);
        title.getAllStyles().setFgColor(MiRitmoTheme.PINK_DARK);
        title.getAllStyles().setFont(Font.createSystemFont(
                Font.FACE_SYSTEM, Font.STYLE_BOLD, Font.SIZE_SMALL));
        card.add(title);
        card.add(body(text));
        form.add(card);
    }

    Container header(String title, String subtitle) {
        Container header = new Container(BoxLayout.y());
        header.setUIID("PageHeader");
        Label heading = new Label(title);
        heading.getAllStyles().setFgColor(MiRitmoTheme.INK);
        heading.getAllStyles().setFont(Font.createSystemFont(
                Font.FACE_SYSTEM, Font.STYLE_BOLD, Font.SIZE_LARGE));
        header.add(heading);
        header.add(body(subtitle));
        return header;
    }

    Label sectionTitle(String value) {
        Label label = new Label(value);
        label.getAllStyles().setFgColor(MiRitmoTheme.PINK_DARK);
        label.getAllStyles().setFont(Font.createSystemFont(
                Font.FACE_SYSTEM, Font.STYLE_BOLD, Font.SIZE_MEDIUM));
        return label;
    }

    SpanLabel body(String value) {
        SpanLabel label = new SpanLabel(value);
        label.getAllStyles().setFgColor(MiRitmoTheme.MUTED);
        return label;
    }

    Label smallText(String value) {
        Label label = new Label(value);
        label.getAllStyles().setFgColor(MiRitmoTheme.MUTED);
        label.getAllStyles().setFont(Font.createSystemFont(
                Font.FACE_SYSTEM, Font.STYLE_PLAIN, Font.SIZE_SMALL));
        return label;
    }

    Label centered(String value) {
        Label label = smallText(value);
        label.setAlignment(Component.CENTER);
        return label;
    }
}
