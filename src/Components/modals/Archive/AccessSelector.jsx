import React from 'react';
import { Select, Segmented, Checkbox, Spin, Empty, Avatar } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getShareableUsers } from '../../../http/folderAccess';

// Controlled selector for choosing division users and their folder permissions.
// value: [{ userId, name, role: 'VIEWER'|'EDITOR', canDelete }]
const AccessSelector = ({ value = [], onChange, excludeUserIds = [] }) => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['shareableUsers'],
    queryFn: getShareableUsers,
  });

  const available = users.filter((u) => !excludeUserIds.includes(u.userId));

  const selectedIds = value.map((v) => v.userId);

  const handleSelectChange = (ids) => {
    const next = ids.map((id) => {
      const existing = value.find((v) => v.userId === id);
      if (existing) return existing;
      const user = users.find((u) => u.userId === id);
      return {
        userId: id,
        name: user?.name || 'Unknown',
        role: 'VIEWER',
        canDelete: false,
      };
    });
    onChange?.(next);
  };

  const updateEntry = (userId, patch) => {
    onChange?.(
      value.map((v) => (v.userId === userId ? { ...v, ...patch } : v))
    );
  };

  return (
    <div className="space-y-3">
      <Select
        mode="multiple"
        allowClear
        showSearch
        loading={isLoading}
        placeholder="Select people in your division"
        className="w-full"
        value={selectedIds}
        onChange={handleSelectChange}
        optionFilterProp="label"
        options={available.map((u) => ({
          label: `${u.name}${u.department?.departmentName ? ` · ${u.department.departmentName}` : ''}`,
          value: u.userId,
        }))}
        notFoundContent={isLoading ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No users" />}
      />

      {value.length > 0 && (
        <div className="border border-[#f0e6da] rounded-lg divide-y divide-[#f5ece2] max-h-64 overflow-auto">
          {value.map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center gap-3 px-3 py-2"
            >
              <Avatar size="small" className="bg-[#9D4D01] flex-shrink-0">
                {entry.name?.[0]?.toUpperCase()}
              </Avatar>
              <span className="flex-1 min-w-0 truncate text-sm text-[#582F08]">
                {entry.name}
              </span>
              <Segmented
                size="small"
                value={entry.role}
                onChange={(role) => updateEntry(entry.userId, { role })}
                options={[
                  { label: 'Viewer', value: 'VIEWER' },
                  { label: 'Editor', value: 'EDITOR' },
                ]}
              />
              <Checkbox
                checked={entry.canDelete}
                onChange={(e) =>
                  updateEntry(entry.userId, { canDelete: e.target.checked })
                }
              >
                <span className="text-xs">Can delete</span>
              </Checkbox>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessSelector;
