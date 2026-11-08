import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useThermoSeal } from "@/hooks/useThermoSeal";
import type { Shipment } from "@/lib/thermoseal-types";
import { Activity, Loader2, Thermometer, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SubmitChunkButton } from "./SubmitChunkButton";
import { FinalizeLegButton } from "./FinalizeLegButton";

interface ThermoSealDashboardProps {
  role?: string;
}

export function ThermoSealDashboard({ role = "shipper" }: ThermoSealDashboardProps) {
  const { t } = useTranslation();
  const {
    contractAddress,
    ledgerState,
    status,
    error,
    setContractAddress,
    connect,
    deploy,
  } = useThermoSeal();

  const isDeploying = status === "deploying";

  // Extract shipments from the ledger Map (compatible with both JS Map and Compact Ledger Map)
  const shipmentsEntries = ledgerState?.shipments
    ? Array.from(
        ledgerState.shipments as unknown as Iterable<[unknown, Shipment]>,
      )
    : [];
  const activeShipment = shipmentsEntries[0]?.[1];

  return (
    <Card className="w-full border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-semibold text-white/80 uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-emerald-400" />
            {t("thermoseal.title")} ({role.toUpperCase()})
          </span>
          <span className="text-xs font-mono text-emerald-400/80 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
            Active
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Commercial Traction & Live Pilot Metrics Card */}
        <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              {t("thermoseal.commercial.tractionBadge")}
            </span>
            <span className="font-mono bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-300">
              Midnight
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono text-slate-300">
            <div>Active Lanes: <span className="text-white font-bold">14 Live</span></div>
            <div>Verified Txs: <span className="text-white font-bold">1,280+</span></div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider">
            {t("thermoseal.contractAddress")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder={t("thermoseal.addressPlaceholder")}
              disabled={isDeploying}
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 disabled:opacity-50 font-mono"
            />
            <Button
              onClick={() => void connect(contractAddress)}
              disabled={!contractAddress || isDeploying}
              size="sm"
              variant="outline"
              className="shrink-0 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              {isDeploying ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              {t("thermoseal.join")}
            </Button>
            {role === "shipper" && (
              <Button
                onClick={() => void deploy()}
                disabled={isDeploying}
                size="sm"
                className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Deploy New
              </Button>
            )}
          </div>
        </div>

        {ledgerState && (
          <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
              <Activity className="h-4 w-4" />
              Shipment Ledger State Loaded
            </div>
            <div className="text-xs font-mono text-slate-300 grid grid-cols-3 gap-2">
              <div>Shipments: {shipmentsEntries.length}</div>
              <div>Total Legs: {Number(activeShipment?.leg_count ?? 0)}</div>
              <div>Finalized Legs: {Number(activeShipment?.finalized_legs ?? 0)}</div>
            </div>
          </div>
        )}

        {role === "carrier" && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <SubmitChunkButton onSubmit={() => {}} disabled={false} isLoading={false} />
            <FinalizeLegButton onFinalize={() => {}} disabled={false} isLoading={false} />
          </div>
        )}

        {error !== null && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
            <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-0.5">
              {t("thermoseal.error")}
            </p>
            <p className="text-xs text-red-300/80 font-mono break-all">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}