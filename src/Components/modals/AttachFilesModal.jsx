import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '../../http/addDocument';
import { addDocumentAttachments } from '../../http/attachments';

const AttachFilesModal = ({
  open,
  onClose,
  documentId,
  documentSubject,
}) => {
  const [fileList, setFileList] = useState([]);
  const queryClient = useQueryClient();

  const { mutate: attachFiles, isPending } = useMutation({
    mutationFn: async (files) => {
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', documentSubject || '');
        formData.append('ref', '');
        return uploadFile(formData).then((response) => {
          if (!response?.data?.newFile?.fileId) {
            throw new Error(`Upload succeeded for ${file.name} but no file ID was returned`);
          }
          return response.data.newFile.fileId;
        });
      });
      const attachmentIds = await Promise.all(uploadPromises);
      return addDocumentAttachments(documentId, attachmentIds);
    },
    onSuccess: () => {
      message.success('Files attached. Recipients you send this to will see them.');
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['trail'] });
      setFileList([]);
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
    const files = fileList
      .map((item) => item.originFileObj)
      .filter(Boolean);
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
            {documentSubject || 'Incoming document'}
          </h2>
          <p className="text-sm text-[#7a6859] mt-2">
            These files stay with the document from this point forward. The original sender will not see them.
          </p>
        </div>

        <Upload.Dragger
          multiple
          fileList={fileList}
          beforeUpload={() => false}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={(info) => setFileList(info.fileList)}
          className="rounded-xl"
        >
          <p className="ant-upload-drag-icon">
            <PaperClipOutlined className="text-[#9D4D01] text-2xl" />
          </p>
          <p className="text-sm text-[#582F08] font-medium">Drop files here or browse</p>
          <p className="text-xs text-[#7a6859] mt-1">PDF, Word, or Excel</p>
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

export default AttachFilesModal;
