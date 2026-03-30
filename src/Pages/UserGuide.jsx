import {
  Collapse,
  Tabs,
  Tag,
  Steps,
  Badge,
  Input,
} from 'antd';
import {
  FileTextOutlined,
  InboxOutlined,
  SendOutlined,
  SearchOutlined,
  FolderOutlined,
  HistoryOutlined,
  DeleteOutlined,
  BarChartOutlined,
  DashboardOutlined,
  TeamOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  SettingOutlined,
  DollarOutlined,
  AuditOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LockOutlined,
  BellOutlined,
  PaperClipOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const { Panel } = Collapse;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const features = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    title: 'Home Dashboard',
    description: 'Central hub with live counters for Incoming and Outgoing documents.',
    color: '#9D4D01',
    tag: 'All Users',
    path: '/',
  },
  {
    key: 'incoming',
    icon: <InboxOutlined />,
    title: 'Incoming Documents',
    description: 'View, acknowledge, and act on documents sent to your department.',
    color: '#1677ff',
    tag: 'All Users',
    path: '/incoming',
  },
  {
    key: 'outgoing',
    icon: <SendOutlined />,
    title: 'Outgoing Documents',
    description: 'Track documents you have dispatched to other departments.',
    color: '#52c41a',
    tag: 'All Users',
    path: '/outgoing',
  },
  {
    key: 'add-document',
    icon: <FileTextOutlined />,
    title: 'Add Document',
    description: 'Create and originate new documents for circulation in the system.',
    color: '#722ed1',
    tag: 'Privileged',
    path: '/add-document',
  },
  {
    key: 'locator',
    icon: <SearchOutlined />,
    title: 'Locator',
    description: 'Search and pinpoint the current location of any document in real time.',
    color: '#eb2f96',
    tag: 'All Users',
    path: '/locator',
  },
  {
    key: 'archive',
    icon: <FolderOutlined />,
    title: 'Archive',
    description: 'Long-term storage for completed documents with secure retrieval.',
    color: '#fa8c16',
    tag: 'Privileged',
    path: '/archive',
  },
  {
    key: 'work-history',
    icon: <HistoryOutlined />,
    title: 'Work History',
    description: 'Chronological log of all actions taken on documents you handled.',
    color: '#13c2c2',
    tag: 'Privileged',
    path: '/work-history',
  },
  {
    key: 'budget',
    icon: <DollarOutlined />,
    title: 'Budget',
    description: 'Manage departmental budgets, budget items, and financial year data.',
    color: '#389e0d',
    tag: 'Finance',
    path: '/budget',
  },
  {
    key: 'analytics',
    icon: <BarChartOutlined />,
    title: 'Analytics',
    description: 'Visual charts showing document flow trends, volumes, and performance.',
    color: '#1677ff',
    tag: 'Management',
    path: '/analytics',
  },
  {
    key: 'advanced-analytics',
    icon: <DashboardOutlined />,
    title: 'Advanced Dashboard',
    description: 'Deep-dive KPIs with filterable views across dates, departments, and types.',
    color: '#722ed1',
    tag: 'Management',
    path: '/advanced-analytics',
  },
  {
    key: 'trash',
    icon: <DeleteOutlined />,
    title: 'Recycle Bin',
    description: 'Recover or permanently delete recently removed documents.',
    color: '#f5222d',
    tag: 'Privileged',
    path: '/trash',
  },
  {
    key: 'backoffice',
    icon: <SafetyOutlined />,
    title: 'Back Office',
    description: 'Admin controls — Staff, Departments, Roles, Retention, Stamps and more.',
    color: '#582F08',
    tag: 'Admin',
    path: null,
  },
];

const tagColor = {
  'All Users': 'blue',
  Privileged: 'orange',
  Finance: 'green',
  Management: 'purple',
  Admin: 'red',
};

