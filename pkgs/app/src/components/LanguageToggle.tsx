import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language;
  const next = current === "hi" ? "en" : "hi";
  const label = current === "hi" ? "EN" : "HI";

  const toggle = () => {
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="fixed top-4 right-4 z-50 font-mono text-xs"
      onClick={toggle}
      aria-label={`Switch to ${next.toUpperCase()}`}
    >
      {label}
    </Button>
  );
}