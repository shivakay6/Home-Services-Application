import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Persona,
  JobState,
  JobCoreStatus,
  ExtraWorkStatus,
  IncompleteResponsibility,
  DisputeStatus,
  PayoutStatus,
  BookedTask,
  ExtraWorkItem,
  ExtraWorkRequest,
  CompletionData,
  TaskCompletionEvidence,
  DisputeData,
  TaskDisputeEvidence,
  IncompleteJobReport,
  SimulatedEvent,
  SimulatedNotification,
  QueuedOfflineAction,
} from '../types';
import { INITIAL_TASKS, SAMPLE_IMAGES } from '../data/sampleAssets';

const LOCAL_STORAGE_KEY = 'consarc_home_services_prototype_state_v2';
const PERSONA_STORAGE_KEY = 'consarc_home_services_current_persona_v2';
const QUEUE_STORAGE_KEY = 'consarc_home_services_offline_queue_v2';
const OFFLINE_STORAGE_KEY = 'consarc_home_services_is_offline_v2';

function getInitialState(): JobState {
  return {
    jobId: 'JOB-1042',
    serviceName: 'Kitchen sink repair',
    providerName: 'Ravi Kumar',
    customerName: 'Priya Sharma',
    contactName: 'Ananya',
    contactPhone: '+91 98765 43210',
    contactLinkToken: 'token_ananya_job1042_secure',
    contactLinkUsed: false,

    bookedTasks: INITIAL_TASKS,
    extraWork: null,

    coreStatus: 'in_progress',
    startWorkStatus: 'not_started',
    extraWorkStatus: 'none',
    disputeStatus: 'none',
    payoutStatus: 'none',

    completion: null,
    dispute: null,
    incompleteReport: null,

    isOffline: false,
    simulatedElapsedHours: 0,

    financials: {
      baseBookingTotal: 2000,
      payableTotal: 2000,
      amountPaidOrInitiated: 0,
      amountHeld: 0,
      amountRefunded: 0,
    },

    events: [
      {
        id: 'evt-0',
        timestamp: '10:00 AM',
        relativeHours: 0,
        actor: 'Customer',
        title: 'Booking Confirmed & Payment Held in Escrow',
        description: 'Customer Priya Sharma booked Kitchen Sink Repair for ₹2,000 held by platform. On-site contact: Ananya.',
        category: 'financial',
      },
      {
        id: 'evt-1',
        timestamp: '10:15 AM',
        relativeHours: 0,
        actor: 'Provider',
        title: 'Provider Checked-in On-site',
        description: 'Provider Ravi Kumar arrived at location and commenced diagnostic inspection.',
        category: 'status',
      },
    ],
    notifications: [],
  };
}

// Helper to re-derive financials accurately
export const computeFinancials = (currentState: JobState) => {
  const base = currentState.bookedTasks.reduce((acc, t) => acc + t.price, 0);
  const extra =
    currentState.extraWork?.status === 'approved'
      ? currentState.extraWork.items && currentState.extraWork.items.length > 0
        ? currentState.extraWork.items.reduce((acc, it) => acc + it.price, 0)
        : currentState.extraWork.totalPrice || currentState.extraWork.price || 0
      : 0;
  const payableTotal = base + extra;

  let held = 0;
  let paidOrInitiated = 0;
  let refunded = 0;

  if (currentState.dispute) {
    if (currentState.dispute.supportDecision) {
      if (currentState.dispute.supportDecision.outcome === 'release_to_provider') {
        paidOrInitiated = payableTotal;
        held = 0;
      } else if (currentState.dispute.supportDecision.outcome === 'refund_to_customer') {
        refunded = currentState.dispute.disputedAmount;
        paidOrInitiated = currentState.dispute.undisputedAmount;
        held = 0;
      } else if (currentState.dispute.supportDecision.outcome === 'split') {
        const prov = currentState.dispute.supportDecision.providerAmount ?? currentState.dispute.supportDecision.splitProviderAmount ?? 0;
        const cust = currentState.dispute.supportDecision.customerAmount ?? currentState.dispute.supportDecision.splitCustomerAmount ?? 0;
        paidOrInitiated = currentState.dispute.undisputedAmount + prov;
        refunded = cust;
        held = 0;
      }
    } else {
      held = currentState.dispute.disputedAmount;
      paidOrInitiated = currentState.dispute.undisputedAmount;
    }
  } else if (currentState.incompleteReport) {
    const inc = currentState.incompleteReport;
    if (inc.status === 'unchallenged_finalized') {
      refunded = inc.initiatedRefundAmount;
      paidOrInitiated = inc.initiatedVisitFeeAmount;
      held = 0;
    } else if (inc.status === 'support_resolved' && inc.supportDecision) {
      refunded = inc.supportDecision.customerAmount;
      paidOrInitiated = inc.supportDecision.providerAmount;
      held = 0;
    } else {
      held = payableTotal;
      paidOrInitiated = 0;
      refunded = 0;
    }
  } else if (
    currentState.coreStatus === 'confirmed' ||
    currentState.coreStatus === 'released' ||
    currentState.payoutStatus === 'initiated_full' ||
    currentState.payoutStatus === 'completed'
  ) {
    paidOrInitiated = payableTotal;
    held = 0;
  }

  return {
    baseBookingTotal: base,
    payableTotal,
    amountPaidOrInitiated: paidOrInitiated,
    amountHeld: held,
    amountRefunded: refunded,
  };
};

