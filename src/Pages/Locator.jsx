import React, { useEffect, useState } from "react";
import { useUser } from "./CustomHook/useUser";
import { useTrail } from "./CustomHook/useTrail";
import Lottie from "react-lottie";
import locator from "../../src/lotties/locator.json";
import { Modal, Steps, Popover } from "antd";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../Components/axiosInstance";

const Locator = () => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trialId, setTrialId] = useState("");

  const [stepsData, setStepsData] = useState([]);
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

  console.log(stepsData);

  const showModal = (trial) => {
    setIsModalOpen(true);
    setTrialId(trial?.docID);
    console.log(trial, documentTrial?.data);
  };

  // console.log(documentTrial?.data);

  // 2nd useQuery to fetch all trails
  const { data: trailDisplay } = useQuery({
    queryKey: ["trailDisplay"],
    queryFn: () => {
      return axiosInstance.get("/trail");
    },
  });
  console.log(trailDisplay?.data);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { allTrails } = useTrail();
  // console.log("Hello",allTrails);

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
        {/* <div className="max-h-[90%] overflow-scroll no-scrollbar h-screen">
          {  allTrails?.map((trail, docID) => (
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
          width={"60%"}
        >
          <div className="py-6">
            <Steps
              responsive
              className="grid grid-cols-2 gap-y-2 "
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
        </Modal> */}

        <div className="max-h-[90%] overflow-scroll no-scrollbar h-screen">
          {trailDisplay?.data.map((trail) => (
            <div
              key={trail?.docID}
              className="  bg-[#F9EEDA]  hover:duration-200 hover:shadow-lg mb-5 p-5 w-[25rem] cursor-pointer "
              onClick={() => showModal(trail)}
            >
              <p className="font-semibold">Subject: {trail.subject}</p>
              {trail?.trail?.map((trail) => (
                <div key={trail?.trailsId}>
                  {trail?.sender.userId === user?.userId && (
                    <h2 className="text-[#582F08] font-semibold">
                      Sent to: {trail?.receiver?.name}
                    </h2>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

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
              className="grid grid-cols-2 gap-y-2 "
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

        <div className="flex justify-center items-center">
          <Lottie options={defaultOptions} height={450} width={650} />
        </div>
      </div>
      <div>
        {trailDisplay?.data.map((doc) => (
          <div key={doc.docID}>
            <h2>{doc.subject}</h2>
            {doc?.trail?.map((trail) => (
              <div key={trail?.trailsId}>
                {trail?.sender.userId === user?.userId && (
                  <p>Sent to: {trail?.receiver?.name}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Locator;
