import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const GoogleTranslate = () => {
  useEffect(() => {
    const addScript = () => {
      if (document.getElementById("google-translate-script")) return;
      
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "pt",
            includedLanguages: "",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    addScript();
  }, []);

  return <div id="google_translate_element" className="inline-block" />;
};

export default GoogleTranslate;
