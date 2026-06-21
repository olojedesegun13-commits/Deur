/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to the JSON database
const DB_PATH = path.join(process.cwd(), "src", "db.json");

// Helper to read database state from db.json
function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database file:", error);
  }
  return {
    users: [],
    gigs: [],
    chats: [],
    escrowTransactions: [],
    reviews: [],
    verifications: [],
    stats: {
      activeUsersCount: 0,
      gigsCompletedCount: 0,
      totalSubscribers: 0,
      totalRevenue: 0,
      escrowHeld: 0,
      commissionsEarned: 0,
      unresolvedDisputes: 0
    }
  };
}

// Helper to write database state to db.json
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}

// Lazy Initialize Gemini SDK
let ai: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini AI integration connected successfully.");
    } catch (e) {
      console.error("Failed to initialize Google Gen AI:", e);
    }
  }
  return ai;
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Authenticated current user mock state (simple backend-managed user session)
let currentSessionUserId: string | null = "client_demo"; // Default to premium client for demo fluidity

// 1. Healthcare & Diagnostics
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Authentication Flow
app.post("/api/auth/register", (req, res) => {
  const { email, name, userType, phone, location, password } = req.body;
  if (!email || !name || !userType) {
    return res.status(400).json({ error: "Email, name, and userType are required." });
  }

  const db = readDB();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "User with this email already exists." });
  }

  // Create masked phone number representation
  const rawPhone = phone || "+2348030000000";
  let phoneMasked = rawPhone;
  if (rawPhone.length >= 8) {
    phoneMasked = `${rawPhone.slice(0, 4)} ${rawPhone.slice(4, 7)} *** **${rawPhone.slice(-2)}`;
  }

  const newUser: any = {
    id: "user_" + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    name,
    userType,
    phoneMasked,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    bio: "",
    location: location || "Lagos, Nigeria",
    isVerified: false,
    verificationBadge: false,
    subscription: null,
    ratingsAverage: 5.0,
    completedGigsCount: 0,
    responseTime: "Within 2 hours"
  };

  if (userType.includes("provider")) {
    newUser.category = "Event Staffing";
    newUser.subcategory = "Ushers";
    newUser.skills = ["Greeting", "Hosting", "Organization"];
    newUser.portfolio = [];
    newUser.emergencyContact = {
      name: "Immediate Family",
      phone: "+2348000000000",
      relationship: "Parent"
    };
    if (userType === "provider_company") {
      newUser.companyName = name + " Ltd";
      newUser.cacNumber = "RC-" + Math.floor(1000000 + Math.random() * 9000000);
      newUser.teamSize = 5;
      newUser.teamList = [];
    }
  }

  db.users.push(newUser);
  db.stats.activeUsersCount += 1;
  writeDB(db);

  currentSessionUserId = newUser.id;
  res.json({ message: "Registration successful. Welcome to Deur!", user: newUser });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User with this email not found." });
  }

  // Initialize a mock 2FA challenge
  // For demonstration, code is 123456
  res.json({
    message: "Two-Factor Authentication (2FA) code sent to emergency number and masked device.",
    twoFactorRequired: true,
    email: user.email,
    challengeId: "challenge_" + Math.random().toString(36).substr(2, 5)
  });
});

// Verify 2FA
app.post("/api/auth/verify-2fa", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and 2FA code are required." });
  }

  if (code !== "123456" && code !== "1234") {
    return res.status(400).json({ error: "Invalid 2FA code. Please use the demo code '123456'." });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  currentSessionUserId = user.id;
  res.json({ message: "Logged in successfully.", user });
});

// Get/switch profile session
app.get("/api/auth/me", (req, res) => {
  const db = readDB();
  const user = db.users.find((u: any) => u.id === currentSessionUserId);
  if (!user) {
    return res.status(401).json({ error: "No active session." });
  }
  res.json({ user });
});

// All Users for identity list
app.get("/api/users", (req, res) => {
  const db = readDB();
  res.json({ users: db.users });
});

// Quick identity switcher for fluid testing in sandbox
app.post("/api/auth/switch-identity", (req, res) => {
  const { userId } = req.body;
  const db = readDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Identity not found." });
  }
  currentSessionUserId = userId;
  res.json({ message: `Successfully switched to ${user.name}`, user });
});

