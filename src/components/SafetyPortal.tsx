/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, Heart, User, Sparkles, MapPin, Navigation, Compass, AlertTriangle, Send, BellDot, CheckCircle2, ChevronDown, HelpCircle } from "lucide-react";
import { Gig, UserProfile } from "../types";

interface SafetyPortalProps {
  currentUser: UserProfile | null;
  activeGigs: Gig[];
  onConfirmSafety: (gigId: string) => Promise<void>;
  onTriggerSOS: (gigId: string) => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export default function SafetyPortal({
  currentUser,
  activeGigs,
  onConfirmSafety,
  onTriggerSOS,
  showToast
}: SafetyPortalProps) {
  const [selectedGigId, setSelectedGigId] = useState<string | null>(activeGigs[0]?.id || null);
  const selectedGig = activeGigs.find((g) => g.id === selectedGigId) || activeGigs[0] || null;

  // Simulator tracking vectors state
  const [coords, setCoords] = useState({ lat: 6.4281, lng: 3.4219 }); // Lagos VI default
  const [trackingDuration, setTrackingDuration] = useState(0);
  const [customSOSContact, setCustomSOSContact] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // Drift latitude and longitude to simulate actual live tracking movement
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedGig && selectedGig.status === "active") {
      interval = setInterval(() => {
        setCoords((prev) => ({
          lat: Number((prev.lat + (Math.random() - 0.5) * 0.0004).toFixed(5)),
          lng: Number((prev.lng + (Math.random() - 0.5) * 0.0004).toFixed(5))
        }));
        setTrackingDuration((prev) => prev + 1);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedGig]);

  if (!currentUser) return null;

  const handleConfirmLocation = async () => {
    if (!selectedGig) return;
    await onConfirmSafety(selectedGig.id);
  };

  const handlePanicButton = async () => {
    if (!selectedGig) return;
    if (confirm("🚨 TRIC PANIC DETECTED: This triggers an administrative security bulletin and dispatches location coordinates to emergency contacts. Confirm emergency dispatch?")) {
      await onTriggerSOS(selectedGig.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in text-left">
      {/* Safety header */}
      <div className="bg-gradient-to-r from-brand-primary to-[#5B155C] text-white p-6 sm:p-8 rounded-3xl border border-brand-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 opacity-10 bg-gradient-to-tr from-brand-alert to-brand-online rounded-full w-80 h-80 blur-3xl"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center space-x-1 bg-brand-alert/20 border border-brand-alert/30 text-white px-3 py-1 rounded-full text-xs font-bold font-mono">
            <ShieldAlert className="w-4 h-4 mr-1 text-brand-alert animate-pulse" />
            <span>Zero-Trust Deur Trust Protocol</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Deur Shield Safety Office</h1>
          <p className="text-slate-100 text-xs max-w-xl">
            We prioritize personal safety above all else. Review location parameters, monitor active in-person trackers, or initiate emergency emergency dispatch actions below.
          </p>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 min-w-[220px]">
          <div className="text-[10px] text-slate-200 font-mono tracking-widest uppercase">Safe Escrows Enabled</div>
          <div className="text-sm font-bold text-brand-online flex items-center mt-1">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-brand-online" />
            <span>100% Insured Delivery</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: SELECTOR LIST OF ACTIVE PHYSICAL GIG CONTRACTS */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Active In-Person Contracts</h3>
          
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {activeGigs.length === 0 ? (
              <div className="p-8 border border-dashed rounded-2xl bg-slate-50 text-center text-gray-400 text-xs">
                No active or escrow-funded physical contracts. Accepted gig biddings will populate this list automatically.
              </div>
            ) : (
              activeGigs.map((g) => {
                const isActive = selectedGigId === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGigId(g.id)}
                    className={`p-4 border rounded-2xl cursor-pointer transition text-left relative overflow-hidden ${
                      isActive ? "bg-brand-online/5 border-brand-online shadow-xs" : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        g.status === "active" ? "bg-brand-online/15 text-brand-online" : "bg-brand-noti/15 text-slate-800"
                      }`}>
                        {g.status.replace("_", " ")}
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-mono">₦{g.budget.toLocaleString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{g.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 shrink-0 text-slate-400" />
                      {g.location}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE PHYSICAL TRACKER & RED SOS TRIGGERS */}
        <div className="lg:col-span-7">
          {selectedGig ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Client and Provider verification badges */}
              <div className="flex justify-between items-center bg-slate-50 border p-4 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Verification Shield Checklists</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Physical contracts require dual location clearances before start.</p>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">Client</span>
                    <span className={`font-bold mt-1 px-2.5 py-0.5 rounded-full ${
                      selectedGig.safetyConfirmed.client ? "bg-green-100 text-green-800" : "bg-gray-150 text-gray-400"
                    }`}>
                      {selectedGig.safetyConfirmed.client ? "CONFIRMED" : "PENDING"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">Provider</span>
                    <span className={`font-bold mt-1 px-2.5 py-0.5 rounded-full ${
                      selectedGig.safetyConfirmed.provider ? "bg-green-100 text-green-800" : "bg-gray-150 text-gray-400"
                    }`}>
                      {selectedGig.safetyConfirmed.provider ? "CONFIRMED" : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider option if personal confirmation pending */}
              {((currentUser.id === selectedGig.clientId && !selectedGig.safetyConfirmed.client) ||
                (currentUser.id === selectedGig.selectedProviderId && !selectedGig.safetyConfirmed.provider)) && (
                 <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3.5 shadow-xs">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Pre-Gig Safety Location check</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                        By confirming, you agree that you have communicated through Deur in-app system and verified the meeting address (<strong>{selectedGig.location}</strong>) is safe, public, and secure.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleConfirmLocation}
                    className="w-full bg-brand-online hover:bg-brand-online/95 text-white font-bold text-xs py-3 rounded-xl cursor-pointer transition active:scale-[0.99]"
                  >
                    Confirm Meeting Location is Sanitized & Safe
                  </button>
                </div>
              )}

              {/* LIVE COORDINATES STREAMING PANELS (ONLY APPLIES TO ACTIVE STATUS) */}
              {selectedGig.status === "active" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center">
                      <Navigation className="w-4 h-4 text-cyan-500 mr-1.5 animate-spin duration-3000" />
                      Live Location Streaming Feed (Active Tracking)
                    </h4>
                    <span className="bg-red-500 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-sm animate-pulse">ON AIR</span>
                  </div>

                  {/* Render simulated tracking dials */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="border border-slate-100 p-3 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Latitude Vector</div>
                      <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">{coords.lat}° N</div>
                    </div>
                    <div className="border border-slate-100 p-3 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Longitude Vector</div>
                      <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">{coords.lng}° E</div>
                    </div>
                    <div className="border border-slate-100 p-3 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Lock Connection</div>
                      <div className="text-xs font-bold text-green-600 flex items-center mt-1">
                        <Compass className="w-3.5 h-3.5 mr-1 text-green-500 animate-spin" />
                        <span>Transmitting ({trackingDuration}s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Emergency dispatcher number inputs */}
                  <div className="space-y-2 Border border-slate-100 p-4 rounded-2xl">
                    <label className="block text-xs font-semibold text-slate-800">Dynamic Emergency Liaison Phone</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. +234 812 400 9001"
                        value={customSOSContact}
                        onChange={(e) => setCustomSOSContact(e.target.value)}
                        className="flex-1 bg-slate-50 border border-gray-300 rounded-xl px-4 py-1.5 text-xs focus:outline-none"
                      />
                      <button
                        onClick={() => showToast(`Liaison updated to ${customSOSContact || "Default Registry Phone"}. Contact will receive automated alert buffers.`, "success")}
                        className="bg-brand-primary text-white hover:opacity-95 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition"
                      >
                        Sync Liaison
                      </button>
                    </div>
                  </div>

                  {/* RED SYSTEM CRITICAL PANIC SOS BUTTON */}
                  <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl text-center space-y-4">
                    <div className="max-w-md mx-auto">
                      <h4 className="text-xs font-bold text-rose-950 uppercase tracking-widest flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4 text-rose-600 mr-1.5 animate-bounce" />
                        Critical Incident Panic Alert
                      </h4>
                      <p className="text-[11px] text-rose-800 mt-1 pr-2">
                        If you encounter safety issues, immediate physical violations, or security threats at the gig, trigger the button below. Deur's Trust taskforce and contacts will receive alerts.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handlePanicButton}
                        className="w-32 h-32 rounded-full bg-gradient-to-tr from-rose-500 to-red-700 hover:from-rose-400 hover:to-red-650 flex flex-col items-center justify-center border-4 border-white shadow-2xl active:scale-95 transition cursor-pointer group"
                      >
                        <ShieldAlert className="w-10 h-10 text-white stroke-[2.5] group-hover:scale-110 transition duration-300" />
                        <span className="text-xs font-black tracking-widest text-white mt-1">PANIC SOS</span>
                      </button>
                    </div>

                    {selectedGig.emergencyAlertsSent && (
                      <div className="bg-red-600 text-white font-bold rounded-xl p-3 text-xs flex items-center justify-center space-x-2 animate-pulse">
                        <BellDot className="w-4 h-4 text-white animate-bounce" />
                        <span>ALERT EMITTED! Emergency coordinate telegram sent to active admins and security dispatch.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* GIG SECURED BUT NOT STARTED YET */
                <div className="text-center p-12 border border-dashed rounded-2xl bg-slate-50/50 space-y-3">
                  <Shield className="w-12 h-12 text-slate-400 mx-auto" />
                  <div className="font-semibold text-slate-800 text-sm">Escrow Locked but Trackers Closed</div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    This in-person package is secured. As soon as both Client and Provider tap the "Confirm Meeting" slider, the gig becomes Active, enabling live tracker coordinates and panic channels!
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center p-16 border rounded-3xl bg-slate-50 text-gray-500 text-xs">
              No matching in-person contracts identified. Create a physical project brief to test Deur's custom Safety framework.
            </div>
          )}
        </div>

      </div>

      {/* Collapsible FAQ Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Safety, Escrow & Verification FAQ</h3>
            <p className="text-xs text-slate-500">Learn how Deur protects you, secures your transactions, and handles critical emergencies.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mb-2">
          {[
            {
              question: "How does the Deur escrow safety protocol work?",
              answer: "When a client hires a provider, the total budget is locked securely in Deur Escrow. Funds are never sent directly to providers upfront, nor can they be unilaterally pulled back by clients. Disbursement only occurs upon mutual completion confirmation or validated dispute resolution, or by admin intervention."
            },
            {
              question: "How are service providers and clients verified on Deur?",
              answer: "Providers list their credentials, including CAC corporate filings, professional certificates, or biometric government ID verification. Clients must provide verified transaction payment details. This dual screening validates both sides of the contract for absolute safety."
            },
            {
              question: "Is my physical location tracked during the gig?",
              answer: "Tracking is strictly opt-in and restricted only to active, physical, in-person contracts. During those active durations, modern encrypted signal vectors are transmitted through the app. Location transmission ceases automatically when the gig is completed or cancelled."
            },
            {
              question: "What happens if a dispute or violation arises during a gig?",
              answer: "If a conflict or safety issue occurs, either participant can immediately file a Deur dispute. The escrow budget remains securely locked. Deur's Trust and Safety Team acts as a neutral arbiter, reviewing chat logs, location logs, and deliverables to ensure a fair payout."
            },
            {
              question: "When should I trigger the Panic SOS button?",
              answer: "The Panic SOS is designed for active human or physical peril. Clicking the Panic button launches an emergency signal broadcast that dispatches live GPS vectors to your pre-synced emergency liaison and flags your active assignment for immediate Deur administrator response."
            }
          ].map((item, idx) => {
            const isExpanded = expandedFaqId === idx;
            return (
              <div key={idx} className="py-4" id={`faq_item_${idx}`}>
                <button
                  type="button"
                  onClick={() => setExpandedFaqId(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:text-brand-primary transition focus:outline-none cursor-pointer"
                >
                  <span className="pr-4">{item.question}</span>
                  <div className={`p-1 rounded-lg transition-transform shrink-0 ${isExpanded ? "rotate-180 text-brand-primary bg-brand-primary/5" : "text-gray-400 bg-gray-50"}`}>
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>
                {isExpanded && (
                  <div className="mt-2.5 text-xs text-slate-600 leading-relaxed pl-1 select-text bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
