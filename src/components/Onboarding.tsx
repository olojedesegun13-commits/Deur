/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldCheck, UploadCloud, FileText, BadgeAlert, Sparkles, Plus, Image as ImageIcon, CheckCircle, FileUp, Info, Search, Briefcase } from "lucide-react";
import { UserProfile, IDVerification } from "../types";

interface OnboardingProps {
  currentUser: UserProfile | null;
  onUpdateProfile: (updates: any) => Promise<void>;
  onSubmitVerification: (idType: 'NIN' | 'BVN' | 'Government_ID' | 'CAC_Document', idNumber: string, documentUrl: string) => Promise<void>;
  onUploadPortfolio: (imageUrl: string, title: string, description: string) => Promise<void>;
  onRegisterUser: (userForm: any) => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export default function Onboarding({
  currentUser,
  onUpdateProfile,
  onSubmitVerification,
  onUploadPortfolio,
  onRegisterUser,
  showToast
}: OnboardingProps) {
  // Registration form state
  const [isRegistering, setIsRegistering] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    userType: "", // Explicitly empty to capture identity immediately upon signup
    location: "Ikeja, Lagos",
    category: "Skilled Professional",
    bio: ""
  });

  // ID verification form state
  const [idType, setIdType] = useState<'NIN' | 'BVN' | 'Government_ID' | 'CAC_Document'>('NIN');
  const [idNumber, setIdNumber] = useState("");
  const [docFileMock, setDocFileMock] = useState<string>("");
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);

  // Portfolio form state
  const [portTitle, setPortTitle] = useState("");
  const [portDesc, setPortDesc] = useState("");
  const [portImage, setPortImage] = useState("");
  const [portSubmitting, setPortSubmitting] = useState(false);

  // New team member state
  const [newTeamMember, setNewTeamMember] = useState({ name: "", role: "" });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.userType) {
      showToast("Please explicitly select your identity (Client or Service Provider) to register!", "warning");
      return;
    }
    if (!regForm.name || !regForm.email) {
      showToast("Name and email are required fields.", "warning");
      return;
    }
    try {
      await onRegisterUser(regForm);
      setIsRegistering(false);
    } catch (err) {
      showToast("Registration failed", "error");
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber) {
      showToast("Please enter your registry identification number!", "warning");
      return;
    }
    if (idType === 'NIN' && idNumber.length !== 11) {
      showToast("NIN numbers in Nigeria must be exactly 11 digits!", "error");
      return;
    }
    if (idType === 'BVN' && idNumber.length !== 11) {
      showToast("BVN numbers in Nigeria must be exactly 11 digits!", "error");
      return;
    }

    setVerificationSubmitting(true);
    // Auto populate realistic mock documents on click
    const mockDocsUrl = idType === 'CAC_Document' 
      ? "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400"
      : "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=400";
    
    await onSubmitVerification(idType, idNumber, docFileMock || mockDocsUrl);
    setVerificationSubmitting(false);
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle || !portImage) return;
    setPortSubmitting(true);
    await onUploadPortfolio(portImage, portTitle, portDesc);
    setPortTitle("");
    setPortDesc("");
    setPortImage("");
    setPortSubmitting(false);
  };

  const handleAddTeamMember = async () => {
    if (!newTeamMember.name || !newTeamMember.role || !currentUser) return;
    const currentList = currentUser.teamList || [];
    const updatedList = [
      ...currentList,
      { name: newTeamMember.name, role: newTeamMember.role, verified: true }
    ];
    await onUpdateProfile({
      teamList: updatedList,
      teamSize: updatedList.length
    });
    setNewTeamMember({ name: "", role: "" });
  };

  return (
    <div className="space-y-8 animate-fade-in p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Platform Welcome Header */}
      <div className="bg-gradient-to-r from-brand-primary to-[#5B155C] border border-brand-primary px-6 py-8 sm:px-8 sm:py-10 text-white relative overflow-hidden rounded-2xl shadow-md">
        <div className="absolute right-0 top-0 opacity-10 blur-2xl w-72 h-72 bg-gradient-to-tr from-brand-accent to-brand-online rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-brand-online/20 border border-brand-online/30 text-white px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-brand-online" />
              <span>Identity Verification Office</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Onboarding & Verifications</h1>
            <p className="text-slate-100 text-sm max-w-xl">
              Nigeria's safest gig portal. We verify BVN/NIN for individuals and CAC registry files for event staffing agencies. Displays a verified badge on approved matching files.
            </p>
          </div>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="px-5 py-2.5 bg-brand-online hover:bg-brand-online/95 text-white rounded-xl text-sm font-bold transition active:scale-95 shadow-lg shadow-brand-online/15 cursor-pointer"
          >
            {isRegistering ? "Cancel Registration" : "Register New Account"}
          </button>
        </div>
      </div>

      {isRegistering ? (
        /* New User Onboarding Registration Form */
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
          <div className="bg-brand-primary text-white px-6 py-4 border-b border-brand-primary/10">
            <h2 className="text-lg font-bold">Register a New Deur Sandbox Holder</h2>
            <p className="text-xs text-gray-250">Instantly creates a new credentials profile to explore gig matches, billing, and portal communication.</p>
          </div>
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-5">
            {/* 1. Capture Identity Card Selection (Explicitly Required First) */}
            <div className="space-y-3 pb-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                1. Select Your Identity to Get Started <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: Seeking Services */}
                <button
                  type="button"
                  id="register_as_client_card"
                  onClick={() => setRegForm({ ...regForm, userType: "client" })}
                  className={`p-4 rounded-xl border text-left transition duration-200 cursor-pointer focus:outline-none ${
                    regForm.userType === "client"
                      ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20"
                      : "border-gray-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 mb-2">
                    <div className={`p-2 rounded-lg ${regForm.userType === "client" ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Search className="w-4 h-4 text-inherit" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Seeking Services (Hiring / Client)</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    I want to post secure gigs, review and vet matching portfolios/bids, and contract individual freelancers or event staffing agencies.
                  </p>
                </button>

                {/* Option B: Offering Services */}
                <button
                  type="button"
                  id="register_as_provider_card"
                  onClick={() => setRegForm({ ...regForm, userType: "provider_individual" })}
                  className={`p-4 rounded-xl border text-left transition duration-200 cursor-pointer focus:outline-none ${
                    regForm.userType && regForm.userType !== "client"
                      ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20"
                      : "border-gray-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 mb-2">
                    <div className={`p-2 rounded-lg ${regForm.userType && regForm.userType !== "client" ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Briefcase className="w-4 h-4 text-inherit" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Offering Services (Provider)</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    I am a professional freelancer, errand provider, or hostess staffing agency seeking to bid on active gigs, match with clients, and earn.
                  </p>
                </button>
              </div>
            </div>

            {/* Display profile details inputs once identity has been clicked */}
            {regForm.userType ? (
              <div className="space-y-4 animate-fade-in">
                <div className="border-t border-slate-100 pt-4 pb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. Provide Your Personal & Security Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Full Name / Agency Business Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kola Adesina"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. adeyemi@deur.ng"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number (Nigerian Format)</label>
                    <input
                      type="text"
                      placeholder="+234 803 123 4567"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Location (Lagos, Nigeria)</label>
                    <select
                      value={regForm.location}
                      onChange={(e) => setRegForm({ ...regForm, location: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    >
                      <option value="Lekki, Lagos">Lekki, Lagos</option>
                      <option value="Ikeja, Lagos">Ikeja, Lagos</option>
                      <option value="Yaba, Lagos">Yaba, Lagos</option>
                      <option value="Surulere, Lagos">Surulere, Lagos</option>
                      <option value="Victoria Island, Lagos">Victoria Island, Lagos</option>
                    </select>
                  </div>
                </div>

                {regForm.userType !== "client" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Provider Entity Type</label>
                      <select
                        value={regForm.userType}
                        onChange={(e) => setRegForm({ ...regForm, userType: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none font-bold"
                      >
                        <option value="provider_individual">Individual Freelancer / Errand Runner</option>
                        <option value="provider_company">Corporate Events Staffing Business (CAC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Task & Service Category</label>
                      <select
                        value={regForm.category}
                        onChange={(e) => setRegForm({ ...regForm, category: e.target.value as any })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      >
                        <option value="Skilled Professional">Skilled Professional (Designer/Developer)</option>
                        <option value="Task & Errand">Task & Errand Providers</option>
                        <option value="Event Staffing">Event Staffing (MC, Ushers, Security)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Bio Details</label>
                  <textarea
                    placeholder="Write a tiny bio..."
                    value={regForm.bio}
                    onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 bg-slate-50 text-sm h-20 focus:outline-none focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-online text-white hover:bg-brand-online/90 font-bold rounded-xl text-sm transition"
                >
                  Sign Up and Populate Sandbox Keys
                </button>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                Please tap an account identity card above to proceed with secure registration.
              </div>
            )}
          </form>
        </div>
      ) : (
        /* Regular State: Status and Documents Review Form */
        currentUser && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Status overview and submission forms */}
            <div className="lg:col-span-7 space-y-6">
              {/* Profile Verification State card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 border-b border-gray-100 pb-3">Official Verification Status</h2>
                
                <div className="flex items-center space-x-4">
                  {currentUser.isVerified ? (
                    <div className="bg-green-100 text-green-800 p-3 rounded-full border border-green-200">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                  ) : currentUser.verification?.status === "pending" ? (
                    <div className="bg-amber-100 text-amber-800 p-3 rounded-full border border-amber-200 animate-pulse">
                      <BadgeAlert className="w-10 h-10 text-amber-600" />
                    </div>
                  ) : (
                    <div className="bg-rose-100 text-rose-800 p-3 rounded-full border border-rose-200">
                      <BadgeAlert className="w-10 h-10 text-rose-600" />
                    </div>
                  )}

                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Status</span>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold">
                        {currentUser.isVerified
                          ? "Verified Safe Member"
                          : currentUser.verification?.status === "pending"
                          ? "Verification Review Pending"
                          : "Identity Verification Missing"}
                      </h3>
                      {currentUser.verificationBadge && (
                        <div className="bg-brand-primary text-white px-2 py-0.5 rounded-md text-[10px] font-bold">BADGE ON PROFILE</div>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      {currentUser.isVerified
                        ? "Congratulations! Your profile has been cleared. You are fully enabled to bid, post, and converse."
                        : currentUser.verification?.status === "pending"
                        ? "Administrative safety officers are reviewing your documents against Federal registries. Usually takes ~2 minutes in sandbox."
                        : "To support safety and build escrow trust, we require verified credentials prior to transaction bids."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Registry Submission form */}
              {!currentUser.isVerified && currentUser.verification?.status !== "pending" && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">NIN / BVN Verification form</h2>
                    <p className="text-xs text-gray-500">Deur security encrypts identity metrics. Verified profiles earn 2.3x higher matches.</p>
                  </div>

                  <form onSubmit={handleVerifySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1">Government ID Type</label>
                        <select
                          value={idType}
                          onChange={(e: any) => setIdType(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none"
                        >
                          {currentUser.userType === "provider_company" ? (
                            <>
                              <option value="CAC_Document">Corporate CAC Registration Letter</option>
                              <option value="BVN">Director's Bank Verification Number (BVN)</option>
                            </>
                          ) : (
                            <>
                              <option value="NIN">Nigerian National Identity Number (NIN)</option>
                              <option value="BVN">Nigerian Bank Verification Number (BVN)</option>
                              <option value="Government_ID">Government Issued Card (Passport/Driver License)</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1">ID Number / Certificate Number</label>
                        <input
                          type="text"
                          required
                          maxLength={idType === 'NIN' || idType === 'BVN' ? 11 : 20}
                          placeholder={idType === 'NIN' ? "11-digit NIN" : idType === 'BVN' ? "11-digit BVN" : "RC-*******"}
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 hover:border-brand-primary rounded-xl p-6 text-center cursor-pointer transition relative bg-slate-50/50">
                      <div className="space-y-2 mt-1">
                        <UploadCloud className="w-8 h-8 text-brand-primary mx-auto" />
                        <div className="text-xs font-medium text-gray-700">Drag or Click to attach identity cards</div>
                        <p className="text-[10px] text-gray-500">Supports JPG, PNG or PDF formats. File will be stored securely under Cloudinary escrow.</p>
                      </div>
                      <select
                        onChange={(e) => setDocFileMock(e.target.value)}
                        className="mt-3 bg-white border border-gray-200 text-[11px] rounded-lg p-1.5 focus:outline-none"
                      >
                        <option value="">-- Sandbox Simulator File Attachments --</option>
                        <option value="https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=400">NIN-Card_Lagos_Reg.png</option>
                        <option value="https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400">CAC_Certificate_RC_Ades.pdf</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={verificationSubmitting}
                      className="w-full py-3 bg-brand-primary hover:opacity-95 text-white font-bold rounded-xl text-sm transition cursor-pointer"
                    >
                      {verificationSubmitting ? "Submitting documents to Deur Operations..." : "Submit File for Admin Clearance"}
                    </button>
                  </form>
                </div>
              )}

              {/* Service Provider Portfolio uploads */}
              {currentUser.userType !== "client" && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-slate-900">Upload Professional Portfolio</h2>
                      <span className="bg-brand-online/15 text-brand-online border border-brand-online/20 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-brand-online" />
                        <span>Auto-Watermark Activated</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Portfolio samples are watermarked with Deur logos to protect copy rights and encourage escrow payments.</p>
                  </div>

                  <form onSubmit={handleAddPortfolio} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1">Project Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Wedding Event MC Plan"
                          value={portTitle}
                          onChange={(e) => setPortTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1">Select Project Sample Image</label>
                        <select
                          value={portImage}
                          required
                          onChange={(e) => setPortImage(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none"
                        >
                          <option value="">-- Choose Beautiful Portfolio --</option>
                          <option value="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400">Victoria Island Gala MC (Event Staffing)</option>
                          <option value="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=400">Wedding Venue Crowd Coordination (MC/Host)</option>
                          <option value="https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=400">Fintech Mobile UI Deck (Skilled Pro)</option>
                          <option value="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400">Corporate Ushering Team Coord (Agency)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 tracking-wide mb-1">Project Detail Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Led a team of 15 hostesses at the Lagos Eko Hotel Summit"
                        value={portDesc}
                        onChange={(e) => setPortDesc(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={portSubmitting}
                      className="w-full py-3 bg-brand-primary hover:opacity-95 text-white font-bold rounded-xl text-sm transition cursor-pointer"
                    >
                      {portSubmitting ? "Stamping watermarks and uploading..." : "Add to Portfolio & Securely Stamp"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Corporate/Business Listing & Verification Status Side panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* If Corporate Service, Show CAC Company lists */}
              {currentUser.userType === "provider_company" && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-950 flex items-center mb-1">
                      <FileText className="w-5 h-5 text-brand-primary mr-1.5" />
                      Corporate Profile & CAC Registry
                    </h3>
                    <p className="text-xs text-gray-500">Provide CAC Numbers to sync with Federal registrations logs.</p>
                  </div>

                  <div className="space-y-2 border border-slate-100 p-3 rounded-xl bg-slate-50">
                    <div className="text-xs text-gray-400">Company Name</div>
                    <div className="text-sm font-bold text-slate-800">{currentUser.companyName || "Unconfigured Business LLC"}</div>
                    
                    <div className="text-xs text-gray-400 mt-2">CAC Registration Number</div>
                    <div className="text-sm font-bold text-slate-800 font-mono">{currentUser.cacNumber || "RC-PENDING_SUBMIT"}</div>
                  </div>

                  {/* Team lists scheduling */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Agency Personnel Roster ({currentUser.teamSize || 0} Ushers)</h4>
                    
                    <div className="space-y-1.5">
                      {(currentUser.teamList || []).map((t, index) => (
                        <div key={index} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                          <span className="font-medium text-slate-800">{t.name}</span>
                          <span className="text-brand-online bg-brand-online/10 px-2.5 py-0.5 rounded-full font-sans font-bold">{t.role}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Member Name"
                          value={newTeamMember.name}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                          className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="e.g. Coordinator"
                          value={newTeamMember.role}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                          className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        className="w-full text-center py-2 bg-brand-primary/10 hover:bg-brand-primary/15 text-brand-primary font-bold rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Coordinator</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive WATERMARK PORTFOLIO DISPLAY PREVIEW */}
              {currentUser.userType !== "client" && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center">
                    <ImageIcon className="w-5 h-5 text-cyan-500 mr-2" />
                    Portfolio Security Preview
                  </h3>
                  <p className="text-xs text-gray-500">How clients see your portfolio samples. All uploads are digitally stamped to prevent direct scraping.</p>

                  <div className="space-y-4">
                    {!(currentUser.portfolio && currentUser.portfolio.length) ? (
                      <div className="text-center p-8 border border-dashed rounded-xl bg-slate-50 text-gray-400 text-xs">
                        No portfolio images submitted. Use the uploader to add secure project logs.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {currentUser.portfolio.map((item) => (
                          <div key={item.id} className="relative rounded-xl overflow-hidden shadow-sm group">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover filter brightness-95" />
                            
                            {/* SVG / Text Watermark Overlay */}
                            <div className="absolute inset-0 pointer-events-none select-none flex flex-col items-center justify-center bg-transparent">
                              {/* Repeated faint grid */}
                              <div className="grid grid-cols-3 gap-6 opacity-20 text-[10px] uppercase font-bold text-white tracking-widest leading-none transform -rotate-12 w-full text-center">
                                <span>Deur Verified</span>
                                <span>Secured Escrow</span>
                                <span>Deur Safe</span>
                                <span>Escrow Holder</span>
                                <span>Deur Verified</span>
                                <span>Secure Platform</span>
                              </div>
                              {/* Central clean water badge */}
                              <div className="mt-2 bg-brand-primary/95 backdrop-blur-sm border border-brand-online/30 text-white font-mono text-[9px] uppercase px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-md">
                                <ShieldCheck className="w-3.5 h-3.5 text-brand-online stroke-[2]" />
                                <span className="tracking-widest">DEUR WATERMARK PROTECTION</span>
                              </div>
                            </div>

                            <div className="bg-slate-950 p-2.5 text-white">
                              <h4 className="text-xs font-bold font-sans">{item.title}</h4>
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Helpful instructions about Nigeria's Federal IDs */}
              <div className="bg-brand-online/10 border border-brand-online/20 rounded-2xl p-4 space-y-2 text-slate-800 text-xs text-left">
                <div className="flex items-center space-x-1.5 text-brand-primary font-bold">
                  <Info className="w-4 h-4 text-brand-online" />
                  <span>Nigeria Registry Compliance Guidelines</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 pl-1 leading-relaxed">
                  <li><strong>NIN (National Identity Number):</strong> Evaluated instantly against the National Identity Management Commission (NIMC) federal API logs.</li>
                  <li><strong>BVN (Bank Verification Number):</strong> Verified securely utilizing Nibss Centralized Portal records (Deur never holds personal cards numbers).</li>
                  <li><strong>CAC (Corporate Affairs Commission):</strong> Mandated for event planning agencies, protocol cooperatives, and hostess companies. Approved RC certificates earn the elite Top Agency badge.</li>
                </ul>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
