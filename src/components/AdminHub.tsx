/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, Shield, Landmark, Flame, Award, BookOpen, AlertTriangle, Check, X, CheckSquare, BarChart, TrendingUp, HelpCircle } from "lucide-react";
import { UserProfile, Gig } from "../types";

interface AdminHubProps {
  currentUser: UserProfile | null;
  users: UserProfile[];
  gigs: Gig[];
  onApproveUser: (userId: string) => Promise<void>;
  onRejectUser: (userId: string) => Promise<void>;
  onResolveDispute: (gigId: string, resolution: 'release' | 'refund') => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export default function AdminHub({
  currentUser,
  users,
  gigs,
  onApproveUser,
  onRejectUser,
  onResolveDispute,
  showToast
}: AdminHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'verifications' | 'disputes' | 'analytics'>('verifications');

  if (currentUser?.userType !== "admin") {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 border rounded-2xl bg-slate-50 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <div className="text-base font-bold text-slate-800">Operational Ingress Prohibited</div>
        <p className="text-xs text-gray-500 leading-relaxed">
          You are currently logged in as a standard user. To view platform back-office charts, approve NIN/BVN documents, or arbitrate escrow disputes, click the <strong>"SWITCH IDENTITY"</strong> selector in the top-right navbar and choose <strong>"Amaka Peters (Admin Ops)"</strong>.
        </p>
      </div>
    );
  }

  // Calculate platform financial metrics
  const activeUsersCount = users.length;
  const verifiedUsersCount = users.filter((u) => u.isVerified).length;
  
  const totalSubscribers = users.filter((u) => u.subscription && u.subscription.status === "active").length;
  const subscriberRevenue = users.reduce((acc, u) => {
    if (u.subscription && u.subscription.status === "active") {
      return acc + (u.subscription.cost || 0);
    }
    return acc;
  }, 0);

  const pendingVerifications = users.filter((u) => !u.isVerified && u.verification?.status === "pending");
  const disputedGigs = gigs.filter((g) => g.status === "disputed");

  // Sum held escrow volume
  const escrowHeldFunds = gigs.reduce((acc, g) => {
    if (g.status === "escrow_funded" || g.status === "active" || g.status === "disputed") {
      return acc + g.budget;
    }
    return acc;
  }, 0);

  // Paid commissions is 10% on completed contracts
  const totalCommissionsEarned = gigs.reduce((acc, g) => {
    if (g.status === "completed") {
      return acc + (g.budget * 0.1);
    }
    return acc;
  }, 0);

  const handleClearID = async (uid: string) => {
    await onApproveUser(uid);
    showToast("User cleared successfully! Verification Badge awarded.", "success");
  };

  const handleDenyID = async (uid: string) => {
    await onRejectUser(uid);
    showToast("Registration document denied.", "warning");
  };

