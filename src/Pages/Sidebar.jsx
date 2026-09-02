import { Link, useLocation } from 'react-router-dom';
import { useUser } from './CustomHook/useUser';
import './Home.css';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import { GiTakeMyMoney } from 'react-icons/gi';
import { HiMiniPresentationChartLine } from 'react-icons/hi2';
import { FaChartPie, FaTimes, FaBook, FaChevronRight } from 'react-icons/fa';
import {
  AuditOutlined,
  CheckSquareOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
  SendOutlined,
  SwapOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const BUDGET_SUBNAV = [
  {
    key: 'all',
    label: 'All Budgets',
    to: '/budget',
    exact: true,
    group: 'workspace',
    perm: 'budget',
    icon: <UnorderedListOutlined />,
  },
  {
    key: 'create',
    label: 'Create Budget',
    to: '/add-budget-item',
    exact: true,
    group: 'workspace',
    perm: 'create',
    icon: <PlusCircleOutlined />,
  },
  {
    key: 'submitted',
    label: 'Submitted',
    to: '/budget?status=SUBMITTED',
    group: 'workflow',
    perm: 'budget',
    icon: <SendOutlined />,
  },
  {
    key: 'committee',
    label: 'Committee',
    to: '/budget?status=COMMITTEE_REVIEW',
    group: 'workflow',
    perm: 'committee',
    icon: <AuditOutlined />,
  },
  {
    key: 'approvals',
    label: 'Approvals',
    to: '/budget?status=RECOMMENDED',
    group: 'workflow',
    perm: 'approvals',
    icon: <CheckSquareOutlined />,
  },
  {
    key: 'returned',
    label: 'Returned',
    to: '/budget?status=RETURNED',
    group: 'workflow',
    perm: 'budget',
    icon: <RollbackOutlined />,
  },
  {
    key: 'compare',
    label: 'Compare',
    to: '/budget/compare',
    exact: true,
    group: 'tools',
    perm: 'compare',
    icon: <SwapOutlined />,
  },
];

const GROUP_LABELS = {
  workspace: 'Workspace',
  workflow: 'Queues',
  tools: 'Tools',
};

const Sidebar = () => {
  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);
  const [isOpen, setIsOpen] = useState(false);
  const [budgetFlyoutOpen, setBudgetFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 12, left: 208 });
  const location = useLocation();
  const sidebarRef = useRef(null);
  const budgetTriggerRef = useRef(null);
  const flyoutRef = useRef(null);
  const closeTimerRef = useRef(null);

  const toggleSidebar = () => {
    setIsOpen((open) => {
      if (open) setBudgetFlyoutOpen(false);
      return !open;
    });
  };
  const closeSidebar = () => {
    setIsOpen(false);
    setBudgetFlyoutOpen(false);
  };

  const isBudgetRoute =
    location.pathname.startsWith('/budget') ||
    location.pathname.startsWith('/add-budget') ||
    location.pathname.startsWith('/update-budget');

  const isDesktopHover = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

  const openBudgetFlyout = () => {
    clearTimeout(closeTimerRef.current);
    setBudgetFlyoutOpen(true);
  };

  const scheduleCloseBudgetFlyout = () => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setBudgetFlyoutOpen(false), 160);
  };

  const updateFlyoutPosition = () => {
    const sidebarEl = sidebarRef.current;
    const triggerEl = budgetTriggerRef.current;
    if (!sidebarEl || !triggerEl) return;

    const sidebarRect = sidebarEl.getBoundingClientRect();
    const triggerRect = triggerEl.getBoundingClientRect();
    const flyoutHeight = flyoutRef.current?.offsetHeight ?? 360;
    const maxTop = Math.max(12, window.innerHeight - flyoutHeight - 12);

    setFlyoutPos({
      top: Math.min(Math.max(12, triggerRect.top), maxTop),
      left: Math.max(0, sidebarRect.right - 2),
    });
  };

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    setBudgetFlyoutOpen(false);
  }, [location.pathname, location.search]);

  useLayoutEffect(() => {
    if (!budgetFlyoutOpen) return;
    updateFlyoutPosition();
    const sidebarEl = sidebarRef.current;
    window.addEventListener('resize', updateFlyoutPosition);
    sidebarEl?.addEventListener('scroll', updateFlyoutPosition);
    return () => {
      window.removeEventListener('resize', updateFlyoutPosition);
      sidebarEl?.removeEventListener('scroll', updateFlyoutPosition);
    };
  }, [budgetFlyoutOpen]);

  const canSeeBudget = hasPermission(allRolePermissions, [requiredPermissions.DISPLAY_BUDGET]);
  const canCreateBudget = hasPermission(allRolePermissions, [requiredPermissions.CREATE_BUDGET]);
  const canSeeCommittee =
    hasPermission(allRolePermissions, [requiredPermissions.START_COMMITTEE_REVIEW]) ||
    hasPermission(allRolePermissions, [requiredPermissions.RECOMMEND_BUDGET]) ||
    hasPermission(allRolePermissions, [requiredPermissions.COMPLETE_COMMITTEE_REVIEW]);
  const canSeeApprovals =
    hasPermission(allRolePermissions, [requiredPermissions.APPROVE_BUDGET]) ||
    hasPermission(allRolePermissions, [requiredPermissions.REJECT_BUDGET]);
  const canCompare = hasPermission(allRolePermissions, [requiredPermissions.READ_BUDGET]);

  const permMap = {
    budget: canSeeBudget,
    create: canCreateBudget,
    committee: canSeeCommittee,
    approvals: canSeeApprovals,
    compare: canCompare,
  };

  const visibleSubnav = useMemo(
    () => BUDGET_SUBNAV.filter((item) => permMap[item.perm]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      canSeeBudget,
      canCreateBudget,
      canSeeCommittee,
      canSeeApprovals,
      canCompare,
    ],
  );

  const isSubLinkActive = (to, exact) => {
    const [pathOnly, query = ''] = to.split('?');
    const currentQuery = location.search.replace(/^\?/, '');

    if (exact) {
      return location.pathname === pathOnly && currentQuery === query;
    }

    if (query) {
      return location.pathname === pathOnly && currentQuery === query;
    }

    return location.pathname === pathOnly && !currentQuery.startsWith('status=');
  };

  const SubLink = ({ to, label, exact, icon }) => {
    const active = isSubLinkActive(to, exact);
    return (
      <Link to={to} onClick={closeSidebar} className="block" title={label}>
        <li
          className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150 ${
            active
              ? 'bg-[#fd984e] text-[#6d3300] shadow-sm'
              : 'text-[#E3BC97] hover:bg-white/10 hover:text-white'
          }`}
        >
          <span
            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[14px] ${
              active
                ? 'bg-[#6d3300]/15 text-[#6d3300]'
                : 'bg-white/10 text-[#E3BC97] group-hover:bg-white/15 group-hover:text-white'
            }`}
          >
            {icon}
          </span>
          <span className="whitespace-nowrap text-[13px] font-semibold leading-tight">
            {label}
          </span>
        </li>
      </Link>
    );
  };

  const renderGroupedSubnav = () => {
    const groups = ['workspace', 'workflow', 'tools'];
    return groups.map((group, groupIndex) => {
      const items = visibleSubnav.filter((item) => item.group === group);
      if (!items.length) return null;
      return (
        <div
          key={group}
          className={groupIndex > 0 ? 'mt-2 border-t border-white/10 pt-2' : ''}
        >
          <p className="mb-1 px-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
            {GROUP_LABELS[group]}
          </p>
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <SubLink
                key={item.key}
                to={item.to}
                label={item.label}
                exact={item.exact}
                icon={item.icon}
              />
            ))}
          </ul>
        </div>
      );
    });
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-[13px] left-3 z-50 w-9 h-9 flex items-center justify-center rounded-lg text-[#582F08] hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <FaTimes size={18} />
        ) : (
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1H19M1 7H19M1 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
        fixed z-40 h-screen bg-[#582f08] overflow-y-auto no-scrollbar transition-transform duration-300 ease-in-out
        w-[13rem] px-3 py-[19px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
      >

        <ul className="list-none px-1 py-[10px] flex flex-col gap-[20px] md:gap-[30px] cursor-pointer">
          {hasPermission(allRolePermissions, [requiredPermissions.READ_ANALYTICS]) && (
            <Link to="/analytics" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <HiMiniPresentationChartLine className="w-[4rem] md:w-[6rem] text-[#E3BC97]" size={40} />
                <p className="text-xs">Analytics</p>
              </li>
            </Link>
          )}
          {hasPermission(allRolePermissions, [requiredPermissions.READ_ANALYTICS]) && (
            <Link to="/advanced-analytics" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <FaChartPie className="w-[4rem] md:w-[6rem] text-[#E3BC97]" size={35} />
                <p className="text-xs text-center">Dashboard</p>
              </li>
            </Link>
          )}
          <Link to="/" onClick={closeSidebar}>
            <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
              <img className="w-[35px] md:w-[43px]" src="/asset/home-icon.a1cb008ba41682badfae94e2877d0206.svg" alt="" />
              <p className="text-xs">Home</p>
            </li>
          </Link>

          <Link to="/locator" onClick={closeSidebar}>
            <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-500 py-2 px-2 hover:scale-105 hover:rounded-md">
              <img className="w-[35px] md:w-[43px]" src="/asset/tracker-icon.6371fcdb202ad14b09e06a9391bf8cc2.svg" alt="" />
              <p className="text-xs">Locator</p>
            </li>
          </Link>

          {hasPermission(allRolePermissions, [requiredPermissions.CREATE_ARCHIVE]) && (
            <Link to="/archive" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <img className="w-[35px] md:w-[43px]" src="/asset/archive.3b9ddd7f65d8f9353f8fd0efad0c45e5.svg" alt="" />
                <p className="text-xs">Archive</p>
              </li>
            </Link>
          )}
          {hasPermission(allRolePermissions, [requiredPermissions.CREATE_ARCHIVE]) && (
            <Link to="/work-history" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <img className="w-[35px] md:w-[43px]" src="/asset/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg" alt="" />
                <p className="text-xs">Work History</p>
              </li>
            </Link>
          )}

          {/* ── Budget hover flyout ──────────────────────────────────────── */}
          {canSeeBudget && (
            <li
              ref={budgetTriggerRef}
              className="flex w-full flex-col"
              onMouseEnter={() => {
                if (isDesktopHover()) openBudgetFlyout();
              }}
              onMouseLeave={() => {
                if (isDesktopHover()) scheduleCloseBudgetFlyout();
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (!isDesktopHover()) {
                    setBudgetFlyoutOpen((open) => !open);
                  }
                }}
                className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 transition-all duration-200 ${
                  isBudgetRoute || budgetFlyoutOpen
                    ? 'bg-[#fd984e]/25 ring-1 ring-[#fd984e]/40'
                    : 'hover:bg-white/10'
                }`}
                aria-haspopup="menu"
                aria-expanded={budgetFlyoutOpen}
              >
                <GiTakeMyMoney className="text-[#E3BC97]" size={45} />
                <span className="flex items-center gap-1 text-xs font-semibold text-white">
                  Budget
                  <FaChevronRight
                    size={10}
                    className={`transition-transform duration-200 ${
                      budgetFlyoutOpen ? 'translate-x-0.5 text-[#fd984e]' : 'text-[#E3BC97]'
                    }`}
                  />
                </span>
              </button>
            </li>
          )}

          <Link to="/trash" onClick={closeSidebar}>
            <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
              <img className="w-[35px] md:w-[43px]" src="/asset/full trash.6648e39921b830096f076502815f16eb.svg" alt="" />
              <p className="text-xs">Recycle Bin</p>
            </li>
          </Link>

          <Link to="/user-guide" onClick={closeSidebar}>
            <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
              <FaBook className="text-[#E3BC97]" size={38} />
              <p className="text-xs">Help</p>
            </li>
          </Link>
        </ul>
      </div>

      {canSeeBudget && budgetFlyoutOpen && (
        <div
          ref={flyoutRef}
          role="menu"
          className={`fixed z-50 w-[15.5rem] rounded-2xl border border-[#E3BC97]/30 bg-[#4a2706] p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.38)] ${
            isOpen ? '' : 'max-md:hidden'
          }`}
          style={{ top: flyoutPos.top, left: flyoutPos.left }}
          onMouseEnter={() => {
            if (isDesktopHover()) openBudgetFlyout();
          }}
          onMouseLeave={() => {
            if (isDesktopHover()) scheduleCloseBudgetFlyout();
          }}
        >
          <div className="absolute top-0 -left-3 h-full w-3" aria-hidden="true" />
          <div className="max-h-[calc(100vh-1.5rem)] overflow-y-auto no-scrollbar rounded-xl bg-gradient-to-b from-black/20 to-black/10 p-2">
            {renderGroupedSubnav()}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
