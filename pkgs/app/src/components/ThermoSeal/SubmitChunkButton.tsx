import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface SubmitChunkButtonProps {
  onSubmit: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function SubmitChunkButton({
  onSubmit,
  disabled,
  isLoading,
}: SubmitChunkButtonProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-5">
        <div
          className="absolute inset-x-0 h-px pointer-events-none animate-zk-scan"
          style={{
            background: "linear-gradient(90deg, transparent, #10b981, transparent)",
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full animate-progress-grow"
              style={{ background: "linear-gradient(90deg, #10b981, #34d399)" }}
            />
          </div>
          <span className="font-mono text-xs text-emerald-300/80">
            {t("thermoseal.commit.loading")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg",
        "font-semibold text-sm text-white transition-all duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed",
      )}
      style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
    >
      <Lock className="h-4 w-4" />
      {t("thermoseal.commit.button")}
    </button>
  );
}