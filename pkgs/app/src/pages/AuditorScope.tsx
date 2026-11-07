import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchGrant, fetchScopedReadings } from '../../../client/contract-client';

export default function AuditorScope() {
  const { grantId } = useParams<{ grantId: string }>();
  const [grant, setGrant] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [withheld, setWithheld] = useState(0);

  useEffect(() => {
    if (!grantId) return;
    (async () => {
      try {
        const g = await fetchGrant(grantId);
        const { disclosed, withheldCount } = await fetchScopedReadings(grantId);
        setGrant(g);
        setReadings(disclosed);
        setWithheld(withheldCount);
      } catch (err) {
        console.error("Failed to load audit grant scope:", err);
      }
    })();
  }, [grantId]);

  if (!grant) return <main aria-busy="true">Loading grant…</main>;

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div role="region" aria-label="Disclosure scope" className="scope-banner bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Scoped Disclosure Verification</h2>
        <p className="text-sm text-slate-300">
          You are viewing <em>only</em> readings matching the shipper's committed scope for this grant. 
          All other readings remain private and are not accessible to you.
        </p>
        <ul className="text-xs text-slate-400 grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <li>Scope hash: <code className="text-emerald-400">{grant.scopeHash?.slice(0, 16)}…</code></li>
          <li>Expires: epoch {grant.expiryEpoch}</li>
          <li>Readings shown: {readings.length}</li>
          <li>Readings withheld: {withheld}</li>
        </ul>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/50">
        <table aria-label="Disclosed readings" className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-slate-900">
              <th className="p-3">Stream</th>
              <th className="p-3">Leg</th>
              <th className="p-3">Reading</th>
              <th className="p-3">Committed leaf</th>
            </tr>
          </thead>
          <tbody>
            {readings.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  No readings match the authorized scope or none have been disclosed.
                </td>
              </tr>
            ) : (
              readings.map((r, i) => (
                <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <td className="p-3 text-slate-200">{r.stream}</td>
                  <td className="p-3 text-slate-200">{r.leg}</td>
                  <td className="p-3 text-slate-200 font-mono">{r.value}</td>
                  <td className="p-3 text-slate-400 font-mono"><code>{r.commitment?.slice(0, 12)}…</code></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="footnote text-xs text-slate-500 italic">
        The ledger records that this disclosure occurred and when. It does not record what was disclosed.
      </p>
    </main>
  );
}