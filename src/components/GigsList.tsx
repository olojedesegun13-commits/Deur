/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, Calendar, DollarSign, Plus, Globe, ShieldAlert, BadgeInfo, Star, RefreshCw, Send, Sparkles, Award } from "lucide-react";
import { Gig, GigCategory, UserProfile, GigApplication } from "../types";

interface GigsListProps {
  currentUser: UserProfile | null;
  gigs: Gig[];
  providers: UserProfile[];
  onPostGig: (gigForm: any) => Promise<void>;
  onApplyGig: (gigId: string, bidAmount: number, coverLetter: string) => Promise<void>;
  onAcceptApplication: (gigId: string, applicationId: string) => Promise<void>;
  onSwitchTab: (tabId: string) => void;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export default function GigsList({
  currentUser,
  gigs,
  providers,
  onPostGig,
  onApplyGig,
  onAcceptApplication,
  onSwitchTab,
  showToast
}: GigsListProps) {
  const [selectedGigId, setSelectedGigId] = useState<string | null>(gigs[0]?.id || null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Post gig Form
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    category: "Skilled Professional" as GigCategory,
    subcategory: "Graphic Designer",
    location: "Ikeja, Lagos",
    isRemote: false,
    budget: "",
    datetimeNeeded: ""
  });

  // Apply gig form
  const [bidAmount, setBidAmount] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // AI assistant integration states
  const [aiProposalLoading, setAiProposalLoading] = useState(false);
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<any>(null);

  // Gemini AI Search states
  const [searchMode, setSearchMode] = useState<"standard" | "ai">("standard");
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [aiSearchReasoning, setAiSearchReasoning] = useState<string | null>(null);

