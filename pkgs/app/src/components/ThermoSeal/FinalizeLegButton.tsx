import { Eye, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface FinalizeLegButtonProps {
  onFinalize: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function FinalizeLegButton({
  onFinalize,
  disabled,
  isLoading,
}: FinalizeLegButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onFinalize}
      disabled={disabled || isLoading}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg",
        "font-semibold text-sm text-black transition-all duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed",
      )}
      style={{
        background: "linear-gradient(135deg, #34d399, #059669)",
      }}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span className="font-mono text-xs text-white">
            {t("thermoseal.finalize.loading")}
          </span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 text-white" />
          <span className="text-white">{t("thermoseal.finalize.button")}</span>
        </>
      )}
    </button>
  );
}