import React, { useState } from 'react';
import {
  Modal,
  Button,
  Segmented,
  Checkbox,
  Avatar,
  Divider,
  Popconfirm,
  message,
  Spin,
  Empty,
} from 'antd';
import { DeleteOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AccessSelector from './AccessSelector';
import {
  getFolderAccessList,
  grantFolderAccess,
  updateFolderAccess,
  revokeFolderAccess,
} from '../../../http/folderAccess';

const ShareFolder = ({ open, setOpen, folder }) => {
  const queryClient = useQueryClient();
  const folderId = folder?.folderId;
  const [newAccess, setNewAccess] = useState([]);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['folderAccess', folderId],
    queryFn: () => getFolderAccessList(folderId),
    enabled: open && Boolean(folderId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['folderAccess', folderId] });
    queryClient.invalidateQueries({
      queryKey: ['archive'],
      exact: false,
      refetchType: 'all',
    });
  };

  const grantMutation = useMutation({
    mutationFn: () =>
      grantFolderAccess(
        folderId,
        newAccess.map((a) => ({
          userId: a.userId,
          role: a.role,
          canDelete: a.canDelete,
        }))
      ),
    onSuccess: () => {
      message.success('Access granted');
      setNewAccess([]);
      invalidate();
    },
    onError: (e) =>
      message.error(e?.response?.data?.error || 'Failed to grant access'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ targetUserId, data }) =>
      updateFolderAccess(folderId, targetUserId, data),
    onSuccess: () => invalidate(),
    onError: (e) =>
      message.error(e?.response?.data?.error || 'Failed to update access'),
  });

  const revokeMutation = useMutation({
    mutationFn: (targetUserId) => revokeFolderAccess(folderId, targetUserId),
    onSuccess: () => {
      message.success('Access revoked');
      invalidate();
    },
    onError: (e) =>
      message.error(e?.response?.data?.error || 'Failed to revoke access'),
  });

  const existingUserIds = members.map((m) => m.user.userId);

  return (
    <Modal
      open={open}
      title={
        <span className="flex items-center gap-2">
          <TeamOutlined /> Share “{folder?.folderName}”
        </span>
      }
      onCancel={() => {
        setOpen(false);
        setNewAccess([]);
      }}
      footer={null}
      width={480}
    >
      {/* Add people */}
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-2 text-[#582F08]">
          <UserAddOutlined />
          <span className="text-sm font-medium">Add people</span>
        </div>
        <AccessSelector
          value={newAccess}
          onChange={setNewAccess}
          excludeUserIds={existingUserIds}
        />
        {newAccess.length > 0 && (
          <Button
            type="primary"
            className="w-full bg-[#9D4D01] mt-3"
            loading={grantMutation.isPending}
            onClick={() => grantMutation.mutate()}
          >
            Grant access to {newAccess.length}{' '}
            {newAccess.length === 1 ? 'person' : 'people'}
          </Button>
        )}
      </div>

      <Divider className="!my-4" />

      {/* Current members */}
      <div className="text-sm font-medium text-[#582F08] mb-2">
        People with access
      </div>
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spin />
        </div>
      ) : members.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Not shared with anyone yet"
        />
      ) : (
        <div className="border border-[#f0e6da] rounded-lg divide-y divide-[#f5ece2] max-h-72 overflow-auto">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-3 py-2">
              <Avatar size="small" className="bg-[#9D4D01] flex-shrink-0">
                {m.user.name?.[0]?.toUpperCase()}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#582F08] truncate">{m.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{m.user.email}</p>
              </div>
              <Segmented
                size="small"
                value={m.role}
                onChange={(role) =>
                  updateMutation.mutate({
                    targetUserId: m.user.userId,
                    data: { role },
                  })
                }
                options={[
                  { label: 'Viewer', value: 'VIEWER' },
                  { label: 'Editor', value: 'EDITOR' },
                ]}
              />
              <Checkbox
                checked={m.canDelete}
                onChange={(e) =>
                  updateMutation.mutate({
                    targetUserId: m.user.userId,
                    data: { canDelete: e.target.checked },
                  })
                }
              >
                <span className="text-xs">Delete</span>
              </Checkbox>
              <Popconfirm
                title="Revoke access?"
                onConfirm={() => revokeMutation.mutate(m.user.userId)}
                okText="Revoke"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ShareFolder;
