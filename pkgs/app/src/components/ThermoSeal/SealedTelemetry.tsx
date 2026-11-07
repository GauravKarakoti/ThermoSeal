import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SealedTelemetryProps {
  commitmentHash: string;
}

export function SealedTelemetry({ commitmentHash }: SealedTelemetryProps) {
  const { t } = useTranslation();
  const shortHash =
    commitmentHash.length > 20
      ? `${commitmentHash.slice(0, 10)}…${commitmentHash.slice(-8)}`
      : commitmentHash;

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-5">
      <div
        className="absolute inset-x-0 h-px pointer-events-none animate-zk-scan"
        style={{
          background: "linear-gradient(90deg, transparent, #10b981, transparent)",
        }}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-emerald-500/10">
          <Shield className="h-7 w-7 text-emerald-400" />
          <span className="absolute bottom-0.5 text-[9px] font-mono font-bold text-emerald-300">
            ZK
          </span>
        </div>
        <p className="text-sm font-semibold text-white/85">
          {t("thermoseal.sealed.title")}
        </p>
        {commitmentHash && (
          <p className="font-mono text-[11px] text-white/30 break-all text-center px-2">
            {shortHash}
          </p>
        )}
        <p className="font-mono text-xs text-emerald-300/60">
          {t("thermoseal.sealed.zkSealed")}
        </p>
      </div>
    </div>
  );
}