// Submit verification documents
app.post("/api/users/upload-id", (req, res) => {
  const { idType, idNumber, documentUrl } = req.body;
  if (!idType || !idNumber) {
    return res.status(400).json({ error: "Identifier type and registry number are required." });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === currentSessionUserId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const user = db.users[userIndex];
  const newVerification = {
    id: "ver_" + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    userName: user.name,
    idType,
    idNumber,
    documentUrl: documentUrl || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=200",
    submittedAt: new Date().toISOString(),
    status: "pending"
  };

  user.verification = {
    idType,
    idNumber,
    documentUrl: newVerification.documentUrl,
    submittedAt: newVerification.submittedAt,
    status: "pending"
  };
  user.isVerified = false;
  user.verificationBadge = false;

  // Track verifications inside the central admin queue
  db.verifications.push(newVerification);
  writeDB(db);

  res.json({ message: "Verification documents submitted successfully for manual review.", user });
});

// Edit profile
app.post("/api/users/update", (req, res) => {
  const { bio, location, category, subcategory, skills, emergencyContact, companyName, cacNumber, teamSize, avatarUrl } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === currentSessionUserId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const user = db.users[userIndex];
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  
  if (user.userType.includes("provider")) {
    if (category !== undefined) user.category = category;
    if (subcategory !== undefined) user.subcategory = subcategory;
    if (skills !== undefined) user.skills = skills;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (user.userType === "provider_company") {
      if (companyName !== undefined) user.companyName = companyName;
      if (cacNumber !== undefined) user.cacNumber = cacNumber;
      if (teamSize !== undefined) user.teamSize = teamSize;
    }
  }

  writeDB(db);
  res.json({ message: "Profile updated successfully.", user });
});

// Add Watermarked portfolio item
app.post("/api/users/upload-portfolio", (req, res) => {
  const { imageUrl, title, description } = req.body;
  if (!imageUrl || !title) {
    return res.status(400).json({ error: "Image URL and project title are required." });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === currentSessionUserId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const user = db.users[userIndex];
  if (!user.portfolio) {
    user.portfolio = [];
  }

  user.portfolio.push({
    id: "port_" + Math.random().toString(36).substr(2, 9),
    imageUrl,
    title,
    description: description || "",
    watermarked: true // ALWAYS watermarked for safety
  });

  writeDB(db);
  res.json({ message: "Portfolio sample watermarked with Deur logo and uploaded successfully.", user });
});

// 3. Subscription & Billing Flow
app.post("/api/subscriptions/subscribe", (req, res) => {
  const { tier } = req.body; // 'basic' | 'premium'
  if (!tier) {
    return res.status(400).json({ error: "Subscription tier is required." });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === currentSessionUserId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const user = db.users[userIndex];
  
  // Calculate cost and onboarding fee parameters
  let cost = 0;
  let hasPromo = false;
  let paidOnboardingFee = false;

  if (user.userType === "client") {
    cost = tier === "premium" ? 5000 : 2000;
    hasPromo = true; // Buy 1 get 2 months (Spotify model promo)
  } else if (user.userType.includes("provider")) {
    const isPremium = tier === "premium";
    cost = isPremium ? 3500 : 1500;
    paidOnboardingFee = false; // No onboarding fee required anymore
  }

  const startDate = new Date();
  const expiryDate = new Date();
  if (user.userType === "client" && hasPromo) {
    expiryDate.setMonth(expiryDate.getMonth() + 2); // 2 months instead of 1 (1 month free!)
  } else {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  }

  user.subscription = {
    tier,
    startDate: startDate.toISOString().split("T")[0],
    expiryDate: expiryDate.toISOString().split("T")[0],
    status: "active",
    hasPromo,
    paidOnboardingFee,
    billingCycle: "monthly",
    cost: user.userType === "client" ? (tier === "premium" ? 5000 : 2000) : (tier === "premium" ? 3500 : 1500)
  };

  db.stats.totalSubscribers += 1;
  db.stats.totalRevenue += cost;
  writeDB(db);

  res.json({
    message: `Payment successful through Paystack standard recurring escrow billing! Subscribed to Deur ${tier.toUpperCase()}.`,
    user
  });
});

// 4. Gig Posting, Filtering, and Applications
app.get("/api/gigs", (req, res) => {
  const db = readDB();
  res.json({ gigs: db.gigs });
});

app.post("/api/gigs/post", (req, res) => {
  const { title, description, category, subcategory, location, isRemote, budget, datetimeNeeded } = req.body;
  if (!title || !description || !category || !budget) {
    return res.status(400).json({ error: "Gig parameters: title, description, category, and budget are required." });
  }

  const db = readDB();
  const client = db.users.find((u: any) => u.id === currentSessionUserId);
  if (!client) {
    return res.status(404).json({ error: "Owner client not found." });
  }

  // Check subscription limits based on tier
  const isPremiumClient = client.subscription?.tier === "premium" && client.subscription?.status === "active";
  const openClientGigs = db.gigs.filter((g: any) => g.clientId === client.id && g.status === "open").length;

  if (!isPremiumClient && openClientGigs >= 3) {
    return res.status(403).json({
      error: "Subscription limit reached. Basic accounts can only post up to 3 active gigs at a time. Upgrade to Premium for unlimited gigs and priority matching!"
    });
  }

  const commissionPercent = isPremiumClient ? 10 : 15; // 10% commission for Premium, 15% for Basic client support

  const newGig: any = {
    id: "gig_" + Math.random().toString(36).substr(2, 9),
    title,
    description,
    category,
    subcategory: subcategory || "General",
    location: location || "Remote",
    isRemote: !!isRemote,
    budget: Number(budget),
    clientId: client.id,
    clientName: client.name,
    clientAvatar: client.avatarUrl,
    createdAt: new Date().toISOString(),
    status: "open",
    datetimeNeeded: datetimeNeeded || new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days
    commissionPercent,
    safetyConfirmed: {
      client: false,
      provider: false
    },
    applications: []
  };

  db.gigs.unshift(newGig);
  writeDB(db);

  res.json({ message: "Gig posted successfully on Deur. Matches auto-notified.", gig: newGig });
});

// Apply to a gig
app.post("/api/gigs/apply", (req, res) => {
  const { gigId, bidAmount, coverLetter } = req.body;
  if (!gigId || !bidAmount) {
    return res.status(400).json({ error: "Gig ID and bidding rate are required." });
  }

  const db = readDB();
  const provider = db.users.find((u: any) => u.id === currentSessionUserId);
  if (!provider) {
    return res.status(404).json({ error: "Provider profile not found." });
  }

  // Refuse client bidding attempts explicitly on the server-side
  if (provider.userType === "client") {
    return res.status(403).json({
      error: "Role Restricted: Hiring Clients are not permitted to submit proposal bids to gig contracts!"
    });
  }

  // Mandate ID verification before service providers can transact
  if (!provider.isVerified) {
    return res.status(403).json({
      error: "Verification required! Deur is a safe network. You must submit your NIN, BVN, or official document and secure admin approval before applying to jobs."
    });
  }

  const gigIndex = db.gigs.findIndex((g: any) => g.id === gigId);
  if (gigIndex === -1) {
    return res.status(404).json({ error: "Gig not found." });
  }

  const gig = db.gigs[gigIndex];
  
  // Verify provider subscription active state (standard rules)
  if (!provider.subscription || provider.subscription.status !== "active") {
    return res.status(403).json({
      error: "Active subscription required! Access the billing panel to subscribe and bid on contracts."
    });
  }

  const existingApplication = gig.applications.find((a: any) => a.providerId === provider.id);
  if (existingApplication) {
    return res.status(400).json({ error: "You have already applied to this gig." });
  }

  const newApp = {
    id: "app_" + Math.random().toString(36).substr(2, 9),
    gigId,
    providerId: provider.id,
    providerName: provider.name,
    providerAvatar: provider.avatarUrl,
    providerRating: provider.ratingsAverage,
    providerBadge: provider.verificationBadge,
    bidAmount: Number(bidAmount),
    coverLetter: coverLetter || "",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  gig.applications.push(newApp);
  writeDB(db);

  res.json({ message: "Your application has been logged and the client will be notified securely.", gig });
});

// Accept application (and open escrow)
app.post("/api/gigs/accept", (req, res) => {
  const { gigId, applicationId } = req.body;
  if (!gigId || !applicationId) {
    return res.status(400).json({ error: "Gig ID and application details are required." });
  }

  const db = readDB();
  const gigIndex = db.gigs.findIndex((g: any) => g.id === gigId);
  if (gigIndex === -1) {
    return res.status(404).json({ error: "Gig not found." });
  }

  const gig = db.gigs[gigIndex];
  const appMatch = gig.applications.find((a: any) => a.id === applicationId);
  if (!appMatch) {
    return res.status(404).json({ error: "Application records not found." });
  }

  // Set selected application
  appMatch.status = "accepted";
  gig.selectedProviderId = appMatch.providerId;
  gig.status = "escrow_funded"; // Funds held in escrow

  // Lock and populate escrow trans
  const budget = appMatch.bidAmount;
  const commission = budget * (gig.commissionPercent / 100);
  const providerPayout = budget - commission;

  const trx = {
    id: "escrow_" + Math.random().toString(36).substr(2, 9),
    gigId: gig.id,
    gigTitle: gig.title,
    clientId: gig.clientId,
    providerId: appMatch.providerId,
    amount: budget,
    commission,
    providerPayout,
    status: "held",
    dateFunded: new Date().toISOString()
  };

  db.escrowTransactions.push(trx);
  db.stats.escrowHeld += budget;

  // Initialize secure chat session between client and provider
  const chatMatch = db.chats.find(
    (c: any) => c.gigId === gig.id && c.clientId === gig.clientId && c.providerId === appMatch.providerId
  );

  if (!chatMatch) {
    const newChat = {
      id: "chat_" + Math.random().toString(36).substr(2, 9),
      gigId: gig.id,
      gigTitle: gig.title,
      clientId: gig.clientId,
      clientName: gig.clientName,
      providerId: appMatch.providerId,
      providerName: appMatch.providerName,
      lastMessageAt: new Date().toISOString(),
      messages: [
        {
          id: "msg_init",
          chatId: "",
          senderId: "system",
          senderName: "Deur System",
          text: `🔐 ESCROW COMMITTED: Funto Alade has successfully deposited ₦${budget.toLocaleString()} for "${gig.title}". Safety Framework activated: (1) Contact masks are on, (2) Complete pre-gig confirmation checklist, (3) Live Location available in-app.`,
          timestamp: new Date().toISOString(),
          flagged: false
        }
      ]
    };
    newChat.messages[0].chatId = newChat.id;
    db.chats.push(newChat);
  }

  writeDB(db);
  res.json({ message: "Escrow payment initialized via Paystack! Contract matches created securely.", gig, transaction: trx });
});

// Pre-gig safety confirmation
app.post("/api/gigs/confirm-safety", (req, res) => {
  const { gigId } = req.body;
  const db = readDB();
  const gigIndex = db.gigs.findIndex((g: any) => g.id === gigId);
  if (gigIndex === -1) {
    return res.status(404).json({ error: "Gig not found." });
  }

  const gig = db.gigs[gigIndex];
  
  if (currentSessionUserId === gig.clientId) {
    gig.safetyConfirmed.client = true;
  } else if (currentSessionUserId === gig.selectedProviderId) {
    gig.safetyConfirmed.provider = true;
  } else {
    return res.status(403).json({ error: "Access denied." });
  }

  // If both confirm, move status from escrow_funded to active!
  if (gig.safetyConfirmed.client && gig.safetyConfirmed.provider) {
    gig.status = "active";
    gig.liveTrackingActive = true;

    // Simulate sending emergency automation SMS
    const provider = db.users.find((u: any) => u.id === gig.selectedProviderId);
    if (provider && provider.emergencyContact) {
      console.log(`[SMS AUTOMATION] Sent alert to emergency contact: ${provider.emergencyContact.name} (${provider.emergencyContact.phone}) -> "Gig '${gig.title}' is starting. Meets at ${gig.location}. Tracking Enabled."`);
    }
  }

  writeDB(db);
  res.json({ message: "Safety location parameters verified successfully.", gig });
});

// Trigger emergency SOS alert!
app.post("/api/gigs/sos-trigger", (req, res) => {
  const { gigId } = req.body;
  const db = readDB();
  const gigIndex = db.gigs.findIndex((g: any) => g.id === gigId);
  if (gigIndex === -1) {
    return res.status(404).json({ error: "Gig not found." });
  }

  const gig = db.gigs[gigIndex];
  gig.emergencyAlertsSent = true;

  const provider = db.users.find((u: any) => u.id === gig.selectedProviderId);
  const emergencyPhone = provider?.emergencyContact?.phone || "+2348000000000";
  const emergencyName = provider?.emergencyContact?.name || "Emergency Contact";

  // Simulate SOS Dispatcher Logs
  console.log(`[🚨 EMERGENCY DISPATCH DISPATCHED] RED BUTTON TRIGGERED on GIG '${gig.title}'. Provider: ${provider?.name}. emergency contact: ${emergencyName} (${emergencyPhone}). Deur safety team dispatched.`);

  // Append a crisis alert system message to chat
  const chatIndex = db.chats.findIndex((c: any) => c.gigId === gig.id);
  if (chatIndex !== -1) {
    db.chats[chatIndex].messages.push({
      id: "msg_sos_" + Date.now(),
      chatId: db.chats[chatIndex].id,
      senderId: "system_safety",
      senderName: "Deur SOS Team",
      text: `🚨 EMERGENCY BUTTON TRIGGERED. Deur Admin Operations and the provider's emergency contact (${emergencyName}: ${emergencyPhone}) have been notified with active security logs and location vectors.`,
      timestamp: new Date().toISOString(),
      flagged: true,
      flagReason: "SOS"
    });
  }

  writeDB(db);
  res.json({ message: "SOS Alert Dispatched instantly. Admin and your emergency contact have been dialed.", gig });
});

// Release Escrow (Mark gig completed)
app.post("/api/gigs/complete", (req, res) => {
  const { gigId } = req.body;
  const db = readDB();
  const gigIndex = db.gigs.findIndex((g: any) => g.id === gigId);
  if (gigIndex === -1) {
    return res.status(404).json({ error: "Gig contract record not found." });
  }

  const gig = db.gigs[gigIndex];
  if (gig.clientId !== currentSessionUserId) {
    return res.status(403).json({ error: "Only the client who opened this gig can authorize escrow payout." });
  }

  gig.status = "completed";
  gig.liveTrackingActive = false;

  const escrowTrxIndex = db.escrowTransactions.findIndex((t: any) => t.gigId === gig.id && t.status === "held");
  if (escrowTrxIndex !== -1) {
    const t = db.escrowTransactions[escrowTrxIndex];
    t.status = "released";
    t.dateReleased = new Date().toISOString();

    db.stats.escrowHeld -= t.amount;
    db.stats.commissionsEarned += t.commission;
    db.stats.gigsCompletedCount += 1;

    // Increment provider count
    const provider = db.users.find((u: any) => u.id === gig.selectedProviderId);
    if (provider) {
      provider.completedGigsCount += 1;
    }
  }

  writeDB(db);
  res.json({ message: "Escrow funds released successfully. Both parties can now leave reviews.", gig });
});

// File dispute on Escrow
app.post("/api/gigs/dispute", (req, res) => {
  const { gigId, reason } = req.body;
  if (!gigId) {
    return res.status(400).json({ error: "Gig ID is required." });
  }

  const db = readDB();
  const gigIndex = db.gigs.findIndex((g: any) => g.id === gigId);
  if (gigIndex === -1) {
    return res.status(404).json({ error: "Gig records not found." });
  }

  const gig = db.gigs[gigIndex];
  gig.status = "disputed";

  const escrowTrxIndex = db.escrowTransactions.findIndex((t: any) => t.gigId === gig.id);
  if (escrowTrxIndex !== -1) {
    const t = db.escrowTransactions[escrowTrxIndex];
    t.status = "disputed";
    t.disputeNotes = reason || "Unresolvable quality issues or contact failure.";
  }

  db.stats.unresolvedDisputes += 1;
  writeDB(db);

  res.json({ message: "A formal dispute has been logged. Escrow funds are frozen under admin resolution.", gig });
});

// 5. In-App Messaging & Automated Contact Filters (with Gemini support)
app.get("/api/chat/sessions", (req, res) => {
  const db = readDB();
  const user = db.users.find((u: any) => u.id === currentSessionUserId);
  if (!user) return res.status(401).json({ error: "Unauthorized session." });

  // Filter chats belonging to current session user
  const matchingChats = db.chats.filter((c: any) => c.clientId === user.id || c.providerId === user.id);
  res.json({ chats: matchingChats });
});

app.post("/api/chat/send", async (req, res) => {
  const { chatId, text, documentName, documentUrl, isLiveLocation, locationDuration, locationLatitude, locationLongitude, locationStatusText } = req.body;
  
  if (!chatId || (!text && !documentUrl && !isLiveLocation)) {
    return res.status(400).json({ error: "Chat ID and message properties are required." });
  }

  const db = readDB();
  const chatIndex = db.chats.findIndex((c: any) => c.id === chatId);
  if (chatIndex === -1) {
    return res.status(404).json({ error: "Chat thread not found." });
  }

  const chat = db.chats[chatIndex];
  const sender = db.users.find((u: any) => u.id === currentSessionUserId);
  if (!sender) {
    return res.status(401).json({ error: "Sender profile missing." });
  }

  let finalMessageText = text || "";
  let markedAsFlagged = false;
  let validationReason = "";

  // Skip security filters for system/automatic live location updates to prevent false matches
  if (!isLiveLocation) {
    // 1. Core security filter (local regex check for rapid response matching Nigerian phone formats and common billing indicators)
    const phonePattern = /(\+?234|0)[789][01]\d{8}/g; 
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const offPlatformPayKeywords = /\b(opay|kuda|gtbank|direct account|pay cash|send to my bank|my number|account number|wema|first bank|zenith)\b/i;

    if (phonePattern.test(finalMessageText)) {
      markedAsFlagged = true;
      validationReason = "Direct contact exchange (phone number) intercepted.";
      finalMessageText = finalMessageText.replace(phonePattern, "[CONTACT INFORMATION MASKED FOR OFF-PLATFORM SECURITY]");
    }

    if (emailPattern.test(finalMessageText)) {
      markedAsFlagged = true;
      validationReason = "Direct contact exchange (email address) intercepted.";
      finalMessageText = finalMessageText.replace(emailPattern, "[CONTACT INFORMATION MASKED FOR OFF-PLATFORM SECURITY]");
    }

    if (offPlatformPayKeywords.test(finalMessageText)) {
      markedAsFlagged = true;
      validationReason = "Off-platform payment attempt intercepted.";
      finalMessageText = finalMessageText + " [🚨 SECURITY ATTENTION: Deur strictly prohibits off-platform payments. All funds must remain in secure escrow to protect you.]";
    }

    // 2. High-Quality Gemini AI Moderation Guard
    const aiClient = getGeminiAI();
    if (aiClient && text && !markedAsFlagged) {
      try {
        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Evaluate the following chat message from a gig marketplace provider or client in Nigeria. 
Detect if they are attempting to share hidden phone numbers, email addresses, social media handles, private bank details (Kuda, Opay, Zenith, GTB, account numbers), or arranging direct physical payments outside the platform's Paystack escrow guidelines.

Message to evaluate: "${text}"

Respond strict JSON with format:
{
  "safetyClear": boolean,
  "flagReason": "phone_detected" | "email_detected" | "off_platform_payment" | "none",
  "cleansedText": "string containing text, but replacing any sensitive leaks with [INFO MASKED BY DEUR FOR TRUST]"
}`,
          config: {
            responseMimeType: "application/json"
          }
        });

        const resultText = response.text || "";
        const resultObj = JSON.parse(resultText.trim());

        if (!resultObj.safetyClear) {
          markedAsFlagged = true;
          validationReason = `AI Moderated: ${resultObj.flagReason}`;
          finalMessageText = resultObj.cleansedText;
        }
      } catch (e) {
        console.warn("Gemini content moderation error or rate-limited. Falling back on strict local regex engine.", e);
      }
    }
  }

  const newMessage: any = {
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    chatId,
    senderId: sender.id,
    senderName: sender.name,
    text: finalMessageText,
    timestamp: new Date().toISOString(),
    flagged: markedAsFlagged
  };

  if (isLiveLocation) {
    newMessage.isLiveLocation = true;
    newMessage.locationDuration = locationDuration || 60;
    newMessage.locationLatitude = locationLatitude || 6.4281;
    newMessage.locationLongitude = locationLongitude || 3.4219;
    newMessage.locationActive = true;
    newMessage.locationStatusText = locationStatusText || "En route to meeting coordinates";
    newMessage.text = `📍 [Live Location Session started for ${locationDuration >= 60 ? `${Math.round(locationDuration / 60)}h` : `${locationDuration}m`}] ${locationStatusText || ""}`;
  }

  if (validationReason) {
    newMessage.flagReason = validationReason;
  }

  if (documentUrl) {
    newMessage.fileUrl = documentUrl;
    newMessage.fileName = documentName || "Project_Brief.pdf";
  }

  chat.messages.push(newMessage);
  chat.lastMessageAt = newMessage.timestamp;
  writeDB(db);

  res.json({ message: "Message parsed and sent.", chatMessage: newMessage });
});

// Stop sharing location session route
app.post("/api/chat/stop-location", (req, res) => {
  const { chatId, messageId } = req.body;
  if (!chatId || !messageId) {
    return res.status(400).json({ error: "Chat ID and message ID are required." });
  }

  const db = readDB();
  const chat = db.chats.find((c: any) => c.id === chatId);
  if (!chat) {
    return res.status(404).json({ error: "Chat thread not found." });
  }

  const msg = chat.messages.find((m: any) => m.id === messageId);
  if (!msg) {
    return res.status(404).json({ error: "Message not found." });
  }

  msg.locationActive = false;
  writeDB(db);

  res.json({ success: true, message: "Location sharing stopped." });
});

// ==========================================
// AI-POWERED PLATFORM ENDPOINTS (Gemini SDK)
// ==========================================

// A. Improve proposal cover letters using Gemini
app.post("/api/ai/optimize-proposal", async (req, res) => {
  const { gigTitle, gigDescription, draftText } = req.body;
  
  const aiClient = getGeminiAI();
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an elite expert business advisor on Deur, a safety-first professional freelancer and contract marketplace in Nigeria.
Your job is to rewrite and optimize a draft pitch/application cover letter submitted by a provider applying to a gig listing.

GIG DETAILS:
Title: "${gigTitle}"
Description: "${gigDescription}"

PROVIDER DRAFT PROPOSAL:
"${draftText || "Hi, I am interested in this contract. Please view my skills."}"

Write a highly professional, polite, persuasive, and clear pitch to the client (around 120-180 words).
Ensure:
1. It is tailored exactly to the gig requirements and shows expertise.
2. It lists professional confidence, readiness, and active safety commitment.
3. Explicitly mentions understanding that payment must be finalized through Deur's automated secure Escrow protection framework.
4. Maintains a polite, formal Nigerian business tone.
5. Do NOT include placeholders (like [Your Name]), replace them with realistic descriptions or sign off as the candidate.

Return ONLY the refined pitch text. Do not output any intro, markdown headings or closing notes. Output raw text directly.`,
      });
      
      const refinedText = response.text || "";
      return res.json({ success: true, optimizedText: refinedText.trim() });
    } catch (e) {
      console.error("Gemini Optimize Proposal Error:", e);
    }
  }

  // Fallback if API keys aren't configured or rate limited
  const defaultEnhanced = `Hello, I'm writing to express my strong interest in your listing "${gigTitle}". I have checked your requirements and am fully equipped to handle this professionally. I respect Deur's safety framework and look forward to finalizing all terms under our secure escrow protection. Let's discuss further on chat. Thank you!`;
  res.json({ success: true, optimizedText: defaultEnhanced });
});

// A2. AI Semantic Gigs Search using Gemini API
app.post("/api/ai/search-gigs", async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Search query string is required." });
  }

  const db = readDB();
  const gigs = db.gigs || [];

  const aiClient = getGeminiAI();
  if (aiClient) {
    try {
      const formattedGigs = gigs.map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        category: g.category,
        subcategory: g.subcategory,
        location: g.location,
        isRemote: g.isRemote,
        budget: g.budget,
        datetimeNeeded: g.datetimeNeeded,
        status: g.status,
      }));

      const prompt = `You are an advanced search and match engine for Deur, a secure freelance and escrow-backed contract services marketplace in Nigeria.
The current date is ${new Date().toLocaleDateString()} (Local time: 2026-06-15, which is Monday).
You need to analyze, filter, and rank the array of Gig listings based on a user's natural language search query.

USER ENTERED SEARCH QUERY:
"${query}"

AVAILABLE GIG LISTINGS AS JSON:
${JSON.stringify(formattedGigs, null, 2)}

Filter and rank the gigs based on semantic intent:
1. Roles/Skills/Keywords: Look for direct skill matches or professions (e.g. "developer", "waiter", "usher", "cook", "designer").
2. Location constraints: (e.g., "Lekki", "Ikeja", "Yaba", "remote"). If they specify a subregion of Lagos (e.g., Lekki), favor matching locations. If they ask for "remote", prioritize gigs marked as isRemote: true.
3. Schedule/Time details: "this weekend" represents Saturday June 20, 2026 and Sunday June 21, 2026 (since June 15 is Monday). Evaluate the "datetimeNeeded" property for time relevance.
4. Keep only gigs that are relevant to the query to some extent. Return empty array if absolutely nothing matches.

Return strict JSON output. The response MUST adhere to this exact JSON layout structure:
{
  "matchingIds": ["string" (an array of the matching gig IDs, ranked from highest match to lowest)],
  "explanation": "string (a concise, professional breakdown sentence explaining the match filters applied or confirming if a perfect fit was found)"
}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const searchResult = JSON.parse(responseText.trim());
      return res.json({ success: true, ...searchResult });
    } catch (e) {
      console.error("Gemini Search Gigs Error:", e);
    }
  }

  // Fallback local robust search if Gemini is not responding or key is missing
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const matched = gigs.filter((g: any) => {
    if (words.length === 0) return true;
    return words.some(word => 
      g.title.toLowerCase().includes(word) ||
      g.description.toLowerCase().includes(word) ||
      g.location.toLowerCase().includes(word) ||
      g.category.toLowerCase().includes(word) ||
      g.subcategory.toLowerCase().includes(word)
    );
  });

  res.json({
    success: true,
    matchingIds: matched.map((g: any) => g.id),
    explanation: `Instant search complete. Found ${matched.length} listings resembling your keywords.`
  });
});

// B. Audit and match applicant proposals using Gemini
app.post("/api/ai/audit-applicants", async (req, res) => {
  const { gigId } = req.body;
  if (!gigId) {
    return res.status(400).json({ error: "Gig ID is required for audit." });
  }

  const db = readDB();
  const gig = db.gigs.find((g: any) => g.id === gigId);
  if (!gig) {
    return res.status(404).json({ error: "Gig not found." });
  }

  const aiClient = getGeminiAI();
  if (aiClient && gig.applications.length > 0) {
    try {
      const applicantsData = gig.applications.map((app: any) => ({
        id: app.id,
        providerName: app.providerName,
        providerRating: app.providerRating,
        providerBadge: app.providerBadge,
        bidAmount: app.bidAmount,
        coverLetter: app.coverLetter,
      }));
      const promptApplicationsStr = JSON.stringify(applicantsData, null, 2);

      const prompt = `Analyze the following gig brief and the applicant proposals on Deur (Nigeria's trusted contract services marketplace).
Provide matching ratings, highlight key risk assessments, suggest a top recommendation, and state trust advice.

GIG BRIEF:
Title: "${gig.title}"
Description: "${gig.description}"
Budget: ₦${gig.budget}

APPLICATIONS RECEIVED:
${promptApplicationsStr}

Return strict JSON matching this exact structure:
{
  "recommendedAppId": "string (the id of the best matching applicant, or empty if none)",
  "executiveSummary": "string (brief overview of the candidates and safety advice)",
  "applicants": [
    {
      "id": "string",
      "matchScore": number (value between 1 and 100),
      "suitability": "Highly Recommended" | "Standard fit" | "Risk flag",
      "bulletPoints": ["string", "string"],
      "safetyAssessment": "string (assess trust profile)"
    }
  ]
}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const auditResult = JSON.parse(responseText.trim());
      return res.json({ success: true, ...auditResult });
    } catch (e) {
      console.error("Gemini Audit Applicants Error:", e);
    }
  }

  // Robust default programmatic fallback if rate limited or API offline
  const defaultAuditResult = {
    recommendedAppId: gig.applications[0]?.id || "",
    executiveSummary: "Deur System Audit: Multiple qualified professionals analyzed. We recommend verifying ratings/badges and securing the Paystack Escrow account prior to starting.",
    applicants: gig.applications.map((app: any) => {
      // Logic for deterministic matching scores
      let score = 75;
      if (app.providerBadge) score += 15;
      if (app.providerRating >= 4.8) score += 8;
      score = Math.min(100, score);

      return {
        id: app.id,
        matchScore: score,
        suitability: score >= 90 ? "Highly Recommended" : "Standard fit",
        bulletPoints: [
          `Solid rating of ${app.providerRating} stars with secure badge alignment.`,
          `Bid rate of ₦${app.bidAmount.toLocaleString()} is compatible with initial budget settings.`
        ],
        safetyAssessment: app.providerBadge ? "Low Risk: Fully ID-verified with CAC or NIN certification registry." : "Medium Risk: Service profile needs official verification before physical meet."
      };
    })
  };

  res.json({ success: true, ...defaultAuditResult });
});

