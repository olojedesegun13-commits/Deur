/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Onboarding from "./components/Onboarding";
import Subscriptions from "./components/Subscriptions";
import GigsList from "./components/GigsList";
import SafetyPortal from "./components/SafetyPortal";
import ChatSystem from "./components/ChatSystem";
import AdminHub from "./components/AdminHub";
import { UserProfile, Gig, ChatSession, GigCategory } from "./types";
import { Shield, Sparkles, Key, AlertCircle, Play, Landmark, Info, CreditCard, Bookmark, ArrowRight, Zap, Gift, Check, RefreshCw } from "lucide-react";
import DeurLogo from "./components/DeurLogo";

// Suppress and gracefully handle Vite HMR connection warnings / error overlay in the browser
if (typeof window !== "undefined") {
  try {
    const OriginalWebSocket = window.WebSocket;
    if (OriginalWebSocket && !(OriginalWebSocket as any)._isWrapped) {
      class RobustWebSocket extends OriginalWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          const isViteHmr = typeof url === 'string' && (url.includes('vite') || url.includes('hmr') || url.includes('ws'));
          super(url, protocols);
          if (isViteHmr) {
            this.addEventListener('error', () => {
              console.debug("Vite HMR connection handled gracefully. Disabling error overlay console spam.");
            });
          }
        }
      }
      (RobustWebSocket as any)._isWrapped = true;
      try {
        window.WebSocket = RobustWebSocket;
      } catch (err) {
        // Fallback for environments with getter-only WebSocket properties
        try {
          Object.defineProperty(window, 'WebSocket', {
            value: RobustWebSocket,
            configurable: true,
            writable: true,
            enumerable: true
          });
        } catch (defineErr) {
          console.debug("WebSocket wrapping bypassed due to strict environment constraints:", defineErr);
        }
      }
    }
  } catch (e) {
    console.debug("Gracefully skipped WebSocket proxy initialization:", e);
  }
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeTab, setActiveTab] = useState("gigs");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showPostRegisterSubModal, setShowPostRegisterSubModal] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<'basic' | 'premium' | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'paystack' | 'mono' | 'flutterwave'>('paystack');
  const [checkoutCard, setCheckoutCard] = useState("");
  const [checkoutExpiry, setCheckoutExpiry] = useState("");
  const [checkoutCvv, setCheckoutCvv] = useState("");
  const [checkoutMonoBank, setCheckoutMonoBank] = useState("Zenith Bank");
  const [checkoutMonoAccount, setCheckoutMonoAccount] = useState("");
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  
  // Refresh toggles
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [loading, setLoading] = useState(true);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Load initial datasets from backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load current logged in user session
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meRes.ok && meData.user) {
          setCurrentUser(meData.user);
        }

        // Fetch gigs
        const gigsRes = await fetch("/api/gigs");
        const gigsData = await gigsRes.json();
        if (gigsRes.ok && gigsData.gigs) {
          setGigs(gigsData.gigs);
        }

        // Fetch chat sessions
        const chatsRes = await fetch("/api/chat/sessions");
        const chatsData = await chatsRes.json();
        if (chatsRes.ok && chatsData.chats) {
          setChats(chatsData.chats);
        }

        // For sandbox presentation, we fetch list of users to switch between
        // we can extract these directly from the initial db structure (we'll fetch admins and active builders)
        // Or write a small fallback if the list fails
        const demoUsers = [
          {
            id: "client_demo",
            email: "funto@deur.ng",
            name: "Funto Alade",
            userType: "client" as const,
            phoneMasked: "+234 803 *** **88",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
            bio: "Executive Director at Alade Events.",
            location: "Lekki Phase 1, Lagos",
            isVerified: true,
            verificationBadge: true,
            ratingsAverage: 4.8,
            completedGigsCount: 14,
            responseTime: "Within 2 hours"
          },
          {
            id: "prov_chioma",
            email: "chioma@deur.ng",
            name: "Chioma Nnaji",
            userType: "provider_individual" as const,
            phoneMasked: "+234 703 *** **12",
            avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=200",
            bio: "Professional MC, Event Hostess, and Corporate Spokesperson.",
            location: "Surulere, Lagos",
            isVerified: true,
            verificationBadge: true,
            category: "Event Staffing" as GigCategory,
            subcategory: "MC/Host",
            ratingsAverage: 4.9,
            completedGigsCount: 28,
            responseTime: "Within 10 minutes"
          },
          {
            id: "prov_lagos_ushers",
            email: "info@lagoselite.com",
            name: "Lagos Elite Ushering Agency",
            userType: "provider_company" as const,
            phoneMasked: "+234 140 *** **10",
            avatarUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=200",
            bio: "CAC-registered leading premium event ushering company in Lagos.",
            location: "Lekki, Lagos",
            isVerified: true,
            verificationBadge: true,
            category: "Event Staffing" as GigCategory,
            subcategory: "Event Staffing",
            ratingsAverage: 4.9,
            completedGigsCount: 42,
            responseTime: "Within 5 minutes"
          },
          {
            id: "prov_tunde",
            email: "tunde@deur.ng",
            name: "Tunde Bakare",
            userType: "provider_individual" as const,
            phoneMasked: "+234 815 *** **45",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
            bio: "Talented UI/UX designer and brand identity specialist.",
            location: "Yaba, Lagos",
            isVerified: true,
            verificationBadge: true,
            category: "Skilled Professional" as GigCategory,
            subcategory: "Graphic Designer",
            ratingsAverage: 4.7,
            completedGigsCount: 12,
            responseTime: "Within 1 hour"
          },
          {
            id: "prov_emeka",
            email: "emeka@deur.ng",
            name: "Emeka Okafor",
            userType: "provider_individual" as const,
            phoneMasked: "+234 905 *** **99",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
            bio: "Quick and reliable market runner, personal shopper.",
            location: "Ikeja, Lagos",
            isVerified: true,
            verificationBadge: true,
            category: "Task & Errand" as GigCategory,
            subcategory: "Errand Handler",
            ratingsAverage: 4.5,
            completedGigsCount: 19,
            responseTime: "Within 30 minutes"
          },
          {
            id: "admin_user",
            email: "admin@deur.ng",
            name: "Amaka Peters (Admin Ops)",
            userType: "admin" as const,
            phoneMasked: "+234 812 *** **01",
            avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
            bio: "Lead Trust and Safety Operations Officer at Deur.ng",
            location: "Ikeja, Lagos",
            isVerified: true,
            verificationBadge: true,
            ratingsAverage: 5.0,
            completedGigsCount: 120,
            responseTime: "Instant"
          }
        ];

        try {
          const usersRes = await fetch("/api/users");
          const usersData = await usersRes.json();
          if (usersRes.ok && usersData.users && usersData.users.length > 0) {
            setUsers(usersData.users);
          } else {
            setUsers(demoUsers);
          }
        } catch (uErr) {
          console.error("Users load API error, using static fallback", uErr);
          setUsers(demoUsers);
        }
        
        setLoading(false);
      } catch (e) {
        console.error("Data load failure:", e);
        setLoading(false);
      }
    }
    loadData();
  }, [refreshSeed]);

  // Sync state function triggerer
  const triggerRefresh = () => setRefreshSeed((s) => s + 1);

  // Switch identity logic
  const handleSwitchIdentity = async (userId: string) => {
    try {
      const res = await fetch("/api/auth/switch-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        triggerRefresh();
        // Reset sub tab view depending on new role target
        if (data.user.userType === "admin") {
          setActiveTab("admin");
        } else {
          setActiveTab("gigs");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Register user API
  const handleRegisterUser = async (form: any) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Register failed");
    setCurrentUser(data.user);
    triggerRefresh();
    
    // Conditionally trigger subscription modal based on role to collect payments
    const isServiceProvider = data.user.userType && data.user.userType.startsWith("provider_");
    if (isServiceProvider) {
      setShowPostRegisterSubModal(true);
      showToast("Profile created! Complete payment selection to activate your workspace.", "info");
    } else {
      setShowPostRegisterSubModal(false);
      showToast("Welcome! Registration completed. Tap 'Post Job' to search verified event providers.", "success");
    }
  };

  // Update profile characteristics
  const handleUpdateProfile = async (updates: any) => {
    const res = await fetch("/api/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentUser(data.user);
      triggerRefresh();
    }
  };

  // Submit NIN/BVN files
  const handleVerifySubmit = async (idType: 'NIN' | 'BVN' | 'Government_ID' | 'CAC_Document', idNumber: string, documentUrl: string) => {
    const res = await fetch("/api/users/upload-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idType, idNumber, documentUrl })
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentUser(data.user);
      triggerRefresh();
      showToast("NIN/BVN registry files dispatched fully to Deur manual security operations team.", "success");
    }
  };

  // Submit portfolio
  const handleUploadPortfolio = async (imageUrl: string, title: string, description: string) => {
    const res = await fetch("/api/users/upload-portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, title, description })
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentUser(data.user);
      triggerRefresh();
    }
  };

  // Subscribe plan
  const handleSubscribe = async (tier: 'basic' | 'premium', paymentMethod: string) => {
    const res = await fetch("/api/subscriptions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier })
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentUser(data.user);
      triggerRefresh();
      showToast(`Paystack Bill initialized. Transaction ID: PST_X${Math.random().toString(36).substring(2,6).toUpperCase()}_SECURED`, "success");
      // Close the post registration checkout modal!
      setShowPostRegisterSubModal(false);
    }
  };

  // Post new gig brief
  const handlePostGig = async (form: any) => {
    const res = await fetch("/api/gigs/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gig listing failed");
    triggerRefresh();
  };

  // Submit bid
  const handleApplyGig = async (gigId: string, bidAmount: number, coverLetter: string) => {
    const res = await fetch("/api/gigs/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigId, bidAmount, coverLetter })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Proposal failed");
    triggerRefresh();
  };

  // Accept bid & escrow deposit
  const handleAcceptApplication = async (gigId: string, applicationId: string) => {
    const res = await fetch("/api/gigs/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigId, applicationId })
    });
    if (res.ok) {
      triggerRefresh();
    }
  };

  // Confirm safety check
  const handleConfirmSafety = async (gigId: string) => {
    const res = await fetch("/api/gigs/confirm-safety", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigId })
    });
    if (res.ok) {
      triggerRefresh();
    }
  };

  // Trigger Red Panic
  const handleTriggerSOS = async (gigId: string) => {
    const res = await fetch("/api/gigs/sos-trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigId })
    });
    if (res.ok) {
      triggerRefresh();
    }
  };

  // In-app chat messaging
  const handleSendMessage = async (
    chatId: string, 
    text: string, 
    documentName?: string, 
    documentUrl?: string,
    isLiveLocation?: boolean,
    locationDuration?: number,
    locationStatusText?: string
  ) => {
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chatId, 
        text, 
        documentName, 
        documentUrl,
        isLiveLocation,
        locationDuration,
        locationStatusText
      })
    });
    if (res.ok) {
      triggerRefresh();
    }
  };

  // Admin approvals
  const handleApproveUser = async (userId: string) => {
    // Look up verification target
    const vRes = await fetch("/api/admin/verifications");
    const vData = await vRes.json();
    const match = vData.verifications.find((v: any) => v.userId === userId && v.status === "pending");
    if (!match) return;

    await fetch("/api/admin/verify-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId: match.id, action: "approve" })
    });
    triggerRefresh();
  };

  const handleRejectUser = async (userId: string) => {
    const vRes = await fetch("/api/admin/verifications");
    const vData = await vRes.json();
    const match = vData.verifications.find((v: any) => v.userId === userId && v.status === "pending");
    if (!match) return;

    await fetch("/api/admin/verify-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId: match.id, action: "reject" })
    });
    triggerRefresh();
  };

  // Admin dispute resolution
  const handleResolveDispute = async (gigId: string, resolution: 'release' | 'refund') => {
    const dRes = await fetch("/api/admin/disputes");
    const dData = await dRes.json();
    const match = dData.disputes.find((d: any) => d.gigId === gigId);
    if (!match) return;

    const resStyle = resolution === "release" ? "release_to_provider" : "refund_client";
    await fetch("/api/admin/dispute-resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: match.id, resolution: resStyle })
    });
    triggerRefresh();
  };

  const isPostRegisterClient = currentUser ? (currentUser.userType === "client") : false;
  const postRegisterPlans = {
    basic: {
      price: isPostRegisterClient ? 2000 : 1500,
      onboarding: 0,
      gigs: isPostRegisterClient ? "Up to 3 open gigs" : "Submit up to 5 proposals",
      matching: "Standard matching algorithms"
    },
    premium: {
      price: isPostRegisterClient ? 5000 : 3500,
      onboarding: 0,
      gigs: isPostRegisterClient ? "Unlimited gigs posting" : "Unlimited proposal bidding",
      matching: isPostRegisterClient ? "Priority premium matching" : "Featured matching search results & featured position"
    }
  };

  return (
    <div className="bg-[#F3F1F1] min-h-screen flex flex-col font-sans select-none antialiased">
      {/* Dynamic top safety navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSwitchIdentity={handleSwitchIdentity}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        triggerRefresh={triggerRefresh}
      />

      {/* Toast Notification Container Overlay */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = "bg-white";
          let borderColor = "border-slate-200";
          let textColor = "text-slate-800";
          let iconColor = "text-blue-500";
          let iconBg = "bg-blue-50";

          if (toast.type === "success") {
            bgColor = "bg-emerald-50";
            borderColor = "border-emerald-200";
            textColor = "text-emerald-900";
            iconColor = "text-emerald-700";
            iconBg = "bg-emerald-100";
          } else if (toast.type === "error") {
            bgColor = "bg-rose-50";
            borderColor = "border-rose-200";
            textColor = "text-rose-900";
            iconColor = "text-rose-700";
            iconBg = "bg-rose-100";
          } else if (toast.type === "warning") {
            bgColor = "bg-amber-50";
            borderColor = "border-amber-200";
            textColor = "text-amber-900";
            iconColor = "text-amber-700";
            iconBg = "bg-amber-100";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl ${bgColor} ${borderColor} ${textColor} transition-all duration-300 transform translate-y-0 scale-100`}
              style={{
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              }}
            >
              <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} mt-0.5`}>
                <Info className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs font-semibold leading-relaxed pt-1 select-text">
                {toast.message}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 shrink-0 p-1 rounded-lg hover:bg-black/5 transition-all cursor-pointer border-0 bg-transparent mt-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Post-Registration Subscription Block Modal Overlay */}
      {showPostRegisterSubModal && currentUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden relative my-8 animate-scale-up">
            <div className="bg-gradient-to-r from-brand-primary to-[#5B155C] text-white px-6 py-8 sm:px-8 sm:py-10 relative overflow-hidden text-left">
              <div className="absolute right-0 top-0 opacity-15 blur-2xl w-60 h-60 bg-brand-online rounded-full"></div>
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center space-x-1.5 bg-brand-online/20 border border-brand-online/30 text-white px-3 py-1 rounded-full text-xs font-bold">
                  <Shield className="w-4 h-4 text-brand-online stroke-[2.5]" />
                  <span>DEUR SECURITY & COMPLIANCE GATEWAY</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">🎉 Account Registered Successfully!</h3>
                <p className="text-slate-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Welcome to Deur, {currentUser.name}! To activate your sandbox workspace as a <span className="font-bold underline">{isPostRegisterClient ? "Hiring Client (Seeking Services)" : "Service Provider (Offering Services)"}</span> and enable secure escrow operations, please select and configure a subscription plan.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-left">
              {!checkoutTier ? (
                /* STEP 1: Select Subscription Plan */
                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <h4 className="text-base font-bold text-slate-900">Choose Your Subscription & Activate Profile</h4>
                    <p className="text-xs text-slate-500">Deur protects market integrity using low barrier subscription models with automatic cancellation triggers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Plan card */}
                    <div className="bg-slate-50 border border-slate-200 hover:border-slate-305 rounded-2xl p-5 flex flex-col justify-between transition-all">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white border px-2.5 py-1 rounded-lg">Standard Access</span>
                          <Bookmark className="w-4 h-4 text-slate-400" />
                        </div>
                        <h5 className="font-bold text-lg text-slate-800">Deur Basic Plan</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Provides immediate directory listings, basic matching and secure standard transaction escrow protection.</p>
                        
                        <div className="space-y-1">
                          <div className="text-2xl font-black text-slate-900 font-sans">
                            ₦{postRegisterPlans.basic.price.toLocaleString()}
                            <span className="text-xs font-normal text-slate-400">/mo</span>
                          </div>
                          {postRegisterPlans.basic.onboarding > 0 && !isPostRegisterClient && (
                            <div className="text-[11px] text-brand-primary font-bold">
                              + ₦{postRegisterPlans.basic.onboarding.toLocaleString()} One-time onboarding fee
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-150">
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-4 h-4 text-brand-online stroke-[2.5]" />
                            <span>{postRegisterPlans.basic.gigs}</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-4 h-4 text-brand-online stroke-[2.5]" />
                            <span>{postRegisterPlans.basic.matching}</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-4 h-4 text-brand-online stroke-[2.5]" />
                            <span>Masked private communications</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCheckoutTier("basic")}
                        className="w-full mt-5 py-3 bg-brand-primary hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                      >
                        Choose Basic Plan
                      </button>
                    </div>

                    {/* Premium Plan Card */}
                    <div className="bg-gradient-to-b from-brand-online/5 to-white border-2 border-brand-online rounded-2xl p-5 flex flex-col justify-between transition-all relative">
                      <div className="absolute top-0 right-0 bg-brand-online text-white font-bold uppercase text-[8px] tracking-widest px-3.5 py-1 rounded-bl-xl shadow-xs">
                        Recommended
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-online bg-brand-online/15 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Zap className="w-3 h-3 animate-pulse" /> Priority Plus
                          </span>
                        </div>
                        <h5 className="font-bold text-lg text-slate-800">Deur Premium Plan</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Maximize match efficiency. Priority vetting, continuous safety tracking, and featured premium badge status.</p>
                        
                        <div className="space-y-1">
                          <div className="text-2xl font-black text-slate-900 font-sans">
                            ₦{postRegisterPlans.premium.price.toLocaleString()}
                            <span className="text-xs font-normal text-slate-400">/mo</span>
                          </div>
                          {postRegisterPlans.premium.onboarding > 0 && !isPostRegisterClient && (
                            <div className="text-[11px] text-brand-primary font-bold">
                              + ₦{postRegisterPlans.premium.onboarding.toLocaleString()} One-time onboarding fee
                            </div>
                          )}
                          {isPostRegisterClient && (
                            <span className="inline-flex items-center text-[9px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20 animate-pulse mt-0.5">
                              <Gift className="w-3 h-3 mr-1" /> BUY 1 GET 2 MONTHS PROMO ACTIVATED
                            </span>
                          )}
                        </div>

                        <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-150">
                          <li className="flex items-center space-x-1.5 font-semibold text-slate-800">
                            <Check className="w-4 h-4 text-brand-online stroke-[2.5]" />
                            <span>{postRegisterPlans.premium.gigs}</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-4 h-4 text-brand-online stroke-[2.5]" />
                            <span>{postRegisterPlans.premium.matching}</span>
                          </li>
                          <li className="flex items-center space-x-1.5 font-bold text-brand-primary">
                            <Check className="w-4 h-4 text-brand-online stroke-[2.5]" />
                            <span>Top Pro Brand verification Badge</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCheckoutTier("premium")}
                        className="w-full mt-5 py-3 bg-brand-online hover:bg-brand-online/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-brand-online/15"
                      >
                        Choose Premium Plan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 2: Checkout / Payment Simulation Form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCheckoutProcessing(true);
                    setTimeout(async () => {
                      await handleSubscribe(checkoutTier, paymentGateway);
                      setCheckoutProcessing(false);
                      setCheckoutTier(null);
                      setCheckoutCard("");
                      setCheckoutExpiry("");
                      setCheckoutCvv("");
                      setCheckoutMonoAccount("");
                    }, 1500);
                  }}
                  className="max-w-md mx-auto space-y-5"
                >
                  <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Secure Sandbox Checkout</h4>
                      <p className="text-[10px] text-gray-500">Tier: Deur {checkoutTier.toUpperCase()} Pack</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutTier(null)}
                      className="text-gray-400 hover:text-gray-600 text-xs font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                    >
                      Change Plan
                    </button>
                  </div>

                  <div className="flex justify-between items-baseline border border-amber-100 bg-amber-50/50 p-3.5 rounded-xl">
                    <span className="text-xs text-amber-800 uppercase font-semibold tracking-wider">Total Amount:</span>
                    <span className="font-extrabold text-xl font-sans text-amber-950">
                      ₦{(postRegisterPlans[checkoutTier].price + postRegisterPlans[checkoutTier].onboarding).toLocaleString()}
                    </span>
                  </div>

                  {/* Gateway selector buttons */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select African Gateway Channel</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "paystack", label: "Paystack", logo: "💳" },
                        { id: "mono", label: "Mono Link", logo: "🏛️" },
                        { id: "flutterwave", label: "Flutterwave", logo: "🛡️" }
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setPaymentGateway(g.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer focus:outline-none ${
                            paymentGateway === g.id
                              ? "border-brand-primary bg-brand-primary/5 text-slate-950 font-bold"
                              : "border-gray-200 bg-white text-gray-400 hover:bg-slate-50 text-xs"
                          }`}
                        >
                          <span className="text-base">{g.logo}</span>
                          <span className="text-[9px] tracking-wide mt-0.5">{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkout Fields Dynamic render based on Gateway */}
                  {paymentGateway === "mono" ? (
                    <div className="space-y-3 text-left">
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-[10px] text-slate-500 leading-relaxed">
                        🔒 Direct Bank Connection via Mono. Deur simulates secure transfer authorization directly from Nigerian deposit banks.
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 select-none">Deposit Bank</label>
                        <select
                          value={checkoutMonoBank}
                          onChange={(e) => setCheckoutMonoBank(e.target.value)}
                          className="w-full bg-white border border-gray-300 text-xs rounded-xl p-2.5 focus:outline-none"
                        >
                          <option value="Zenith Bank">Zenith Bank Plc</option>
                          <option value="Guaranty Trust Bank">GTBank (Guaranty Trust)</option>
                          <option value="Access Bank">Access Bank Plc</option>
                          <option value="United Bank for Africa">UBA (United Bank for Africa)</option>
                          <option value="OPay">OPay Digital Services</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 select-none">NUBAN account number</label>
                        <input
                          type="text"
                          maxLength={10}
                          required
                          placeholder="10-digit account number"
                          value={checkoutMonoAccount}
                          onChange={(e) => setCheckoutMonoAccount(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-white border border-gray-300 text-xs rounded-xl p-2.5 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 select-none">Cardholder Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Kola Adesina"
                          className="w-full bg-white border border-gray-300 text-xs rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 select-none">Card Number (Nigerian Verve/Master/Visa)</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="5061 0000 0000 0000"
                          value={checkoutCard}
                          onChange={(e) => setCheckoutCard(e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                          className="w-full bg-white border border-gray-300 text-xs rounded-xl p-2.5 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 select-none">Card Expiry</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/YY"
                            value={checkoutExpiry}
                            onChange={(e) => setCheckoutExpiry(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-xs rounded-xl p-2.5 focus:outline-none font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 select-none">CVV Code</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            placeholder="123"
                            value={checkoutCvv}
                            onChange={(e) => setCheckoutCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-white border border-gray-300 text-xs rounded-xl p-2.5 focus:outline-none font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission and Cancel Action Row */}
                  <div className="flex space-x-3 pt-4 border-t border-slate-150">
                    <button
                      type="button"
                      disabled={checkoutProcessing}
                      onClick={() => setCheckoutTier(null)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={checkoutProcessing}
                      className="flex-2 py-3 bg-brand-online hover:bg-brand-online/90 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-brand-online/15"
                    >
                      {checkoutProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Authorizing transfer...</span>
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
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>🔒 256-BIT SSL GATEWAY ESCROW CO</span>
              <span>POWERED BY PAYSTACK • SECURED SANDBOX</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center p-12 text-slate-500 space-y-4">
          <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-150/55 flex items-center justify-center animate-bounce duration-1000">
            <DeurLogo className="w-16 h-16" size={64} />
          </div>
          <div className="font-bold font-mono text-xs tracking-widest text-brand-primary uppercase animate-pulse">
            LOADING DEUR SECURE GIG CHANNELS...
          </div>
          <div className="text-[10px] text-gray-400 font-mono tracking-wider">
            ESCROW • VERIFICATION • CENTRAL TRUST ENGINE
          </div>
        </div>
      ) : (
        <main className="flex-1">
          {activeTab === "onboarding" && (
            <Onboarding
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onSubmitVerification={handleVerifySubmit}
              onUploadPortfolio={handleUploadPortfolio}
              onRegisterUser={handleRegisterUser}
              showToast={showToast}
            />
          )}

          {activeTab === "billing" && (
            <Subscriptions
              currentUser={currentUser}
              onSubscribe={handleSubscribe}
            />
          )}

          {activeTab === "gigs" && (
            <GigsList
              currentUser={currentUser}
              gigs={gigs}
              providers={users}
              onPostGig={handlePostGig}
              onApplyGig={handleApplyGig}
              onAcceptApplication={handleAcceptApplication}
              onSwitchTab={setActiveTab}
              showToast={showToast}
            />
          )}

          {activeTab === "safety" && (
            <SafetyPortal
              currentUser={currentUser}
              activeGigs={gigs.filter((g) => g.status === "escrow_funded" || g.status === "active" || g.status === "work_delivered")}
              onConfirmSafety={handleConfirmSafety}
              onTriggerSOS={handleTriggerSOS}
              showToast={showToast}
            />
          )}

          {activeTab === "chat" && (
            <ChatSystem
              currentUser={currentUser}
              chats={chats}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === "admin" && (
            <AdminHub
              currentUser={currentUser}
              users={users}
              gigs={gigs}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
              onResolveDispute={handleResolveDispute}
              showToast={showToast}
            />
          )}
        </main>
      )}

      {/* Safety Footer info */}
      <footer className="bg-brand-primary text-slate-200 py-8 text-center border-t border-[#5B155C] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-bold text-white flex items-center justify-center space-x-1">
            <Shield className="w-4 h-4 text-brand-online mr-1" />
            <span>DEUR SECURITY & VERIFIED MARKETPLACE CO • NIGERIA VETTING COMMISSION</span>
          </p>
          <p className="text-[10px] text-slate-300 font-mono">
            License & REG: RC-1849204. Supported by Federal Identity Registry authorities. All transactions insured up to ₦10,000,000.
          </p>
        </div>
      </footer>
    </div>
  );
}