export const applyActionToState = (
  baseState: JobState,
  action: QueuedOfflineAction,
  isOnlineSync: boolean
): JobState => {
  const currentElapsed = baseState.simulatedElapsedHours;
  const timeString = `${10 + Math.floor(currentElapsed)}:${currentElapsed % 1 === 0 ? '00' : '30'} ${10 + currentElapsed >= 12 ? 'PM' : 'AM'}`;

  switch (action.type) {
    case 'request_start_work': {
      const isQueued = !isOnlineSync;
      const requestedAt = timeString;

      const newEvents = [...baseState.events];
      const newNotifs = [...baseState.notifications];

      if (isQueued) {
        newEvents.push({
          id: `evt-${action.id}`,
          timestamp: requestedAt,
          relativeHours: currentElapsed,
          actor: 'Provider',
          title: 'Start Work Request Queued Offline',
          description:
            'Provider tapped "Start work". Device is offline. Request queued locally on device and will transmit to Priya Sharma or Ananya once signal connects.',
          category: 'status',
        });
      } else {
        newEvents.push({
          id: `evt-${action.id}`,
          timestamp: requestedAt,
          relativeHours: currentElapsed,
          actor: 'Provider',
          title: 'Start Work Requested by Provider',
          description:
            'Provider Ravi Kumar tapped "Start work". Sent approval request to customer Priya Sharma and named on-site person Ananya.',
          category: 'status',
        });
        newNotifs.push({
          id: `notif-${action.id}-cust`,
          recipient: 'customer',
          channel: 'push',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Provider Ready to Start Work',
          body: 'Ravi Kumar is on site and has requested your approval to start work on Kitchen Sink Repair.',
        });
        newNotifs.push({
          id: `notif-${action.id}-contact`,
          recipient: 'contact',
          channel: 'sms',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Consarc: Work Start Approval Request',
          body: `Ravi requested approval to start work. Open link: consarc.ai/review/${baseState.contactLinkToken}`,
        });
      }

      const next: JobState = {
        ...baseState,
        startWorkStatus: 'requested',
        startWorkRequestedAt: requestedAt,
        events: newEvents,
        notifications: newNotifs,
      };
      return next;
    }

    case 'approve_start_work': {
      const { approver, approverName } = action.payload;
      const isQueued = !isOnlineSync;
      const approvedAt = timeString;
      const approverTitle = approver === 'contact' ? 'On-site Contact' : 'Customer';
      const displayName = approverName || (approver === 'contact' ? 'Ananya' : 'Priya Sharma');

      const newEvents = [...baseState.events];
      const newNotifs = [...baseState.notifications];

      if (isQueued) {
        newEvents.push({
          id: `evt-${action.id}`,
          timestamp: approvedAt,
          relativeHours: currentElapsed,
          actor: approverTitle,
          title: 'Start of Work Approved (Queued Offline)',
          description: `${displayName} approved start of work offline. Will synchronize with provider as soon as signal connects.`,
          category: 'status',
        });
      } else {
        newEvents.push({
          id: `evt-${action.id}`,
          timestamp: approvedAt,
          relativeHours: currentElapsed,
          actor: approverTitle,
          title: 'Start of Work Approved',
          description: `${displayName} approved work to start. Provider can now perform work, add extra work if needed, and complete the job. "Report job not done" is no longer available to either side.`,
          category: 'status',
        });
        newNotifs.push({
          id: `notif-${action.id}-prov`,
          recipient: 'provider',
          channel: 'sms',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Work Start Approved',
          body: `${displayName} approved start of work. You can now proceed with tasks, add extra work, or submit completion.`,
        });
      }

      const next: JobState = {
        ...baseState,
        startWorkStatus: 'approved',
        startWorkApprovedAt: approvedAt,
        startWorkApprovedBy: approver,
        events: newEvents,
        notifications: newNotifs,
      };
      return next;
    }

    case 'submit_completion': {
      const { beforePhotoUrl, afterPhotoUrl, taskCompletions } = action.payload;
      const isQueued = !isOnlineSync;
      const submittedAt = timeString;

      const tasksEvidence: TaskCompletionEvidence[] =
        taskCompletions && taskCompletions.length > 0
          ? taskCompletions
          : baseState.bookedTasks.map((t, idx) => ({
              taskId: t.id,
              taskName: t.name,
              beforePhotoUrl: idx === 0 ? SAMPLE_IMAGES.task1Before : SAMPLE_IMAGES.task2Before,
              afterPhotoUrl: idx === 0 ? SAMPLE_IMAGES.task1After : SAMPLE_IMAGES.task2After,
            }));

      const completion: CompletionData = {
        beforePhotoUrl: beforePhotoUrl || tasksEvidence[0]?.beforePhotoUrl || SAMPLE_IMAGES.beforeWork,
        afterPhotoUrl: afterPhotoUrl || tasksEvidence[0]?.afterPhotoUrl || SAMPLE_IMAGES.afterWork,
        taskCompletions: tasksEvidence,
        submittedAtTap: submittedAt,
        platformReceiptAt: isQueued ? null : submittedAt,
        reviewDeadlineAt: isQueued ? null : 'Next day 11:30 AM (24h window)',
        isQueuedOffline: isQueued,
      };

      const newEvents = [...baseState.events];
      const newNotifs = [...baseState.notifications];

      if (isQueued) {
        newEvents.push({
          id: `evt-${action.id}`,
          timestamp: submittedAt,
          relativeHours: currentElapsed,
          actor: 'Provider',
          title: 'Completion Queued Offline',
          description: 'Provider captured 2 required photos. Device offline. Status: "Completion queued offline". 24h review timer has NOT started.',
          category: 'status',
        });
      } else {
        newEvents.push({
          id: `evt-${action.id}`,
          timestamp: submittedAt,
          relativeHours: currentElapsed,
          actor: 'Provider',
          title: 'Completion Received by Platform',
          description: 'Platform verified 2 required photos. Job status set to "In review". 24-hour customer review window has started.',
          category: 'status',
        });
        newNotifs.push({
          id: `notif-${action.id}-cust`,
          recipient: 'customer',
          channel: 'push',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Job Completed — 24h Review Window Started',
          body: 'Ravi Kumar completed Kitchen Sink Repair. Review photos and confirm or report an issue within 24 hours.',
        });
        newNotifs.push({
          id: `notif-${action.id}-contact`,
          recipient: 'contact',
          channel: 'sms',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Consarc: Job Review Link for Ananya',
          body: `Ravi completed work. Single-use review link: consarc.ai/review/${baseState.contactLinkToken}`,
        });
      }

      const next: JobState = {
        ...baseState,
        coreStatus: isQueued ? 'completion_queued_offline' : 'in_review',
        completion,
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'request_extra_work': {
      const isQueued = !isOnlineSync;
      let itemsList: ExtraWorkItem[] = [];
      if (action.payload.items && Array.isArray(action.payload.items) && action.payload.items.length > 0) {
        itemsList = action.payload.items.map((it: any, idx: number) => ({
          id: it.id || `extra-item-${action.id}-${idx + 1}`,
          description: it.description || it.desc || 'Additional scope item',
          price: Number(it.price) || 0,
          reason: it.reason || 'Discovered during work',
          photoUrl: it.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered,
        }));
      } else {
        const { desc, price, reason, photoUrl } = action.payload;
        itemsList = [
          {
            id: `extra-item-${action.id}-1`,
            description: desc || 'Additional pipe replacement',
            price: Number(price) || 0,
            reason: reason || 'A damaged pipe was discovered during the job.',
            photoUrl: photoUrl || SAMPLE_IMAGES.extraWorkDiscovered,
          },
        ];
      }

      const totalItemsPrice = itemsList.reduce((acc, it) => acc + it.price, 0);
      const summaryDesc =
        itemsList.length === 1
          ? itemsList[0].description
          : `${itemsList.length} items (${itemsList.map((i) => i.description).join(', ')})`;

      const extra: ExtraWorkRequest = {
        id: `extra-${action.id}`,
        items: itemsList,
        totalPrice: totalItemsPrice,
        description: summaryDesc,
        price: totalItemsPrice,
        reason: itemsList[0]?.reason || 'Discovered on site',
        photoUrl: itemsList[0]?.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered,
        requestedAt: '10:45 AM',
        status: isQueued ? 'queued_offline' : 'awaiting_approval',
        queuedOffline: isQueued,
      };

      const newEvents = [...baseState.events];
      const newNotifs = [...baseState.notifications];

      if (isQueued) {
        newEvents.push({
          id: `evt-${action.id}`,
          timestamp: '10:45 AM',
          relativeHours: currentElapsed,
          actor: 'Provider',
          title: 'Extra Work Queued Offline (Not Sent)',
          description: `Provider entered ${itemsList.length} extra work item${itemsList.length > 1 ? 's' : ''} (total ₹${totalItemsPrice}). Stored locally: "Not sent — will send when connected". Customer not notified.`,
          category: 'status',
        });
      } else {
        newEvents.push({
          id: `evt-${action.id}`,
          timestamp: '10:45 AM',
          relativeHours: currentElapsed,
          actor: 'Provider',
          title: 'Extra Work Request Sent for Prior Approval',
          description: `Provider requested ₹${totalItemsPrice} across ${itemsList.length} extra work item${itemsList.length > 1 ? 's' : ''}: ${itemsList.map((i) => `"${i.description}" (₹${i.price})`).join(', ')}. Awaiting customer / contact approval before work begins.`,
          category: 'rule',
        });
        newNotifs.push({
          id: `notif-${action.id}-cust`,
          recipient: 'customer',
          channel: 'push',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Action Required: Extra Work Request',
          body: `Ravi Kumar requested ₹${totalItemsPrice} for ${itemsList.length} extra item${itemsList.length > 1 ? 's' : ''}. Tap to review and approve before work starts.`,
        });
        newNotifs.push({
          id: `notif-${action.id}-contact`,
          recipient: 'contact',
          channel: 'sms',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Consarc: Extra Work Approval Request',
          body: `On-site link: Ravi requested ₹${totalItemsPrice} for extra work (${itemsList.length} items). Review at consarc.ai/review/${baseState.contactLinkToken}`,
        });
      }

      const next: JobState = {
        ...baseState,
        extraWork: extra,
        extraWorkStatus: extra.status,
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'respond_extra_work': {
      const { approve, responder } = action.payload;
      if (!baseState.extraWork) return baseState;
      const responderLabel = responder === 'contact' ? 'On-site Contact (Ananya)' : 'Customer (Priya Sharma)';
      const newStatus: ExtraWorkStatus = approve ? 'approved' : 'declined';
      const updatedExtra: ExtraWorkRequest = {
        ...baseState.extraWork,
        status: newStatus,
        respondedBy: responder,
        respondedAt: '11:00 AM',
      };

      const extraTotal = baseState.extraWork.totalPrice || baseState.extraWork.price;
      const itemsCount = baseState.extraWork.items?.length || 1;
      const newPayable = approve
        ? baseState.financials.baseBookingTotal + extraTotal
        : baseState.financials.baseBookingTotal;

      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}`,
          timestamp: '11:00 AM',
          relativeHours: currentElapsed,
          actor: responder === 'contact' ? ('On-site Contact' as const) : ('Customer' as const),
          title: approve ? 'Extra Work Approved' : 'Extra Work Declined',
          description: `${responderLabel} ${approve ? 'approved' : 'declined'} ₹${extraTotal} for ${itemsCount} extra work item${itemsCount > 1 ? 's' : ''}. ${
            approve ? `New payable total is ₹${newPayable}.` : `Payable total remains base ₹${baseState.financials.baseBookingTotal}.`
          }`,
          category: 'financial' as const,
        },
      ];

      const newNotifs = [
        ...baseState.notifications,
        {
          id: `notif-${action.id}`,
          recipient: 'provider' as const,
          channel: 'sms' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: approve ? 'Extra Work Approved' : 'Extra Work Declined',
          body: `${responderLabel} has ${approve ? 'approved' : 'declined'} the ₹${extraTotal} extra work request (${itemsCount} items).`,
        },
      ];

      const next: JobState = {
        ...baseState,
        extraWork: updatedExtra,
        extraWorkStatus: newStatus,
        contactLinkUsed: responder === 'contact' ? true : baseState.contactLinkUsed,
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'confirm_completion': {
      const { confirmedBy } = action.payload;
      if (baseState.dispute && baseState.dispute.disputedAmount > 0) {
        return baseState;
      }
      const actorLabel = confirmedBy === 'contact' ? 'On-site Contact (Ananya)' : 'Customer (Priya Sharma)';
      const payable = baseState.financials.payableTotal;

      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}-1`,
          timestamp: '11:45 AM',
          relativeHours: currentElapsed,
          actor: confirmedBy === 'contact' ? ('On-site Contact' as const) : ('Customer' as const),
          title: 'Job Completion Confirmed by Customer',
          description: `${actorLabel} inspected and confirmed work. Payout initiated within 5 minutes for ₹${payable}.`,
          category: 'financial' as const,
        },
        {
          id: `evt-${action.id}-2`,
          timestamp: '11:45 AM',
          relativeHours: currentElapsed,
          actor: 'System Rule' as const,
          title: 'Payout Initiated to Provider',
          description: `Full payout of ₹${payable} initiated to Ravi Kumar's bank account (standard settlement batch). Status: "Payout initiated".`,
          category: 'financial' as const,
        },
      ];

      const newNotifs = [
        ...baseState.notifications,
        {
          id: `notif-${action.id}`,
          recipient: 'provider' as const,
          channel: 'sms' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Payout Initiated: ₹${payable}`,
          body: `Customer confirmed job completion. Payout of ₹${payable} has been initiated to your registered account.`,
        },
      ];

      const next: JobState = {
        ...baseState,
        coreStatus: 'confirmed',
        payoutStatus: 'initiated_full',
        contactLinkUsed: confirmedBy === 'contact' ? true : baseState.contactLinkUsed,
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'report_cannot_complete_provider': {
      const { reason, photos } = action.payload;
      const totalPayable = baseState.financials.payableTotal;
      const providerPhotos = photos && photos.filter(Boolean).length > 0 ? photos.filter(Boolean) : [SAMPLE_IMAGES.providerPhoto1, SAMPLE_IMAGES.providerPhoto2];

      const report: IncompleteJobReport = {
        initialReporter: 'provider',
        reportedBy: 'provider',
        reason,
        providerReason: reason,
        providerReportedAt: '11:15 AM',
        providerPhotos,
        responsibility: 'customer',
        initiatedRefundAmount: Math.max(0, totalPayable - 500),
        initiatedVisitFeeAmount: 500,
        status: 'pending_24h_challenge',
        challenged: false,
        challengeHoursRemaining: 24,
      };

      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}-1`,
          timestamp: '11:15 AM',
          relativeHours: currentElapsed,
          actor: 'Provider' as const,
          title: 'Provider Marked Job Not Completed',
          description: `Ravi Kumar marked job not completed: "${reason}". 2 photos attached. Claimed ₹500 Fixed Visit Fee.`,
          category: 'status' as const,
        },
        {
          id: `evt-${action.id}-2`,
          timestamp: '11:15 AM',
          relativeHours: currentElapsed,
          actor: 'System Rule' as const,
          title: 'Visit Fee Refund Requested (24h Customer Challenge Window)',
          description: `Provider claimed ₹500 visit fee; remaining ₹1,500 queued for customer refund. Customer has 24 hours to challenge with counter-photos. Only if challenged does it escalate to Support.`,
          category: 'rule' as const,
        },
      ];

      const newNotifs = [
        ...baseState.notifications,
        {
          id: `notif-${action.id}`,
          recipient: 'customer' as const,
          channel: 'push' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Provider Marked Job Not Completed',
          body: `Provider reported unable to finish ("${reason}") with 2 photos and requested ₹500 visit fee. ₹1,500 refund queued. You have 24h to challenge if provider was responsible.`,
        },
      ];

      const next: JobState = {
        ...baseState,
        coreStatus: 'incomplete_reported',
        incompleteReport: report,
        dispute: null,
        disputeStatus: 'none',
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'report_job_not_done_customer': {
      const { reason, photos } = action.payload;
      const totalPayable = baseState.financials.payableTotal;
      const customerPhotos = photos && photos.filter(Boolean).length > 0 ? photos.filter(Boolean) : [SAMPLE_IMAGES.customerPhoto1, SAMPLE_IMAGES.customerPhoto2];

      const report: IncompleteJobReport = {
        initialReporter: 'customer',
        reportedBy: 'customer',
        reason,
        customerReason: reason,
        customerReportedAt: '11:20 AM',
        customerPhotos,
        responsibility: 'provider',
        initiatedRefundAmount: totalPayable,
        initiatedVisitFeeAmount: 0,
        status: 'pending_24h_challenge',
        challenged: false,
        challengeHoursRemaining: 24,
      };

      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}-1`,
          timestamp: '11:20 AM',
          relativeHours: currentElapsed,
          actor: 'Customer' as const,
          title: 'Customer Marked Job Not Completed',
          description: `Customer marked job as not completed: "${reason}". 2 photos attached. Full refund request initiated.`,
          category: 'status' as const,
        },
        {
          id: `evt-${action.id}-2`,
          timestamp: '11:20 AM',
          relativeHours: currentElapsed,
          actor: 'System Rule' as const,
          title: 'Full Refund Request Initiated (Money Withheld, 24h Window)',
          description: `Full refund of ₹${totalPayable} queued. Money withheld on provider screen. Provider has 24 hours to challenge with counter-photos. Only if challenged does it go to Support Dashboard.`,
          category: 'rule' as const,
        },
      ];

      const newNotifs = [
        ...baseState.notifications,
        {
          id: `notif-${action.id}`,
          recipient: 'provider' as const,
          channel: 'push' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Job Marked Not Completed: Refund Initiated',
          body: `Customer marked job not completed ("${reason}") with 2 photos. Escrow money withheld. You have 24 hours to challenge stating customer was responsible.`,
        },
      ];

      const next: JobState = {
        ...baseState,
        coreStatus: 'incomplete_reported',
        incompleteReport: report,
        dispute: null,
        disputeStatus: 'none',
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'provider_submit_perspective': {
      if (!baseState.incompleteReport) return baseState;
      const { perspectiveReason, photos } = action.payload;
      const providerPhotos = photos && photos.filter(Boolean).length > 0 ? photos.filter(Boolean) : baseState.incompleteReport.providerPhotos || [SAMPLE_IMAGES.providerPhoto1, SAMPLE_IMAGES.providerPhoto2];

      const updatedReport: IncompleteJobReport = {
        ...baseState.incompleteReport,
        reportedBy: 'both',
        providerPerspective: perspectiveReason,
        providerReason: perspectiveReason,
        providerPhotos,
        responsibility: 'conflicting',
        status: 'challenged_escalated_to_support',
        challenged: true,
        challengedBy: 'provider',
        challengeReason: perspectiveReason,
        challengedAt: '11:45 AM',
      };

      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}-1`,
          timestamp: '11:45 AM',
          relativeHours: currentElapsed,
          actor: 'Provider' as const,
          title: 'Provider Challenged Non-Completion Claim',
          description: `Ravi Kumar challenged customer claim: "${perspectiveReason}". 2 photos attached stating customer responsibility.`,
          category: 'status' as const,
        },
        {
          id: `evt-${action.id}-2`,
          timestamp: '11:45 AM',
          relativeHours: currentElapsed,
          actor: 'System Rule' as const,
          title: 'Claim Challenged: Escalated to Support Operations Dashboard',
          description: 'Rule: Non-completion claim was challenged. Responsibility is contested. All 4 photos and statements sent to Support Dashboard for human adjudication.',
          category: 'support' as const,
        },
      ];

      const newNotifs = [
        ...baseState.notifications,
        {
          id: `notif-${action.id}`,
          recipient: 'customer' as const,
          channel: 'push' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Claim Challenged: Escalated to Support',
          body: `Provider challenged your claim with 2 photos: "${perspectiveReason}". Case routed to Support Dashboard for review.`,
        },
      ];

      const next: JobState = {
        ...baseState,
        incompleteReport: updatedReport,
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'contest_visit_fee': {
      if (!baseState.incompleteReport) return baseState;
      const { reason, photos } = action.payload;
      const customerPhotos = photos && photos.filter(Boolean).length > 0 ? photos.filter(Boolean) : baseState.incompleteReport.customerPhotos || [SAMPLE_IMAGES.customerPhoto1, SAMPLE_IMAGES.customerPhoto2];

      const updatedReport: IncompleteJobReport = {
        ...baseState.incompleteReport,
        reportedBy: 'both',
        customerReason: reason,
        customerPhotos,
        visitFeeContested: true,
        visitFeeContestReason: reason,
        responsibility: 'conflicting',
        status: 'challenged_escalated_to_support',
        challenged: true,
        challengedBy: 'customer',
        challengeReason: reason,
        challengedAt: '11:45 AM',
      };

      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}-1`,
          timestamp: '11:45 AM',
          relativeHours: currentElapsed,
          actor: 'Customer' as const,
          title: 'Customer Challenged Fixed Visit Fee',
          description: `Customer challenged visit fee: "${reason}". 2 photos attached stating provider responsibility.`,
          category: 'status' as const,
        },
        {
          id: `evt-${action.id}-2`,
          timestamp: '11:45 AM',
          relativeHours: currentElapsed,
          actor: 'System Rule' as const,
          title: 'Visit Fee Challenged: Escalated to Support Operations Dashboard',
          description: 'Rule: Customer challenged the visit fee claim. Responsibility is disputed. Case and all 4 photos sent to Support Dashboard for human adjudication.',
          category: 'support' as const,
        },
      ];

      const newNotifs = [
        ...baseState.notifications,
        {
          id: `notif-${action.id}`,
          recipient: 'provider' as const,
          channel: 'push' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Customer Challenged Visit Fee',
          body: `Customer challenged the ₹500 fee with 2 photos: "${reason}". Case escalated to Support Dashboard for review.`,
        },
      ];

      const next: JobState = {
        ...baseState,
        incompleteReport: updatedReport,
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'accept_incomplete_settlement': {
      if (!baseState.incompleteReport) return baseState;
      const { acceptedBy } = action.payload;
      const inc = baseState.incompleteReport;

      const updatedReport: IncompleteJobReport = {
        ...inc,
        status: 'unchallenged_finalized',
        challengeHoursRemaining: 0,
      };

      const actorName = acceptedBy === 'customer' ? 'Customer (Priya Sharma)' : 'Provider (Ravi Kumar)';
      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}`,
          timestamp: '12:00 PM',
          relativeHours: currentElapsed,
          actor: acceptedBy === 'customer' ? ('Customer' as const) : ('Provider' as const),
          title: 'Refund Settlement Accepted without Challenge',
          description: `${actorName} accepted the settlement terms. Refund of ₹${inc.initiatedRefundAmount} finalized to customer${
            inc.initiatedVisitFeeAmount > 0 ? ` and ₹${inc.initiatedVisitFeeAmount} fee released to provider.` : '.'
          }`,
          category: 'financial' as const,
        },
      ];

      const next: JobState = {
        ...baseState,
        incompleteReport: updatedReport,
        events: newEvents,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'raise_dispute': {
      const {
        disputedTaskIds,
        disputeExtraWork,
        description,
        reporter,
        taskDisputes,
        customerPhotos,
        reasonSelected,
        customReason,
      } = action.payload;

      const totalPayable = baseState.financials.payableTotal;
      let disputedAmount = 0;
      baseState.bookedTasks.forEach((t) => {
        if (disputedTaskIds.includes(t.id)) disputedAmount += t.price;
      });
      if (baseState.extraWork && baseState.extraWork.status === 'approved') {
        const extraItems =
          baseState.extraWork.items && baseState.extraWork.items.length > 0
            ? baseState.extraWork.items
            : [
                {
                  id: baseState.extraWork.id,
                  description: baseState.extraWork.description,
                  price: baseState.extraWork.price,
                  reason: baseState.extraWork.reason,
                  photoUrl: baseState.extraWork.photoUrl,
                },
              ];
        extraItems.forEach((extraItem) => {
          if (disputedTaskIds.includes(extraItem.id) || (disputeExtraWork && !disputedTaskIds.some((id: string) => extraItems.map(ei => ei.id).includes(id)))) {
            disputedAmount += extraItem.price;
          }
        });
      }
      if (disputedAmount <= 0) disputedAmount = totalPayable;
      const undisputedAmount = Math.max(0, totalPayable - disputedAmount);

      const reporterLabel = reporter === 'contact' ? 'On-site Contact (Ananya)' : 'Customer (Priya Sharma)';
      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}-1`,
          timestamp: '12:15 PM',
          relativeHours: currentElapsed,
          actor: reporter === 'contact' ? ('On-site Contact' as const) : ('Customer' as const),
          title: 'Work Problem Reported',
          description: `${reporterLabel} reported: "${reasonSelected || description}". Items disputed: ₹${disputedAmount} of ₹${totalPayable}.`,
          category: 'status' as const,
        },
        {
          id: `evt-${action.id}-2`,
          timestamp: '12:15 PM',
          relativeHours: currentElapsed,
          actor: 'System Rule' as const,
          title: 'Partial Payment Hold Enacted',
          description: `Rule: "Evidence settles disagreement." Disputed ₹${disputedAmount} held in escrow. Undisputed ₹${undisputedAmount} payout initiated immediately to provider.`,
          category: 'financial' as const,
        },
      ];

      const newNotifs = [...baseState.notifications];
      if (undisputedAmount > 0) {
        newNotifs.push({
          id: `notif-${action.id}`,
          recipient: 'provider' as const,
          channel: 'sms' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Partial Payout Initiated: ₹${undisputedAmount}`,
          body: `₹${undisputedAmount} undisputed payment has been initiated. ₹${disputedAmount} is temporarily held pending review of reported issue.`,
        });
      }

      const dispute: DisputeData = {
        disputedTaskIds,
        disputeExtraWork,
        problemDescription: description,
        reason: reasonSelected,
        customReason,
        disputedAmount,
        undisputedAmount,
        reportedAt: '12:15 PM',
        reportedBy: reporter,
        taskDisputes: taskDisputes && taskDisputes.length > 0 ? taskDisputes : undefined,
        customerPhotos: customerPhotos && customerPhotos.length > 0 ? customerPhotos : undefined,
        ruleApplied: {
          code: 'RULE_PARTIAL_ESCROW_HOLD',
          name: 'Partial Dispute Hold & Undisputed Payout Release',
          explanation: `Customer disputed ₹${disputedAmount}. Platform held exactly ₹${disputedAmount} while immediately releasing undisputed ₹${undisputedAmount} to provider.`,
          outcome: 'partial_payout_hold',
          heldAmount: disputedAmount,
          releasedAmount: undisputedAmount,
          refundedAmount: 0,
        },
      };

      const next: JobState = {
        ...baseState,
        coreStatus: 'disputed',
        disputeStatus: 'active',
        payoutStatus: undisputedAmount > 0 ? 'initiated_partial' : 'stopped_for_dispute',
        dispute,
        contactLinkUsed: reporter === 'contact' ? true : baseState.contactLinkUsed,
        events: newEvents,
        notifications: newNotifs,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    case 'appeal_decision': {
      if (!baseState.dispute) return baseState;
      const { appealedBy, reason } = action.payload;
      const appellant = appealedBy === 'customer' ? 'Customer (Priya Sharma)' : 'Provider (Ravi Kumar)';
      const updatedDispute: DisputeData = {
        ...baseState.dispute,
        appealedBy,
        appealReason: reason,
        appealedAt: '01:30 PM',
      };

      const newEvents = [
        ...baseState.events,
        {
          id: `evt-${action.id}`,
          timestamp: '01:30 PM',
          relativeHours: currentElapsed,
          actor: appealedBy === 'customer' ? ('Customer' as const) : ('Provider' as const),
          title: 'Rule-Based Decision Appealed',
          description: `${appellant} appealed decision: "${reason}". Escalated to senior Support Agent review queue with full evidence packet.`,
          category: 'support' as const,
        },
      ];

      const next: JobState = {
        ...baseState,
        disputeStatus: 'appealed',
        dispute: updatedDispute,
        events: newEvents,
      };
      return { ...next, financials: computeFinancials(next) };
    }

    default:
      return baseState;
  }
};

