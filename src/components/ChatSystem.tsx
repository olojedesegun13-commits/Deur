/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Image, 
  Paperclip, 
  ShieldAlert, 
  CheckCircle, 
  FileText, 
  Bookmark, 
  Info, 
  AlertOctagon, 
  HelpCircle,
  MapPin,
  Compass,
  Clock,
  Sliders,
  X,
  Navigation,
  AlertTriangle,
  Sparkles,
  Map,
  RefreshCw,
  Eye
} from "lucide-react";
import { ChatSession, Message, UserProfile } from "../types";

function SafeTrackerOverlay({
  msg,
  currentUser,
  onClose,
  onStopSharing
}: {
  msg: any;
  currentUser: UserProfile;
  onClose: () => void;
  onStopSharing: (msgId: string) => Promise<void>;
}) {
  const [distance, setDistance] = useState(2450); // meters
  const [speed, setSpeed] = useState(28); // km/h
  const [zoom, setZoom] = useState(14);
  const [logs, setLogs] = useState<string[]>([
    "🎯 Initiating secured GPRS handshake...",
    "🛰️ Dual GPS locks stabilized via Lagos telecom node",
    "🛡️ Shield safety encryption active: 100% masked protocols"
  ]);

  // Telemetry drift simulator
  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogs((prev) => {
        const nextLat = (6.4281 + (Math.random() - 0.5) * 0.005).toFixed(5);
        const nextLng = (3.4219 + (Math.random() - 0.5) * 0.005).toFixed(5);
        const logTemplates = [
          `📡 Coordinates updated: ${nextLat}° N, ${nextLng}° E`,
          `📊 GPRS package telemetry sync complete (ping 18ms)`,
          `🚗 Beacon speed velocity registered at ${Math.floor(25 + Math.random() * 12)} km/h`,
          `🔒 Trust signature checkpoint verified`
        ];
        const nextLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        return [nextLog, ...prev.slice(0, 8)];
      });
    }, 4050);

    const telemetryInterval = setInterval(() => {
      setDistance((prev) => {
        if (prev <= 150) return 120; // safe arrived margin
        return prev - Math.floor(10 + Math.random() * 8);
      });
      setSpeed(() => Math.floor(20 + Math.random() * 20));
    }, 1250);

    return () => {
      clearInterval(logInterval);
      clearInterval(telemetryInterval);
    };
  }, []);

  const isMe = msg.senderId === currentUser.id;
  const etaMins = Math.ceil((distance / 1000) / (speed / 60)) || 1;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in text-left">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col">
        
        {/* Top title bar */}
        <div className="bg-[#075E54] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <span className="absolute -inset-1.5 bg-red-400/40 rounded-full animate-ping"></span>
              <Compass className="w-6 h-6 text-white animate-spin" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-[#25D366]">WhatsApp SafeTracker Link</h2>
              <p className="text-xs text-slate-100 opacity-90 font-medium">Real-time escort and route monitoring active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer border-0 bg-transparent font-extrabold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner layout grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100">
          
          {/* Left panel: Telemetry and statistics */}
          <div className="lg:col-span-5 bg-white border-r border-slate-200 overflow-y-auto p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Partner avatar & identity profile */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center space-x-3.5">
                <div className="relative">
                  <span className="absolute -inset-1.5 bg-emerald-500/25 rounded-full animate-pulse"></span>
                  <div className="w-11 h-11 rounded-full border-2 border-[#128C7E] overflow-hidden bg-slate-300">
                    <img referrerPolicy="no-referrer" src={isMe ? currentUser.avatarUrl : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150"} alt="User avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-extrabold flex items-center space-x-1">
                    <span>Active Broadcaster</span>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping ml-1"></span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">{msg.senderName}</h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 italic">"{msg.locationStatusText || 'Broadcasting safety beacons'}"</p>
                </div>
              </div>

              {/* Dials columns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-150 p-4 rounded-2xl bg-slate-50 relative overflow-hidden">
                  <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase font-bold">ETA Estimate</div>
                  <div className="text-xl font-extrabold text-slate-900 font-sans mt-1">
                    {distance > 120 ? `${etaMins} mins` : "Arrived"}
                  </div>
                  <div className="text-[9px] text-[#128C7E] font-medium font-mono mt-0.5">
                    {distance > 120 ? `${(distance / 1000).toFixed(2)} km remains` : "Within 100m"}
                  </div>
                </div>

                <div className="border border-slate-150 p-4 rounded-2xl bg-slate-50 relative overflow-hidden">
                  <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase font-bold">Speed Beacon</div>
                  <div className="text-xl font-extrabold text-slate-900 font-sans mt-1">
                    {speed} km/h
                  </div>
                  <div className="text-[9px] text-amber-600 font-medium font-mono mt-0.5 flex items-center">
                    <Sliders className="w-3 h-3 mr-0.5" />
                    Moderate traffic
                  </div>
                </div>
              </div>

              {/* Coordinate transmission streams terminal box */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Secure Telemetry Feed:</div>
                <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 font-mono text-[9px] text-emerald-400 overflow-y-auto space-y-1.5 leading-normal shadow-inner">
                  {logs.map((log, i) => (
                    <div key={i} className="truncate select-text">
                      <span className="text-[#128C7E] mr-1.5 font-bold">[{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}]</span>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom cancel buttons */}
            <div className="border-t border-slate-200/60 pt-5 mt-5 space-y-3">
              <div className="bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-150 text-[10px] flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Shield Escort Mode:</strong> This real-time tracker logs precise route milestones. If disputes or coordinates diverge from the agreed workplace, Deur security dispatches warnings immediately.
                </p>
              </div>

              <div className="flex space-x-2">
                {isMe && (
                  <button
                    onClick={() => {
                      if (confirm("Stop live coordinate broadcasting for this chat contract?")) {
                        onStopSharing(msg.id);
                        onClose();
                      }
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-center py-2.5 rounded-xl cursor-pointer transition text-xs border-0"
                  >
                    STOP LIVE SHARE
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-center py-2.5 rounded-xl cursor-pointer transition text-xs border border-slate-200"
                >
                  MINIMIZE PANEL
                </button>
              </div>
            </div>

          </div>

          {/* Right panel: Full-screen interactive map layout */}
          <div className="lg:col-span-7 relative h-full flex flex-col bg-slate-250">
            
            {/* Top map controls */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 flex items-center space-x-3 shadow-md max-w-sm">
              <Compass className="w-4 h-4 text-[#128C7E] animate-spin" />
              <div className="text-[10px] text-slate-850 font-bold truncate">
                Lagos district Map scale: x{zoom / 10}
              </div>
            </div>

            <div className="absolute right-4 top-4 z-10 flex flex-col space-y-1.5 shadow-md">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(18, z + 1))}
                className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 font-black cursor-pointer rounded-xl border border-slate-200 flex items-center justify-center p-0"
                title="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(10, z - 1))}
                className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 font-black cursor-pointer rounded-xl border border-slate-200 flex items-center justify-center p-0"
                title="Zoom out"
              >
                -
              </button>
            </div>

            {/* MAP VECTOR ART STAGE */}
            <div className="flex-1 relative overflow-hidden bg-[#e0f2f1]/20 flex items-center justify-center">
              
              {/* Animated high fidelity SVG map */}
              <svg 
                className="absolute w-[200%] h-[200%] transition-transform duration-500 ease-out pointer-events-none stroke-emerald-800/10 fill-none" 
                style={{ transform: `scale(${zoom / 14})` }}
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background water element */}
                <rect x="0" y="0" width="1000" height="1000" fill="#f1f5f9" />
                <path d="M 0,450 Q 300,480 500,600 T 1000,500 L 1000,1000 L 0,1000 Z" fill="#b3e5fc" opacity="0.6" stroke="#81d4fa" strokeWidth="2" />

                {/* Grid guidelines */}
                <line x1="0" y1="100" x2="1000" y2="100" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="5,5" />
                <line x1="0" y1="300" x2="1000" y2="300" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="5,5" />
                <line x1="0" y1="500" x2="1000" y2="500" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="5,5" />
                <line x1="0" y1="700" x2="1000" y2="700" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="5,5" />
                <line x1="100" y1="0" x2="100" y2="1000" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="5,5" />
                <line x1="300" y1="0" x2="300" y2="1000" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="5,5" />
                <line x1="500" y1="0" x2="500" y2="1000" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="5,5" />
                <line x1="700" y1="0" x2="700" y2="1000" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="5,5" />

                {/* Major High fidelity routes */}
                {/* Lekki-Ikoyi Link Bridge */}
                <path d="M 420,150 L 580,450" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
                <path d="M 420,150 L 580,450" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                <circle cx="500" cy="300" r="16" fill="#075E54" opacity="0.15" />

                {/* Admiralty Way road networks */}
                <path d="M 580,450 L 900,380" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />
                <path d="M 580,450 L 900,380" stroke="#f8fafc" strokeWidth="10" strokeLinecap="round" />

                {/* Lekki-Epe expressway */}
                <path d="M 200,600 Q 500,580 900,650" stroke="#94a3b8" strokeWidth="24" strokeLinecap="round" />
                <path d="M 200,600 Q 500,580 900,650" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" strokeDasharray="10,6" />

                {/* Secondary pathways */}
                <path d="M 680,180 L 680,395" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                <path d="M 800,200 L 800,420" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                <path d="M 320,100 L 420,150" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

                {/* Traced dotted path tracker of movement */}
                <path d="M 580,450 Q 640,430 730,415" stroke="#128C7E" strokeWidth="4" strokeLinecap="round" strokeDasharray="8,6" />

                {/* Landmarks text tags */}
                <text x="515" y="275" fill="#475569" className="text-[10px] font-black uppercase font-mono tracking-widest">Lekki-Ikoyi Link Bridge</text>
                <text x="700" y="355" fill="#475569" className="text-[10px] font-bold">Admiralty Way</text>
                <text x="450" y="640" fill="#475569" className="text-[10px] font-bold uppercase tracking-wider">Lekki-Epe Expressway</text>
                <text x="750" y="250" fill="#64748b" className="text-[9px] font-medium font-mono">Lekki Phase 1 Residential</text>
                <text x="250" y="780" fill="#0284c7" className="text-[12px] font-black uppercase tracking-wider font-mono opacity-60">Lagos Lagoon Zone</text>

                {/* SENDER MOVING MARKER */}
                <g transform="translate(730, 415)">
                  <circle cx="0" cy="0" r="28" fill="#128C7E" opacity="0.15" />
                  <circle cx="0" cy="0" r="16" fill="#128C7E" opacity="0.3" className="animate-pulse" />
                  <circle cx="0" cy="0" r="9" fill="#128C7E" />
                  <circle cx="0" cy="0" r="6" fill="#25D366" />
                </g>

                {/* CLIENT TARGET MEETING MARKER */}
                <g transform="translate(580, 450)">
                  <circle cx="0" cy="0" r="20" fill="#3b82f6" opacity="0.15" />
                  <circle cx="0" cy="0" r="8" fill="#3b82f6" />
                </g>
              </svg>

              {/* Float-over coordinate tag */}
              <div className="absolute bottom-6 left-6 bg-slate-900 text-slate-100 font-mono text-[9px] px-3.5 py-2.5 rounded-xl border border-slate-700 shadow-xl opacity-90 max-w-sm">
                <div className="font-extrabold uppercase text-[#25D366] tracking-wider">GPRS SECURE BEACON</div>
                <div className="mt-1">LAT: 6.42813° N / LNG: 3.42194° E</div>
                <div className="text-gray-400 mt-0.5">Packet state: encrypted (AES-256)</div>
              </div>

              {/* Status footer inside stage */}
              <div className="absolute bottom-6 right-6 bg-white border border-slate-200 py-1.5 px-3 rounded-full flex items-center shadow-lg text-[10px]">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2 animate-ping"></span>
                <span className="font-extrabold text-[#111] uppercase tracking-wider">🟢 Live Streaming Escort Coordinates</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

interface ChatSystemProps {
  currentUser: UserProfile | null;
  chats: ChatSession[];
  onSendMessage: (
    chatId: string, 
    text: string, 
    documentName?: string, 
    documentUrl?: string,
    isLiveLocation?: boolean,
    locationDuration?: number,
    locationStatusText?: string
  ) => Promise<void>;
}

function LocationMessageCard({
  m,
  chatId,
  currentUser,
  onStopSharing,
  onOpenTracker
}: {
  m: Message;
  chatId: string;
  currentUser: UserProfile;
  onStopSharing: (msgId: string) => void;
  onOpenTracker: (msg: any) => void;
}) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const calculateTime = () => {
      const msgTime = new Date(m.timestamp).getTime();
      const durationMs = (m.locationDuration || 60) * 60 * 1000;
      const expiryTime = msgTime + durationMs;
      const diff = expiryTime - Date.now();
      
      if (!m.locationActive) {
        setTimeLeft("Ended early");
        setIsActive(false);
      } else if (diff <= 0) {
        setTimeLeft("Session Expired");
        setIsActive(false);
      } else {
        setIsActive(true);
        const sec = Math.floor(diff / 1000) % 60;
        const min = Math.floor(diff / (1000 * 60)) % 60;
        const hr = Math.floor(diff / (1000 * 60 * 60));
        let timerStr = "";
        if (hr > 0) timerStr += `${hr}h `;
        if (min > 0 || hr > 0) timerStr += `${min}m `;
        timerStr += `${sec}s`;
        setTimeLeft(`Expires in ${timerStr}`);
      }
    };

    calculateTime();
    interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [m.timestamp, m.locationDuration, m.locationActive]);

  const isMe = m.senderId === currentUser.id;

  return (
    <div className="bg-emerald-50/80 border border-emerald-200/95 rounded-2xl p-3.5 space-y-2.5 max-w-sm w-full text-slate-800 shadow-sm animate-fade-in">
      <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-800">
        <span className="flex items-center">
          <MapPin className={`w-3.5 h-3.5 mr-1 ${isActive ? 'text-[#128C7E] animate-pulse' : 'text-slate-400'}`} />
          WhatsApp live tracker
        </span>
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isActive ? 'bg-emerald-100 text-[#128C7E]' : 'bg-slate-200 text-slate-500'}`}>
          {isActive ? 'Live' : 'Ended'}
        </span>
      </div>

      {/* Mini-Map Preview */}
      <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
        {/* Animated grid or pathways inside map container representation */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-300 fill-none opacity-80" xmlns="http://www.w3.org/2000/svg">
          {/* Street lanes */}
          <path d="M 0,20 Q 150,45 350,30" strokeWidth="4" />
          <path d="M 10,120 L 320,10" strokeWidth="4" />
          <path d="M 120,0 L 150,150" strokeWidth="4" />
          <path d="M 280,0 L 250,150" strokeWidth="6" />
          <text className="text-[7px]" fill="#94a3b8" x="18" y="28">Admiralty Way</text>
          <text className="text-[7px]" fill="#94a3b8" x="200" y="22">Lekki Phase 1</text>
          <text className="text-[7px]" fill="#94a3b8" x="40" y="80">Epe Expy</text>
        </svg>

        {/* Sender avatar pulsing position marker */}
        <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          {isActive ? (
            <div className="relative">
              <span className="absolute -inset-2 bg-[#128C7E]/40 rounded-full animate-ping"></span>
              <span className="absolute -inset-4 bg-emerald-500/20 rounded-full animate-pulse"></span>
              <div className="relative w-7 h-7 rounded-full border-2 border-white bg-slate-300 overflow-hidden shadow-md flex items-center justify-center">
                <img referrerPolicy="no-referrer" src={isMe ? currentUser.avatarUrl : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150"} alt="User avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-slate-300 bg-slate-200 overflow-hidden opacity-50 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
        </div>
      </div>

      {/* Expiry / Stats summary */}
      <div className="text-[11px] leading-relaxed">
        <div className="font-bold text-slate-900">{isMe ? "Your" : `${m.senderName}'s`} shared live location</div>
        <p className="text-slate-500 text-[10px] font-mono flex items-center mt-1">
          <Clock className="w-3.5 h-3.5 mr-1 text-[#128C7E]" />
          <span className="font-semibold text-[#128C7E]">{timeLeft}</span>
        </p>
        {m.locationStatusText && (
          <p className="text-[10px] text-slate-700 bg-white/75 p-2 rounded-xl border border-emerald-100 mt-2 italic font-serif leading-snug">
            "{m.locationStatusText}"
          </p>
        )}
      </div>

      {/* Action triggers */}
      <div className="grid grid-cols-2 gap-2 border-t border-emerald-150/60 pt-2.5">
        <button
          type="button"
          onClick={() => onOpenTracker(m)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1.5 rounded-lg text-center cursor-pointer flex items-center justify-center space-x-1 uppercase tracking-wider text-[9px] w-full border-0 shadow-xs"
        >
          <Compass className="w-3 h-3 text-white animate-spin" />
          <span>Monitor live</span>
        </button>

        {isMe && isActive ? (
          <button
            type="button"
            onClick={() => onStopSharing(m.id)}
            className="border-2 border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-extrabold py-1 rounded-lg text-center cursor-pointer uppercase tracking-wider text-[9px]"
          >
            Stop sharing
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="border border-slate-200 text-slate-400 bg-slate-100 font-bold py-1.5 rounded-lg text-center cursor-not-allowed uppercase tracking-wider text-[9px]"
          >
            {isActive ? "Streaming" : "Cancelled"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChatSystem({
  currentUser,
  chats,
  onSendMessage
}: ChatSystemProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats[0]?.id || null);
  const [inputText, setInputText] = useState("");
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId) || chats[0] || null;

  // WhatsApp style live location tracker states
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [locDuration, setLocDuration] = useState(60); // duration in minutes
  const [locStatusText, setLocStatusText] = useState("Walking to meeting coordinates");
  const [activeFullTrackerMsg, setActiveFullTrackerMsg] = useState<any | null>(null);

  const handleStartLocationSharing = async () => {
    if (!selectedChat) return;
    setIsLocModalOpen(false);
    await onSendMessage(
      selectedChat.id,
      "", // empty text, handled server side
      undefined,
      undefined,
      true, // isLiveLocation
      locDuration,
      locStatusText
    );
    // Reset inputs
    setLocStatusText("Walking to meeting coordinates");
  };

  const handleStopLocationSharing = async (messageId: string) => {
    if (!selectedChat) return;
    try {
      await fetch("/api/chat/stop-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: selectedChat.id, messageId })
      });
      // trigger refresh on list immediately
      await onSendMessage(selectedChat.id, "📍 [System: Live location session ended]");
    } catch(e) {
      console.error(e);
    }
  };

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  if (!currentUser) return null;

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || (!inputText.trim() && !fileAttached)) return;
    setSubmitting(true);
    
    await onSendMessage(
      selectedChat.id,
      inputText,
      fileName || undefined,
      fileAttached || undefined
    );
    
    setInputText("");
    setFileAttached(null);
    setFileName("");
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-lg h-[75vh]">
        
        {/* LEFT PANE: ACTIVE CHAT THREADS */}
        <div className="lg:col-span-4 border-r border-gray-100 bg-slate-50/50 flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Bookmark className="w-5 h-5 text-brand-primary mr-2" />
              Masked Chat Channels
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 pr-3 leading-relaxed">
              No private phones/emails display here. All chats secure for dispute logs.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active chat channels. Fund an escrow contract on the Gig Market to open channels securely!
              </div>
            ) : (
              chats.map((c) => {
                const isSelected = selectedChat?.id === c.id;
                const otherPartner = currentUser.id === c.clientId ? c.providerName : c.clientName;
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedChatId(c.id)}
                    className={`p-3 rounded-xl cursor-pointer transition text-left ${
                      isSelected ? "bg-brand-online/5 border-l-4 border-brand-online" : "hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-slate-900">{otherPartner}</h4>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-primary truncate mt-1 font-mono font-bold">{c.gigTitle}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-1">
                      {lastMsg ? lastMsg.text : "Locked channels created."}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: MESSAGES SCROLL AND INPUT COMPLIANCE PANELS */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white relative">
          {selectedChat ? (
            <>
              {/* Top channel header */}
              <div className="p-4 border-b border-gray-100 bg-slate-50/40 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-mono text-gray-400">GIG CHANNEL PROTOCOL: SECURED BY DEUR</h3>
                  <h2 className="text-sm font-bold text-slate-950 font-sans tracking-tight">
                    {currentUser.id === selectedChat.clientId ? selectedChat.providerName : selectedChat.clientName}
                  </h2>
                </div>
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] rounded px-2.5 py-1 font-bold">
                  🔐 Escrow Funded Channel
                </div>
              </div>

              {/* Chat messages scrollable list */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {selectedChat.messages.map((m) => {
                  const isMe = m.senderId === currentUser.id;
                  const isSystem = m.senderId.includes("system");
                  
                  if (isSystem) {
                    return (
                      <div key={m.id} className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4.5 text-center text-xs space-y-2">
                        <p className="text-slate-800 leading-relaxed font-sans font-medium text-left">
                          {m.text}
                        </p>
                        <div className="text-[10px] text-brand-primary font-mono tracking-widest uppercase text-right">SYSTEM LOG</div>
                      </div>
                    );
                  }

                  if (m.isLiveLocation) {
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start animate-fade-in"}`}>
                        <LocationMessageCard
                          m={m}
                          chatId={selectedChat.id}
                          currentUser={currentUser}
                          onStopSharing={handleStopLocationSharing}
                          onOpenTracker={(msg) => setActiveFullTrackerMsg(msg)}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start animate-fade-in"}`}>
                      <div className={`max-w-sm rounded-2xl p-4 space-y-2 shadow-xs ${
                        isMe ? "bg-brand-primary text-white rounded-br-none" : "bg-slate-100 text-slate-900 rounded-bl-none"
                      }`}>
                        
                        {/* Sender handle */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1 text-[10px]">
                          <span className="font-bold opacity-80">{m.senderName}</span>
                          <span className="opacity-60">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Text message */}
                        <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{m.text}</p>

                        {/* Render file attachments if present */}
                        {m.fileUrl && (
                          <div className={`p-2 rounded-xl flex items-center space-x-2 border text-xs mt-2 ${
                            isMe ? "bg-white/10 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                          }`}>
                            <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                            <div className="truncate flex-1">
                              <div className="font-bold truncate">{m.fileName}</div>
                              <span className="text-[9px] opacity-70">Secured PDF brief</span>
                            </div>
                            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold text-[10px] text-cyan-400">OPEN</a>
                          </div>
                        )}

                        {/* Flags Warning Label */}
                        {m.flagged && (
                          <div className="bg-red-500/10 text-rose-300 border border-red-500/20 text-[9px] rounded p-2.5 flex items-start space-x-1 mt-2">
                            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">VIOLATION BLOCKED:</span> {m.flagReason || "Off-platform instruction filtered."}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Security filter guidelines banner */}
              <div className="bg-brand-online/10 border-t border-brand-online/20 px-4 py-25 text-[10px] text-slate-800 flex items-center justify-between">
                <span className="flex items-center">
                  <Info className="w-3.5 h-3.5 mr-1.5 text-brand-online" />
                  <strong>Trust Regulation:</strong> Do not share private contact detail. Any typed phone or account is flagged and masked automatically inside the escrow platform.
                </span>
                
                {/* Sandbox helpers */}
                <div className="flex items-center space-x-1.5 font-bold">
                  <span>Try:</span> 
                  <span
                    onClick={() => setInputText("Call me on 08031112222 or email me")}
                    className="underline text-brand-primary cursor-pointer hover:text-black font-mono bg-brand-primary/10 px-1.5 py-0.5 rounded"
                    title="Click to copy into inputs and test filters"
                  >
                    NIN/Phone
                  </span>
                  <span
                    onClick={() => setInputText("direct transfer Zenith bank 1012023034")}
                    className="underline text-brand-primary cursor-pointer hover:text-black font-mono bg-brand-primary/10 px-1.5 py-0.5 rounded"
                    title="Click to copy direct payments instructions"
                  >
                    Direct pay
                  </span>
                </div>
              </div>

              {/* Message inputs form and attachment slider */}
              <form onSubmit={handleSendSubmit} className="p-4 border-t border-gray-100 bg-white flex items-center space-x-3">
                <div className="relative group">
                  <button
                    type="button"
                    className="p-2.5 rounded-full hover:bg-slate-150 border text-slate-400 hover:text-slate-700 transition"
                    title="Attach file briefings"
                    id="attachment-btn"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-12 left-0 bg-white border rounded-xl p-2 shadow-xl hidden group-hover:block z-10 w-48 text-xs text-slate-800 space-y-1">
                    <div className="font-bold border-b pb-1 mb-1">Simulate Files Upload</div>
                    <button
                      type="button"
                      onClick={() => { setFileAttached("https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=400"); setFileName("Federal_NIN_Copy_Verify.png"); }}
                      className="w-full text-left p-1 rounded hover:bg-slate-100 truncate text-[11px]"
                    >
                      📎 Government_ID_ID.jpg
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFileAttached("https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400"); setFileName("Project_Requirements_VI_Stage.pdf"); }}
                      className="w-full text-left p-1 rounded hover:bg-slate-100 truncate text-[11px]"
                    >
                      📎 Project_Brief_Eko.pdf
                    </button>
                  </div>
                </div>

                {/* WhatsApp style Live Location sharing trigger button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLocModalOpen(!isLocModalOpen)}
                    className={`p-2.5 rounded-full border transition cursor-pointer ${
                      isLocModalOpen
                        ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                        : "text-slate-400 hover:text-emerald-500 hover:bg-slate-100"
                    }`}
                    title="Share Live Location (WhatsApp style)"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>

                   {isLocModalOpen && (
                    <div className="absolute bottom-14 left-0 bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xl z-20 w-80 text-xs text-slate-800 space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center space-x-1 ml-1">
                          <MapPin className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span className="font-extrabold text-slate-900 uppercase tracking-wide">WhatsApp Live Tracking</span>
                        </div>
                        <button type="button" onClick={() => setIsLocModalOpen(false)} className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {currentUser?.userType === "client" ? (
                        <div className="space-y-3 pt-1">
                          <div className="bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-200 text-[11px] leading-relaxed">
                            <ShieldAlert className="w-4.5 h-4.5 text-amber-600 inline-block mr-1.5 shrink-0 align-text-bottom" />
                            <strong>Service Providers Only:</strong> Location broadcasting is a secure transit companion feature reserved exclusively for Service Providers en route. As a Hiring Client, you can trace their location live once they start sharing.
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-extrabold">Select duration :</label>
                            <div className="flex gap-2">
                              {[
                                { label: "15 Mins", val: 15 },
                                { label: "1 Hour", val: 60 },
                                { label: "8 Hours", val: 480 }
                              ].map((item) => (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => setLocDuration(item.val)}
                                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer border transition text-center ${
                                    locDuration === item.val
                                      ? "bg-[#128C7E] text-white border-[#128C7E] shadow-xs"
                                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-extrabold font-sans">Active Status Message :</label>
                            <input
                              type="text"
                              value={locStatusText}
                              onChange={(e) => setLocStatusText(e.target.value)}
                              placeholder="e.g. Walking down Admiralty road to client node"
                              className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-xs rounded-xl focus:outline-none focus:bg-white tracking-normal text-slate-800"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleStartLocationSharing}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-850 hover:opacity-95 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center cursor-pointer transition active:scale-95 space-x-1 border-0"
                          >
                            <Compass className="w-4 h-4 text-white animate-spin" />
                            <span>START LIVE LOCATION SHARES</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    required={!fileAttached}
                    placeholder={fileAttached ? `Attached: ${fileName} (Ready to send)` : "Type your message securely..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none pr-10"
                  />
                  {fileAttached && (
                    <button
                      type="button"
                      onClick={() => { setFileAttached(null); setFileName(""); }}
                      className="absolute right-3 top-2.5 text-rose-500 font-extrabold text-[10px]"
                    >
                      REMOVE
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="p-3 bg-brand-online hover:bg-brand-online/90 text-white rounded-full transition cursor-pointer shadow-xs active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-800">Escrow Chat Channel Closed</div>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Channels open automatically after a client accepts a candidate bid and commits escrow funds. All phone numbers/emails remain fully masked.
              </p>
            </div>
          )}
        </div>

      </div>

      {activeFullTrackerMsg && (
        <SafeTrackerOverlay
          msg={activeFullTrackerMsg}
          currentUser={currentUser}
          onClose={() => setActiveFullTrackerMsg(null)}
          onStopSharing={handleStopLocationSharing}
        />
      )}
    </div>
  );
}
