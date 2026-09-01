import React from 'react';
import { Tooltip } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LikeOutlined,
  PlayCircleOutlined,
  SendOutlined,
  WarningOutlined,
} from '@ant-design/icons';

/** Maps a BudgetWorkflowStatus to the index of the "active" step (0-based). */
const STATUS_STEP = {
  DRAFT: 0,
  SUBMITTED: 1,
  COMMITTEE_REVIEW: 2,
  RECOMMENDED: 3,
  APPROVED: 4,
  RETURNED: 2, // shown at committee review step with amber colour
  REJECTED: 2, // shown at relevant step with red colour
};

const STEPS = [
  { label: 'Drafting', description: 'Prepare and validate the budget.', icon: <EditOutlined /> },
  {
    label: 'Submitted',
    description: 'Locked and awaiting committee review.',
    icon: <SendOutlined />,
  },
  {
    label: 'Committee Review',
    description: 'Committee reviewing and revising.',
    icon: <PlayCircleOutlined />,
  },
  {
    label: 'Recommended',
    description: 'Committee recommendation locked.',
    icon: <LikeOutlined />,
  },
  { label: 'Approved', description: 'Official approved budget.', icon: <CheckOutlined /> },
];

/**
 * Returns the visual state for each step given the current budget status.
 * state: 'completed' | 'current' | 'returned' | 'rejected' | 'pending'
 */
function getStepStates(status) {
  const activeIndex = STATUS_STEP[status] ?? 0;

  return STEPS.map((_, i) => {
    if (status === 'RETURNED' && i === activeIndex) return 'returned';
    if (status === 'REJECTED' && i === activeIndex) return 'rejected';
    if (i < activeIndex) return 'completed';
    if (i === activeIndex) return 'current';
    return 'pending';
  });
}

const STATE_STYLES = {
  completed: {
    circle: 'bg-[#582f08] border-[#582f08] text-white',
    label: 'text-[#51443b]',
    connector: 'bg-[#582f08]',
    icon: <CheckOutlined />,
  },
  current: {
    circle: 'bg-[#9D4D01] border-[#9D4D01] text-white ring-4 ring-[#ffdcc7]',
    label: 'text-[#9D4D01]',
    connector: 'bg-[#ead9cb]',
    icon: null,
  },
  returned: {
    circle: 'bg-[#f59e0b] border-[#f59e0b] text-white ring-4 ring-[#fef3c7]',
    label: 'text-[#b45309]',
    connector: 'bg-[#ead9cb]',
    icon: <WarningOutlined />,
  },
  rejected: {
    circle: 'bg-[#dc2626] border-[#dc2626] text-white ring-4 ring-[#fee2e2]',
    label: 'text-[#dc2626]',
    connector: 'bg-[#ead9cb]',
    icon: <CloseOutlined />,
  },
  pending: {
    circle: 'bg-[#f1e6e0] border-[#d6c3b7] text-[#84746a]',
    label: 'text-[#84746a]',
    connector: 'bg-[#ead9cb]',
    icon: null,
  },
};

const WorkflowStepper = ({ status = 'DRAFT', submittedAt, submittedBy, approvedAt, approvedBy, compact = false }) => {
  const states = getStepStates(status);

  const extraInfo = [
    null, // Draft — no extra
    submittedAt
      ? `${new Date(submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}${submittedBy ? ` · ${submittedBy}` : ''}`
      : null,
    null,
    null,
    approvedAt
      ? `${new Date(approvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}${approvedBy ? ` · ${approvedBy}` : ''}`
      : null,
  ];

  return (
    <div className={`overflow-x-auto ${compact ? 'py-0' : 'py-4'}`}>
      <div className={`flex items-start px-2 ${compact ? 'min-w-[520px] gap-4' : 'min-w-[760px]'}`}>
      {STEPS.map((step, i) => {
        const state = states[i];
        const isLast = i === STEPS.length - 1;
        const style = STATE_STYLES[state];
        const displayIcon =
          style.icon ??
          (state === 'current' || state === 'pending' ? step.icon : <CheckOutlined />);

        return (
          <React.Fragment key={step.label}>
            <Tooltip title={compact ? undefined : step.description}>
              <div className={`flex flex-col items-center cursor-default select-none ${compact ? 'min-w-[72px]' : 'min-w-[132px] flex-1'}`}>
                <div
                  className={`flex items-center justify-center rounded-full border shadow-sm transition-all ${compact ? 'h-8 w-8 text-sm' : 'h-11 w-11 text-base'} ${style.circle}`}
                >
                  {displayIcon}
                </div>
                <span
                  className={`mt-2 text-center font-semibold uppercase tracking-[0.14em] ${compact ? 'text-[9px]' : 'text-[11px]'} ${style.label}`}
                >
                  {compact ? step.label.split(' ')[0] : step.label}
                </span>
                {!compact && extraInfo[i] && (
                  <span className="mt-1 max-w-[108px] text-center text-[10px] leading-tight text-[#84746a]">
                    {extraInfo[i]}
                  </span>
                )}
                {state === 'returned' && !compact && (
                  <span className="mt-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600">
                    Returned
                  </span>
                )}
                {state === 'rejected' && !compact && (
                  <span className="mt-2 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600">
                    Rejected
                  </span>
                )}
              </div>
            </Tooltip>
            {!isLast && (
              <div className={`h-[2px] bg-[#ead9cb] ${compact ? 'mt-[16px] w-6' : 'mt-[22px] min-w-[32px] flex-1'}`}>
                <div
                  className={`h-full ${
                    ['completed', 'current', 'returned', 'rejected'].includes(state)
                      ? state === 'current'
                        ? 'w-1/2 bg-[#9D4D01]'
                        : state === 'returned'
                        ? 'w-full bg-[#f59e0b]'
                        : state === 'rejected'
                        ? 'w-full bg-[#dc2626]'
                        : 'w-full bg-[#582f08]'
                      : 'w-0'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