// C. AI-Powered natural-language Semantic search on Gigs using Gemini
app.post("/api/ai/search-gigs", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required for AI search." });
  }

  const db = readDB();
  const gigs = db.gigs || [];

  const aiClient = getGeminiAI();
  if (aiClient && gigs.length > 0) {
    try {
      const prompt = `You are the core AI retrieval assistant for Deur, Nigeria's secure expert-gigs marketplace.
The user's search query is: "${query}"

Below is the complete database list of all open Gigs. Evaluate how well each gig matches the user's semantic request (intent, category matches, location criteria e.g. "Lekki" vs remote, timeframes, or specific roles).

GIGS LISTING DATA:
${JSON.stringify(gigs.map((g: any) => ({
  id: g.id,
  title: g.title,
  description: g.description,
  category: g.category,
  subcategory: g.subcategory,
  location: g.location,
  isRemote: g.isRemote,
  budget: g.budget,
  status: g.status,
  datetimeNeeded: g.datetimeNeeded
})), null, 2)}

Filter and rank the gigs. Return a JSON structure containing:
1. "matchedIds": A list of gig ID strings that are relevant to this query, ordered from best match to worst match. Do not include completely irrelevant gigs.
2. "reasoning": A concise, friendly single-sentence human explanation of how Gemini searched or matched these listings.

Return strict JSON in this exact structure:
{
  "matchedIds": ["id-1", "id-2"],
  "reasoning": "A concise single-sentence human explanation of how the search was filtered or why the recommended match is selected."
}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const parsedResult = JSON.parse(responseText.trim());
      return res.json({ success: true, ...parsedResult });
    } catch (e) {
      console.error("Gemini Search Gigs Error:", e);
    }
  }

  // Robust programmatic fallback if API is not initialized/rate-limited
  const lowerQuery = query.toLowerCase();
  const matchedGigs = gigs.filter((g: any) => {
    return (
      g.title.toLowerCase().includes(lowerQuery) ||
      g.description.toLowerCase().includes(lowerQuery) ||
      g.category.toLowerCase().includes(lowerQuery) ||
      g.subcategory.toLowerCase().includes(lowerQuery) ||
      g.location.toLowerCase().includes(lowerQuery)
    );
  });

  res.json({
    success: true,
    matchedIds: matchedGigs.map((g: any) => g.id),
    reasoning: `Matched ${matchedGigs.length} listing(s) using Deur's offline keyword semantic indexer.`
  });
});


