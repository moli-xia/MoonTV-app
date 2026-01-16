package com.moontv.app;

import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.WindowManager;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;
import com.capacitorjs.plugins.screenorientation.ScreenOrientationPlugin;
import com.capacitorjs.plugins.statusbar.StatusBarPlugin;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class MainActivity extends BridgeActivity {

    private View fullscreenView;
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    private int previousSystemUiVisibility;
    private int previousOrientation;
    private final Handler uiHandler = new Handler(Looper.getMainLooper());
    private final Runnable rehideSystemUiRunnable = new Runnable() {
        @Override
        public void run() {
            if (fullscreenView != null) {
                applyFullscreenSystemUi();
            }
        }
    };
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 注册Capacitor插件
        registerPlugin(ScreenOrientationPlugin.class);
        registerPlugin(StatusBarPlugin.class);
        
        // 设置自定义WebViewClient来注入桥接脚本
        setupWebView();
    }
    
    private void setupWebView() {
        Bridge bridge = getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                CookieManager cookieManager = CookieManager.getInstance();
                cookieManager.setAcceptCookie(true);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    cookieManager.setAcceptThirdPartyCookies(webView, true);
                }

                WebSettings settings = webView.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setLoadsImagesAutomatically(true);
                settings.setUseWideViewPort(true);
                settings.setLoadWithOverviewMode(true);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                }

                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        super.onPageFinished(view, url);
                        
                        // 注入Capacitor桥接脚本
                        String bridgeScript = loadBridgeScript();
                        if (bridgeScript != null && !bridgeScript.isEmpty()) {
                            view.evaluateJavascript(bridgeScript, null);
                        }
                    }
                });

                webView.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public void onShowCustomView(View view, CustomViewCallback callback) {
                        if (fullscreenView != null) {
                            callback.onCustomViewHidden();
                            return;
                        }

                        fullscreenView = view;
                        fullscreenCallback = callback;
                        previousSystemUiVisibility = getWindow().getDecorView().getSystemUiVisibility();
                        previousOrientation = getRequestedOrientation();

                        FrameLayout decorView = (FrameLayout) getWindow().getDecorView();
                        decorView.addView(
                            fullscreenView,
                            new FrameLayout.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                        );

                        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
                        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR);
                        applyFullscreenSystemUi();
                        scheduleRehideSystemUi();
                    }

                    @Override
                    public void onHideCustomView() {
                        exitFullscreen();
                    }
                });
            }
        }
    }

    private void applyFullscreenSystemUi() {
        View decorView = getWindow().getDecorView();
        int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        decorView.setSystemUiVisibility(flags);

        decorView.setOnSystemUiVisibilityChangeListener(new View.OnSystemUiVisibilityChangeListener() {
            @Override
            public void onSystemUiVisibilityChange(int visibility) {
                if (fullscreenView == null) return;
                scheduleRehideSystemUi();
            }
        });
    }

    private void scheduleRehideSystemUi() {
        uiHandler.removeCallbacks(rehideSystemUiRunnable);
        uiHandler.postDelayed(rehideSystemUiRunnable, 2000);
    }

    private void exitFullscreen() {
        if (fullscreenView == null) return;
        uiHandler.removeCallbacks(rehideSystemUiRunnable);

        FrameLayout decorView = (FrameLayout) getWindow().getDecorView();
        decorView.removeView(fullscreenView);
        fullscreenView = null;

        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(previousSystemUiVisibility);
        setRequestedOrientation(previousOrientation);

        if (fullscreenCallback != null) {
            fullscreenCallback.onCustomViewHidden();
            fullscreenCallback = null;
        }
    }
    
    private String loadBridgeScript() {
        try {
            InputStream inputStream = getAssets().open("public/capacitor-bridge.js");
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            StringBuilder stringBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                stringBuilder.append(line).append("\n");
            }
            reader.close();
            return stringBuilder.toString();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
    
    @Override
    public void onBackPressed() {
        if (fullscreenView != null) {
            exitFullscreen();
            return;
        }

        Bridge bridge = getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
                return;
            }
        }

        super.onBackPressed();
    }
}
