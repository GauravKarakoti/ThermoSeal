import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyShipmentOnChain } from '../../../client/contract-client';

export default function VerifyShipment() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!shipmentId) return;
    verifyShipmentOnChain(shipmentId).then(setData);
  }, [shipmentId]);

  if (!data) return <main className="p-6 text-slate-400">Verifying shipment on-chain...</main>;

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Shipment Verification Dashboard</h1>
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 text-sm">
        <div>
          <span className="text-slate-500 block text-xs uppercase font-semibold">Shipment ID</span>
          <span className="font-mono text-emerald-400">{data.shipmentId}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-slate-500 block text-xs uppercase font-semibold">Total Legs</span>
            <span className="text-slate-200 font-medium">{data.legCount}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs uppercase font-semibold">Finalized Legs</span>
            <span className="text-slate-200 font-medium">{data.finalizedLegs}</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 block text-xs uppercase font-semibold mb-2">Leg Compliance Flags</span>
          <ul className="space-y-1">
            {data.legsCompliant.map((compliant: boolean, idx: number) => (
              <li key={idx} className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                <span className="text-slate-300">Leg {idx}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${compliant ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                  {compliant ? 'Compliant' : 'Non-Compliant / Pending'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}