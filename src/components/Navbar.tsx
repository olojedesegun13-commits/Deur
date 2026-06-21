/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Key, RefreshCw, Layers, Award, AlertTriangle, DoorOpen } from "lucide-react";
import { UserProfile } from "../types";
import DeurLogo from "./DeurLogo";

interface NavbarProps {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onSwitchIdentity: (userId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  triggerRefresh: () => void;
}

export default function Navbar({
  currentUser,
  allUsers,
  onSwitchIdentity,
  activeTab,
  setActiveTab,
  triggerRefresh
}: NavbarProps) {
  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer select-none group" onClick={() => setActiveTab("gigs")}>
            <div className="relative hover:scale-105 active:scale-95 transition-all duration-300">
              <DeurLogo className="w-10 h-10 drop-shadow-md" size={40} />
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-brand-online rounded-full border-2 border-white shadow-sm ring-1 ring-brand-online/20 animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-baseline leading-none">
                <span className="text-2xl font-black tracking-tight font-sans bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-[#9C27B0] to-[#E01E5A]">
                  deur
                </span>
                <span className="text-brand-online font-black text-2xl leading-none">.</span>
              </div>
              <p className="text-[8px] uppercase tracking-widest text-brand-accent font-extrabold font-mono leading-none mt-1 group-hover:text-[#ECB22E] transition-colors duration-200">
                Opening Doors For Everyone
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {[
              { id: "gigs", label: "Gig Market" },
              { id: "chat", label: "In-App Messages" },
              { id: "safety", label: "Safety Office" },
              { id: "billing", label: "Sub & Paystack Plan" },
              { id: "onboarding", label: "ID Verification" },
              { id: "admin", label: "Admin Operations" }
            ].map((tab) => {
              const active = activeTab === tab.id;
              // Alert indicator on admin tab if any pending
              const isAdminTab = tab.id === "admin";
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer flex items-center space-x-1.5 ${
                    active
                      ? "text-brand-online border-b-2 border-brand-online bg-brand-online/5 rounded-b-none py-[6px]"
                      : "text-slate-600 hover:text-brand-online hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isAdminTab && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-noti opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-noti"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Identity Quick Switch Profile */}
          <div className="flex items-center space-x-3">
            {currentUser && (
              <div className="hidden lg:flex flex-col items-end mr-1">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-bold text-slate-800">{currentUser.name}</span>
                  {currentUser.verificationBadge && (
                    <div className="bg-brand-online/10 text-brand-online p-0.5 rounded-full border border-brand-online/20 font-bold text-[9px] px-2 flex items-center space-x-0.5">
                      <Award className="w-3 h-3 text-brand-online fill-current" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 capitalize font-mono leading-none mt-0.5">
                  {currentUser.userType === "provider_individual"
                    ? "Individual Pro"
                    : currentUser.userType === "provider_company"
                    ? "Agency Company"
                    : currentUser.userType === "client"
                    ? `${currentUser.subscription?.tier || "Basic"} Client`
                    : "Operations Admin"}
                </span>
              </div>
            )}

            {/* Switch Persona Trigger Card */}
            <div className="relative group">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 transition-all">
                <img
                  src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-brand-online object-cover"
                />
                <div className="flex flex-col ml-2 text-left justify-center md:min-w-[120px]">
                  <span className="text-[11px] font-mono font-bold text-brand-primary">PERSONA SWITCHER</span>
                  <span className="text-[10px] text-brand-accent flex items-center font-medium">
                    <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin duration-1000 text-brand-accent" />
                    Sandbox Env
                  </span>
                </div>
              </div>

              {/* Persona Droplist */}
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden hidden group-hover:block hover:block z-50 animate-fade-in">
                <div className="bg-brand-primary text-white px-4 py-2.5 text-xs font-bold border-b border-brand-primary/20">
                  Select Sandbox Persona
                </div>
                <div className="p-1 space-y-1 max-h-96 overflow-y-auto">
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onSwitchIdentity(user.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition text-xs ${
                        currentUser?.id === user.id ? "bg-slate-150 text-brand-primary font-bold border-l-4 border-brand-primary" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      <div className="flex-1 truncate">
                        <div className="font-semibold truncate text-slate-800">{user.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize truncate">
                          {user.userType === "client" ? "Hiring Client" : user.userType === "admin" ? "Deur Admin" : `${user.category} Provider`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentUser && !currentUser.isVerified && currentUser.userType !== "admin" && (
        <div className="bg-brand-alert/5 border-y border-brand-alert/10 px-4 py-2 text-center text-xs text-brand-alert flex items-center justify-center space-x-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-brand-alert" />
          <span>
            <strong>Action Required:</strong> Your profile is currently unverified. Submit your NIN / BVN / CAC files to apply/transact securely!
          </span>
          <button onClick={() => setActiveTab("onboarding")} className="underline font-bold text-brand-primary hover:text-slate-900 ml-2 cursor-pointer">
            Verify Now
          </button>
        </div>
      )}
    </header>
  );
}