  const handleAISearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const activeQuery = customQuery !== undefined ? customQuery : aiSearchQuery;
    if (!activeQuery.trim()) return;
    setAiSearchLoading(true);
    setAiMatchedIds([]);
    setAiSearchReasoning(null);
    try {
      const res = await fetch("/api/ai/search-gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: activeQuery })
      });
      const data = await res.json();
      if (data.success) {
        setAiMatchedIds(data.matchingIds || data.matchedIds || []);
        setAiSearchReasoning(data.explanation || data.reasoning || "Matched semantically.");
      }
    } catch (err) {
      console.error("Gemini AI Search Failure", err);
    } finally {
      setAiSearchLoading(false);
    }
  };

  const handleClearAISearch = () => {
    setAiSearchQuery("");
    setAiMatchedIds(null);
    setAiSearchReasoning(null);
  };

  useEffect(() => {
    setAiAuditReport(null);
  }, [selectedGigId]);

  const handleAIOptimizeProposal = async () => {
    if (!selectedGig) return;
    setAiProposalLoading(true);
    try {
      const res = await fetch("/api/ai/optimize-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigTitle: selectedGig.title,
          gigDescription: selectedGig.description,
          draftText: coverLetter
        })
      });
      const data = await res.json();
      if (data.success && data.optimizedText) {
        setCoverLetter(data.optimizedText);
      }
    } catch (e) {
      console.error("AI pitch optimization failure", e);
    } finally {
      setAiProposalLoading(false);
    }
  };

  const handleAIAudit = async () => {
    if (!selectedGig) return;
    setAiAuditLoading(true);
    setAiAuditReport(null);
    try {
      const res = await fetch("/api/ai/audit-applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gigId: selectedGig.id })
      });
      const data = await res.json();
      if (data.success) {
        setAiAuditReport(data);
      }
    } catch (e) {
      console.error("AI applicant evaluation failure", e);
    } finally {
      setAiAuditLoading(false);
    }
  };

  // Subcategories mapping
  const subcatOptions = {
    "Skilled Professional": ["Graphic Designer", "Accountant", "Lawyer", "Photographer/Videographer", "IT Specialist/Developer", "Marketing/PR"],
    "Task & Errand": ["Personal Assistant", "Market Runner", "Price Researcher", "Errand Handler", "Admin Support"],
    "Event Staffing": ["Usher", "Waiters/Waitresses", "Bartender", "MC/Host", "Event Security", "Coordinating Agency"]
  };

  // Perform matches for Curated Match highlights
  const getMatches = (gig: Gig) => {
    return providers.filter((p) => {
      const matchCat = p.category === gig.category;
      const matchSub = p.subcategory?.toLowerCase().includes(gig.subcategory.toLowerCase()) || 
                       gig.title.toLowerCase().includes(p.subcategory?.toLowerCase() || "___");
      return matchCat || matchSub;
    });
  };

  // Filters calculation
  let filteredGigs = gigs;
  if (searchMode === "ai" && aiMatchedIds !== null) {
    // Only display gigs matching the IDs returned from Gemini
    filteredGigs = gigs.filter((g) => aiMatchedIds.includes(g.id));
    // Sort based on the rank/index position returned in aiMatchedIds
    filteredGigs = [...filteredGigs].sort((a, b) => {
      return aiMatchedIds.indexOf(a.id) - aiMatchedIds.indexOf(b.id);
    });
  } else {
    filteredGigs = gigs.filter((g) => {
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            g.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || g.category === categoryFilter;
      const matchesLocation = locationFilter === "all" || 
                              (locationFilter === "remote" ? g.isRemote : !g.isRemote);
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }

  const selectedGig = filteredGigs.find((g) => g.id === selectedGigId) || filteredGigs[0] || null;

  const handlePostSumit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.budget) return;
    setSubmitting(true);
    try {
      await onPostGig({
        ...postForm,
        budget: Number(postForm.budget)
      });
      setShowPostModal(false);
      // reset form
      setPostForm({
        title: "",
        description: "",
        category: "Skilled Professional",
        subcategory: "Graphic Designer",
        location: "Ikeja, Lagos",
        isRemote: false,
        budget: "",
        datetimeNeeded: ""
      });
    } catch (e: any) {
      showToast(e.message || "Posting failed. Check subscription rules!", "error");
    }
    setSubmitting(false);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyModal || !bidAmount) return;
    setSubmitting(true);
    try {
      await onApplyGig(showApplyModal, Number(bidAmount), coverLetter);
      setShowApplyModal(null);
      setBidAmount("");
      setCoverLetter("");
      showToast("Proposal submitted successfully!", "success");
    } catch (err: any) {
      showToast(err.error || err.message || "Failed to submit proposal.", "error");
    }
    setSubmitting(false);
  };

  const handleAcceptBid = async (appId: string) => {
    if (!selectedGig) return;
    if (confirm("Proceed to deposit funds into Deur secure Escrow? Funds remain held until the service provider delivers the project.")) {
      await onAcceptApplication(selectedGig.id, appId);
      showToast("Payment escrow commitment successful! Communications chat opened safely.", "success");
      onSwitchTab("chat");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in text-left">
      
      {/* DEUR PREMIUM GIG HERO HERO BANNER */}
      <div className="bg-gradient-to-r from-brand-primary via-[#5B155C] to-brand-primary text-white rounded-2xl p-6 sm:p-10 mb-8 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-brand-accent to-transparent"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-brand-online/20 text-brand-online border border-brand-online/30 px-3 py-1 rounded-full text-xs font-bold tracking-tight">
            <span>Deur Protective Platform Escrow</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-sans leading-tight tracking-tight">
            Find the perfect <span className="text-brand-accent">vetted</span> expert services in Nigeria.
          </h1>
          <p className="text-sm text-slate-200">
            Secure client escrow buffers, CAC authentication checks, and instant NIN identity verification protocols.
          </p>

          {/* Quick interactive search suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-slate-300 font-bold text-[10px] uppercase tracking-wider">Popular Services:</span>
            {["MC/Host", "Ushering", "Graphic Designer", "Admin Support", "Errand"].map((kw) => (
              <button
                key={kw}
                onClick={() => setSearchQuery(kw)}
                className="bg-white/10 hover:bg-white/25 text-white font-semibold border border-white/10 px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: GIGS DIRECTORY & SEARCH */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 font-sans">Available Gigs</h2>
              <button
                onClick={() => {
                  if (currentUser?.userType !== "client") {
                    showToast("Only hiring clients can create gig listings. Switch identities in the switcher at the top to test!", "warning");
                    return;
                  }
                  setShowPostModal(true);
                }}
                className="inline-flex items-center space-x-1 px-3.5 py-2 bg-brand-online text-white hover:bg-brand-online/90 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post a Job</span>
              </button>
            </div>

            {/* Search Mode Toggles */}
            <div className="flex border-b border-gray-100 pb-1.5 gap-1.5 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setSearchMode("standard");
                }}
                className={`flex-1 py-1.5 text-center font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                  searchMode === "standard"
                    ? "text-[#4A154B] border-b-2 border-[#4A154B]"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                Standard Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode("ai");
                  handleClearAISearch();
                }}
                className={`flex-1 py-1.5 text-center font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  searchMode === "ai"
                    ? "text-[#E01E5A] border-b-2 border-[#E01E5A]"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E01E5A] fill-current animate-pulse animate-duration-1000" />
                <span>Gemini AI Search</span>
              </button>
            </div>

            {searchMode === "standard" ? (
              <div className="space-y-3 pt-1">
                {/* Search fields */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search gigs keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>

                {/* Selector Filters */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-[11px] focus:outline-none text-slate-700 font-medium cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="Skilled Professional">Skilled Pro</option>
                    <option value="Task & Errand">Errand Runner</option>
                    <option value="Event Staffing">Event Staffing</option>
                  </select>

                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-[11px] focus:outline-none text-slate-700 font-medium cursor-pointer"
                  >
                    <option value="all">All Locations</option>
                    <option value="remote">Remote Only</option>
                    <option value="physical">Physical Lagos</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                <form onSubmit={handleAISearch} className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Graphic designer in Lekki weekend..."
                    value={aiSearchQuery}
                    onChange={(e) => setAiSearchQuery(e.target.value)}
                    className="w-full bg-purple-50/40 border border-purple-200/80 rounded-xl pl-10 pr-20 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4A154B]/30"
                  />
                  <Sparkles className="w-4 h-4 text-[#A8287F] absolute left-3 top-3.5 animate-pulse" />
                  
                  <button
                    type="submit"
                    disabled={aiSearchLoading || !aiSearchQuery.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-brand-primary to-[#A8287F] text-white hover:opacity-95 active:scale-95 transition-all text-[10px] font-bold uppercase rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    {aiSearchLoading ? "Matching..." : "Match"}
                  </button>
                </form>

                {/* Quick AI Search Suggestions */}
                <div className="flex flex-wrap gap-1.5 text-[10px] items-center">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Try:</span>
                  {[
                    "graphic designer in Lekki available this weekend",
                    "remote website builder with low budget",
                    "event usher and waiter needed in Ikeja"
                  ].map((sg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAiSearchQuery(sg);
                        handleAISearch(undefined, sg);
                      }}
                      className="bg-purple-50 hover:bg-purple-100 text-[#4A154B] font-medium border border-[#4A154B]/10 px-2.5 py-1 rounded-lg cursor-pointer transition text-left shrink-0 max-w-full truncate"
                    >
                      {sg}
                    </button>
                  ))}
                </div>

                {/* Search status & reasoning */}
                {aiSearchLoading && (
                  <div className="p-3 bg-[#4A154B]/5 border border-[#4A154B]/10 rounded-xl flex items-center justify-center space-x-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" />
                    <span className="text-[10px] font-bold text-brand-primary font-mono tracking-wider">GEMINI SEMANTIC MATCH ENGAGED...</span>
                  </div>
                )}

                {aiMatchedIds !== null && !aiSearchLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold bg-brand-online/15 border border-brand-online/30 text-brand-online px-2.5 py-1.5 rounded-xl">
                      <span>🎯 {filteredGigs.length} matching gig(s)</span>
                      <button
                        type="button"
                        onClick={handleClearAISearch}
                        className="text-[9px] uppercase font-bold tracking-wider hover:underline"
                      >
                        [Reset Search]
                      </button>
                    </div>
                    {aiSearchReasoning && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] leading-relaxed text-slate-600 italic">
                        <span className="font-bold text-slate-800 not-italic block mb-0.5">Gemini Insights:</span>
                        "{aiSearchReasoning}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gigs lists stack */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredGigs.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                No active gigs match your filter variables. Try creating one!
              </div>
            ) : (
              filteredGigs.map((g) => {
                const isSelected = selectedGig?.id === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGigId(g.id)}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-online/5 border-brand-online shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold bg-brand-online/10 text-brand-online px-2 py-0.5 rounded-md uppercase">
                        {g.subcategory}
                      </span>
                      <span className="text-xs font-bold text-brand-online font-mono">
                        ₦{g.budget.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{g.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{g.description}</p>

                    <div className="flex items-center space-x-4 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 shrink-0 text-slate-400" />
                        {g.location}
                      </span>
                      <span className="flex items-center">
                        <Globe className="w-3 h-3 mr-1 shrink-0 text-slate-400" />
                        {g.isRemote ? "Remote" : "In-Person"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECT GIG INVENTORY VIEW */}
        <div className="lg:col-span-7">
          {selectedGig ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Header profile details */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <img src={selectedGig.clientAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs text-slate-500 font-semibold">Posted by {selectedGig.clientName}</span>
                  </div>
                  <h1 className="text-xl font-extrabold text-slate-900 font-sans tracking-tight leading-tight">{selectedGig.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-600 flex items-center bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {selectedGig.location}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Needed: {new Date(selectedGig.datetimeNeeded).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">EST. BUDGET (₦)</div>
                  <div className="text-2xl font-black text-slate-900 font-sans">
                    ₦{selectedGig.budget.toLocaleString()}
                  </div>
                  <span className="inline-block text-[10px] uppercase font-bold text-brand-accent tracking-wide mt-1">
                    {selectedGig.isRemote ? "Remote Delivery" : "Physical meeting checks"}
                  </span>
                </div>
              </div>

              {/* description text block */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Detailed Specification</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {selectedGig.description}
                </p>
              </div>

              {/* Status details tracker banner */}
              <div className="flex items-center justify-between border border-slate-150 rounded-xl p-3.5 bg-slate-50">
                <div className="text-xs">
                  <span className="font-bold text-slate-700">Contract Lifecycle Status: </span>
                  <span className="uppercase font-mono font-bold text-brand-primary">{selectedGig.status.replace("_", " ")}</span>
                </div>
                {selectedGig.status === "open" && (
                  currentUser?.userType === "client" ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-start space-x-2 max-w-sm text-left">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold uppercase text-[9px] tracking-wider text-amber-800 block mb-0.5">Role Restriction: Client Mode</span>
                        <p className="text-[10px] leading-relaxed text-amber-700">
                          Bidding remains strictly reserved for verified service providers. As a hiring client, you monitor bidded candidate profiles, approve milestones, or release escrow payouts.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          showToast("Please register or login to apply to this gig listing.", "warning");
                          return;
                        }
                        setShowApplyModal(selectedGig.id);
                      }}
                      className="px-4 py-2 bg-brand-online text-white font-bold text-xs rounded-xl cursor-pointer hover:shadow-xs hover:bg-brand-online/90 transition-all border-0"
                    >
                      Apply & Bid on Gig
                    </button>
                  )
                )}
              </div>

              {/* MATCHMAKING & HIGH-PRIORITY PROFILES PANEL */}
              {getMatches(selectedGig).length > 0 && (
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center">
                      <Sparkles className="w-4 h-4 text-brand-online mr-2 animate-pulse" />
                      Smart Matching Recommendations
                    </h3>
                    <span className="bg-brand-primary text-white text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold">PREMIUM SPEED MATCH</span>
                  </div>
                  
                  <div className="space-y-2 pt-1">
                    {getMatches(selectedGig).slice(0, 2).map((match) => (
                      <div key={match.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-xs">
                        <div className="flex items-center space-x-2.5">
                          <img src={match.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center">
                              {match.name}
                              {match.verificationBadge && <Award className="w-3.5 h-3.5 text-brand-online ml-1 fill-current" />}
                            </div>
                            <div className="text-[10px] text-slate-500">{match.subcategory} • ₦{match.subscription?.cost ? "Premium Partner" : "Standard Verified"}</div>
                          </div>
                        </div>

                        <div className="text-right flex items-center space-x-2">
                          <div className="text-[10px] text-slate-600 flex items-center space-x-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                            <Star className="w-3.5 h-3.5 text-brand-noti fill-current animate-pulse" />
                            <span className="font-bold">{match.ratingsAverage}</span>
                          </div>
                          <button
                            onClick={() => {
                              showToast(`Invite sent to ${match.name}! An automated SMS proposal has been dispatched.`, "success");
                            }}
                            className="text-[10px] font-bold text-brand-primary bg-slate-100 border border-slate-200 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
                          >
                            Direct Invitation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GIG APPLICATIONS SECTION */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900">Active Applicant Proposals ({selectedGig.applications.length})</h2>
                
                {/* AI Match & Safety Auditor controller */}
                {currentUser?.id === selectedGig.clientId && selectedGig.applications.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5 mb-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-[#4A154B]/10 rounded-xl">
                          <Sparkles className="w-4 h-4 text-[#E01E5A] animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-800">Deur AI Applicant Auditor</h3>
                          <p className="text-[10px] text-slate-500">Compare bidding proposals using safe automated matching engines</p>
                        </div>
                      </div>
                      
                      {!aiAuditReport && !aiAuditLoading && (
                        <button
                          onClick={handleAIAudit}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-brand-primary to-brand-alert text-white hover:opacity-95 font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
                        >
                          Audit with Gemini AI 🤖
                        </button>
                      )}
                    </div>

                    {aiAuditLoading && (
                      <div className="p-4 bg-white border border-dashed border-purple-200 rounded-xl flex items-center justify-center space-x-3 animate-pulse">
                        <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
                        <span className="text-xs font-bold text-brand-primary font-mono tracking-wider">GEMINI AI GENERATING MATCH PERFORMANCE METRICS...</span>
                      </div>
                    )}

                    {aiAuditReport && (
                      <div className="space-y-3 pt-1 animate-fade-in text-slate-700">
                        <div className="p-3 bg-[#4A154B]/10 rounded-xl border border-[#4A154B]/10 text-xs text-[#4A154B] font-semibold leading-relaxed">
                          <span className="font-bold">Executive Report Summary:</span> {aiAuditReport.executiveSummary}
                        </div>
                        
                        {aiAuditReport.recommendedAppId && (
                          <div className="p-2.5 bg-brand-online/10 rounded-xl border border-brand-online/25 text-xs text-slate-800 flex items-center justify-between">
                            <span className="font-bold text-brand-online flex items-center">
                              🌟 Top Recommendation Match Selected
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-2 bg-brand-online text-white rounded">
                              AI BEST BID
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedGig.applications.length === 0 ? (
                  <div className="text-center p-6 border border-slate-200 rounded-xl text-xs text-slate-400 bg-slate-50/50">
                    No proposals submitted yet. Matches are scanning the brief.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedGig.applications.map((app) => {
                      const auditMatch = aiAuditReport?.applicants?.find((a: any) => a.id === app.id);
                      const isRecommended = aiAuditReport?.recommendedAppId === app.id;

                      return (
                        <div key={app.id} className={`border rounded-2xl p-4 space-y-3 shadow-xs transition-all duration-300 ${
                          isRecommended ? "border-brand-online bg-gradient-to-b from-white to-brand-online/5 ring-1 ring-brand-online/15" : "border-slate-200 bg-white"
                        }`}>
                          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <div className="flex items-center space-x-2.5">
                              <img src={app.providerAvatar} alt="" className="w-9 h-9 rounded-full border object-cover" />
                              <div>
                                <div className="text-xs font-bold text-slate-950 flex items-center">
                                  {app.providerName}
                                  {app.providerBadge && (
                                    <span className="ml-1 bg-brand-online/10 text-brand-online text-[8px] font-bold px-1.5 py-0.5 rounded-md border border-brand-online/20 flex items-center space-x-0.5">
                                      <Award className="w-2.5 h-2.5 text-brand-online fill-current" />
                                      <span>Verified</span>
                                    </span>
                                  )}
                                  {auditMatch && (
                                    <span className="ml-2 bg-[#4A154B]/10 text-[#4A154B] text-[8px] font-bold px-1.5 py-0.5 rounded-md border border-[#4A154B]/20 flex items-center space-x-0.5 shrink-0">
                                      <Sparkles className="w-2.5 h-2.5 text-[#E01E5A] fill-current animate-pulse" />
                                      <span>{auditMatch.matchScore}% Match</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 flex items-center mt-0.5">
                                  <Star className="w-3 h-3 text-brand-noti fill-current mr-0.5" />
                                  {app.providerRating} stars
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[10px] text-slate-450 font-mono">PROPOSED RATE</div>
                              <span className="text-sm font-black text-slate-900 font-mono">
                                ₦{app.bidAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                            "{app.coverLetter || "Hi! Very interested. Lets complete the contract."}"
                          </p>

                          {/* Individual AI insights block */}
                          {auditMatch && (
                            <div className="bg-[#4A154B]/5 border border-[#4A154B]/10 rounded-xl p-3 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#4A154B] flex items-center">
                                  <Sparkles className="w-3 h-3 text-[#E01E5A] mr-1" />
                                  Gemini Match Evaluation:
                                </span>
                                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                  auditMatch.suitability === "Highly Recommended" 
                                    ? "bg-brand-online text-white" 
                                    : auditMatch.suitability === "Risk flag" 
                                    ? "bg-brand-noti text-white" 
                                    : "bg-brand-online/20 text-brand-online"
                                }`}>
                                  {auditMatch.suitability}
                                </span>
                              </div>
                              <ul className="list-disc pl-4 text-[11px] text-slate-800 space-y-1">
                                {auditMatch.bulletPoints?.map((bp: string, i: number) => (
                                  <li key={i}>{bp}</li>
                                ))}
                              </ul>
                              <div className="text-[10px] text-slate-500 italic border-t border-[#4A154B]/10 pt-1.5 mt-1 flex items-center justify-between">
                                <span>🛡️ Trust Flag: {auditMatch.safetyAssessment}</span>
                                {isRecommended && <span className="text-[10px] font-bold text-brand-online uppercase">Top Choice Match</span>}
                              </div>
                            </div>
                          )}

                          {/* Accept details, visible only for Client role */}
                          {currentUser?.id === selectedGig.clientId && selectedGig.status === "open" && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleAcceptBid(app.id)}
                                className="px-4 py-2 bg-brand-primary text-white hover:opacity-95 font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer"
                              >
                                Fund Escrow & Accept Bid
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center p-16 border rounded-2xl bg-slate-50 text-slate-500 text-sm">
              No gigs active. Use the Create Job button to post Naira contract briefs!
            </div>
          )}
        </div>

      </div>

      {/* POST A GIG OVERLAY DIALOG MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 transform scale-100 transition-all">
            <div className="bg-brand-primary text-white p-6 border-b border-[#5B155C]">
              <h3 className="text-lg font-bold font-sans text-white">Post a Protected Job Listing</h3>
              <p className="text-xs text-purple-200">All payments utilize instant escrow buffers. Communications remain fully masked.</p>
            </div>

            <form onSubmit={handlePostSumit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MC/Hostess for 3-Day Lagos Exhibition"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1.5">Gig Description / Safe Meeting Specifications</label>
                <textarea
                  required
                  placeholder="Specify clear specifications, expectations, criteria, and location parameters..."
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs h-24 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1.5">Category</label>
                  <select
                    value={postForm.category}
                    onChange={(e: any) => setPostForm({ ...postForm, category: e.target.value, subcategory: subcatOptions[e.target.value as GigCategory][0] })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs focus:outline-none"
                  >
                    <option value="Skilled Professional">Skilled Professional (Designer/Writer)</option>
                    <option value="Task & Errand">Task & Errand Providers (Helper/Runner)</option>
                    <option value="Event Staffing">Event Staffing (MC/Hostess/Steward)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1.5">Role Subtype</label>
                  <select
                    value={postForm.subcategory}
                    onChange={(e) => setPostForm({ ...postForm, subcategory: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs focus:outline-none"
                  >
                    {subcatOptions[postForm.category].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1.5 font-mono">Bounty Amount Budget (₦ NGN)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={postForm.budget}
                    onChange={(e) => setPostForm({ ...postForm, budget: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1.5">Project Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={postForm.datetimeNeeded}
                    onChange={(e) => setPostForm({ ...postForm, datetimeNeeded: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1.5">Meeting Environment</label>
                  <select
                    value={postForm.isRemote ? "remote" : "physical"}
                    onChange={(e) => setPostForm({ ...postForm, isRemote: e.target.value === "remote" })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs focus:outline-none"
                  >
                    <option value="physical">Physical Meeting (Lagos, Nigeria)</option>
                    <option value="remote">Remote Delivery Platform</option>
                  </select>
                </div>
                {!postForm.isRemote && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1.5">Physical Meeting Point</label>
                    <input
                      type="text"
                      placeholder="e.g. Victoria Island, Lagos"
                      value={postForm.location}
                      onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-brand-primary hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer transition"
                >
                  {submitting ? "Securing listing contract..." : "Post Gig Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT BID PROPOSAL OVERLAY MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 transform scale-100 transition-all">
            <div className="bg-brand-primary text-white p-6 border-b border-[#5B155C]">
              <h3 className="text-base font-bold text-white">Apply & Bid Proposal</h3>
              <p className="text-[11px] text-purple-200 font-mono">Deur Shield: Verifications & Escrow payments active.</p>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Your Proposed Naira Rate (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Proposal Cover Letter</label>
                  <button
                    type="button"
                    disabled={aiProposalLoading}
                    onClick={handleAIOptimizeProposal}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-brand-primary to-brand-alert rounded-lg text-[9px] font-extrabold uppercase text-white hover:opacity-90 active:scale-95 transition-all select-none disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-brand-accent scale-110" />
                    <span>{aiProposalLoading ? "AI generating..." : "Improve with Gemini AI ✨"}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Introduce yourself, your experienced background, and detail how you will deliver standard safety protections..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-online hover:bg-brand-online/90 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-sm"
                >
                  Submit proposal Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
