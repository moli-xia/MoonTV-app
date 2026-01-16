// Capacitor Bridge for Remote Content
// This script provides Capacitor plugin functionality to remote websites

(function() {
    'use strict';
    
    // Check if Capacitor is available
    if (typeof window.Capacitor === 'undefined') {
        console.log('Capacitor not available, creating mock implementation');
        return;
    }
    
    // Screen Orientation Bridge
    window.ScreenOrientationBridge = {
        async lockLandscape() {
            try {
                const { ScreenOrientation } = window.Capacitor.Plugins;
                await ScreenOrientation.lock({ orientation: 'landscape' });
                console.log('Screen locked to landscape');
                return true;
            } catch (error) {
                console.error('Failed to lock screen orientation:', error);
                return false;
            }
        },
        
        async lockPortrait() {
            try {
                const { ScreenOrientation } = window.Capacitor.Plugins;
                await ScreenOrientation.lock({ orientation: 'portrait' });
                console.log('Screen locked to portrait');
                return true;
            } catch (error) {
                console.error('Failed to lock screen orientation:', error);
                return false;
            }
        },
        
        async unlock() {
            try {
                const { ScreenOrientation } = window.Capacitor.Plugins;
                await ScreenOrientation.unlock();
                console.log('Screen orientation unlocked');
                return true;
            } catch (error) {
                console.error('Failed to unlock screen orientation:', error);
                return false;
            }
        },
        
        async getCurrentOrientation() {
            try {
                const { ScreenOrientation } = window.Capacitor.Plugins;
                const result = await ScreenOrientation.orientation();
                return result.type;
            } catch (error) {
                console.error('Failed to get current orientation:', error);
                return null;
            }
        }
    };
    
    // Status Bar Bridge
    window.StatusBarBridge = {
        async hide() {
            try {
                const { StatusBar } = window.Capacitor.Plugins;
                await StatusBar.hide();
                console.log('Status bar hidden');
                return true;
            } catch (error) {
                console.error('Failed to hide status bar:', error);
                return false;
            }
        },
        
        async show() {
            try {
                const { StatusBar } = window.Capacitor.Plugins;
                await StatusBar.show();
                console.log('Status bar shown');
                return true;
            } catch (error) {
                console.error('Failed to show status bar:', error);
                return false;
            }
        }
    };
    
    // Auto-detect fullscreen events and handle orientation
    function handleFullscreenChange() {
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement;
        
        if (isFullscreen) {
            console.log('Entering fullscreen, locking to landscape');
            window.ScreenOrientationBridge.lockLandscape();
            window.StatusBarBridge.hide();
        } else {
            console.log('Exiting fullscreen, unlocking orientation');
            window.ScreenOrientationBridge.unlock();
            window.StatusBarBridge.show();
        }
    }
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Expose global functions for manual control
    window.toggleLandscape = function() {
        return window.ScreenOrientationBridge.lockLandscape();
    };
    
    window.togglePortrait = function() {
        return window.ScreenOrientationBridge.lockPortrait();
    };
    
    window.unlockOrientation = function() {
        return window.ScreenOrientationBridge.unlock();
    };
    
    console.log('Capacitor Bridge loaded successfully');
})();