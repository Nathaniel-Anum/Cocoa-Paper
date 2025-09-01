import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useUser } from './useUser';
import axiosInstance from '../../Components/axiosInstance';

export const useTrail = (type) => {
  const { user } = useUser();

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [allTrails, setAllTrails] = useState([]);
  const [physicalDocument, setPhysicalDocument] = useState([]);

  // useQuery to fetch all trails
  const { data: trails, isLoading } = useQuery({
    queryKey: ['trail'],
    queryFn: () => {
      return axiosInstance.get('/all-Trails');
    },
  });

  useEffect(() => {
    if (!isLoading && user && trails?.data.length) {
      // Build set of docIDs that have any Archived status
      const archivedDocIds = new Set(
        trails.data
          .filter((t) => t.status === 'Archived' && t.docID)
          .map((t) => t.docID)
      );

      console.log(trails.data);

      // Normal incoming (exclude any docID that has an Archived status)
      const incomingData = trails.data
        .filter(
          (i) =>
            i.receiver.userId === user?.userId &&
            i.status === 'Received' &&
            i.docID &&
            !archivedDocIds.has(i.docID)
        )
        .map((i) => ({ ...i, isCarbonCopy: false }));

      // Carbon copy incoming
      const carbonCopyData = trails.data.flatMap((trail) => {
        if (Array.isArray(trail.carbonCopies)) {
          return trail.carbonCopies
            .filter((cc) => cc.copiedToUserId === user?.userId)
            .map(() => ({ ...trail, isCarbonCopy: true }));
        }
        return [];
      });

      // Merge, deduplicate, and preserve original order from trails.data
      const seen = new Set();
      const orderedIncoming = [];
      trails.data.forEach((trail) => {
        const key = trail.docID || trail.trailsId;
        if (seen.has(key)) return;
        // Prefer carbon copy if present, else normal
        const cc = carbonCopyData.find((t) => (t.docID || t.trailsId) === key);
        const normal = incomingData.find(
          (t) => (t.docID || t.trailsId) === key
        );
        if (cc) {
          orderedIncoming.push(cc);
          seen.add(key);
        } else if (normal) {
          orderedIncoming.push(normal);
          seen.add(key);
        }
      });
      setIncoming(orderedIncoming);

      const outgoingDataRaw = trails.data.filter(
        (i) => i.sender.userId === user?.userId
      );
      // Filter outgoingData to keep only the most recent record for each unique reference
      const uniqueOutgoingMap = new Map();
      outgoingDataRaw.forEach((trail) => {
        const ref = trail.document.ref;
        if (
          !uniqueOutgoingMap.has(ref) ||
          new Date(trail.createdAt) >
            new Date(uniqueOutgoingMap.get(ref).createdAt)
        ) {
          uniqueOutgoingMap.set(ref, trail);
        }
      });
      const outgoingData = Array.from(uniqueOutgoingMap.values());
      setOutgoing(outgoingData);

      const physicalDocsData = trails.data.filter(
        (i) =>
          i.receiver.userId === user?.userId && i.status === 'PendingReceipt'
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
      type === 'incoming'
        ? incoming
        : type === 'outgoing'
        ? outgoing
        : physicalDocument,
    isLoading,
    incomingLength,
    outgoingLength,
    physicalLength,
    allTrails,
  };
};
