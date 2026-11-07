import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import hindi from "./locales/hindi";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
  }
}

const savedLang = localStorage.getItem("lang");
const initialLang = savedLang === "hi" || savedLang === "en" ? savedLang : "en";

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem("lang", lng);
});
document.documentElement.lang = i18n.language;

i18n.use(initReactI18next).init({
  lng: initialLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    hi: { translation: hindi },
    en: { translation: en },
  },
});

export default i18n;