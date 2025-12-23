import React, { useEffect, useState } from 'react';
import { useUser } from './CustomHook/useUser';
import { useTrail } from './CustomHook/useTrail';
import Lottie from 'react-lottie';
import locator from '../../src/lotties/locator.json';
import { Modal, Steps, Button, Table, Popover, Tooltip, Input, Badge } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { FaRegEye } from 'react-icons/fa';
import { FaTable, FaThLarge } from 'react-icons/fa';
import { EyeOutlined } from '@ant-design/icons';
import axiosInstance from '../Components/axiosInstance';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import Trail from '../Components/Trail/Trail';
import { LuFileSearch, LuSearch, LuLink } from 'react-icons/lu';
import { BsSend } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
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

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: locator,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // **Table Columns Configuration for Trail Data**
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
                    <span key={trailItem.trailsId}>
                      {trailItem.receiver?.name}
                    </span>
                  ) : null
                )
              : 'Document In Possession'}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Popover
            content={
              <div>
                <p>Read Receipts</p>
              </div>
            }
          >
            <button type="link" onClick={(e) => openReadReceiptsModal(record, e)}>
              <EyeOutlined className="text-[20px] text-blue-600" />
            </button>
          </Popover>
          <Popover
            content={
              <div>
                <p>View Trail</p>
              </div>
            }
          >
            <button type="link" onClick={() => showModal(record)}>
              <FaRegEye className="text-[20px]" />
            </button>
          </Popover>
          <Popover
            content={
              <div>
                <p>Document Links</p>
              </div>
            }
          >
            <button type="link" onClick={(e) => openLinksModal(record, e)}>
              <LuLink className="text-[20px] text-orange-600" />
            </button>
          </Popover>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      {/* Toggle Button to Switch Views */}
      <div className="mb-4 flex justify-end fixed top-[8rem] right-[4.5rem]">
        <Popover
          content={
            <div>
              <p>Toggle View</p>
            </div>
          }
        >
          <button onClick={() => setIsGridView(!isGridView)}>
            {isGridView ? (
              <FaTable size={20} className="text-[#582F08]" />
            ) : (
              <FaThLarge size={20} className="text-[#582F08]" />
            )}
          </button>
        </Popover>
      </div>
      {console.log(trailDisplay && { trailDisplay })}
      {/* Conditional Rendering for Grid or Table View */}
      {isGridView ? (
        <div className=" ">
          <div className=" grid grid-cols-4 no-scrollbar h-screen">
            {isArray(trailDisplay?.data) ? (
              trailDisplay?.data?.map((trail) => (
                  <div className=" flex items-center  p-6 cursor-pointer " key={trail.docID}>
                  <div className="w-full max-w-2xl">
                    <div
                      className="relative transition-all bg-[#c2773199] rounded-2xl p-8 shadow-2xl hover:bg-[#5f4a387d] overflow-hidden"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(249, 238, 218, 0) 50%)',
                      }}
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                        <Tooltip title="Read Receipts">
                          <button
                            onClick={(e) => openReadReceiptsModal(trail, e)}
                            className="hover:scale-110 transition-transform p-1 hover:bg-white/20 rounded"
                          >
                            <EyeOutlined className="w-5 h-5 text-blue-600" />
                          </button>
                        </Tooltip>
                        <Tooltip title="Document Links">
                          <button
                            onClick={(e) => openLinksModal(trail, e)}
                            className="hover:scale-110 transition-transform p-1 hover:bg-white/20 rounded"
                          >
                            <LuLink className="w-5 h-5 text-orange-600" />
                          </button>
                        </Tooltip>
                        <Tooltip title="View Trail">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showModal(trail);
                            }}
                            className="animate-pulse hover:scale-110 transition-transform p-1 hover:bg-white/20 rounded"
                          >
                            <LuSearch className="w-5 h-5 text-gray-600" />
                          </button>
                        </Tooltip>
                        <IoLocationOutline className=" w-8 h-8 text-gray-700" />
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-orange-100/30 rounded-bl-full" />

                      <div className="space-y-6" onClick={() => showModal(trail)}>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">
                            Subject
                          </label>
                          <h2 className="text-xl font-bold text-gray-800">
                            {trail.subject}
                          </h2>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">
                            Reference
                          </label>
                          <p className="font-mono text-gray-700">
                            {trail?.ref || 'N/A'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">
                            Sent To
                          </label>
                          <p className="text-gray-800">
                            {trail?.trail?.length > 0
                              ? trail?.trail[trail?.trail?.length - 1]?.receiver?.name || 'N/A'
                              : 'N/A'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">
                            Date Sent
                          </label>
                          <p className="text-gray-800">
                            {new Date(trail?.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-200/20 via-orange-300/40 to-orange-200/20" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center">
                <span className="text-3xl text-zinc-600">
                  No Trails Available
                </span>
              </div>
            )}
          </div>

          {/* Lottie Animation on the Right Side (Shown Only in Grid View) */}
          {/* <div className="flex justify-center items-center fixed bottom-10 right-[5rem]">
            <Lottie options={defaultOptions} height={450} width={650} />
          </div> */}
        </div>
      ) : (
        // Full-Width Ant Design Table Component for Trail Data (Table View)
        <div>
          <div className="flex justify-end mb-4">
            <Input.Search
              placeholder="Search by subject, recipient..."
              className="w-[30rem]"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Table
            dataSource={isArray(trailDisplay?.data) ? trailDisplay?.data : []}
            columns={columns}
            rowKey="docID"
            pagination={{ pageSize: 10 }}
            className="w-full" // Ensures the table takes full width
          />
        </div>
      )}
      {/* Locator Modal for Trail Steps */}
      <Trail
        open={isModalOpen}
        handleCancel={handleCancel}
        trails={documentTrial?.data?.trails}
      />
      
      {/* Link Document Modal */}
      <LinkDocumentModal
        open={isLinkModalOpen}
        onClose={closeLinkModal}
        documentId={selectedDocForLinking?.docID}
        documentSubject={selectedDocForLinking?.subject}
      />
      
      {/* View Linked Documents Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <LuLink className="text-[#582F08]" />
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
              icon={<LuLink />}
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

      {/* Read Receipts Modal */}
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
