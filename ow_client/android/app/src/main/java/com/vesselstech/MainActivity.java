package com.vesselstech;

import android.graphics.Color;
import android.view.View;
import android.os.Bundle;

import com.reactnativenavigation.controllers.SplashActivity;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends SplashActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);
        super.onCreate(savedInstanceState);
    }

    // @Override
    // public View createSplashLayout() {
    //     View view = new View(this);
    //     view.setBackgroundColor(Color.BLUE);
    //     return view;
    // }

}
