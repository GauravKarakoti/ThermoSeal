import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type StreamKey = "temp" | "humidity" | "shock";

interface StreamConfig {
  key: StreamKey;
  emoji: string;
  borderColor: string;
  glowColor: string;
  labelColor: string;
}

const STREAMS: StreamConfig[] = [
  {
    key: "temp",
    emoji: "🌡️",
    borderColor: "rgba(16,185,129,0.6)",
    glowColor: "rgba(16,185,129,0.15)",
    labelColor: "#10b981",
  },
  {
    key: "humidity",
    emoji: "💧",
    borderColor: "rgba(52,211,153,0.6)",
    glowColor: "rgba(52,211,153,0.15)",
    labelColor: "#34d399",
  },
  {
    key: "shock",
    emoji: "⚡",
    borderColor: "rgba(5,150,105,0.6)",
    glowColor: "rgba(5,150,105,0.15)",
    labelColor: "#059669",
  },
];

interface StreamSelectorProps {
  selectedStream: StreamKey | null;
  onSelect: (stream: StreamKey) => void;
  disabled: boolean;
}

export function StreamSelector({
  selectedStream,
  onSelect,
  disabled,
}: StreamSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3">
      {STREAMS.map(({ key, emoji, borderColor, glowColor, labelColor }) => {
        const isSelected = selectedStream === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            disabled={disabled}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl",
              "border transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              !disabled && !isSelected && "hover:-translate-y-0.5 hover:bg-white/5",
              isSelected ? "border-current" : "border-white/10 bg-white/3",
            )}
            style={
              isSelected
                ? {
                    borderColor,
                    backgroundColor: glowColor,
                    boxShadow: `0 0 20px ${glowColor}`,
                  }
                : undefined
            }
          >
            {isSelected && (
              <CheckCircle2
                className="absolute top-2 right-2 h-3.5 w-3.5"
                style={{ color: labelColor }}
              />
            )}
            <span className="text-3xl leading-none">{emoji}</span>
            <span
              className="text-xs font-medium"
              style={
                isSelected
                  ? { color: labelColor }
                  : { color: "rgba(255,255,255,0.5)" }
              }
            >
              {t(`thermoseal.streams.${key}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}