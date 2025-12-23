import React, { useState } from 'react';
import { Tag, Tooltip, Button, Empty, Spin, Popconfirm, message, Collapse, Tabs } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocumentLinks, deleteDocumentLink, LINK_TYPE_COLORS } from '../http/documentLinks';
import { LuLink, LuTrash2, LuArrowRight, LuArrowLeft, LuExternalLink, LuFileText, LuMapPin } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const LinkedDocuments = ({ documentId, onViewDocument, onViewTrail }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch document links
  const { data: linksData, isLoading } = useQuery({
    queryKey: ['documentLinks', documentId],
    queryFn: () => getDocumentLinks(documentId),
    enabled: !!documentId,
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: (linkId) => deleteDocumentLink(linkId),
    onSuccess: () => {
      message.success('Link removed successfully');
      queryClient.invalidateQueries(['documentLinks', documentId]);
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to remove link');
    },
  });

  const handleDeleteLink = (linkId) => {
    deleteLinkMutation.mutate(linkId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin />
      </div>
    );
  }

  const { linksTo = [], linksFrom = [], totalLinks = 0 } = linksData || {};

  if (totalLinks === 0) {
    return (
      <Empty
        description="No linked documents"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-4"
      />
    );
  }

  const LinkItem = ({ link, direction }) => {
    const document = direction === 'to' ? link.targetDoc : link.sourceDoc;
    const ArrowIcon = direction === 'to' ? LuArrowRight : LuArrowLeft;
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <Tooltip title={direction === 'to' ? 'Links to this document' : 'Linked from this document'}>
            <ArrowIcon className="text-gray-400 text-lg" />
          </Tooltip>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800">{document.subject}</p>
              <Tag color={LINK_TYPE_COLORS[link.linkType]} size="small">
                {link.linkType}
              </Tag>
            </div>
            <p className="text-sm text-gray-500 font-mono">{document.ref}</p>
            {link.description && (
              <p className="text-sm text-gray-400 mt-1 italic">"{link.description}"</p>
            )}
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
              <span>Linked by: {link.createdBy?.name}</span>
              <span>{dayjs(link.createdAt).format('MMM D, YYYY')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="View document PDF">
            <Button
              type="text"
              icon={<LuFileText className="text-blue-500" />}
              onClick={() => navigate(`/view-document/${document.docID}`)}
            />
          </Tooltip>
          <Tooltip title="View linked documents">
            <Button
              type="text"
              icon={<LuLink className="text-purple-500" />}
              onClick={() => onViewDocument?.(document.docID)}
            />
          </Tooltip>
          <Tooltip title="View document trail">
            <Button
              type="text"
              icon={<LuMapPin className="text-green-500" />}
              onClick={() => onViewTrail?.(document.docID)}
            />
          </Tooltip>
          <Popconfirm
            title="Remove this link?"
            description="This will unlink the documents."
            onConfirm={() => handleDeleteLink(link.id)}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<LuTrash2 />}
              loading={deleteLinkMutation.isLoading}
            />
          </Popconfirm>
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-1">
          <LuLink /> All Links ({totalLinks})
        </span>
      ),
      children: (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {linksTo.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <LuArrowRight /> Links To ({linksTo.length})
              </p>
              <div className="space-y-2">
                {linksTo.map((link) => (
                  <LinkItem key={link.id} link={link} direction="to" />
                ))}
              </div>
            </div>
          )}
          
          {linksFrom.length > 0 && (
            <div className={linksTo.length > 0 ? 'mt-4 pt-4 border-t' : ''}>
              <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <LuArrowLeft /> Linked From ({linksFrom.length})
              </p>
              <div className="space-y-2">
                {linksFrom.map((link) => (
                  <LinkItem key={link.id} link={link} direction="from" />
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'to',
      label: `Links To (${linksTo.length})`,
      children: (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {linksTo.length > 0 ? (
            linksTo.map((link) => (
              <LinkItem key={link.id} link={link} direction="to" />
            ))
          ) : (
            <Empty description="No outgoing links" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      ),
    },
    {
      key: 'from',
      label: `Linked From (${linksFrom.length})`,
      children: (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {linksFrom.length > 0 ? (
            linksFrom.map((link) => (
              <LinkItem key={link.id} link={link} direction="from" />
            ))
          ) : (
            <Empty description="No incoming links" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Tabs items={tabItems} size="small" />
    </div>
  );
};

export default LinkedDocuments;
