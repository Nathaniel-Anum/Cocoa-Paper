import React, { useState } from "react";
import { useTrail } from "./CustomHook/useTrail";
import Lottie from "react-lottie";
import locator from "../../src/lotties/locator.json";
import { Modal, Steps, Popover } from "antd";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../Components/axiosInstance";

const Locator = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trialId, setTrialId] = useState("");

  const [stepsData, SetStepsData] = useState([]);
  const [document, setDocument] = useState({});

  // useQuery for getting all trails associated to a document
  const { data: documentTrial, isLoading } = useQuery({
    queryKey: ["documentTrial", trialId],
    queryFn: () => {
      console.log(`document ID assigned: ${trialId}`);
      return axiosInstance.get(`/trail/${trialId}`);
    },
    enabled: !!trialId,
  });

  const showModal = (trial) => {
    setIsModalOpen(true);
    setTrialId(trial?.docID);
    console.log(trial, documentTrial?.data);

    // const temp = [
    //   {
    //     title: "Sender",

    //     description: trial?.sender?.name,
    //   },
    //   {
    //     title: (
    //       <Popover
    //         content={
    //           <div className="cursor-pointer">
    //             <p>Department: {trial?.document?.department?.departmentName}</p>
    //             <p>Date: {new Date(trial?.createdAt).toDateString()}</p>
    //             <p>Time: {new Date(trial?.createdAt).toLocaleTimeString()}</p>
    //           </div>
    //         }
    //       >
    //         <p className="cursor-pointer">{trial?.document?.status}</p>
    //       </Popover>
    //     ),
    //     description: trial?.receiver?.name,
    //   },
    //   {
    //     title: documentTrial?.data?.user,
    //   },
    //   // {
    //   //   title: "documentTrial?.data?.status",
    //   //   description: documentTrial?.data?.receiver?.name,
    //   // },
    // ];
    // SetStepsData(temp);
    // const temp = [
    //   {
    //     title: "Sender",

    //     description: trial?.sender?.name,
    //   },
    //   {
    //     title: (
    //       <Popover
    //         content={
    //           <div className="cursor-pointer">
    //             <p>Department: {trial?.document?.department?.departmentName}</p>
    //             <p>Date: {new Date(trial?.createdAt).toDateString()}</p>
    //             <p>Time: {new Date(trial?.createdAt).toLocaleTimeString()}</p>
    //           </div>
    //         }
    //       >
    //         <p className="cursor-pointer">{trial?.document?.status}</p>
    //       </Popover>
    //     ),
    //     description: trial?.receiver?.name,
    //   },
    //   {
    //     title: documentTrial?.data?.user,
    //   },
    //   // {
    //   //   title: "documentTrial?.data?.status",
    //   //   description: documentTrial?.data?.receiver?.name,
    //   // },
    // ];

    const temp  = documentTrial?.data?.trails?.map((trail)=> {
      return { 
        title: trail.status,
        description: trail.receiver.name
      }
    })
   
    SetStepsData(temp);
  };

  // console.log(documentTrial?.data);

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const { allTrails } = useTrail();
  // console.log(allTrails);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: locator,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="  pt-[3rem]  pl-[200px] pr-[72px] no-scrollbar overflow-scroll  border-red-500 ">
      <div className="grid grid-cols-2   border-red-500">
        <div className="max-h-[90%] overflow-scroll no-scrollbar h-screen">
          {allTrails?.map((trail, docID) => (
            <div
              key={docID}
              className="  bg-[#F9EEDA]  hover:duration-200 hover:shadow-lg mb-5 p-5 w-[25rem] cursor-pointer "
              onClick={() => showModal(trail)}
            >
              <h2 className="text-[#582F08] font-semibold">
                Sent To: {trail.receiver.name}
              </h2>
              <p className="font-semibold">
                Department: {trail.document.department.departmentName}
              </p>
              <p className="font-semibold">
                Document: {trail.document.subject}
              </p>
            </div>
          ))}
        </div>
        <Modal
          title="Locator"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          centered="true"
        >
          <Steps items={stepsData} />
        </Modal>
        <div className="flex justify-center items-center">
          <Lottie options={defaultOptions} height={450} width={650} />
        </div>
      </div>
    </div>
  );
};

export default Locator;
