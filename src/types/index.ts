export type Persona = 'customer' | 'provider' | 'support' | 'contact';

export type JobCoreStatus =
  | 'in_progress'
  | 'completion_queued_offline'
  | 'in_review'
  | 'confirmed'
  | 'disputed'
  | 'released'
  | 'incomplete_reported'
  | 'cancelled';

export type ExtraWorkStatus = 'none' | 'queued_offline' | 'awaiting_approval' | 'approved' | 'declined';

export type StartWorkStatus = 'not_started' | 'requested' | 'approved';

export type IncompleteResponsibility = 'provider' | 'customer' | 'conflicting';

export type DisputeStatus =
  | 'none'
  | 'active'
  | 'rule_resolved'
  | 'support_review'
  | 'appealed'
  | 'resolved';

export type PayoutStatus =
  | 'none'
  | 'initiated_partial'
  | 'initiated_full'
  | 'completed'
  | 'stopped_for_dispute';

export interface BookedTask {
  id: string;
  name: string;
  price: number;
}

export interface ExtraWorkItem {
  id: string;
  description: string;
  price: number;
  reason: string;
  photoUrl: string;
}

export interface ExtraWorkRequest {
  id: string;
  items: ExtraWorkItem[];
  totalPrice: number;
  description: string;
  price: number;
  reason: string;
  photoUrl: string;
  requestedAt: string;
  status: ExtraWorkStatus;
  respondedBy?: 'customer' | 'contact';
  respondedAt?: string;
  queuedOffline?: boolean;
}

export interface TaskCompletionEvidence {
  taskId: string;
  taskName: string;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
}

export interface CompletionData {
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  taskCompletions?: TaskCompletionEvidence[];
  submittedAtTap: string;
  platformReceiptAt: string | null;
  reviewDeadlineAt: string | null;
  isQueuedOffline: boolean;
}

export interface TaskDisputeEvidence {
  taskId: string;
  taskName: string;
  price: number;
  problemDescription: string;
  photos: string[];
}

export interface DisputeData {
  disputedTaskIds: string[];
  disputeExtraWork: boolean;
  problemDescription: string;
  disputedAmount: number;
  undisputedAmount: number;
  reportedAt: string;
  reportedBy: 'customer' | 'contact';
  taskDisputes?: TaskDisputeEvidence[];
  customerPhotos?: string[];
  ruleApplied?: {
    code: string;
    name: string;
    explanation: string;
    outcome: 'held_for_support' | 'auto_excluded_extra' | 'partial_payout_hold';
    heldAmount: number;
    releasedAmount: number;
    refundedAmount: number;
  };
  appealedBy?: 'customer' | 'provider';
  appealReason?: string;
  appealedAt?: string;
  reason?: string;
  customReason?: string;
  isAutomatedRefund?: boolean;
  automatedRuleName?: string;
  automatedFact?: string;
  supportDecision?: {
    outcome: 'refund_to_customer' | 'release_to_provider' | 'split';
    providerAmount: number;
    customerAmount: number;
    splitProviderAmount?: number;
    splitCustomerAmount?: number;
    rationale: string;
    decidedAt: string;
    agentName: string;
  };
}

export interface IncompleteJobReport {
  initialReporter: 'provider' | 'customer';
  reportedBy: 'provider' | 'customer' | 'both';
  reason: string;
  providerReason?: string;
  providerPerspective?: string;
  providerReportedAt?: string;
  customerReason?: string;
  customerDescription?: string;
  customerReportedAt?: string;
  customerPhotos?: string[];
  providerPhotos?: string[];
  responsibility: 'provider' | 'customer' | 'conflicting';
  initiatedRefundAmount: number;
  initiatedVisitFeeAmount: number;
  status:
    | 'pending_24h_challenge'
    | 'challenged_escalated_to_support'
    | 'unchallenged_finalized'
    | 'support_resolved';
  challenged: boolean;
  challengedBy?: 'customer' | 'provider';
  challengeReason?: string;
  challengedAt?: string;
  challengeHoursRemaining: number;
  visitFeeContested?: boolean;
  visitFeeContestReason?: string;
  isAutomatedRefund?: boolean;
  automatedRuleName?: string;
  automatedFact?: string;
  ruleApplied?: {
    code: string;
    name: string;
    fact: string;
    rationale: string;
    explanation?: string;
    outcome: 'refund_to_customer' | 'release_to_provider';
  };
  supportDecision?: {
    outcome: 'refund_to_customer' | 'release_to_provider' | 'split';
    decidedResponsibility?: 'provider' | 'customer' | 'split';
    providerAmount: number;
    customerAmount: number;
    rationale: string;
    decidedAt: string;
    agentName: string;
  };
}

export interface SimulatedEvent {
  id: string;
  timestamp: string;
  relativeHours: number;
  actor: 'Provider' | 'Customer' | 'On-site Contact' | 'System Rule' | 'Support Agent';
  title: string;
  description: string;
  category: 'status' | 'financial' | 'rule' | 'notification' | 'support';
}

export interface SimulatedNotification {
  id: string;
  recipient: 'customer' | 'provider' | 'contact';
  channel: 'push' | 'sms';
  timestamp: string;
  title: string;
  body: string;
  actionUrl?: string;
}

export interface JobState {
  jobId: string;
  serviceName: string;
  providerName: string;
  customerName: string;
  contactName: string;
  contactPhone: string;
  contactLinkToken: string;
  contactLinkUsed: boolean;

  bookedTasks: BookedTask[];
  extraWork: ExtraWorkRequest | null;

  coreStatus: JobCoreStatus;
  startWorkStatus: StartWorkStatus;
  startWorkRequestedAt?: string;
  startWorkApprovedAt?: string;
  startWorkApprovedBy?: 'customer' | 'contact';
  extraWorkStatus: ExtraWorkStatus;
  disputeStatus: DisputeStatus;
  payoutStatus: PayoutStatus;

  completion: CompletionData | null;
  dispute: DisputeData | null;
  incompleteReport: IncompleteJobReport | null;

  isOffline: boolean;
  simulatedElapsedHours: number; // 0 to 24+

  financials: {
    baseBookingTotal: number;
    payableTotal: number;
    amountPaidOrInitiated: number;
    amountHeld: number;
    amountRefunded: number;
  };

  events: SimulatedEvent[];
  notifications: SimulatedNotification[];
}

export interface QueuedOfflineAction {
  id: string;
  actor: 'provider' | 'customer' | 'contact';
  type: string;
  payload: any;
  description: string;
  timestamp: string;
}
