import React, { useEffect, useState } from 'react';
import { useUser } from './CustomHook/useUser';
import { useTrail } from './CustomHook/useTrail';
import Lottie from 'react-lottie';
import locator from '../../src/lotties/locator.json';
import { Modal, Steps, Button, Table, Popover, Tooltip } from 'antd'; // Removed Popover import, added Button and Table
import { useQuery } from '@tanstack/react-query';
import { FaRegEye } from 'react-icons/fa';
import { FaTable, FaThLarge } from 'react-icons/fa';
import axiosInstance from '../Components/axiosInstance';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import Trail from '../Components/Trail/Trail';
import { LuFileSearch, LuSearch } from 'react-icons/lu';
import { BsSend } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
import { isArray } from 'lodash';
const Locator = () => {
  dayjs.extend(advancedFormat);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trialId, setTrialId] = useState('');
  const [isGridView, setIsGridView] = useState(true); // State to toggle between grid and table view

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
    },
    {
      title: 'Sent To',
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
      ),
    },
  ];

  return (
    <div>
      {/* Toggle Button to Switch Views */}
      <div className="mb-4 flex justify-end ">
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
        <div className="grid grid-cols-2 border-red-500">
          <div className="max-h-[90%] grid grid-cols-2 overflow-scroll no-scrollbar h-screen">
            {isArray(trailDisplay?.data) ? (
              trailDisplay?.data?.map((trail) => (
                <div className=" flex items-center  p-6 cursor-pointer ">
                  <div className="w-full max-w-2xl">
                    <div
                      onClick={() => showModal(trail)}
                      className="relative transition-all bg-[#c2773199] rounded-2xl p-8 shadow-2xl hover:bg-[#5f4a387d] overflow-hidden"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(249, 238, 218, 0) 50%)',
                      }}
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className="animate-pulse">
                          <LuSearch className="w-5 h-5 text-gray-600" />
                        </div>
                        <IoLocationOutline className=" w-8 h-8 text-gray-700" />
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-orange-100/30 rounded-bl-full" />

                      <div className="space-y-6">
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
                            REF-2024-03-QR
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">
                            Sent To
                          </label>
                          <p className="text-gray-800">
                            {trail?.trail?.map(
                              (trailItem) =>
                                trailItem?.sender.userId === user?.userId && (
                                  //
                                  <span> {trailItem?.receiver?.name}</span>
                                )
                            )}
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
          <div className="flex justify-center items-center">
            <Lottie options={defaultOptions} height={450} width={650} />
          </div>
        </div>
      ) : (
        // Full-Width Ant Design Table Component for Trail Data (Table View)
        <Table
          dataSource={isArray(trailDisplay?.data) ? trailDisplay?.data : []}
          columns={columns}
          rowKey="docID"
          pagination={{ pageSize: 10 }}
          className="w-full" // Ensures the table takes full width
        />
      )}
      {/* Locator Modal for Trail Steps */}
      <Trail
        open={isModalOpen}
        handleCancel={handleCancel}
        trails={documentTrial?.data?.trails}
      />
    </div>
  );
};

export default Locator;
