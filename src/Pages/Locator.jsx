import React, { useState } from 'react';
import { useUser } from './CustomHook/useUser';
import { useTrail } from './CustomHook/useTrail';
import { Modal, Table, Dropdown, Input, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { EyeOutlined, MoreOutlined, LinkOutlined, SearchOutlined } from '@ant-design/icons';
import { FaTable, FaThLarge } from 'react-icons/fa';
import axiosInstance from '../Components/axiosInstance';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import Trail from '../Components/Trail/Trail';
import { isArray } from 'lodash';
import DocumentLinksModal from '../Components/modals/DocumentLinksModal';
import ReadReceipts from '../Components/ReadReceipts';
import PageHeader from '../Components/PageHeader';
const Locator = () => {
  dayjs.extend(advancedFormat);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trialId, setTrialId] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [selectedDocForLinks, setSelectedDocForLinks] = useState(null);
  const [isReadReceiptsModalOpen, setIsReadReceiptsModalOpen] = useState(false);
  const [selectedDocForReceipts, setSelectedDocForReceipts] = useState(null);

  // useQuery to fetch all trails
  const { data: trailDisplay } = useQuery({
    queryKey: ['trailDisplay'],
    queryFn: () => {
      return axiosInstance.get('/trail');
    },
  });

  // useQuery for getting all trails associated to a document
  const { data: documentTrial, isLoading } = useQuery({
    queryKey: ['documentTrial', trialId],
    queryFn: () => {
      return axiosInstance.get(`/trail/${trialId}`);
    },
    enabled: !!trialId,
  });
  console.log(documentTrial?.data?.trails);

  const showModal = (trail) => {
    setIsModalOpen(true);
    setTrialId(trail?.docID);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const openLinksModal = (doc, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedDocForLinks(doc);
    setIsLinksModalOpen(true);
  };

  const closeLinksModal = () => {
    setIsLinksModalOpen(false);
    setSelectedDocForLinks(null);
  };

  const openReadReceiptsModal = (doc, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedDocForReceipts(doc);
    setIsReadReceiptsModalOpen(true);
  };

  const closeReadReceiptsModal = () => {
    setIsReadReceiptsModalOpen(false);
    setSelectedDocForReceipts(null);
  };

  const { allTrails } = useTrail();

  // **Table Columns Configuration for Trail Data**
  const handleMenuClick = (record) => ({ key, domEvent }) => {
    domEvent?.stopPropagation();
    domEvent?.preventDefault();
    if (key === 'trail') {
      showModal(record);
      return;
    }
    if (key === 'receipts') {
      openReadReceiptsModal(record);
      return;
    }
    if (key === 'links') {
      openLinksModal(record);
    }
  };

  const getActionItems = () => [
    {
      key: 'trail',
      label: 'View Trail',
      icon: <SearchOutlined />,
    },
    {
      key: 'receipts',
      label: 'View receipt',
      icon: <EyeOutlined />,
    },
    {
      key: 'links',
      label: 'Linking',
      icon: <LinkOutlined />,
    },
  ];

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toLowerCase();
        const receiverNames = record.trail?.map(t => t.receiver?.name?.toLowerCase() || '').join(' ') || '';
        return (
          record.subject?.toLowerCase().includes(search) ||
          receiverNames.includes(search)
        );
      },
      render: (val) => <span className="font-semibold text-[#582F08]">{val}</span>,
    },
    {
      title: 'Reference',
      dataIndex: 'ref',
      key: 'ref',
      render: (val) => <span className="font-mono text-xs text-gray-500">{val || '—'}</span>,
    },
    {
      title: 'Current Recipient',
      dataIndex: 'receiver',
      key: 'receiver',
      render: (_, record) => {
        const hasSenderMatch = record.trail.some(
          (trailItem) => trailItem.sender.userId === user?.userId
        );
        return (
          <span>
            {hasSenderMatch
              ? record.trail.map((trailItem) =>
                  trailItem.sender.userId === user?.userId ? (
                    <Tag key={trailItem.trailsId} color="orange">{trailItem.receiver?.name}</Tag>
                  ) : null
                )
              : <Tag color="blue">In Possession</Tag>}
          </span>
        );
      },
    },
    {
      title: 'Date Sent',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => <span className="text-xs text-gray-500">{dayjs(val).format('MMM D, YYYY')}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(), onClick: handleMenuClick(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#fdf4ed] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreOutlined className="text-lg text-[#9D4D01]" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <PageHeader
        title="Locator"
        description="Track where a document is and who has seen it"
        meta={`${isArray(trailDisplay?.data) ? trailDisplay.data.length : 0} documents tracked`}
        extra={
          <>
            <Input
              placeholder="Search by subject or recipient..."
              prefix={<SearchOutlined className="text-[#9D4D01]" />}
              allowClear
              className="w-full lg:w-72"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-[#f0e6da] bg-white hover:bg-[#fdf4ed] transition-colors text-[#582F08]"
              title={isGridView ? 'Switch to table view' : 'Switch to grid view'}
            >
              {isGridView ? <FaTable size={16} /> : <FaThLarge size={16} />}
            </button>
          </>
        }
      />

      {/* ── Content ── */}
      {isGridView ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isArray(trailDisplay?.data) && trailDisplay.data.length > 0 ? (
            trailDisplay.data
              .filter((trail) => {
                if (!searchText) return true;
                const s = searchText.toLowerCase();
                const receiverNames = trail.trail?.map(t => t.receiver?.name?.toLowerCase() || '').join(' ') || '';
                return trail.subject?.toLowerCase().includes(s) || receiverNames.includes(s);
              })
              .map((trail) => {
                const lastRecipient = trail.trail?.length > 0
                  ? trail.trail[trail.trail.length - 1]?.receiver?.name
                  : null;
                return (
                  <div
                    key={trail.docID}
                    className="bg-white border border-[#f0e6da] rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                  >
                    {/* Card top accent */}
                    <div className="h-1 rounded-t-xl bg-gradient-to-r from-[#9D4D01] to-[#E3BC97]" />

                    <div className="p-4 flex-1 space-y-3">
                      {/* Subject + actions row */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#582F08] text-sm leading-snug line-clamp-2 flex-1">
                          {trail.subject}
                        </h3>
                        <Dropdown
                          menu={{ items: getActionItems(), onClick: handleMenuClick(trail) }}
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <button
                            className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-[#fdf4ed] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreOutlined className="text-[#9D4D01]" />
                          </button>
                        </Dropdown>
                      </div>

                      {/* Reference */}
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Reference</p>
                        <p className="font-mono text-xs text-gray-600">{trail?.ref || '—'}</p>
                      </div>

                      {/* Last recipient */}
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">With</p>
                        {lastRecipient
                          ? <Tag color="orange" className="text-xs">{lastRecipient}</Tag>
                          : <span className="text-xs text-gray-400">—</span>}
                      </div>

                      {/* Date */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#f0e6da]">
                        <span className="text-xs text-gray-400">
                          {dayjs(trail?.createdAt).format('MMM D, YYYY')}
                        </span>
                        <span className="text-xs text-[#9D4D01] font-medium">
                          {trail.trail?.length ?? 0} stop{trail.trail?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            /* Empty state */
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <svg viewBox="0 0 120 100" className="w-32 h-32 mb-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="90" rx="40" ry="6" fill="#f0e6da"/>
                <rect x="30" y="20" width="44" height="56" rx="5" fill="#E3BC97" opacity="0.5"/>
                <rect x="36" y="28" width="32" height="4" rx="2" fill="#9D4D01" opacity="0.4"/>
                <rect x="36" y="36" width="22" height="4" rx="2" fill="#9D4D01" opacity="0.3"/>
                <rect x="36" y="44" width="26" height="4" rx="2" fill="#9D4D01" opacity="0.3"/>
                <circle cx="77" cy="55" r="14" stroke="#9D4D01" strokeWidth="3" fill="white"/>
                <circle cx="77" cy="55" r="7" fill="#E3BC97" opacity="0.6"/>
                <line x1="87" y1="65" x2="96" y2="74" stroke="#582F08" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <p className="text-lg font-semibold text-[#582F08]">No documents found</p>
              <p className="text-sm text-gray-400 mt-1">No trails are available to display.</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-[#f0e6da] bg-white">
            <Table
              dataSource={isArray(trailDisplay?.data) ? trailDisplay.data : []}
              columns={columns}
              rowKey="docID"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="small"
              rowClassName={(_, i) => i % 2 !== 0 ? 'bg-[#fffaf6]' : ''}
              className="cp-table w-full"
            />
        </div>
      )}

      {/* ── Modals ── */}
      <Trail
        open={isModalOpen}
        handleCancel={handleCancel}
        trails={documentTrial?.data?.trails}
      />

      <DocumentLinksModal
        open={isLinksModalOpen}
        onClose={closeLinksModal}
        documentId={selectedDocForLinks?.docID}
        documentSubject={selectedDocForLinks?.subject}
      />

      <Modal
        title={null}
        open={isReadReceiptsModalOpen}
        onCancel={closeReadReceiptsModal}
        footer={null}
        width={720}
        destroyOnClose
      >
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#9D4D01] mb-1">
            View receipt
          </p>
          <h2 className="text-lg font-semibold text-[#582F08] leading-tight">
            {selectedDocForReceipts?.subject}
          </h2>
        </div>
        {selectedDocForReceipts && (
          <ReadReceipts documentId={selectedDocForReceipts.docID} />
        )}
      </Modal>
    </div>
  );
};

export default Locator;