  const handleArbiterResolution = async (gigId: string, action: 'release' | 'refund') => {
    if (confirm(`Instruct Deur banking layer to resolve as: ${action === 'release' ? 'Release funds to Provider' : 'Refund Client'}?`)) {
      await onResolveDispute(gigId, action);
      showToast("Arbitrage decision recorded! Ledger updated.", "success");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-left animate-fade-in mb-8">
      
      {/* Executive bento dashboard metrics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border rounded-2xl p-4.5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] uppercase font-mono tracking-widest">Active Members</span>
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="text-2xl font-black font-sans text-slate-900">{activeUsersCount}</div>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center">
            <span>{verifiedUsersCount} Verified Safe</span>
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] uppercase font-mono tracking-widest">Escrow Hold Balance</span>
            <Landmark className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-sans text-slate-900">₦{escrowHeldFunds.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500">Secured in Naira reserves</p>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] uppercase font-mono tracking-widest">Commissions Earned</span>
            <TrendingUp className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-2xl font-black font-sans text-slate-900">₦{totalCommissionsEarned.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500">10% standard platform cut</p>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] uppercase font-mono tracking-widest">Premium Subscribers</span>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-sans text-slate-900">{totalSubscribers} Accounts</div>
          <p className="text-[10px] text-brand-primary font-bold font-mono">₦{subscriberRevenue.toLocaleString()}/mo recurring</p>
        </div>

      </div>

      {/* Sub tabs nav for backoffice modules */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "verifications", label: `Registry Verifications Queue (${pendingVerifications.length})` },
          { id: "disputes", label: `Resolution Disputes Ledger (${disputedGigs.length})` },
          { id: "analytics", label: "Financial Metrics & Auditing" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2.5 font-bold text-xs transition uppercase ${
              activeSubTab === tab.id
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-gray-400 hover:text-slate-700 cursor-pointer"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TABS VIEWS */}
      
      {/* 1. VERIFICATION PROCESSING QUEUE */}
      {activeSubTab === "verifications" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">ID Registry review Queue</h2>
            <p className="text-xs text-gray-500">Review NIN details against Nigeria Federal registries and CAC registration credentials.</p>
          </div>

          {pendingVerifications.length === 0 ? (
            <div className="p-16 text-center border border-dashed rounded-2xl bg-slate-50/50 text-gray-400 text-xs">
              Excellent! No pending federal documents require verification clearance. Use the "ID Verification" tab on unverified accounts to submit test registries.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead>
                  <tr className="bg-slate-50 text-gray-400 uppercase tracking-widest text-[9px] border-b">
                    <th className="p-3">User Profile Name</th>
                    <th>ID Registry Type</th>
                    <th>Document Number</th>
                    <th>Attached Certificate File</th>
                    <th className="p-3 text-right">Actions Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingVerifications.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/40">
                      <td className="p-3 font-semibold">
                        <div className="flex items-center space-x-2">
                          <img src={u.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border" />
                          <div>
                            <div className="font-bold">{u.name}</div>
                            <span className="text-[10px] text-gray-400 capitalize">{u.userType.replace("_", " ")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="font-semibold uppercase text-brand-primary">{u.verification?.idType}</td>
                      <td className="font-mono font-bold text-slate-900">{u.verification?.idNumber}</td>
                      <td>
                        <a
                          href={u.verification?.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:underline font-bold flex items-center space-x-0.5"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1" />
                          <span>View NIN_Scan.png</span>
                        </a>
                      </td>
                      <td className="p-3 text-right space-x-1.5 flex justify-end">
                        <button
                          onClick={() => handleDenyID(u.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1.5 rounded-lg border border-rose-100 transition"
                          title="Reject Documents"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleClearID(u.id)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 p-1.5 rounded-lg border border-green-100 transition flex items-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span className="font-bold text-[10px]">Approve Member</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. RESOLUTION ARBITRAGE LEDGER */}
      {activeSubTab === "disputes" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Resolutions Ledger (Active Arbitrations)</h2>
            <p className="text-xs text-gray-500">Arbitrate failed operations. Admins can securely release escrow holds directly to providers or issue full client refunds.</p>
          </div>

          {disputedGigs.length === 0 ? (
            <div className="p-16 text-center border border-dashed rounded-2xl bg-slate-50/50 text-gray-400 text-xs">
              No active disputes in arbitration ledger. Match escrow disputes will list here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead>
                  <tr className="bg-slate-50 text-gray-400 uppercase tracking-widest text-[9px] border-b">
                    <th className="p-3">Contract Title</th>
                    <th>Client Employer</th>
                    <th>Service Provider</th>
                    <th>Held Escrow (₦)</th>
                    <th>Dispute Incident logs</th>
                    <th className="p-3 text-right">Escrow Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {disputedGigs.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/40">
                      <td className="p-3 font-bold text-slate-900">{g.title}</td>
                      <td>{g.clientName}</td>
                      <td className="font-semibold">{g.applications.find((a) => a.providerId === g.selectedProviderId)?.providerName || "Assigned Provider"}</td>
                      <td className="font-mono font-bold text-emerald-600">₦{g.budget.toLocaleString()}</td>
                      <td className="text-rose-700 font-medium italic">"No response from support. Quality was completely unacceptable."</td>
                      <td className="p-3 text-right space-x-1.5 justify-end">
                        <button
                          onClick={() => handleArbiterResolution(g.id, 'refund')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition"
                        >
                          Issue Full Refund
                        </button>
                        <button
                          onClick={() => handleArbiterResolution(g.id, 'release')}
                          className="bg-brand-primary hover:opacity-95 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition"
                        >
                          Release Holds to Provider
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. ANALYTICS & ACCOUNT AUDITING */}
      {activeSubTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-base font-bold text-slate-950 flex items-center">
              <BarChart className="w-5 h-5 text-brand-primary mr-2" />
              Naira Flow Analytics
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tracking real-time business health indicators. Deur implements a 10% administrative matching tariff buffer alongside modern recurring corporate memberships.
            </p>

            <div className="space-y-2 border p-3 rounded-xl bg-slate-50">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Recurring Subscribers:</span>
                <span className="font-bold text-slate-800">{totalSubscribers} active accounts</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Total Membership Run-rate:</span>
                <span className="font-bold text-slate-800">₦{subscriberRevenue.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Match Commissions:</span>
                <span className="font-bold text-emerald-600">₦{totalCommissionsEarned.toLocaleString()} earned</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 p-12 bg-slate-50 border rounded-2xl flex flex-col items-center justify-center text-center text-gray-500 space-y-3">
            <TrendingUp className="w-12 h-12 text-brand-primary animate-pulse" />
            <div className="font-bold text-slate-800 text-sm">Escrow Banking Channels Clear</div>
            <p className="text-xs text-gray-500 max-w-sm">
              NFC systems, Paystack API, Flutterwave integrations, and Mono direct transfers are operating fully within sandbox boundaries. Escrow buffer values remain insured by the central reserve.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
