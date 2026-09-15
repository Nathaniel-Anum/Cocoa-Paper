import { Modal, Button, Breadcrumb, Empty, Spin } from 'antd';
import { FolderFilled } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';

const isFolderRow = (item) => item?.folderId && item?.folderName;

const ArchiveFolderPicker = ({
  open,
  onClose,
  onSelect,
  selectedFolderId,
}) => {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [trail, setTrail] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [picked, setPicked] = useState(null);

  const loadRoot = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/archive');
      const list = (res.data?.archives || []).filter(isFolderRow);
      setFolders(list);
      setTrail([]);
      setCurrentId(null);
    } finally {
      setLoading(false);
    }
  };

  const loadFolder = async (folder, nextTrail) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/archive/${folder.folderId}`);
      const children = (res.data?.archive?.children || []).filter(isFolderRow);
      setFolders(children);
      setTrail(nextTrail);
      setCurrentId(folder.folderId);
      setPicked(folder);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPicked(null);
      loadRoot();
    }
  }, [open]);

  const goToIndex = async (index) => {
    if (index < 0) {
      setPicked(null);
      await loadRoot();
      return;
    }
    const target = trail[index];
    await loadFolder(target, trail.slice(0, index + 1));
  };

  const handleConfirm = () => {
    const folder = picked || (currentId ? { folderId: currentId } : null);
    if (!folder?.folderId) return;
    onSelect(folder);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Choose personal file folder"
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="ok"
          type="primary"
          disabled={!picked?.folderId && !currentId}
          onClick={handleConfirm}
        >
          Use this folder
        </Button>,
      ]}
    >
      <Breadcrumb
        className="mb-3"
        items={[
          {
            title: (
              <button type="button" className="text-[#9D4D01]" onClick={() => goToIndex(-1)}>
                Archive
              </button>
            ),
          },
          ...trail.map((item, index) => ({
            title: (
              <button type="button" className="text-[#9D4D01]" onClick={() => goToIndex(index)}>
                {item.folderName}
              </button>
            ),
          })),
        ]}
      />
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : folders.length === 0 ? (
        <Empty description="No folders here. Select the current folder or go back." />
      ) : (
        <ul className="max-h-72 space-y-1 overflow-auto">
          {folders.map((folder) => (
            <li key={folder.folderId}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${
                  picked?.folderId === folder.folderId
                    ? 'bg-[#fdf4ed] ring-1 ring-[#ead9cb]'
                    : 'hover:bg-[#fffaf7]'
                }`}
                onClick={() => setPicked(folder)}
                onDoubleClick={() => loadFolder(folder, [...trail, folder])}
              >
                <FolderFilled className="text-[#9D4D01]" />
                <span className="text-sm text-[#582F08]">{folder.folderName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-[#7a6859]">
        Click to select. Double-click to open. The letter PDF will be stored in the selected folder.
        {selectedFolderId ? ' A folder is already chosen.' : ''}
      </p>
    </Modal>
  );
};

export default ArchiveFolderPicker;
