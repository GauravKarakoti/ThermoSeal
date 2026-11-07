import { useState } from 'react';
import { registerShipmentOnChain } from '../../../client/contract-client';

export default function ShipperRegister() {
  const [shipmentId, setShipmentId] = useState('');
  const [csvData, setCsvData] = useState('t,temp,rh,shock\n0,4,45,1.0\n60,5,46,1.0\n');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pubkey = new Uint8Array(32).fill(1);
      const res = await registerShipmentOnChain(shipmentId, csvData, pubkey, [
        { min: 2, max: 8 },
        { min: 30, max: 60 },
        { min: 0, max: 5 },
      ]);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Register New Shipment</h1>
      <form onSubmit={handleRegister} className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Shipment ID (Hex)</label>
          <input
            type="text"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
            placeholder="e.g., 010203..."
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 text-sm font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Sensor Readings (CSV)</label>
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={5}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 text-sm font-mono"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Registering on Ledger...' : 'Register Shipment'}
        </button>
      </form>
      {result && (
        <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl text-emerald-300 text-xs font-mono">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}