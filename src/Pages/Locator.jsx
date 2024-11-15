import React, { useEffect, useState } from "react";
import { useUser } from "./CustomHook/useUser";
import { useTrail } from "./CustomHook/useTrail";
import Lottie from "react-lottie";
import locator from "../../src/lotties/locator.json";
import { Modal, Steps, Button, Table, Popover } from "antd"; // Removed Popover import, added Button and Table
import { useQuery } from "@tanstack/react-query";
import { FaRegEye } from "react-icons/fa";
import { FaTable, FaThLarge } from "react-icons/fa";
import axiosInstance from "../Components/axiosInstance";

const Locator = () => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trialId, setTrialId] = useState("");
  const [isGridView, setIsGridView] = useState(true); // State to toggle between grid and table view

  // useQuery to fetch all trails
  const { data: trailDisplay } = useQuery({
    queryKey: ["trailDisplay"],
    queryFn: () => {
      return axiosInstance.get("/trail");
    },
  });

  // useQuery for getting all trails associated to a document
  const { data: documentTrial, isLoading } = useQuery({
    queryKey: ["documentTrial", trialId],
    queryFn: () => {
      return axiosInstance.get(`/trail/${trialId}`);
    },
    enabled: !!trialId,
  });

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
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // **Table Columns Configuration for Trail Data**
  const columns = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Sent To",
      dataIndex: "receiver",
      key: "receiver",
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
              : "Document In Possession"}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
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
    <div className="pt-[3rem] pl-[200px] pr-[72px] no-scrollbar overflow-scroll border-red-500">
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

      {/* Conditional Rendering for Grid or Table View */}
      {isGridView ? (
        <div className="grid grid-cols-2 border-red-500">
          <div className="max-h-[90%] overflow-scroll no-scrollbar h-screen">
            {trailDisplay?.data.map((trail) => (
              <div
                key={trail?.docID}
                className="bg-[#F9EEDA] hover:duration-200 hover:shadow-lg mb-5 p-5 w-[25rem] cursor-pointer"
                onClick={() => showModal(trail)}
              >
                <p className="font-semibold">Subject: {trail.subject}</p>
                {trail?.trail?.map((trailItem) => (
                  <div key={trailItem?.trailsId}>
                    {trailItem?.sender.userId === user?.userId && (
                      <h2 className="text-[#582F08] font-semibold">
                        Sent to: {trailItem?.receiver?.name}
                      </h2>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Lottie Animation on the Right Side (Shown Only in Grid View) */}
          <div className="flex justify-center items-center">
            <Lottie options={defaultOptions} height={450} width={650} />
          </div>
        </div>
      ) : (
        // Full-Width Ant Design Table Component for Trail Data (Table View)
        <Table
          dataSource={trailDisplay?.data}
          columns={columns}
          rowKey="docID"
          pagination={{ pageSize: 10 }}
          className="w-full" // Ensures the table takes full width
        />
      )}

      {/* Locator Modal for Trail Steps */}
      <Modal
        title="Locator"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered="true"
        width={"60%"}
      >
        <div className="py-6">
          <Steps
            responsive
            className="grid grid-cols-2 gap-y-2"
            items={documentTrial?.data?.trails.flatMap((trail, index) => {
              if (index === 0) {
                return [
                  {
                    title: "Sent",
                    description: trail.sender.name,
                  },
                  {
                    title: trail?.status,
                    description: trail.receiver.name,
                  },
                ];
              } else {
                return {
                  title: trail.status,
                  description: trail.receiver.name,
                };
              }
            })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Locator;
