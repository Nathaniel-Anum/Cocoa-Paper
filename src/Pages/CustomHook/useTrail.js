import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { useEffect, useState } from "react";
import axiosInstance from "../../Components/axiosInstance";

export const useTrail = (type) => {
  const { user } = useUser();
  // console.log(user);

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [physicalDocument, setPhysicalDocument] = useState([]);
  const [allTrails, setAllTrails] = useState([]);

  // useQuery to fetch all trails
  const { data: trails, isLoading } = useQuery({
    queryKey: ["trail"],
    queryFn: () => {
      return axiosInstance.get("/all-Trails");
    },
  });
  // console.log(trails?.data);

  

  useEffect(() => {
    if (!isLoading && user && trails?.data.length) {
      const incomingData = trails.data.filter(
        (i) =>
          i.receiver.userId === user?.userId && i.status === "Received"   
      );

      setIncoming(incomingData);

      const outgoingData = trails.data.filter(
        (i) => i.sender.userId === user?.userId
      );
      setOutgoing(outgoingData);

      const physicalDocsData = trails.data.filter(
        (i) =>  i.receiver.userId === user?.userId && i.status === "PendingReceipt"
      );
      setPhysicalDocument(physicalDocsData);
    }

    const AllTrail = trails?.data;
    setAllTrails(AllTrail);
  }, [isLoading, user, trails]);

  // length of all the trails
  const outgoingLength = outgoing.length;
  const incomingLength = incoming.length;
  const physicalLength = physicalDocument.length;

  return {
    trails:
      type === "incoming"
        ? incoming
        : type === "outgoing"
        ? outgoing
        : physicalDocument,
    isLoading,
    incomingLength,
    outgoingLength,
    physicalLength,
    allTrails,
  };
};
