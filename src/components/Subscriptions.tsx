/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CreditCard, Shield, Landmark, Bookmark, ArrowRight, Zap, Gift, Check, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

interface SubscriptionsProps {
  currentUser: UserProfile | null;
  onSubscribe: (tier: 'basic' | 'premium', paymentMethod: string) => Promise<void>;
}

export default function Subscriptions({
  currentUser,
  onSubscribe
}: SubscriptionsProps) {
  const [activeCheckoutTier, setActiveCheckoutTier] = useState<'basic' | 'premium' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'mono' | 'flutterwave'>('paystack');
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [monoAccount, setMonoAccount] = useState("");
  const [monoBank, setMonoBank] = useState("Zenith Bank");
  const [processing, setProcessing] = useState(false);

  if (!currentUser) {
    return (
      <div className="p-8 text-center text-gray-500">
        Please log in or select a sandbox identity in the top menu to view subscription plans.
      </div>
    );
  }

  const isClient = currentUser.userType === "client";
  const hasActiveSub = currentUser.subscription && currentUser.subscription.status === "active";
  const currentSub = currentUser.subscription;

  // Pricing Matrix calculations
  const plans = {
    basic: {
      price: isClient ? 2000 : 1500,
      onboarding: 0,
      badge: false,
      gigs: isClient ? "Up to 3 open gigs" : "Submit up to 5 proposals",
      matching: "Standard matching algorithms"
    },
    premium: {
      price: isClient ? 5000 : 3500,
      onboarding: 0,
      badge: true,
      gigs: isClient ? "Unlimited gigs posting" : "Unlimited proposal bidding",
      matching: isClient ? "Priority premium matching (Get matching providers in <10 mins)" : "Featured matching search results, Featured Profile position"
    }
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckoutTier) return;
    setProcessing(true);
    
    // Simulate real billing processing delay
    setTimeout(async () => {
      await onSubscribe(activeCheckoutTier, paymentMethod);
      setProcessing(false);
      setActiveCheckoutTier(null);
      // Clean forms
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setMonoAccount("");
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in text-left">
      {/* Page header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-brand-online/10 border border-brand-online/20 text-brand-online px-3.5 py-1 rounded-full text-xs font-bold">
          <Shield className="w-3.5 h-3.5 text-brand-online" />
          <span>Paystack Secured Transactions</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          Billing, subscriptions & Plan Control
        </h1>
        <p className="text-slate-500 text-sm">
          Select or upgrade your subscription plan securely. All fees are in Nigerian Naira (₦) processed through Nigerian Escrow protocols with automatic billing limits.
        </p>
      </div>

      {/* Show active subscription detail first */}
      {hasActiveSub && currentSub ? (
        <div className="bg-gradient-to-r from-brand-primary to-[#5B155C] text-white border border-brand-primary p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md relative overflow-hidden rounded-2xl">
          <div className="absolute right-0 top-0 opacity-10 bg-radial-gradient py-12 px-12 transform translate-x-10 -translate-y-10 rounded-full w-44 h-44 bg-brand-online"></div>
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-online font-bold flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-brand-online animate-pulse" />
              <span>Active Subscription Tier</span>
            </span>
            <h2 className="text-2xl font-black font-sans">
              Deur {currentSub.tier.toUpperCase()} Plan
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-200 mt-2">
              <span><strong>Billing Cycle:</strong> Monthly</span>
              <span>•</span>
              <span><strong>Renewal Date:</strong> {currentSub.expiryDate}</span>
              <span>•</span>
              {currentSub.hasPromo && (
                <span className="bg-brand-online/20 text-brand-online font-bold px-2.5 py-0.5 rounded border border-brand-online/30 flex items-center text-[11px]">
                  <Gift className="w-3.5 h-3.5 mr-1" />
                  Deur Premium Promo Active (2 months for 1)
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl p-4 min-w-[200px] text-left">
            <div className="text-xs text-slate-200">Premium Invoice Rate</div>
            <div className="text-2xl font-black text-white font-sans mt-0.5">
              ₦{currentSub.cost.toLocaleString()}
              <span className="text-xs font-normal text-slate-300">/mo</span>
            </div>
            <span className="inline-flex items-center text-[10px] bg-brand-online/20 border border-brand-online/35 text-brand-online rounded-full font-bold px-2.5 py-0.5 mt-2">
              <Check className="w-3 h-3 text-brand-online mr-1" /> Paid via Paystack CO
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4.5 text-amber-900 text-xs flex items-start space-x-3 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <strong>Plan Inactive:</strong> Your profile currently has standard trial listing. Choose a subscription package below to transact, apply for projects, and access safe contact filters fully.
          </div>
        </div>
      )}

      {/* Plan Card Pricing Selections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-6">
        {/* plan Basic card */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border px-2 py-1 rounded">Standard Access</span>
              <Bookmark className="w-5 h-5 text-slate-400" />
            </div>
            
            <h3 className="text-xl font-bold font-sans">Deur Basic Plan</h3>
            <p className="text-xs text-slate-500">Essential standard features for individuals seeking to matching contracts safely.</p>
            
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900 font-sans">
                ₦{plans.basic.price.toLocaleString()}
                <span className="text-xs font-normal text-slate-400">/month</span>
              </div>
              {plans.basic.onboarding > 0 && !isClient && (
                <div className="text-xs text-brand-primary font-bold">
                  + ₦{plans.basic.onboarding.toLocaleString()} One-time onboarding fee
                </div>
              )}
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-3">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span>{plans.basic.gigs}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span>{plans.basic.matching}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span>Standard Escrow protection</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span>Masked In-App communications</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-slate-50 border-t border-gray-100">
            <button
              onClick={() => setActiveCheckoutTier("basic")}
              disabled={currentUser.subscription?.tier === "basic" && hasActiveSub}
              className={`w-full py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer ${
                currentUser.subscription?.tier === "basic" && hasActiveSub
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed font-medium"
                  : "bg-brand-primary text-white hover:opacity-95"
              }`}
            >
              {currentUser.subscription?.tier === "basic" && hasActiveSub ? "Active Plan" : "Choose Basic Plan"}
            </button>
          </div>
        </div>

        {/* plan Premium card */}
        <div className="bg-white border-2 border-brand-online rounded-3xl shadow-sm relative overflow-hidden flex flex-col transform hover:scale-[1.01] transition-all">
          <div className="absolute top-0 right-0 bg-brand-online text-white font-bold uppercase text-[9px] tracking-widest px-4 py-1.5 rounded-bl-xl shadow-xs">
            Recommended
          </div>
          <div className="p-6 border-b border-gray-100 flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <div className="inline-flex items-center space-x-1 bg-brand-online/10 border border-brand-online/20 text-brand-online rounded px-2.5 py-0.5 text-xs font-bold font-sans">
                <Zap className="w-3.5 h-3.5" />
                <span>Priority Plus</span>
              </div>
              {isClient && (
                <div className="bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-0.5 animate-pulse">
                  <Gift className="w-3 h-3 text-brand-accent" />
                  <span>Buy 1 Get 2 Months!</span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold font-sans flex items-center">
              Deur Premium Plan
              {plans.basic.badge && <span className="ml-1.5 bg-brand-online/10 text-brand-online font-mono text-[9px] px-1.5 py-0.5 rounded">Pro Badge</span>}
            </h3>
            <p className="text-xs text-gray-500">Maximize matching efficiency. Priority vetting, continuous live map location tracking, and premium badge protection.</p>
            
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900 font-sans">
                ₦{plans.premium.price.toLocaleString()}
                <span className="text-xs font-normal text-brand-accent">/month</span>
              </div>
              {plans.premium.onboarding > 0 && !isClient && (
                <div className="text-xs text-brand-primary font-bold">
                  + ₦{plans.premium.onboarding.toLocaleString()} One-time onboarding fee
                </div>
              )}
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-3">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span className="font-semibold text-slate-850">{plans.premium.gigs}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span>{plans.premium.matching}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span className="font-semibold text-brand-primary">Top Pro Brand verification Badge</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span>Unlimited watermark creations</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-online" />
                <span>Dedicated safety monitoring desk</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-brand-online/5 border-t border-gray-100">
            <button
              onClick={() => setActiveCheckoutTier("premium")}
              disabled={currentUser.subscription?.tier === "premium" && hasActiveSub}
              className={`w-full py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer ${
                currentUser.subscription?.tier === "premium" && hasActiveSub
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed font-medium"
                  : "bg-brand-online text-white hover:bg-brand-online/90"
              }`}
            >
              {currentUser.subscription?.tier === "premium" && hasActiveSub ? "Active Plan" : "Choose Premium Plan"}
            </button>
          </div>
        </div>
      </div>

      {/* Paystack simulation Portal Drawer overlay */}
      {activeCheckoutTier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 transform scale-100 transition-all">
            {/* paystack Checkout header */}
            <div className="bg-gradient-to-r from-brand-primary to-[#5B155C] text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#36C5F0] font-bold">Gateway Secured checkout</span>
                <h4 className="text-base font-bold font-sans text-white">
                  Pay with {paymentMethod === "paystack" ? "Paystack" : paymentMethod === "mono" ? "Mono Direct Bank" : "Flutterwave"}
                </h4>
              </div>
              <div className="bg-white/15 p-1.5 rounded-lg border border-white/10 flex items-center justify-center">
                <span className="text-brand-primary bg-white text-[10px] font-sans font-extrabold px-2.5 py-0.5 rounded-md">₦</span>
              </div>
            </div>

            {/* billing detail content */}
            <form onSubmit={handleSubscribeSubmit} className="p-6 space-y-4">
              <div className="flex justify-between items-baseline border-b border-gray-100 pb-2 mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Subscription Cost:</span>
                <span className="font-bold text-lg font-sans text-slate-900">
                  ₦{(plans[activeCheckoutTier].price + plans[activeCheckoutTier].onboarding).toLocaleString()}
                </span>
              </div>

              {/* Toggle Gateways */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "paystack", label: "Paystack", logo: "💳" },
                  { id: "mono", label: "Mono Link", logo: "🏛️" },
                  { id: "flutterwave", label: "Flutterwave", logo: "🛡️" }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPaymentMethod(g.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === g.id
                        ? "border-teal-500 bg-teal-50/40 text-slate-950 font-bold"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-slate-50 text-xs"
                    }`}
                  >
                    <span className="text-lg">{g.logo}</span>
                    <span className="text-[10px] tracking-wide mt-0.5">{g.label}</span>
                  </button>
                ))}
              </div>

              {/* Render dynamic payment forms based on gateway */}
              {paymentMethod === "mono" ? (
                /* MONO DIRECT NIGERIA BANK INTEGRATION */
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[10px] text-slate-500">
                    🔒 Direct Bank Authorization. Mono connects you to your banking portal safely to complete immediate transfers. Supports Naira accounts.
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Select Bank</label>
                    <select
                      value={monoBank}
                      onChange={(e) => setMonoBank(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-xs rounded-xl p-2 focus:outline-none"
                    >
                      <option value="Zenith Bank">Zenith Bank Plc</option>
                      <option value="Guaranty Trust Bank">GTBank (Guaranty Trust)</option>
                      <option value="Access Bank">Access Bank Plc</option>
                      <option value="United Bank for Africa">UBA (United Bank for Africa)</option>
                      <option value="OPay">OPay Digital Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="10-digit account number"
                      value={monoAccount}
                      onChange={(e) => setMonoAccount(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-50 border border-gray-200 text-xs rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* STANDARD CREDIT CARD CAPTURE (PAYSTACK / FLUTTERWAVE) */
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Kola Adesina"
                      className="w-full bg-slate-50 border border-gray-200 text-xs rounded-xl p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="5061 0000 0000 0000 (Verve/Mastercard)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                      className="w-full bg-slate-50 border border-gray-200 text-xs rounded-xl p-2.5 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 text-xs rounded-xl p-2 focus:outline-none font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Security CVV Code</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-50 border border-gray-200 text-xs rounded-xl p-2 focus:outline-none font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* pay buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveCheckoutTier(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-2 py-2.5 bg-brand-online hover:bg-brand-online/90 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-brand-online/15"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Securing transfer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Payment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