interface JobContextType {
  state: JobState;
  persona: Persona;
  setPersona: (p: Persona) => void;
  resetDemo: () => void;
  toggleOffline: () => void;
  advanceClockTo: (hours: number) => void;
  reopenUsedContactLink: () => void;
  offlineQueue: QueuedOfflineAction[];
  isOffline: boolean;

  providerState: JobState;
  customerState: JobState;
  supportState: JobState;
  syncedState: JobState;

  // Flow 0: Start work
  requestStartWork: () => void;
  approveStartWork: (approver: 'customer' | 'contact') => void;

  // Flow 1: Extra work
  requestExtraWork: (
    itemsOrDesc:
      | Array<{ description: string; price: number; reason: string; photoUrl: string }>
      | string,
    price?: number,
    reason?: string,
    photoUrl?: string
  ) => void;
  sendQueuedExtraWork: () => void;
  respondExtraWork: (approve: boolean, responder: 'customer' | 'contact') => void;

  // Flow 2: Completion & Review
  submitCompletion: (
    beforePhotoUrl: string,
    afterPhotoUrl: string,
    taskCompletions?: TaskCompletionEvidence[]
  ) => void;
  restoreConnectionAndSync: () => void;
  confirmJobCompletion: (confirmedBy: 'customer' | 'contact') => void;

