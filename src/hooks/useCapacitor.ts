import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useNavigate } from 'react-router-dom';

export function useCapacitor() {
  const navigate = useNavigate();

  useEffect(() => {
    let backButtonListener: any = null;

    const initCapacitor = async () => {
      try {
        // Only run if we're actually in a Capacitor environment
        // 1. Hide Splash Screen
        await SplashScreen.hide().catch(() => {});
        
        // 2. Set Status Bar (Purple theme)
        await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        await StatusBar.setBackgroundColor({ color: '#6C5CE7' }).catch(() => {});

        // 3. Hardware Back Button Listener (Android)
        backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });

        // 4. Listen for deep links
        App.addListener('appUrlOpen', (event) => {
          const slug = event.url.split('.app').pop();
          if (slug) {
            navigate(slug);
          }
        });

      } catch (err) {
        console.warn('Capacitor initialization skipped (running in browser)', err);
      }
    };

    initCapacitor();

    return () => {
      if (backButtonListener && backButtonListener.remove) {
        backButtonListener.remove();
      }
    };
  }, [navigate]);
}
