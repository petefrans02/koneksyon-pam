"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Campaign {
  contest_id: string;
  title: string;
  sent: number;
  failed: number;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) { router.replace("/admin"); return; }
      fetch("/api/admin/campaigns").then(r => r.json()).then(d => {
        setCampaigns(d.campaigns || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#0f2044] px-5 py-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-white/50 hover:text-white text-sm">← Admin</Link>
          <h1 className="text-white font-black text-xl">Campagnes email</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {loading ? (
          <p className="text-stone-400">Chargement...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-stone-400">Aucune campagne envoyée pour le moment.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 font-black text-[#0f2044] text-xs uppercase tracking-wide">Concours</th>
                  <th className="text-center px-4 py-3 font-black text-[#0f2044] text-xs uppercase tracking-wide">Envoyés</th>
                  <th className="text-center px-4 py-3 font-black text-[#0f2044] text-xs uppercase tracking-wide">Erreurs</th>
                  <th className="text-center px-4 py-3 font-black text-[#0f2044] text-xs uppercase tracking-wide">Taux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {campaigns.map(c => {
                  const total = c.sent + c.failed;
                  const rate = total > 0 ? Math.round((c.sent / total) * 100) : 0;
                  return (
                    <tr key={c.contest_id} className="hover:bg-stone-50">
                      <td className="px-5 py-3">
                        <Link href={`/concours/${c.contest_id}`} className="font-medium text-[#0f2044] hover:text-[#1d4ed8] text-sm">{c.title || "—"}</Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-green-600">{c.sent}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${c.failed > 0 ? "text-red-500" : "text-stone-300"}`}>{c.failed}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${rate >= 90 ? "bg-green-100 text-green-700" : rate >= 70 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
