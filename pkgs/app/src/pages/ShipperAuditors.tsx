import { useState } from 'react';
import { authorizeAuditorGrant } from '../../../client/contract-client';

export default function ShipperAuditors() {
  const [grantId, setGrantId] = useState('');
  const [scopeHash, setScopeHash] = useState('');
  const [auditorPubkey, setAuditorPubkey] = useState('');
  const [expiryEpoch, setExpiryEpoch] = useState(1000);
  const [success, setSuccess] = useState(false);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authorizeAuditorGrant(grantId, scopeHash, auditorPubkey, expiryEpoch);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Authorize Auditor Grant</h1>
      <form onSubmit={handleAuthorize} className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Grant ID (Hex)</label>
          <input
            type="text"
            value={grantId}
            onChange={(e) => setGrantId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 text-sm font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Scope Hash (Hex)</label>
          <input
            type="text"
            value={scopeHash}
            onChange={(e) => setScopeHash(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 text-sm font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Auditor Pubkey Hash (Hex)</label>
          <input
            type="text"
            value={auditorPubkey}
            onChange={(e) => setAuditorPubkey(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 text-sm font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Expiry Epoch</label>
          <input
            type="number"
            value={expiryEpoch}
            onChange={(e) => setExpiryEpoch(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 text-sm font-mono"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded transition-colors"
        >
          Create Grant
        </button>
      </form>
      {success && <p className="text-emerald-400 text-sm font-medium">Auditor grant successfully authorized on-chain!</p>}
    </main>
  );
}