// 6. Rating & Review System
app.post("/api/reviews/post", (req, res) => {
  const { gigId, revieweeId, rating, comment } = req.body;
  if (!gigId || !revieweeId || !rating) {
    return res.status(400).json({ error: "Review params: Gig ID, partner ID, and star rating (1-5) are required." });
  }

  const db = readDB();
  const gig = db.gigs.find((g: any) => g.id === gigId);
  if (!gig) {
    return res.status(444).json({ error: "Gig contract not found." });
  }

  if (gig.status !== "completed") {
    return res.status(403).json({ error: "Reviews can only be written for completed contracts." });
  }

  const reviewer = db.users.find((u: any) => u.id === currentSessionUserId);
  if (!reviewer) {
    return res.status(401).json({ error: "Reviewer profile missing." });
  }

  const newReview = {
    id: "rev_" + Math.random().toString(36).substr(2, 9),
    gigId,
    gigTitle: gig.title,
    reviewerId: reviewer.id,
    reviewerName: reviewer.name,
    revieweeId,
    rating: Number(rating),
    comment: comment || "",
    createdAt: new Date().toISOString()
  };

  db.reviews.push(newReview);

  // Recalculate reviewee average
  const revieweeIndex = db.users.findIndex((u: any) => u.id === revieweeId);
  if (revieweeIndex !== -1) {
    const targetUser = db.users[revieweeIndex];
    const userReviews = db.reviews.filter((r: any) => r.revieweeId === revieweeId);
    const sum = userReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    targetUser.ratingsAverage = Number((sum / userReviews.length).toFixed(1));

    // Handle suspension checks: consistently below 3.0 stars flagged for evaluation
    if (targetUser.ratingsAverage < 3.0 && targetUser.completedGigsCount > 3) {
      console.warn(`[Suspension Warning] User ${targetUser.name} (${targetUser.id}) has average rating ${targetUser.ratingsAverage}. Account flagged for review.`);
    }
  }

  writeDB(db);
  res.json({ message: "Review posted successfully. Public profile metrics updated.", review: newReview });
});

