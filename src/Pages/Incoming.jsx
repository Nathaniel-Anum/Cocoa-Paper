import React, { useState, useEffect } from 'react';
import {
  Table,
  Modal,
  Form,
  Select,
  message,
  Popover,
  Button,
  Steps,
  Dropdown,
  Upload,
  notification,
} from 'antd';
import { useTrail } from './CustomHook/useTrail';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axiosInstance from '../Components/axiosInstance';
import { UploadOutlined } from '@ant-design/icons';

import ArchiveFiles from '../Components/modals/Archive/ArchiveFiles';

import { useNavigate } from 'react-router-dom';

import useStore from '../store/store';
import { SlOptionsVertical } from 'react-icons/sl';
import TextArea from 'antd/es/input/TextArea';
import { useUser } from './CustomHook/useUser';
import { uploadFile } from '../http/addDocument';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';

const Incoming = () => {
  const { trails, isLoading } = useTrail('incoming');
  const [show, setShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState({});
  const [trailId, setTrailId] = useState('');
  const [open, SetOpen] = useState(false);

  const [senderId, setSenderId] = useState('');

  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  function handleFile(selectedRecord) {
    setShow(true);
    setSenderId(selectedRecord);
    setRecord(selectedRecord?.document);
  }

  // console.log(trails);

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleClose = () => {
    SetOpen(false);
  };

  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selected, setSelected] = useState('');

  const setChosenRecord = useStore((state) => state.setChosenRecord);

  const { user: authUser } = useUser();

  // useQuery for getting all  divisions
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => {
      return axiosInstance.get('/division');
    },
  });
  // console.log(divisions?.data);

  // useQuery for getting all departments in a selected Division
  const { data: departments, refetch } = useQuery({
    queryKey: ['options'],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: false,
  });
  // console.log(departments?.data?.data);

  // useQuery for getting all users in a selected Department
  const { data: users, refetch: fetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      return axiosInstance.get(`/all-users/${selectedDepartment}`);
    },
    enabled: false,
  });

  // useMutation to forward Document
  const { mutate: forwardDocument } = useMutation({
    mutationKey: 'forwardDocument',
    mutationFn: (values) => {
      return axiosInstance.patch(`/trail/${selected}`, values);
    },
    onSuccess: () => {
      setLoading(false);
      setIsModalOpen(false);
      message.success('Document has been successfully forwarded!');
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['trail'] });
    },
    onError: (error) => {
      setLoading(false);
      setIsModalOpen(false);
      console.log(error?.response?.data?.trail?.error);
      form.resetFields();
      message.error(error?.response?.data?.trail?.error);
    },
  });
  useEffect(() => {
    if (selectedDivision) {
      refetch();
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchUsers();
    }
  }, [selectedDepartment]);

  const showErrorNotification = (title, error) => {
    let description = 'An unexpected error occurred.';

    // Try to extract error message from different formats
    if (typeof error === 'string') {
      description = error;
    } else if (error?.message) {
      description = error.message;
    } else if (error?.response?.data?.error) {
      if (Array.isArray(error.response.data.error)) {
        description = error.response.data.error
          .map((e) => e.msg || e)
          .join(', ');
      } else {
        description = error.response.data.error;
      }
    } else if (error?.response?.data?.msg) {
      description = error.response.data.msg;
    }

    // Log the error for debugging
    console.error(`${title}:`, error);

    // Show notification
    notification.error({
      message: title,
      description,
    });
  };

  // Helper function to show success notification
  const showSuccessNotification = (title, description) => {
    notification.success({
      message: title,
      description,
    });
  };

  //useQUery to fetch trail associated to doc ID
  const { data: trailData } = useQuery({
    queryKey: ['trailData', trailId],
    queryFn: async () => {
      return axiosInstance.get(`/trail/${trailId}`);
    },
    enabled: !!trailId, // Only fetch if trailId is set
  });

  const { mutate: uploadMultipleFiles, isPending: isMultipleUploading } =
    useMutation({
      mutationKey: ['uploadMultiple'],
      mutationFn: async ({ files, subject, ref }) => {
        console.log('Uploading multiple files...');

        // Create an array of promises for each file upload
        const uploadPromises = files.map((file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('subject', subject);
          formData.append('ref', ref);

          return uploadFile(formData).then((response) => {
            if (!response?.data?.newFile?.fileId) {
              throw new Error(
                `File upload successful for ${file.name} but no file ID was returned`
              );
            }
            return response.data.newFile.fileId;
          });
        });

        // Wait for all uploads to complete
        return Promise.all(uploadPromises);
      },
      onSuccess: (fileIds) => {
        console.log('All files uploaded successfully with IDs:', fileIds);

        // Get form values and add file IDs
        const values = form.getFieldsValue();
        forwardDocument({
          ...values,
          status: 'Forwarded',
          attachmentIds: fileIds,
        });
      },
      onError: (error) => {
        // showErrorNotification('Attachment Upload Failed', error);
        message.error(error?.response?.data?.error);
      },
    });

  // console.log(trailData?.data);
  const handleDivisionChange = (option) => {
    setSelectedDivision(option.value);
  };

  const handleDepartmentChange = (option) => {
    setSelectedDepartment(option.value);
  };

  const handleUserChange = (value) => {
    console.log(`selected User: ${value}`);
  };

  const handleClick = (selectedRecord) => {
    setIsModalOpen(true);
    setSelected(selectedRecord?.docID);
  };

  const handleFormSubmit = (values) => {
    setLoading(true);

    const attachmentFiles = values.attachments?.fileList;

    if (!attachmentFiles || attachmentFiles.length === 0) {
      // No attachments, just upload the main file

      forwardDocument({ ...values, status: 'Forwarded' });
    } else {
      const attachmentFilesArray = attachmentFiles.map(
        (fileItem) => fileItem.originFileObj
      );

      // Upload all attachments with reference to main file
      uploadMultipleFiles({
        files: attachmentFilesArray,
        subject: '',
        ref: '',
      });
    }
  };

  const handleView = (selectedRecord) => {
    console.log(`Vieweing trail with ${selectedRecord?.docID}`);
    setTrailId(selectedRecord?.docID);
    SetOpen(true);
  };

  const handleViewDocument = (selectedRecord) => {
    setChosenRecord(selectedRecord);
    navigate(`/view-document/${selectedRecord?.docID}`);
  };

  const attachmentUploadProps = {
    name: 'file', // The name of the file input field, not the form field name
    multiple: true,
    beforeUpload: () => false, // Prevent auto upload
    onChange(info) {
      console.log(
        'Attachment files selected:',
        info.fileList.map((f) => f.name)
      );
      // The fileList will be stored in the form
      form.setFieldsValue({ attachments: { fileList: info.fileList } });
    },
    accept: '.pdf',
  };

  const getItems = (selectedRecord) => {
    return [
      {
        label: (
          <span onClick={() => handleViewDocument(selectedRecord)}>View</span>
        ),
        key: 0,
      },
      {
        label: <span onClick={() => handleClick(selectedRecord)}>Forward</span>,
        key: 1,
      },
      hasPermission(allRolePermissions, [
        requiredPermissions.ARCHIVE_DOCUMENT,
      ]) && {
        label: <span onClick={() => handleFile(selectedRecord)}>Archive</span>,
        key: 2,
      },
      {
        label: <span onClick={() => handleView(selectedRecord)}>Trail</span>,
        key: 3,
      },
    ].filter(Boolean);
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'document',
      key: 'subject',
      render: (document) => {
        //   console.log(document);
        return <div>{document.subject}</div>;
      },
    },
    {
      title: 'Reference',
      dataIndex: 'document',
      key: 'ref',
      render: (document) => {
        return <div>{document.ref}</div>;
      },
    },

    {
      title: 'Sender',
      dataIndex: ['sender', 'name'],
      key: 'receiver',
    },

    {
      title: 'Division',
      key: 'division',
      render: (document) => {
        return <div>{document.document.division.divisionName}</div>;
      },
    },

    {
      title: 'Department',
      key: 'department',
      render: (document) => {
        return <div>{document.document.department.departmentName}</div>;
      },
    },
    {
      title: 'Date',
      key: 'action',
      dataIndex: 'createdAt',
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        //   console.log(dateTime.toDateString());
        //   const year = dateTime.getFullYear();
        //   const month = (dateTime.getMonth() + 1).toString();
        //   const day = dateTime.getDate().toString().padStart(2, "0");
        //   const readableTime = `${day}-${month}-${year}`;
        //   console.log(readableTime);
        return <div>{dateTime.toDateString()}</div>;
      },
    },
    {
      title: 'Time',
      key: 'time',
      dataIndex: 'createdAt',
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return <div>{dateTime.toLocaleTimeString()}</div>;
      },
    },
    {
      title: 'Actions',
      key: 'action',

      render: (selectedRecord) => (
        <Dropdown
          menu={{ items: getItems(selectedRecord) }}
          trigger={['click']}
        >
          <a onClick={(e) => e.preventDefault()}>
            <SlOptionsVertical />
          </a>
        </Dropdown>
      ),
    },
  ];

  const _data = trails.map((s) => ({
    ...s,
    key: s.docId,
  }));

  const props = {
    name: 'file',
    beforeUpload: () => false,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
    },
  };

  return (
    <div className="mt-8">
      <Table columns={columns} dataSource={_data} loading={isLoading} />
      <Modal
        title="Forward Document"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <div className="mt-8">
          <Form
            form={form}
            layout="vertical"
            name="Forward Document"
            onFinish={(values) => handleFormSubmit(values)}
          >
            <Form.Item
              label="Division"
              name="division"
              rules={[
                {
                  required: true,
                  message: 'Please choose your Division!',
                },
              ]}
            >
              <Select
                placeholder="Please choose your Division"
                allowClear
                labelInValue
                options={divisions?.data.map((division, index) => {
                  return {
                    label: division?.divisionName,
                    value: division?.divisionId,
                  };
                })}
                onChange={handleDivisionChange}
              />
            </Form.Item>
            <Form.Item
              label="Department"
              name="department"
              rules={[
                {
                  required: true,
                  message: 'Please choose your Department!',
                },
              ]}
            >
              <Select
                placeholder="Please choose your Department"
                allowClear
                labelInValue
                options={departments?.data?.data?.map((department, index) => {
                  return {
                    label: department?.departmentName,
                    value: department?.departmentId,
                  };
                })}
                onChange={handleDepartmentChange}
              />
            </Form.Item>
            <Form.Item
              name="userId"
              label="User"
              rules={[
                {
                  required: true,
                  message: 'Please select a User!',
                },
              ]}
            >
              <Select
                placeholder="Please select a User"
                allowClear
                options={(users?.data || [])
                  .filter((emp) => emp.userId !== user?.userId)
                  .map((user) => ({
                    label: user?.name,
                    value: user?.userId,
                  }))}
                // onChange={handleUserChange}
              />
            </Form.Item>

            <Form.Item label="Comment" name="comment">
              <TextArea rows={4} placeholder="Enter Comment...." />
            </Form.Item>

            <Form.Item name="attachments" className="flex justify-start">
              <Upload {...attachmentUploadProps}>
                <Button
                  icon={<UploadOutlined />}
                  loading={isMultipleUploading}
                  className="cursor-pointer w-full"
                >
                  Upload Additional Docs
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-[#582F08] px-5 py-1 text-white w-full flex"
                loading={loading}
              >
                Forward
              </Button>
            </Form.Item>
          </Form>{' '}
        </div>
      </Modal>
      <Modal
        title="Locator"
        open={open}
        onCancel={handleClose}
        footer={null}
        centered="true"
        width={'60%'}
      >
        <div className="py-6">
          <Steps
            responsive
            direction
            className="grid grid-cols-2 gap-y-2 "
            items={trailData?.data?.trails.flatMap((trail, index) => {
              if (index === 0) {
                return [
                  {
                    title: 'Sent',
                    description: trail.sender.name,
                  },
                  {
                    title: trail?.status,
                    description: trail.receiver.name,
                  },
                ];
              } else {
                return {
                  title: trail.status,
                  description: trail.receiver.name,
                };
              }
            })}
          />
        </div>
      </Modal>
      {show ? (
        <ArchiveFiles
          show={show}
          setShow={setShow}
          record={record}
          sender={authUser?.userId}
        />
      ) : null}
    </div>
  );
};

export default Incoming;
