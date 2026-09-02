import React from 'react';
import { Tag, Tooltip, Button, Empty, Spin, Popconfirm, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocumentLinks, deleteDocumentLink, LINK_TYPE_COLORS } from '../http/documentLinks';
import { LuArrowRight, LuArrowLeft, LuFileText, LuTrash2 } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const LinkedDocuments = ({ documentId, onViewLinks }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: linksData, isLoading } = useQuery({
    queryKey: ['documentLinks', documentId],
    queryFn: () => getDocumentLinks(documentId),
    enabled: !!documentId,
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId) => deleteDocumentLink(linkId),
    onSuccess: () => {
      message.success('Link removed');
      queryClient.invalidateQueries(['documentLinks', documentId]);
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to remove link');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spin />
      </div>
    );
  }

  const { linksTo = [], linksFrom = [], totalLinks = 0 } = linksData || {};

  if (totalLinks === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#e9d6c2] bg-[#fffaf6] py-10">
        <Empty
          description="No linked documents yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  const LinkItem = ({ link, direction }) => {
    const document = direction === 'to' ? link.targetDoc : link.sourceDoc;
    const ArrowIcon = direction === 'to' ? LuArrowRight : LuArrowLeft;

    return (
      <div className="group flex items-start gap-3 rounded-xl border border-[#f0e6da] bg-white px-3 py-3 hover:border-[#E3BC97] transition-colors">
        <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#FDF4ED] text-[#9D4D01] flex items-center justify-center flex-shrink-0">
          <ArrowIcon className="text-base" />
        </div>
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onViewLinks?.(document.docID, document.subject)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-[#582F08] truncate">{document.subject}</p>
            <Tag color={LINK_TYPE_COLORS[link.linkType]} className="m-0">
              {link.linkType}
            </Tag>
          </div>
          <p className="text-xs text-[#7a6859] font-mono mt-0.5">{document.ref}</p>
          {link.description && (
            <p className="text-xs text-[#7a6859] mt-1">{link.description}</p>
          )}
          <p className="text-[11px] text-[#a08b7a] mt-1">
            {link.createdBy?.name} · {dayjs(link.createdAt).format('MMM D, YYYY')}
          </p>
        </button>
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Tooltip title="Open document">
            <Button
              type="text"
              size="small"
              icon={<LuFileText className="text-[#9D4D01]" />}
              onClick={() => navigate(`/view-document/${document.docID}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Remove this link?"
            description="The documents stay in the system; only the relationship is removed."
            onConfirm={() => deleteLinkMutation.mutate(link.id)}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<LuTrash2 />}
              loading={deleteLinkMutation.isLoading}
            />
          </Popconfirm>
        </div>
      </div>
    );
  };

  const Section = ({ title, count, items, direction }) => {
    if (!items.length) return null;
    return (
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[#9D4D01]">
          {title} ({count})
        </p>
        {items.map((link) => (
          <LinkItem key={link.id} link={link} direction={direction} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <Section title="Links to" count={linksTo.length} items={linksTo} direction="to" />
      <Section title="Linked from" count={linksFrom.length} items={linksFrom} direction="from" />
    </div>
  );
};

export default LinkedDocuments;
