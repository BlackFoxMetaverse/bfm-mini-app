import { useState, useEffect } from "react";

export function useTelegramUser() {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      // Check if Telegram WebApp is available
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;

        // Initialize Telegram WebApp
        tg.ready();
        // 1) WebApp payload (from startapp=r123)
        const startParam = tg.initDataUnsafe?.start_param;
        if (startParam) {
          const cleaned = String(startParam).replace(/^r/i, "");
          sessionStorage.setItem("referrerTgId", cleaned);
        }

        // Get user data if available
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          setUser(tg.initDataUnsafe.user);
        } else {
          // Set fallback user data when testing outside Telegram
          setUser({
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            photo_url: null,
          });
        }
      } else {
        // Set fallback user data when not in Telegram
        setUser({
          telegramId: 999999999,
          first_name: "Test",
          last_name: "User",
          username: "testuser",
          photo_url: null,
        });
      }
    } catch (err) {
    } finally {
      setIsLoaded(true);
    }
  }, []);

  return { user, isLoaded };
}
