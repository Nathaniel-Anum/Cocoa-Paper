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
import { FaChartPie, FaTimes, FaBook, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {
  AuditOutlined,
  CheckSquareOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
  SendOutlined,
  SwapOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

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
  const [budgetOpen, setBudgetOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const isBudgetRoute =
    location.pathname.startsWith('/budget') ||
    location.pathname.startsWith('/add-budget') ||
    location.pathname.startsWith('/update-budget');

  // Open when entering a budget route; allow manual collapse while staying on that page.
  useEffect(() => {
    setBudgetOpen(isBudgetRoute);
  }, [location.pathname, location.search, isBudgetRoute]);

  const budgetExpanded = budgetOpen;

  const toggleBudgetMenu = () => setBudgetOpen((open) => !open);

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
      <Link to={to} onClick={closeSidebar} className="block min-w-0" title={label}>
        <li
          className={`group flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 transition-all duration-150 ${
            active
              ? 'bg-[#fd984e] text-[#6d3300] shadow-sm'
              : 'text-[#E3BC97] hover:bg-white/10 hover:text-white'
          }`}
        >
          <span
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[13px] ${
              active
                ? 'bg-[#6d3300]/15 text-[#6d3300]'
                : 'bg-white/10 text-[#E3BC97] group-hover:bg-white/15 group-hover:text-white'
            }`}
          >
            {icon}
          </span>
          <span className="min-w-0 flex-1 break-words text-[11px] font-semibold leading-tight">
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
          <p className="mb-1 px-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white/40">
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
      <div className={`
        fixed z-40 h-screen bg-[#582f08] overflow-y-auto no-scrollbar transition-transform duration-300 ease-in-out
        w-[13rem] px-3 py-[19px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

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

          {/* ── Budget expandable menu ───────────────────────────────────── */}
          {canSeeBudget && (
            <li className="flex w-full min-w-0 flex-col">
              <button
                onClick={toggleBudgetMenu}
                className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 transition-all duration-200 ${
                  isBudgetRoute
                    ? 'bg-[#fd984e]/25 ring-1 ring-[#fd984e]/40'
                    : 'hover:bg-white/10'
                }`}
                aria-expanded={budgetExpanded}
              >
                <GiTakeMyMoney className="text-[#E3BC97]" size={45} />
                <span className="flex items-center gap-1 text-xs font-semibold text-white">
                  Budget
                  {budgetExpanded ? (
                    <FaChevronUp size={10} className="text-[#fd984e]" />
                  ) : (
                    <FaChevronDown size={10} className="text-[#E3BC97]" />
                  )}
                </span>
              </button>

              {budgetExpanded && (
                <div className="mt-2 w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-black/25 to-black/10 p-2 shadow-inner">
                  {renderGroupedSubnav()}
                </div>
              )}
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
    </>
  );
};

export default Sidebar;
