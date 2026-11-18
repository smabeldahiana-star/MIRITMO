package com.miritmo;

import com.codename1.system.Lifecycle;
import com.codename1.ui.Toolbar;

public class MiRitmo extends Lifecycle {
    private MiRitmoApp app;

    @Override
    public void runApp() {
        Toolbar.setGlobalToolbar(true);
        app = new MiRitmoApp();
        app.showHome();
    }

    @Override
    public void stop() {
        if (app != null) app.stop();
    }
}
