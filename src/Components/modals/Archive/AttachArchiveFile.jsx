import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attachArchiveFiles } from '../../../http/archive';

const AttachArchiveFile = ({
  open,
  onClose,
  file,
  onAttached,
}) => {
  const [fileList, setFileList] = useState([]);
  const queryClient = useQueryClient();

  const { mutate: attachFiles, isPending } = useMutation({
    mutationFn: (files) => attachArchiveFiles(file.fileId, files),
    onSuccess: (data) => {
      message.success('Files attached. Anyone with access can download them as one PDF.');
      queryClient.invalidateQueries({
        queryKey: ['archive'],
        exact: false,
        refetchType: 'all',
      });
      setFileList([]);
      onAttached?.(data);
      onClose();
    },
    onError: (error) => {
      message.error(error?.response?.data?.error || 'Failed to attach files');
    },
  });

  const handleClose = () => {
    if (isPending) return;
    setFileList([]);
    onClose();
  };

  const handleAttach = () => {
    if (!file?.fileId) {
      message.error('No archive file selected');
      return;
    }
    const files = fileList.map((item) => item.originFileObj).filter(Boolean);
    if (!files.length) {
      message.warning('Choose at least one file to attach');
      return;
    }
    attachFiles(files);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnClose
      width={520}
      title={null}
    >
      <div className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#9D4D01] mb-1">
            Attach files
          </p>
          <h2 className="text-lg font-semibold text-[#582F08] leading-tight">
            {file?.fileName || 'Archive file'}
          </h2>
          <p className="text-sm text-[#7a6859] mt-2">
            Editors can add files here. They stay with this document and download as one PDF.
          </p>
        </div>

        <Upload.Dragger
          multiple
          fileList={fileList}
          beforeUpload={() => false}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(info) => setFileList(info.fileList)}
          className="rounded-xl"
        >
          <p className="ant-upload-drag-icon">
            <PaperClipOutlined className="text-[#9D4D01] text-2xl" />
          </p>
          <p className="text-sm text-[#582F08] font-medium">Drop files here or browse</p>
          <p className="text-xs text-[#7a6859] mt-1">PDF, Word, Excel, or image</p>
        </Upload.Dragger>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={isPending}
            onClick={handleAttach}
            className="bg-[#582F08]"
          >
            Attach
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AttachArchiveFile;
