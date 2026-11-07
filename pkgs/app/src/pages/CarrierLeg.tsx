import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { submitLegChunks, finalizeLegOnChain } from '../../../client/contract-client';

export default function CarrierLeg() {
  const { shipmentId, n } = useParams<{ shipmentId: string; n: string }>();
  const [csvData, setCsvData] = useState('t,temp,rh,shock\n0,4,45,1.0\n');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleProcessLeg = async () => {
    if (!shipmentId || n === undefined) return;
    setLoading(true);
    try {
      const legIndex = Number(n);
      const pubkey = new Uint8Array(32).fill(1);
      setStatus('Submitting O(128) sensor chunks...');
      await submitLegChunks(shipmentId, legIndex, csvData, pubkey);
      setStatus('Finalizing leg compliance & nullifier...');
      await finalizeLegOnChain(shipmentId, legIndex);
      setStatus('Leg successfully finalized and recorded on-chain!');
    } catch (err) {
      console.error(err);
      setStatus('Error submitting leg proof.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Carrier Leg Submission (Leg #{n})</h1>
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
        <p className="text-xs text-slate-400 font-mono">Shipment: {shipmentId}</p>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Leg Telemetry CSV</label>
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={5}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 text-sm font-mono"
          />
        </div>
        <button
          onClick={handleProcessLeg}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing ZK Proofs...' : 'Submit & Finalize Leg'}
        </button>
        {status && <p className="text-sm text-emerald-400 font-medium">{status}</p>}
      </div>
    </main>
  );
}