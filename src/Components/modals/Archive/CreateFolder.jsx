import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, message, Divider } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';
import AccessSelector from './AccessSelector';
import { grantFolderAccess } from '../../../http/folderAccess';

const CreateFolder = ({ setOpen, open, id }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [access, setAccess] = useState([]);

  const { mutate, isPending } = useMutation({
    mutationKey: 'folder',
    mutationFn: async (values) => {
      const res = await axiosInstance.post('/archive', {
        ...values,
        folderId: id,
        isArchive: true,
      });

      const newFolderId = res?.data?.newFolder?.folderId;
      // If the owner chose people to share with, grant access to the new folder.
      if (newFolderId && access.length > 0) {
        await grantFolderAccess(
          newFolderId,
          access.map((a) => ({
            userId: a.userId,
            role: a.role,
            canDelete: a.canDelete,
          }))
        );
      }
      return res;
    },
    onSuccess: () => {
      setOpen(false);
      form.resetFields();
      setAccess([]);
      message.success('Folder created successfully!');
      queryClient.invalidateQueries({
        queryKey: ['archive'],
        exact: false,
        refetchType: 'all',
      });
    },
    onError: (error) => {
      console.log(error);
      message.error(error?.response?.data?.error || 'Failed to create folder');
    },
  });

  const handleCancel = () => {
    setOpen(false);
    setAccess([]);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    mutate(values);
  };

  return (
    <Modal open={open} title="New Folder" onCancel={handleCancel} footer={null}>
      <div className="mt-3">
        <Form
          name="Create Folder"
          onFinish={(values) => handleSubmit(values)}
          form={form}
        >
          <Form.Item
            name="folderName"
            rules={[
              {
                required: true,
                message: 'Please input a name for the Folder!',
              },
            ]}
          >
            <Input placeholder="Enter folder Name" allowClear />
          </Form.Item>

          <Divider className="!my-3" />
          <div className="flex items-center gap-2 mb-2 text-[#582F08]">
            <TeamOutlined />
            <span className="text-sm font-medium">Give access (optional)</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Share this folder with people in your division. They will see it in
            their Archive.
          </p>
          <AccessSelector value={access} onChange={setAccess} />

          <Form.Item className="mt-4 mb-0">
            <Button
              className="w-full bg-[#9D4D01]"
              type="primary"
              htmlType="submit"
              loading={isPending}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateFolder;
