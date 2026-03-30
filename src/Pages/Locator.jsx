import React, { useEffect, useState } from 'react';
import { useUser } from './CustomHook/useUser';
import { useTrail } from './CustomHook/useTrail';
import { Modal, Button, Table, Dropdown, Input, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { EyeOutlined, MoreOutlined, ApartmentOutlined, LinkOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { FaTable, FaThLarge } from 'react-icons/fa';
import axiosInstance from '../Components/axiosInstance';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import Trail from '../Components/Trail/Trail';
import { LuLink } from 'react-icons/lu';
import { isArray } from 'lodash';
import LinkDocumentModal from '../Components/modals/LinkDocumentModal';
import LinkedDocuments from '../Components/LinkedDocuments';
import ReadReceipts from '../Components/ReadReceipts';
const Locator = () => {
  dayjs.extend(advancedFormat);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trialId, setTrialId] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedDocForLinking, setSelectedDocForLinking] = useState(null);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
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

  const openLinkModal = (doc, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedDocForLinking(doc);
    setIsLinkModalOpen(true);
  };

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setSelectedDocForLinking(null);
  };

  const openLinksModal = (doc, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setTrialId(doc?.docID);
    setIsLinksModalOpen(true);
  };

  const closeLinksModal = () => {
    setIsLinksModalOpen(false);
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
  const getActionItems = (record) => [
    {
      key: 'trail',
      label: 'View Trail',
      icon: <SearchOutlined />,
      onClick: () => showModal(record),
    },
    {
      key: 'receipts',
      label: 'Read Receipts',
      icon: <EyeOutlined />,
      onClick: () => openReadReceiptsModal(record),
    },
    {
      key: 'links',
      label: 'Document Links',
      icon: <LinkOutlined />,
      onClick: (e) => openLinksModal(record, e),
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
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#fdf4ed] transition-colors">
            <MoreOutlined className="text-lg text-[#9D4D01]" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="pl-[10rem] md:pl-[11rem] pr-4 md:pr-8 pt-6 pb-12 min-h-screen bg-[#faf7f4]">

      {/* ── Header ── */}
      <div className="bg-white border border-[#f0e6da] rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            {/* Inline SVG Illustration */}
            <div className="w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="28" fill="#FDF4ED"/>
                {/* Map pin document */}
                <rect x="16" y="12" width="18" height="24" rx="3" fill="#E3BC97"/>
                <rect x="19" y="17" width="12" height="2" rx="1" fill="#9D4D01"/>
                <rect x="19" y="21" width="8" height="2" rx="1" fill="#9D4D01" opacity="0.6"/>
                <rect x="19" y="25" width="10" height="2" rx="1" fill="#9D4D01" opacity="0.6"/>
                {/* Pin */}
                <circle cx="36" cy="32" r="7" fill="#9D4D01"/>
                <circle cx="36" cy="32" r="3" fill="white"/>
                <path d="M36 39 L33 44 L36 42 L39 44 Z" fill="#9D4D01"/>
                {/* Search glass */}
                <circle cx="20" cy="40" r="5" stroke="#582F08" strokeWidth="2" fill="none"/>
                <line x1="24" y1="44" x2="27" y2="47" stroke="#582F08" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#582F08]">Document Locator</h1>
              <p className="text-sm text-gray-500 mt-0.5">Track the real-time location and trail of any document in the system.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Input
              placeholder="Search by subject or recipient..."
              prefix={<SearchOutlined className="text-[#9D4D01]" />}
              allowClear
              size="middle"
              className="w-full md:w-72 rounded-lg"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-[#f0e6da] bg-white hover:bg-[#fdf4ed] transition-colors text-[#582F08]"
              title={isGridView ? 'Switch to Table view' : 'Switch to Grid view'}
            >
              {isGridView ? <FaTable size={16} /> : <FaThLarge size={16} />}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-[#f0e6da] px-6 py-3 flex gap-6 bg-[#fffaf6]">
          <div className="flex items-center gap-2">
            <EnvironmentOutlined className="text-[#9D4D01]" />
            <span className="text-sm text-gray-600">
              <span className="font-bold text-[#582F08]">
                {isArray(trailDisplay?.data) ? trailDisplay.data.length : 0}
              </span> documents tracked
            </span>
          </div>
        </div>
      </div>

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
                    className="bg-white border border-[#f0e6da] rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
                    onClick={() => showModal(trail)}
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
                          menu={{ items: getActionItems(trail) }}
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <button
                            className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-[#fdf4ed] transition-colors opacity-0 group-hover:opacity-100"
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
        <div className="bg-white rounded-xl shadow-sm border border-[#f0e6da]">
          <div className="p-4">
            <Table
              dataSource={isArray(trailDisplay?.data) ? trailDisplay.data : []}
              columns={columns}
              rowKey="docID"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 600 }}
              size="small"
              rowClassName={(_, i) => i % 2 !== 0 ? 'bg-[#fffaf6]' : ''}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <Trail
        open={isModalOpen}
        handleCancel={handleCancel}
        trails={documentTrial?.data?.trails}
      />

      <LinkDocumentModal
        open={isLinkModalOpen}
        onClose={closeLinkModal}
        documentId={selectedDocForLinking?.docID}
        documentSubject={selectedDocForLinking?.subject}
      />

      <Modal
        title={
          <div className="flex items-center gap-2">
            <LinkOutlined className="text-[#582F08]" />
            <span>Linked Documents</span>
          </div>
        }
        open={isLinksModalOpen}
        onCancel={closeLinksModal}
        footer={null}
        width={800}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => {
                const currentDoc = trailDisplay?.data?.find(d => d.docID === trialId);
                if (currentDoc) {
                  closeLinksModal();
                  openLinkModal(currentDoc);
                }
              }}
              className="bg-[#582F08]"
            >
              Link New Document
            </Button>
          </div>
          <LinkedDocuments
            documentId={trialId}
            onViewDocument={(docId) => {
              closeLinksModal();
              setTrialId(docId);
              setIsLinksModalOpen(true);
            }}
            onViewTrail={(docId) => {
              closeLinksModal();
              setTrialId(docId);
              setIsModalOpen(true);
            }}
          />
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-[#582F08]" />
            <span>Read Receipts</span>
          </div>
        }
        open={isReadReceiptsModalOpen}
        onCancel={closeReadReceiptsModal}
        footer={null}
        width={800}
      >
        {selectedDocForReceipts && (
          <ReadReceipts documentId={selectedDocForReceipts.docID} />
        )}
      </Modal>
    </div>
  );
};

export default Locator;