  // Flow 1 / Incomplete job (No reschedule; auto-refund with 24h challenge window)
  reportCannotCompleteProvider: (
    reason: string,
    wasCustomerResponsible?: boolean,
    photos?: string[]
  ) => void;
  reportJobNotDoneCustomer: (reason: string, photos?: string[]) => void;
  providerSubmitPerspective: (perspectiveReason: string, photos?: string[]) => void;
  contestVisitFee: (reason: string, photos?: string[]) => void;
  acceptIncompleteSettlement: (acceptedBy: 'customer' | 'provider') => void;
  fastForwardIncompleteChallengeWindow: () => void;

  // Flow 4: Disputes & Appeals & Support
  raiseDispute: (
    disputedTaskIds: string[],
    disputeExtraWork: boolean,
    description: string,
    reporter: 'customer' | 'contact',
    taskDisputes?: TaskDisputeEvidence[],
    customerPhotos?: string[],
    reasonSelected?: string,
    customReason?: string
  ) => void;
  appealDecision: (appealedBy: 'customer' | 'provider', reason: string) => void;
  recordSupportDisputeDecision: (
    outcome: 'release_to_provider' | 'refund_to_customer' | 'split',
    rationale: string,
    splitProvider?: number,
    splitCustomer?: number
  ) => void;
  recordSupportIncompleteDecision: (
    outcome: 'refund_to_customer' | 'release_to_provider',
    rationale: string
  ) => void;

