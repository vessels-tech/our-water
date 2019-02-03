package com.vesselstech;

import android.graphics.Color;
import android.view.View;
import android.os.Bundle;

import com.reactnativenavigation.controllers.SplashActivity;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends SplashActivity {    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        System.out.println("ggmn MainActivity onCreate() called.");
        SplashScreen.show(this, false);
        super.onCreate(savedInstanceState);
    }

    @Override
    public View createSplashLayout() {
        System.out.println("ggmn  MainActivity createSplashLayout() called.");
        View view = new View(this);
        view.setBackgroundColor(Color.BLUE);
        return view;
    }

    @Override
    protected void onPause() {
        System.out.println("ggmn MainActivity onPause() called.");
        SplashScreen.hide(this);
        super.onPause();
    }
}