/* ─────────────────────────────────────────────
   GUIDE CONTENT (Sections → Tabs)
───────────────────────────────────────────── */
const guideData = [
  {
    key: 'getting-started',
    label: 'Getting Started',
    icon: <QuestionCircleOutlined />,
    sections: [
      {
        title: 'Signing In',
        steps: [
          'Navigate to the Cocoa Papers login page.',
          'Enter your registered email address and password.',
          'If Two-Factor Authentication (2FA) is enabled for your account, enter the OTP sent to your email.',
          'Click Sign In — you will land on the Home Dashboard.',
        ],
        notes: [
          'If you forget your password, click Forgot Password on the login page to receive a reset link.',
          'Your session will expire after prolonged inactivity for security.',
        ],
      },
      {
        title: 'Understanding the Interface',
        steps: [
          'The dark-brown sidebar on the left is your primary navigation. Click any icon to go to that module.',
          'The top Navbar provides global search, notifications, access requests, and your profile menu.',
          'The main content area changes based on the active route.',
          'On mobile devices, tap the hamburger (☰) icon at the top-left to open the sidebar.',
        ],
        notes: [
          'Not all sidebar items are visible — they are shown based on your assigned role and permissions.',
        ],
      },
      {
        title: 'Profile & Settings',
        steps: [
          'Click your name or avatar in the top-right of the Navbar to open the profile dropdown.',
          'You can update OTP/2FA preferences under OTP Settings.',
          'To sign out, select Sign Out from the dropdown.',
        ],
      },
    ],
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: <FileTextOutlined />,
    sections: [
      {
        title: 'Adding a New Document',
        steps: [
          'Click Add Document in the Navbar or navigate to /add-document.',
          'Fill in the document Subject, Type, Reference Number (auto-generated), and Description.',
          'Select the recipient Department.',
          'Optionally attach files (PDF, Word, images, etc.).',
          'Configure the Retention Policy for the document.',
          'Click Submit to circulate the document.',
        ],
        notes: [
          'Reference numbers are auto-generated in the format DEPT/YEAR/SEQUENCE.',
          'Requires CREATE_DOCUMENT permission.',
        ],
      },
      {
        title: 'Incoming Documents',
        steps: [
          'Navigate to Incoming from the sidebar or home cards.',
          'Browse the list of documents addressed to your department.',
          'Click on any row to view full details.',
          'Use the action buttons to Forward, Acknowledge, or Add a Badge to a document.',
          'Use the search bar to find specific documents by subject or reference.',
        ],
        notes: [
          'A red counter badge on the Incoming card shows how many unread documents are waiting.',
          'Forwarding sends the document onward to another department or desk.',
        ],
      },
      {
        title: 'Outgoing Documents',
        steps: [
          'Navigate to Outgoing from the sidebar.',
          'This list shows all documents your department has dispatched.',
          'Click on a document to view its current trail and status.',
          'Filters allow you to narrow by date range, department, or document type.',
        ],
      },
      {
        title: 'Viewing a Document',
        steps: [
          'Click on any document row or thumbnail to open the View Document screen.',
          'The top section shows document metadata: subject, reference, type, date, status.',
          'The Linked Documents panel shows related documents.',
          'The Trail panel shows the full movement history with timestamps.',
          'The Attachments tab lists all attached files — click to preview or download.',
          'Use the stamp, badge, or read receipt controls at the bottom of the page.',
        ],
      },
      {
        title: 'Attachments',
        steps: [
          'Open any document and switch to the Attachments tab.',
          'Click Upload to add new files (PDF, DOCX, PNG, JPG, etc.).',
          'Existing attachments can be previewed inline or downloaded.',
          'Delete an attachment by clicking the trash icon (requires permission).',
        ],
      },
    ],
  },
  {
    key: 'locator',
    label: 'Locator',
    icon: <SearchOutlined />,
    sections: [
      {
        title: 'Finding a Document',
        steps: [
          'Navigate to Locator from the sidebar.',
          'Type any part of the document subject or reference number into the search bar.',
          'The system displays matching documents with their current location, last handler, and trail summary.',
          'Click a result to open the full document view.',
        ],
        notes: [
          'Search is real-time with a short debounce delay for performance.',
          'The locator searches across all departments you have access to.',
        ],
      },
    ],
  },
  {
    key: 'archive',
    label: 'Archive & History',
    icon: <FolderOutlined />,
    sections: [
      {
        title: 'Archiving Documents',
        steps: [
          'Navigate to Archive from the sidebar.',
          'Browse archived documents using filters by date, department, or type.',
          'Click a record to view its full details and original attachments.',
          'Use Export to download a report of archived records.',
        ],
        notes: [
          'Documents are moved to Archive automatically when their lifecycle ends, based on the Retention Policy.',
          'Archived documents are read-only — they cannot be edited or re-circulated.',
          'Requires CREATE_ARCHIVE or READ_ARCHIVE permission.',
        ],
      },
      {
        title: 'Work History',
        steps: [
          'Navigate to Work History from the sidebar.',
          'This shows every action you (or your department) performed on any document.',
          'Filter by date, document type, or action type (sent, received, forwarded, etc.).',
          'Click any entry to open the related document.',
        ],
      },
      {
        title: 'Recycle Bin',
        steps: [
          'Navigate to Recycle Bin (Trash) from the sidebar.',
          'Deleted documents are held here for a grace period before permanent deletion.',
          'Click Restore to return a document to its active state.',
          'Click Permanently Delete to remove it from the system entirely (irreversible).',
        ],
        notes: [
          'Permanent deletion cannot be undone. Proceed with caution.',
        ],
      },
    ],
  },
  {
    key: 'budget',
    label: 'Budget',
    icon: <DollarOutlined />,
    sections: [
      {
        title: 'Overview',
        steps: [
          'Navigate to Budget from the sidebar (visible if you have the DISPLAY_BUDGET permission).',
          'The page shows all active budgets grouped by financial year.',
          'The Archived Budgets panel (collapsed by default) shows budgets from closed financial years.',
          'Use the search bar in each section to filter by budget title or item name.',
        ],
      },
      {
        title: 'Adding a Budget Item',
        steps: [
          'Click the + Add Budgetary Item button (requires CREATE_BUDGET permission).',
          'Non-admin users: your Department is auto-filled — no need to select Division or Department.',
          'Admin/Finance users: select the target Division first, then Department.',
          'Enter a Budget Title and add line items (name, quantity, amount).',
          'Click Submit to save.',
        ],
        notes: [
          'Each line item has Item Name, Quantity, and Amount (GHS).',
          'You can add multiple line items by clicking the + (plus) icon.',
        ],
      },
      {
        title: 'Uploading a Budget via Template',
        steps: [
          'Click Download Template to get the official Excel spreadsheet format.',
          'Fill in budget data in the template — do not change column headers.',
          'Return to the Budget page and click Upload Template.',
          'Select your completed Excel file and confirm the upload.',
          'The system will validate rows and import valid entries.',
        ],
      },
      {
        title: 'Editing & Deleting Budgets',
        steps: [
          'Click the edit icon (pencil) on any budget row to modify its details.',
          'Click the delete icon (trash) to remove a budget item (requires UPDATE_BUDGET permission).',
          'A confirmation dialog will appear before any deletion.',
        ],
      },
      {
        title: 'Archived Budgets',
        steps: [
          'Expand the Archived Budgets section at the bottom of the Budget page.',
          'Archived budgets belong to closed financial years and are read-only.',
          'Use the search bar inside the panel to filter archived budgets.',
          'Click a row to expand it and view individual budget line items.',
        ],
        notes: [
          'Financial years are closed by an Admin in Back Office → Financial Year.',
        ],
      },
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: <BarChartOutlined />,
    sections: [
      {
        title: 'Analytics Overview',
        steps: [
          'Navigate to Analytics from the sidebar (requires READ_ANALYTICS permission).',
          'Charts display document counts broken down by type, direction (in/out), and time period.',
          'Use the date range picker to zoom in on a specific period.',
          'Hover over data points for exact figures.',
        ],
      },
      {
        title: 'Advanced Dashboard',
        steps: [
          'Navigate to Advanced Analytics from the sidebar.',
          'This dashboard provides KPIs such as total documents, average processing time, and top document types.',
          'Filterable by department, division, date range, and document category.',
          'Charts can be toggled between bar, line, and pie views.',
          'Use Export to download a PDF or CSV report.',
        ],
      },
    ],
  },
  {
    key: 'backoffice',
    label: 'Back Office',
    icon: <SafetyOutlined />,
    sections: [
      {
        title: 'Accessing Back Office',
        steps: [
          'Click the shield icon (Back Office) in the sidebar — visible to Admin and privileged roles.',
          'The Back Office dashboard shows staff, department, and activity summaries.',
          'Use the left sub-navigation to switch between modules.',
        ],
      },
      {
        title: 'Staff Management',
        steps: [
          'Go to Back Office → Staff to view all registered users.',
          'Add a new staff member by clicking Create User — fill in name, email, department, division, and role.',
          'Edit an existing user by clicking the edit icon on their row.',
          'Deactivate or delete a staff account using the controls on the right.',
        ],
        notes: ['Requires READ_STAFF and CREATE_STAFF permissions.'],
      },
      {
        title: 'Departments & Divisions',
        steps: [
          'Go to Back Office → Department to view and manage departments.',
          'Each department belongs to a Division — create Divisions first.',
          'Click Create Department/Division to add new entries.',
          'Edit or delete using the inline action icons.',
        ],
      },
      {
        title: 'Roles & Permissions',
        steps: [
          'Go to Back Office → Roles to view all defined roles in the system.',
          'Click Create Role to define a new role and assign granular permissions.',
          'Click on an existing role to view or modify its permission set.',
          'Assign roles to staff members from the Staff Management page.',
        ],
        notes: [
          'Permissions gate every feature. Ensure roles are correctly configured before assigning to users.',
        ],
      },
      {
        title: 'User Groups',
        steps: [
          'Go to Back Office → User Groups to manage groups of users.',
          'Create a group, give it a name, and add members.',
          'User groups can be referenced for bulk actions and access requests.',
        ],
      },
      {
        title: 'Stamps',
        steps: [
          'Go to Back Office → Stamps to manage official document stamps.',
          'Upload a stamp image (PNG with transparent background recommended).',
          'Stamps can be applied to documents during the review/signing workflow.',
        ],
      },
      {
        title: 'Financial Year',
        steps: [
          'Go to Back Office → Financial Year to view and create financial years.',
          'Create a new financial year by specifying the year label.',
          'Close a financial year to move all associated budgets to the Archived Budgets panel.',
        ],
        notes: ['Closing a financial year is irreversible.'],
      },
      {
        title: 'Retention Policy',
        steps: [
          'Go to Back Office → Retention Policy to define document lifecycle rules.',
          'Create a policy with a name, duration (in days), and behavior (Delete / Archive).',
          'Apply policies when creating documents to automate their lifecycle.',
        ],
      },
      {
        title: 'Configuration',
        steps: [
          'Go to Back Office → Configuration to manage system-wide settings.',
          'Configure document types, categories, and other global parameters.',
          'Changes take effect immediately across the application.',
        ],
      },
      {
        title: 'Audit Trail',
        steps: [
          'Go to Back Office → Audit Trail to see a complete log of all system actions.',
          'Filter by user, action type, date range, or module.',
          'Each entry shows: actor, action, affected resource, timestamp, and IP address.',
        ],
        notes: ['Audit Trail data is read-only and cannot be modified or deleted.'],
      },
    ],
  },
  {
    key: 'security',
    label: 'Security & 2FA',
    icon: <LockOutlined />,
    sections: [
      {
        title: 'Two-Factor Authentication (2FA)',
        steps: [
          'Open the profile dropdown in the top-right Navbar.',
          'Click OTP Settings.',
          'Toggle Enable 2FA — an OTP will now be required at every sign-in.',
          'Optionally, scan the QR Code with an authenticator app for TOTP-based 2FA.',
        ],
        notes: [
          'OTPs are sent to your registered email address and expire after a few minutes.',
          'If you cannot receive emails, contact your system administrator.',
        ],
      },
      {
        title: 'Access Requests',
        steps: [
          'If you try to access a document that is restricted, click Request Access.',
          'Provide a reason for your request and submit.',
          'An admin or the document owner will approve or deny your request.',
          'You will receive a notification once a decision is made.',
        ],
      },
      {
        title: 'Password Reset',
        steps: [
          'On the Sign In page, click Forgot Password.',
          'Enter your registered email address.',
          'Check your inbox for a reset link (valid for a limited time).',
          'Click the link, enter a new password, and confirm.',
        ],
        notes: [
          'Passwords must be sufficiently strong. Choose a unique password not used elsewhere.',
        ],
      },
    ],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <BellOutlined />,
    sections: [
      {
        title: 'In-App Notifications',
        steps: [
          'Click the bell icon in the Navbar to see recent notifications.',
          'Notifications include new incoming documents, access request decisions, and system alerts.',
          'Click any notification to navigate directly to the related item.',
          'Mark notifications as read by clicking the check icon.',
        ],
      },
      {
        title: 'Push Notifications',
        steps: [
          'When you first sign in, the browser may prompt you to allow notifications — click Allow.',
          'Push notifications are delivered even when the app tab is not active.',
          'You will receive a push notification whenever a new document is sent to your department.',
        ],
        notes: [
          'Push notifications require a modern browser and an active internet connection.',
          'You can revoke notification permission from your browser settings.',
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const UserGuide = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeatures = useMemo(() => {
    if (!searchQuery) return features;
    const q = searchQuery.toLowerCase();
    return features.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredGuide = useMemo(() => {
    if (!searchQuery) return guideData;
    const q = searchQuery.toLowerCase();
    return guideData
      .map((tab) => ({
        ...tab,
        sections: tab.sections.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.steps.some((step) => step.toLowerCase().includes(q)) ||
            (s.notes || []).some((note) => note.toLowerCase().includes(q))
        ),
      }))
      .filter((tab) => tab.sections.length > 0);
  }, [searchQuery]);

  return (
    <div className="pl-[10rem] md:pl-[11rem] pr-4 md:pr-8 pt-6 pb-12 min-h-screen bg-[#faf7f4]">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-[#582F08] to-[#9D4D01] rounded-2xl p-6 md:p-10 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <QuestionCircleOutlined className="text-3xl text-[#E3BC97]" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">User Guide & Features</h1>
              </div>
              <p className="text-[#E3BC97] text-sm md:text-base max-w-xl">
                Everything you need to know about Cocoa Papers — a complete reference for all modules, workflows, and features.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{features.length}</div>
                <div className="text-xs text-[#E3BC97]">Modules</div>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold">{guideData.reduce((a, t) => a + t.sections.length, 0)}</div>
                <div className="text-xs text-[#E3BC97]">Guides</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Global Search ── */}
      <div className="mb-8">
        <Input
          size="large"
          placeholder="Search features, guides, and how-to articles..."
          prefix={<SearchOutlined className="text-[#9D4D01]" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="rounded-xl shadow-sm"
        />
      </div>

      {/* ── Feature Cards Grid ── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-[#582F08] mb-4 flex items-center gap-2">
          <DashboardOutlined />
          Features Overview
          {searchQuery && (
            <span className="text-sm font-normal text-gray-400 ml-1">
              — {filteredFeatures.length} result{filteredFeatures.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>

        {filteredFeatures.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No features match your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFeatures.map((f) => (
              <div
                key={f.key}
                className="bg-white border border-[#f0e6da] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0"
                    style={{ backgroundColor: f.color }}
                  >
                    {f.icon}
                  </div>
                  <Tag color={tagColor[f.tag]} className="text-xs">{f.tag}</Tag>
                </div>
                <h3 className="font-bold text-[#582F08] text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{f.description}</p>
                {f.path && (
                  <Link
                    to={f.path}
                    className="text-xs text-[#9D4D01] font-semibold hover:underline"
                  >
                    Go to {f.title} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Detailed Guides ── */}
      <section>
        <h2 className="text-lg font-bold text-[#582F08] mb-4 flex items-center gap-2">
          <AuditOutlined />
          Step-by-Step Guides
        </h2>

        {filteredGuide.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No guides match your search.</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da] overflow-hidden">
            <Tabs
              tabPosition="left"
              className="user-guide-tabs"
              items={filteredGuide.map((tab) => ({
                key: tab.key,
                label: (
                  <span className="flex items-center gap-2 text-sm py-1">
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                ),
                children: (
                  <div className="p-4 md:p-6">
                    <h3 className="text-xl font-bold text-[#582F08] mb-6 flex items-center gap-2">
                      {tab.icon}
                      {tab.label}
                    </h3>
                    <Collapse
                      bordered={false}
                      defaultActiveKey={tab.sections.length === 1 ? ['0'] : []}
                      className="bg-transparent guide-collapse"
                      expandIconPosition="end"
                    >
                      {tab.sections.map((section, idx) => (
                        <Panel
                          key={String(idx)}
                          header={
                            <span className="font-semibold text-[#582F08] text-sm">
                              {section.title}
                            </span>
                          }
                          className="bg-[#faf7f4] rounded-xl mb-3 border border-[#f0e6da] overflow-hidden"
                        >
                          <Steps
                            direction="vertical"
                            size="small"
                            className="guide-steps"
                            items={section.steps.map((step, si) => ({
                              key: si,
                              status: 'finish',
                              icon: (
                                <div className="w-6 h-6 rounded-full bg-[#9D4D01] text-white text-xs flex items-center justify-center font-bold">
                                  {si + 1}
                                </div>
                              ),
                              description: (
                                <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                              ),
                            }))}
                          />

                          {section.notes && section.notes.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {section.notes.map((note, ni) => (
                                <div
                                  key={ni}
                                  className="flex items-start gap-2 bg-[#fff8f0] border border-[#f0e6da] rounded-lg p-3"
                                >
                                  <InfoCircleOutlined className="text-[#9D4D01] mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-gray-600 leading-relaxed">{note}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </Panel>
                      ))}
                    </Collapse>
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </section>

      {/* ── Permission Reference Card ── */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-[#582F08] mb-4 flex items-center gap-2">
          <LockOutlined />
          Access Level Reference
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'All Users',
              color: 'blue',
              bg: '#e6f4ff',
              border: '#91caff',
              icon: <UserOutlined />,
              desc: 'Every logged-in staff member can access these features — Home, Incoming, Outgoing, Locator.',
            },
            {
              label: 'Privileged',
              color: '#fa8c16',
              bg: '#fff7e6',
              border: '#ffd591',
              icon: <CheckCircleOutlined />,
              desc: 'Users with elevated document permissions — Add Document, Archive, Work History, Recycle Bin.',
            },
            {
              label: 'Finance',
              color: '#389e0d',
              bg: '#f6ffed',
              border: '#b7eb8f',
              icon: <DollarOutlined />,
              desc: 'Finance and budget officers — Budget management, financial year and budget templates.',
            },
            {
              label: 'Admin',
              color: '#f5222d',
              bg: '#fff1f0',
              border: '#ffa39e',
              icon: <SafetyOutlined />,
              desc: 'System administrators — Back Office, Role Management, Staff, Configuration, Audit Trail.',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-4 border"
              style={{ backgroundColor: item.bg, borderColor: item.border }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: item.color }}>
                <span className="text-lg">{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400">
          Cocoa Papers Document Management System &nbsp;·&nbsp; For support, contact your system administrator.
        </p>
      </div>

      {/* ── Inline Styles for Guide Tabs ── */}
      <style>{`
        .user-guide-tabs .ant-tabs-tab {
          padding: 10px 16px !important;
          margin: 2px 0 !important;
          border-radius: 8px !important;
        }
        .user-guide-tabs .ant-tabs-tab-active {
          background: #fdf4ed !important;
        }
        .user-guide-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #9D4D01 !important;
        }
        .user-guide-tabs .ant-tabs-ink-bar {
          background: #9D4D01 !important;
        }
        .user-guide-tabs .ant-tabs-left > .ant-tabs-content-holder {
          border-left: 1px solid #f0e6da !important;
        }
        .guide-collapse .ant-collapse-item {
          margin-bottom: 8px !important;
        }
        .guide-collapse .ant-collapse-header {
          padding: 12px 16px !important;
        }
        .guide-steps .ant-steps-item-tail {
          border-left: 2px dashed #f0e6da !important;
        }
        .guide-steps .ant-steps-item-content {
          min-height: 40px !important;
        }
      `}</style>
    </div>
  );
};

export default UserGuide;
