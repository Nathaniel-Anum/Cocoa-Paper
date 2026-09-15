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

const flattenFolderIds = (nodes = [], acc = []) => {
  for (const node of nodes) {
    acc.push(node.folderId);
    flattenFolderIds(node.children, acc);
  }
  return acc;
};

const SubfolderChecks = ({ nodes = [], checkedIds, onToggle, disabled }) => {
  if (!nodes.length) return null;
  const checked = new Set(checkedIds);

  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.folderId}>
          <Checkbox
            checked={checked.has(node.folderId)}
            disabled={disabled}
            onChange={(e) => onToggle(node.folderId, e.target.checked)}
          >
            <span className="text-sm text-[#582F08]">{node.folderName}</span>
          </Checkbox>
          {node.children?.length > 0 && (
            <div className="pl-5 mt-1">
              <SubfolderChecks
                nodes={node.children}
                checkedIds={checkedIds}
                onToggle={onToggle}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ShareFolder = ({ open, setOpen, folder }) => {
  const queryClient = useQueryClient();
  const folderId = folder?.folderId;
  const [newAccess, setNewAccess] = useState([]);
  const [includeFolderIds, setIncludeFolderIds] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['folderAccess', folderId],
    queryFn: () => getFolderAccessList(folderId),
    enabled: open && Boolean(folderId),
  });

  const members = data?.access || [];
  const subfolders = data?.subfolders || [];
  const allSubfolderIds = flattenFolderIds(subfolders);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['folderAccess', folderId] });
    queryClient.invalidateQueries({
      queryKey: ['archive'],
      exact: false,
      refetchType: 'all',
    });
  };

  const resetForm = () => {
    setNewAccess([]);
    setIncludeFolderIds([]);
  };

  const grantMutation = useMutation({
    mutationFn: () =>
      grantFolderAccess(
        folderId,
        newAccess.map((a) => ({
          userId: a.userId,
          role: a.role,
          canDelete: a.canDelete,
        })),
        includeFolderIds
      ),
    onSuccess: () => {
      message.success('Access granted');
      resetForm();
      invalidate();
    },
    onError: (e) =>
      message.error(e?.response?.data?.error || 'Failed to grant access'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ targetUserId, data: payload }) =>
      updateFolderAccess(folderId, targetUserId, payload),
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

  const memberSubfolderMutation = useMutation({
    mutationFn: async ({ targetUserId, folderId: childId, grant, role, canDelete }) => {
      if (grant) {
        return grantFolderAccess(childId, [{ userId: targetUserId, role, canDelete }]);
      }
      return revokeFolderAccess(childId, targetUserId);
    },
    onSuccess: invalidate,
    onError: (e) =>
      message.error(e?.response?.data?.error || 'Failed to update subfolder access'),
  });

  const existingUserIds = members.map((m) => m.user.userId);
  const allIncluded =
    allSubfolderIds.length > 0 &&
    allSubfolderIds.every((id) => includeFolderIds.includes(id));

  const toggleInclude = (id, checked) => {
    setIncludeFolderIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)
    );
  };

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
        resetForm();
      }}
      footer={null}
      width={520}
    >
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

        {subfolders.length > 0 && (
          <div className="mt-4 rounded-lg border border-[#f0e6da] bg-[#fdfaf6] px-3 py-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-[#582F08]">
                Also include subfolders
              </span>
              <Checkbox
                checked={allIncluded}
                indeterminate={includeFolderIds.length > 0 && !allIncluded}
                onChange={(e) =>
                  setIncludeFolderIds(e.target.checked ? allSubfolderIds : [])
                }
              >
                <span className="text-xs">All</span>
              </Checkbox>
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Sharing “{folder?.folderName}” only covers files in this folder.
              Tick a subfolder to give access to that one too.
            </p>
            <SubfolderChecks
              nodes={subfolders}
              checkedIds={includeFolderIds}
              onToggle={toggleInclude}
            />
          </div>
        )}

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
        <div className="border border-[#f0e6da] rounded-lg divide-y divide-[#f5ece2] max-h-80 overflow-auto">
          {members.map((m) => (
            <div key={m.id} className="px-3 py-2">
              <div className="flex items-center gap-3">
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
              {subfolders.length > 0 && (
                <div className="mt-2 ml-8">
                  <p className="text-xs text-gray-400 mb-1">Subfolders</p>
                  <SubfolderChecks
                    nodes={subfolders}
                    checkedIds={m.grantedSubfolderIds || []}
                    disabled={memberSubfolderMutation.isPending}
                    onToggle={(childId, checked) =>
                      memberSubfolderMutation.mutate({
                        targetUserId: m.user.userId,
                        folderId: childId,
                        grant: checked,
                        role: m.role,
                        canDelete: m.canDelete,
                      })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ShareFolder;
