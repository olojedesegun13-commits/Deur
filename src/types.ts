/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserType = 'client' | 'provider_individual' | 'provider_company' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'unsubmitted';

export interface IDVerification {
  idType: 'NIN' | 'BVN' | 'Government_ID' | 'CAC_Document';
  idNumber: string;
  documentUrl: string;
  submittedAt: string;
  status: VerificationStatus;
  rejectionReason?: string;
}

export type SubscriptionTier = 'basic' | 'premium';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'canceled';
  hasPromo: boolean; // Deur special promo: buy 1 month, get 1 free (2 months total)
  paidOnboardingFee: boolean; // Service providers one-time fee
  billingCycle: 'monthly';
  cost: number;
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  watermarked: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  profilePhoto?: string;
  verified: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  phoneMasked: string; // "+234 803 *** **21"
  avatarUrl: string;
  bio: string;
  location: string; // Lagos sub-region (Lekki, Ikeja, Yaba, Surulere, etc.)
  isVerified: boolean;
  verificationBadge: boolean;
  verification?: IDVerification;
  subscription: SubscriptionInfo | null;
  // Provider Specifics
  category?: 'Skilled Professional' | 'Task & Errand' | 'Event Staffing';
  subcategory?: string; // e.g. "Graphic Designer", "MC/Host", "Errand Runner"
  skills?: string[];
  portfolio?: PortfolioItem[];
  companyName?: string;
  cacNumber?: string;
  teamSize?: number;
  teamList?: TeamMember[];
  ratingsAverage: number;
  completedGigsCount: number;
  responseTime: string; // e.g. "Within 1 hour"
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export type GigCategory = 'Skilled Professional' | 'Task & Errand' | 'Event Staffing';

export type GigStatus = 'open' | 'applied' | 'negotiation' | 'escrow_funded' | 'active' | 'completed' | 'disputed' | 'cancelled';

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: GigCategory;
  subcategory: string;
  location: string; // e.g., "Ikeja, Lagos", "Remote"
  isRemote: boolean;
  budget: number;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  createdAt: string;
  status: GigStatus;
  datetimeNeeded: string;
  applications: GigApplication[];
  selectedProviderId?: string;
  escrowStatus?: 'held' | 'released' | 'disputed';
  commissionPercent: number; // 10% or 15%
  safetyConfirmed: {
    client: boolean;
    provider: boolean;
  };
  liveTrackingActive?: boolean;
  emergencyAlertsSent?: boolean;
}

export interface GigApplication {
  id: string;
  gigId: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  providerBadge: boolean;
  bidAmount: number;
  coverLetter: string;
  status: 'pending' | 'invited' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  fileUrl?: string; // documents, briefs
  fileName?: string;
  timestamp: string;
  flagged: boolean;
  flagReason?: string; // e.g., "phone number detected", "direct bank payment link"
  // WhatsApp-style live location sharing attributes
  isLiveLocation?: boolean;
  locationDuration?: number; // duration in minutes
  locationLatitude?: number;
  locationLongitude?: number;
  locationActive?: boolean;
  locationStatusText?: string;
}

export interface ChatSession {
  id: string;
  gigId: string;
  gigTitle: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  messages: Message[];
  lastMessageAt: string;
}

export interface EscrowTransaction {
  id: string;
  gigId: string;
  gigTitle: string;
  clientId: string;
  providerId: string;
  amount: number;
  commission: number; // calculated currency (₦)
  providerPayout: number; // amount - commission
  status: 'held' | 'released' | 'disputed';
  dateFunded: string;
  dateReleased?: string;
  disputeNotes?: string;
}

export interface Review {
  id: string;
  gigId: string;
  gigTitle: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface PlatformStats {
  activeUsersCount: number;
  gigsCompletedCount: number;
  totalSubscribers: number;
  totalRevenue: number; // in NGN
  escrowHeld: number; // currently in escrow
  commissionsEarned: number;
  unresolvedDisputes: number;
}
