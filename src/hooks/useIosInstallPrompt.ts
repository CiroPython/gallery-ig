import { useEffect, useState } from "react";

export const useIosInstallPrompt = () => {
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isInStandalone = (window.navigator as any).standalone === true;

    const dismissed = localStorage.getItem("iosPromptDismissed");

    if (isIos && !isInStandalone && !dismissed) {
      setShowIosPrompt(true);
    }
  }, []);

  const dismissPrompt = () => {
    localStorage.setItem("iosPromptDismissed", "true");
    setShowIosPrompt(false);
  };

  return { showIosPrompt, dismissPrompt };
};