  // Quick scenario loader for interview demonstration
  loadScenario: (scenarioId: number) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persona, setPersonaState] = useState<Persona>(() => {
    try {
      const saved = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (saved && ['customer', 'provider', 'support', 'contact'].includes(saved)) {
        return saved as Persona;
      }
    } catch {
      // Ignore
    }
    return 'customer';
  });

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [offlineQueue, setOfflineQueue] = useState<QueuedOfflineAction[]>(() => {
    try {
      const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [syncedState, setSyncedState] = useState<JobState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return getInitialState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(syncedState));
    } catch {}
  }, [syncedState]);

  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(offlineQueue));
    } catch {}
  }, [offlineQueue]);

  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(isOffline));
    } catch {}
  }, [isOffline]);

  const setPersona = (newPersona: Persona) => {
    setPersonaState(newPersona);
    try {
      localStorage.setItem(PERSONA_STORAGE_KEY, newPersona);
    } catch {}
  };

  const resetDemo = () => {
    const fresh = getInitialState();
    setSyncedState(fresh);
    setOfflineQueue([]);
    setIsOffline(false);
    setPersona('customer');
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(QUEUE_STORAGE_KEY);
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
      localStorage.setItem(PERSONA_STORAGE_KEY, 'customer');
    } catch {}
  };

  // Dispatch an action from an actor
  const dispatchAction = (
    actor: 'provider' | 'customer' | 'contact',
    type: string,
    payload: any,
    description: string
  ) => {
    const action: QueuedOfflineAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actor,
      type,
      payload,
      description,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (isOffline) {
      // Offline: action is queued locally
      setOfflineQueue((prev) => [...prev, action]);
    } else {
      // Online: applied directly to server synced state
      setSyncedState((prev) => applyActionToState(prev, action, true));
    }
  };

  const toggleOffline = () => {
    if (isOffline) {
      // Transitioning from NO SIGNAL (OFFLINE) to SIGNAL CONNECTED (ONLINE)
      // Automatically sync all queued actions!
      let nextState = syncedState;
      const count = offlineQueue.length;
      for (const act of offlineQueue) {
        nextState = applyActionToState(nextState, act, true);
      }

      const currentElapsed = nextState.simulatedElapsedHours;
      const timeString = `${10 + Math.floor(currentElapsed)}:${currentElapsed % 1 === 0 ? '00' : '30'} ${10 + currentElapsed >= 12 ? 'PM' : 'AM'}`;

      nextState = {
        ...nextState,
        isOffline: false,
        events: [
          ...nextState.events,
          {
            id: `evt-online-${Date.now()}`,
            timestamp: timeString,
            relativeHours: currentElapsed,
            actor: 'System Rule',
            title: 'Signal: Connected (Online)',
            description:
              count > 0
                ? `Network restored. ${count} offline action(s) synced to platform & shared across customer and provider portals.`
                : 'Network restored. Signal connected online.',
            category: 'status',
          },
        ],
      };
      nextState.financials = computeFinancials(nextState);

      setSyncedState(nextState);
      setOfflineQueue([]);
      setIsOffline(false);
    } else {
      // Transitioning from ONLINE to NO SIGNAL (OFFLINE)
      setIsOffline(true);
      const currentElapsed = syncedState.simulatedElapsedHours;
      const timeString = `${10 + Math.floor(currentElapsed)}:${currentElapsed % 1 === 0 ? '00' : '30'} ${10 + currentElapsed >= 12 ? 'PM' : 'AM'}`;

      setSyncedState((prev) => ({
        ...prev,
        events: [
          ...prev.events,
          {
            id: `evt-offline-${Date.now()}`,
            timestamp: timeString,
            relativeHours: currentElapsed,
            actor: 'System Rule',
            title: 'Simulate: No Signal (Offline)',
            description:
              'Network disconnected. Actions will queue locally on device and automatically sync once signal is restored.',
            category: 'status',
          },
        ],
      }));
    }
  };

  // Derive persona perspectives
  const providerState = useMemo(() => {
    let s: JobState = { ...syncedState, isOffline };
    // Apply Provider's offline actions so Provider sees their own updates immediately
    const providerActions = offlineQueue.filter((a) => a.actor === 'provider');
    for (const act of providerActions) {
      s = applyActionToState(s, act, false);
    }
    s.isOffline = isOffline;
    return s;
  }, [syncedState, offlineQueue, isOffline]);

  const customerState = useMemo(() => {
    let s: JobState = { ...syncedState, isOffline };
    // Apply Customer / Contact offline actions so Customer and Contact Link see their own updates immediately
    const customerActions = offlineQueue.filter(
      (a) => a.actor === 'customer' || a.actor === 'contact'
    );
    for (const act of customerActions) {
      s = applyActionToState(s, act, false);
    }
    s.isOffline = isOffline;
    return s;
  }, [syncedState, offlineQueue, isOffline]);

  const supportState = useMemo(() => {
    // Support agent is on the platform server desk, unaffected by mobile device signal
    return { ...syncedState, isOffline: false };
  }, [syncedState]);

  const effectiveState = useMemo(() => {
    if (persona === 'provider') return providerState;
    if (persona === 'customer' || persona === 'contact') return customerState;
    return supportState;
  }, [persona, providerState, customerState, supportState]);

  // ACTION METHODS
  const requestStartWork = () => {
    dispatchAction('provider', 'request_start_work', {}, 'Provider requested to start work');
  };

  const approveStartWork = (approver: 'customer' | 'contact') => {
    const approverName = approver === 'contact' ? 'Ananya' : 'Priya Sharma';
    dispatchAction(
      approver,
      'approve_start_work',
      { approver, approverName },
      `Start of work approved by ${approverName}`
    );
  };

  const requestExtraWork = (
    itemsOrDesc:
      | Array<{ description: string; price: number; reason: string; photoUrl: string }>
      | string,
    price?: number,
    reason?: string,
    photoUrl?: string
  ) => {
    if (Array.isArray(itemsOrDesc)) {
      const total = itemsOrDesc.reduce((s, it) => s + Number(it.price || 0), 0);
      dispatchAction(
        'provider',
        'request_extra_work',
        { items: itemsOrDesc, price: total },
        `Extra work: ${itemsOrDesc.length} items (total ₹${total})`
      );
    } else {
      dispatchAction(
        'provider',
        'request_extra_work',
        { desc: itemsOrDesc, price: price || 0, reason: reason || '', photoUrl: photoUrl || '' },
        `Extra work: ${itemsOrDesc} (₹${price})`
      );
    }
  };

  const sendQueuedExtraWork = () => {
    toggleOffline();
  };

  const respondExtraWork = (approve: boolean, responder: 'customer' | 'contact') => {
    dispatchAction(responder, 'respond_extra_work', { approve, responder }, `${responder === 'contact' ? 'Contact' : 'Customer'} ${approve ? 'approved' : 'declined'} extra work`);
  };

  const submitCompletion = (
    beforePhotoUrl: string,
    afterPhotoUrl: string,
    taskCompletions?: TaskCompletionEvidence[]
  ) => {
    dispatchAction('provider', 'submit_completion', { beforePhotoUrl, afterPhotoUrl, taskCompletions }, 'Completion photos submitted');
  };

  const restoreConnectionAndSync = () => {
    toggleOffline();
  };

  const confirmJobCompletion = (confirmedBy: 'customer' | 'contact') => {
    dispatchAction(confirmedBy, 'confirm_completion', { confirmedBy }, `Job completed confirmed by ${confirmedBy}`);
  };

  const reportCannotCompleteProvider = (
    reason: string,
    wasCustomerResponsible: boolean = true,
    photos?: string[]
  ) => {
    dispatchAction('provider', 'report_cannot_complete_provider', { reason, wasCustomerResponsible, photos }, `Provider reported cannot complete: ${reason}`);
  };

  const reportJobNotDoneCustomer = (reason: string, photos?: string[]) => {
    dispatchAction('customer', 'report_job_not_done_customer', { reason, photos }, `Customer reported job not done: ${reason}`);
  };

  const providerSubmitPerspective = (perspectiveReason: string, photos?: string[]) => {
    dispatchAction('provider', 'provider_submit_perspective', { perspectiveReason, photos }, `Provider submitted perspective: ${perspectiveReason}`);
  };

  const contestVisitFee = (reason: string, photos?: string[]) => {
    dispatchAction('customer', 'contest_visit_fee', { reason, photos }, `Customer contested visit fee: ${reason}`);
  };

  const acceptIncompleteSettlement = (acceptedBy: 'customer' | 'provider') => {
    dispatchAction(acceptedBy, 'accept_incomplete_settlement', { acceptedBy }, `Incomplete settlement accepted by ${acceptedBy}`);
  };

  const reopenUsedContactLink = () => {
    setSyncedState((prev) => ({
      ...prev,
      contactLinkUsed: false,
    }));
  };

  const advanceClockTo = (targetHours: number) => {
    setSyncedState((prev) => {
      if (targetHours <= prev.simulatedElapsedHours) return prev;

      const newEvents = [...prev.events];
      const newNotifs = [...prev.notifications];
      const oldH = prev.simulatedElapsedHours;

      if (oldH < 1 && targetHours >= 1 && prev.coreStatus === 'in_review' && !prev.dispute) {
        newEvents.push({
          id: `evt-clk-1`,
          timestamp: '11:00 AM',
          relativeHours: 1,
          actor: 'System Rule',
          title: '1-Hour Review Reminder Triggered',
          description: '1 hour elapsed since completion. 1st notification sent to customer Priya Sharma and on-site contact Ananya.',
          category: 'notification',
        });
      }

      if (oldH < 12 && targetHours >= 12 && prev.coreStatus === 'in_review' && !prev.dispute) {
        newEvents.push({
          id: `evt-clk-12`,
          timestamp: '10:00 PM',
          relativeHours: 12,
          actor: 'System Rule',
          title: '12-Hour Midpoint Warning Triggered',
          description: '12 hours elapsed. Reminder sent: 12 hours remaining to inspect work before automatic payment release.',
          category: 'notification',
        });
      }

      if (oldH < 23 && targetHours >= 23 && prev.coreStatus === 'in_review' && !prev.dispute) {
        newEvents.push({
          id: `evt-clk-23`,
          timestamp: '09:00 AM',
          relativeHours: 23,
          actor: 'System Rule',
          title: 'Final 1-Hour Warning Before Auto-Release',
          description: '23 hours elapsed. Urgent push/SMS sent: Payout will auto-release in 60 minutes if unchallenged.',
          category: 'notification',
        });
      }

      let newStatus = prev.coreStatus;
      let newPayout = prev.payoutStatus;

      // 24 hours elapsed in review -> Auto release
      if (targetHours >= 24 && prev.coreStatus === 'in_review' && !prev.dispute) {
        newStatus = 'released';
        newPayout = 'completed';
        const total = prev.financials.payableTotal;

        newEvents.push({
          id: `evt-clk-24`,
          timestamp: '10:00 AM (Next Day)',
          relativeHours: 24,
          actor: 'System Rule',
          title: '24h Timer Expired: Automated Payout Released',
          description: `Platform verified 24h review window expired with zero complaints. Full ₹${total} released to Ravi Kumar.`,
          category: 'financial',
        });
        newNotifs.push({
          id: `notif-clk-24`,
          recipient: 'provider',
          channel: 'sms',
          timestamp: '10:00 AM',
          title: 'Payout Auto-Released: ₹' + total,
          body: `24 hours elapsed without issue report. Payout of ₹${total} released to your account.`,
        });
      }

      // 24 hours elapsed in incomplete challenge window -> Auto finalize unchallenged
      let updatedInc = prev.incompleteReport;
      if (
        targetHours >= 24 &&
        prev.incompleteReport &&
        prev.incompleteReport.status === 'pending_24h_challenge' &&
        !prev.incompleteReport.challenged
      ) {
        const isFullRefund = prev.incompleteReport.initiatedRefundAmount === prev.financials.payableTotal;
        updatedInc = {
          ...prev.incompleteReport,
          status: 'unchallenged_finalized',
          challengeHoursRemaining: 0,
        };
        newStatus = isFullRefund ? 'cancelled' : 'released';
        newPayout = isFullRefund ? 'none' : 'completed';

        newEvents.push({
          id: `evt-inc-24`,
          timestamp: '11:15 AM (Next Day)',
          relativeHours: 24,
          actor: 'System Rule',
          title: '24h Challenge Window Expired (Unchallenged Settlement Finalized)',
          description: `No challenge submitted within 24 hours. Settlement finalized: Refund of ₹${prev.incompleteReport.initiatedRefundAmount} processed to customer.`,
          category: 'financial',
        });
      }

      const next: JobState = {
        ...prev,
        simulatedElapsedHours: targetHours,
        coreStatus: newStatus,
        payoutStatus: newPayout,
        incompleteReport: updatedInc,
        events: newEvents,
        notifications: newNotifs,
      };

      return {
        ...next,
        financials: computeFinancials(next),
      };
    });
  };

  const fastForwardIncompleteChallengeWindow = () => {
    advanceClockTo(24);
  };

  const raiseDispute = (
    disputedTaskIds: string[],
    disputeExtraWork: boolean,
    description: string,
    reporter: 'customer' | 'contact',
    taskDisputes?: TaskDisputeEvidence[],
    customerPhotos?: string[],
    reasonSelected?: string,
    customReason?: string
  ) => {
    dispatchAction(
      reporter,
      'raise_dispute',
      {
        disputedTaskIds,
        disputeExtraWork,
        description,
        reporter,
        taskDisputes,
        customerPhotos,
        reasonSelected,
        customReason,
      },
      `Dispute reported by ${reporter}: ${reasonSelected || description}`
    );
  };

  const appealDecision = (appealedBy: 'customer' | 'provider', reason: string) => {
    dispatchAction(appealedBy, 'appeal_decision', { appealedBy, reason }, `Decision appealed by ${appealedBy}`);
  };

  // Support Agent directly adjudicates platform state
  const recordSupportDisputeDecision = (
    outcome: 'release_to_provider' | 'refund_to_customer' | 'split',
    rationale: string,
    splitProvider?: number,
    splitCustomer?: number
  ) => {
    setSyncedState((prev) => {
      if (!prev.dispute) return prev;

      const disputed = prev.dispute.disputedAmount;
      const provAmt =
        outcome === 'split'
          ? splitProvider !== undefined ? splitProvider : Math.round(disputed / 2)
          : outcome === 'release_to_provider'
          ? disputed
          : 0;
      const custAmt =
        outcome === 'split'
          ? splitCustomer !== undefined ? splitCustomer : (disputed - provAmt)
          : outcome === 'refund_to_customer'
          ? disputed
          : 0;

      const updatedDispute: DisputeData = {
        ...prev.dispute,
        supportDecision: {
          outcome,
          rationale,
          providerAmount: provAmt,
          customerAmount: custAmt,
          splitProviderAmount: provAmt,
          splitCustomerAmount: custAmt,
          decidedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: 'Agent Vikram (Senior Support)',
        },
      };

      const outcomeDesc =
        outcome === 'release_to_provider'
          ? `Released full disputed ₹${disputed} to provider Ravi Kumar.`
          : outcome === 'refund_to_customer'
          ? `Refunded full disputed ₹${disputed} to customer Priya Sharma.`
          : `50-50 Split: ₹${provAmt} released to provider, ₹${custAmt} refunded to customer.`;

      const newEvents = [
        ...prev.events,
        {
          id: `evt-sup-${Date.now()}`,
          timestamp: '02:00 PM',
          relativeHours: prev.simulatedElapsedHours,
          actor: 'Support Agent' as const,
          title: 'Support Decision Recorded on Disputed Problem',
          description: `Agent Vikram reviewed evidence. Outcome: ${outcomeDesc} Rationale: ${rationale}`,
          category: 'support' as const,
        },
      ];

      const newNotifs = [
        ...prev.notifications,
        {
          id: `notif-sup-cust-${Date.now()}`,
          recipient: 'customer' as const,
          channel: 'push' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Dispute Resolved by Support',
          body: `Support reviewed your case: ${outcomeDesc}`,
        },
        {
          id: `notif-sup-prov-${Date.now()}`,
          recipient: 'provider' as const,
          channel: 'sms' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Dispute Resolved by Support',
          body: `Support reviewed JOB-1042: ${outcomeDesc}`,
        },
      ];

      const next: JobState = {
        ...prev,
        coreStatus: 'released',
        disputeStatus: 'resolved',
        payoutStatus: 'completed',
        dispute: updatedDispute,
        events: newEvents,
        notifications: newNotifs,
      };

      return {
        ...next,
        financials: computeFinancials(next),
      };
    });
  };

  const recordSupportIncompleteDecision = (
    outcome: 'refund_to_customer' | 'release_to_provider',
    rationale: string
  ) => {
    setSyncedState((prev) => {
      if (!prev.incompleteReport) return prev;

      const total = prev.financials.payableTotal;
      let providerAmount = 0;
      let customerAmount = 0;
      let responsibility: 'provider' | 'customer' = 'provider';

      if (outcome === 'refund_to_customer') {
        providerAmount = 0;
        customerAmount = total;
        responsibility = 'provider';
      } else {
        providerAmount = 500;
        customerAmount = Math.max(0, total - 500);
        responsibility = 'customer';
      }

      const updatedReport: IncompleteJobReport = {
        ...prev.incompleteReport,
        responsibility,
        status: 'support_resolved',
        supportDecision: {
          outcome,
          decidedResponsibility: responsibility,
          providerAmount,
          customerAmount,
          rationale,
          decidedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: 'Agent Vikram',
        },
      };

      const newEvents = [
        ...prev.events,
        {
          id: `evt-inc-sup-${Date.now()}`,
          timestamp: '02:00 PM',
          relativeHours: prev.simulatedElapsedHours,
          actor: 'Support Agent' as const,
          title: 'Support Adjudication Applied: Incomplete Case Resolved',
          description: `Agent Vikram resolved non-completion case: "${rationale}". Outcome: ${outcome === 'refund_to_customer' ? 'FULL REFUND TO CUSTOMER' : 'RELEASE VISIT FEE (₹500) TO PROVIDER & REFUND BALANCE'}. Customer Refund: ₹${customerAmount}, Provider Payout: ₹${providerAmount}.`,
          category: 'support' as const,
        },
      ];

      const newNotifs = [
        ...prev.notifications,
        {
          id: `notif-inc-cust-${Date.now()}`,
          recipient: 'customer' as const,
          channel: 'push' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Case Resolved by Support',
          body: `Support reviewed non-completion claim. ₹${customerAmount} refunded to your account.`,
        },
        {
          id: `notif-inc-prov-${Date.now()}`,
          recipient: 'provider' as const,
          channel: 'sms' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Case Resolved by Support',
          body: `Support resolved JOB-1042. Payout: ₹${providerAmount}.`,
        },
      ];

      const next: JobState = {
        ...prev,
        incompleteReport: updatedReport,
        coreStatus: (providerAmount > 0 ? 'released' : 'cancelled') as JobCoreStatus,
        payoutStatus: (providerAmount > 0 ? 'completed' : 'none') as PayoutStatus,
        events: newEvents,
        notifications: newNotifs,
      };

      return {
        ...next,
        financials: computeFinancials(next),
      };
    });
  };

  const loadScenario = (scenarioId: number) => {
    const base = getInitialState();

    switch (scenarioId) {
      case 1: {
        base.startWorkStatus = 'approved';
        base.startWorkApprovedAt = '10:20 AM';
        base.startWorkApprovedBy = 'customer';
        base.extraWork = {
          id: 'extra-1',
          items: [
            {
              id: 'extra-item-1',
              description: 'Additional pipe replacement',
              price: 400,
              reason: 'A damaged pipe was discovered during the job.',
              photoUrl: SAMPLE_IMAGES.extraWorkDiscovered,
            },
            {
              id: 'extra-item-2',
              description: 'High-pressure brass coupler',
              price: 250,
              reason: 'Corroded coupler required reinforced replacement.',
              photoUrl: SAMPLE_IMAGES.task1Before,
            },
          ],
          totalPrice: 650,
          description: 'Additional pipe replacement & High-pressure brass coupler',
          price: 650,
          reason: 'A damaged pipe and corroded coupler were discovered during the job.',
          photoUrl: SAMPLE_IMAGES.extraWorkDiscovered,
          requestedAt: '10:45 AM',
          status: 'approved',
          respondedBy: 'customer',
          respondedAt: '10:50 AM',
        };
        base.extraWorkStatus = 'approved';
        base.financials = {
          baseBookingTotal: 2000,
          payableTotal: 2650,
          amountPaidOrInitiated: 0,
          amountHeld: 0,
          amountRefunded: 0,
        };
        base.events.push({
          id: 'sc1-evt',
          timestamp: '10:50 AM',
          relativeHours: 0.5,
          actor: 'Customer',
          title: 'Extra Work Approved (₹650)',
          description: 'Priya Sharma approved 2 extra work items (total ₹650). Total payable updated from ₹2,000 to ₹2,650.',
          category: 'financial',
        });
        setSyncedState(base);
        setOfflineQueue([]);
        setIsOffline(false);
        setPersona('provider');
        break;
      }
      case 2: {
        base.startWorkStatus = 'approved';
        base.startWorkApprovedAt = '10:20 AM';
        base.startWorkApprovedBy = 'customer';
        base.extraWork = {
          id: 'extra-2',
          items: [
            {
              id: 'extra-item-1',
              description: 'Additional pipe replacement',
              price: 400,
              reason: 'A damaged pipe was discovered during the job.',
              photoUrl: SAMPLE_IMAGES.extraWorkDiscovered,
            },
          ],
          totalPrice: 400,
          description: 'Additional pipe replacement',
          price: 400,
          reason: 'A damaged pipe was discovered during the job.',
          photoUrl: SAMPLE_IMAGES.extraWorkDiscovered,
          requestedAt: '10:45 AM',
          status: 'declined',
          respondedBy: 'customer',
          respondedAt: '10:55 AM',
        };
        base.extraWorkStatus = 'declined';
        base.financials = {
          baseBookingTotal: 2000,
          payableTotal: 2000,
          amountPaidOrInitiated: 0,
          amountHeld: 0,
          amountRefunded: 0,
        };
        setSyncedState(base);
        setOfflineQueue([]);
        setIsOffline(false);
        setPersona('customer');
        break;
      }
      default:
        resetDemo();
        break;
    }
  };

  return (
    <JobContext.Provider
      value={{
        state: effectiveState,
        persona,
        setPersona,
        resetDemo,
        toggleOffline,
        advanceClockTo,
        reopenUsedContactLink,
        offlineQueue,
        isOffline,

        providerState,
        customerState,
        supportState,
        syncedState,

        requestStartWork,
        approveStartWork,
        requestExtraWork,
        sendQueuedExtraWork,
        respondExtraWork,
        submitCompletion,
        restoreConnectionAndSync,
        confirmJobCompletion,
        reportCannotCompleteProvider,
        reportJobNotDoneCustomer,
        providerSubmitPerspective,
        contestVisitFee,
        acceptIncompleteSettlement,
        fastForwardIncompleteChallengeWindow,
        raiseDispute,
        appealDecision,
        recordSupportDisputeDecision,
        recordSupportIncompleteDecision,
        loadScenario,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};