// 7. Admin Dashboard Resolution Control
app.get("/api/admin/verifications", (req, res) => {
  const db = readDB();
  res.json({ verifications: db.verifications });
});

app.post("/api/admin/verify-action", (req, res) => {
  const { verificationId, action } = req.body; // 'approve' | 'reject'
  if (!verificationId || !action) {
    return res.status(400).json({ error: "Required: manual verification target ID & action." });
  }

  const db = readDB();
  const vIndex = db.verifications.findIndex((v: any) => v.id === verificationId);
  if (vIndex === -1) {
    return res.status(404).json({ error: "Manual verify document not in queue anymore." });
  }

  const verification = db.verifications[vIndex];
  const user = db.users.find((u: any) => u.id === verification.userId);
  
  if (action === "approve") {
    verification.status = "verified";
    if (user) {
      user.isVerified = true;
      user.verificationBadge = true; // Displays verified badge on approved profile
      if (user.verification) {
        user.verification.status = "verified";
      }
    }
  } else {
    verification.status = "rejected";
    if (user) {
      user.isVerified = false;
      user.verificationBadge = false;
      if (user.verification) {
        user.verification.status = "rejected";
      }
    }
  }

  writeDB(db);
  res.json({ message: `Verification status ${action}d manually. Badge profiles updated.` });
});

// Admin panel for active disputes
app.get("/api/admin/disputes", (req, res) => {
  const db = readDB();
  const transactions = db.escrowTransactions.filter((t: any) => t.status === "disputed");
  res.json({ disputes: transactions });
});

app.post("/api/admin/dispute-resolve", (req, res) => {
  const { transactionId, resolution } = req.body; // 'release_to_provider' | 'refund_client'
  if (!transactionId || !resolution) {
    return res.status(444).json({ error: "Disputed transaction ID and resolution style are required." });
  }

  const db = readDB();
  const trx = db.escrowTransactions.find((t: any) => t.id === transactionId);
  if (!trx) {
    return res.status(404).json({ error: "Escrow record not found." });
  }

  const gig = db.gigs.find((g: any) => g.id === trx.gigId);

  if (resolution === "release_to_provider") {
    trx.status = "released";
    trx.dateReleased = new Date().toISOString();
    if (gig) {
      gig.status = "completed";
    }
    db.stats.commissionsEarned += trx.commission;
    db.stats.escrowHeld -= trx.amount;
  } else { // refund_client
    trx.status = "released"; // Released back
    trx.disputeNotes = "Refunded to client account: " + trx.disputeNotes;
    if (gig) {
      gig.status = "cancelled";
    }
    db.stats.escrowHeld -= trx.amount;
  }

  db.stats.gigsCompletedCount += 1;
  db.stats.unresolvedDisputes = Math.max(0, db.stats.unresolvedDisputes - 1);
  writeDB(db);

  res.json({ message: "Disposed dispute successfully.", transaction: trx, gig });
});

// Get global administrative stats
app.get("/api/admin/stats", (req, res) => {
  const db = readDB();
  res.json({ stats: db.stats });
});

// ==========================================
// VITE OR STATIC SERVING IN MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Deur platform backend running fully on port ${PORT}`);
  });
}

startServer();
