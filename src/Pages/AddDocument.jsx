import React, { useState } from 'react';
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Form,
  Input,
  Select,
  notification,
  Button,
  Upload,
  Checkbox,
  InputNumber,
  Row,
  Col,
  Spin,
  message,
} from 'antd';
import axiosInstance from '../Components/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Lottie from 'react-lottie';
import CreateDoc from '../../src/lotties/create-doc.json';
import { useUser } from './CustomHook/useUser';
import { addDocument, uploadFile } from '../http/addDocument';
import TextArea from 'antd/es/input/TextArea';
import { useGetAllBudgets } from '../queryHooks/budget';
import { useNavigate } from 'react-router-dom';
import { multiply } from 'lodash';
import { capitalize } from '../../utils/typography';
import { useGetAllUserGroups, useGetAllUsers } from '../queryHooks/user';

// Set up notification configuration
notification.config({
  placement: 'topRight',
  duration: 4,
});

const AddDocument = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user } = useUser();

  // State variables
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [isPhysical, setIsPhysical] = useState(false);
  const [budgetUnits, setBudgetUnits] = useState({});
  const [isPrivate, setIsPrivate] = useState(false);
  const [ccEnableForward, setCcEnableForward] = useState(false);

  const { data: userGroups, isLoading: loadingUserGroups } =
    useGetAllUserGroups();

  const { data: ccUsers } = useGetAllUsers();

  // Animation options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: CreateDoc,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Helper function to show error notification
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

  // Fetch divisions
  const { data: divisions, isLoading: divisionsLoading } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      try {
        return await axiosInstance.get('/division');
      } catch (error) {
        showErrorNotification('Failed to Load Divisions', error);
        return { data: [] };
      }
    },
  });

  // Fetch departments based on selected division
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: async () => {
      try {
        return await axiosInstance.get(`/department/${selectedDivision}`);
      } catch (error) {
        showErrorNotification('Failed to Load Departments', error);
        return { data: { data: [] } };
      }
    },
    enabled: !!selectedDivision,
  });

  // Fetch users based on selected department
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users', selectedDepartment],
    queryFn: async () => {
      try {
        return await axiosInstance.get(`/all-users/${selectedDepartment}`);
      } catch (error) {
        showErrorNotification('Failed to Load Users', error);
        return { data: [] };
      }
    },
    enabled: !!selectedDepartment,
  });

  // Fetch budget items
  const { data: budgetaryItems, isLoading: budgetsLoading } =
    useGetAllBudgets();

  // Document creation mutation
  const { mutate: startDocument, isPending: isDocumentSubmitting } =
    useMutation({
      mutationKey: ['document'],
      mutationFn: async (values) => {
        console.log('Creating document with data:', values);
        const response = await addDocument(values);
        return response;
      },
      onSuccess: () => {
        setLoading(false);
        showSuccessNotification(
          'Request Successful',
          'Your document has been created successfully!'
        );
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['trail'] });
        isPhysical ? navigate('/') : navigate('/outgoing');
      },
      onError: (error) => {
        setLoading(false);
        showErrorNotification('Error  ', error?.response?.data?.error);
      },
    });

  // File upload mutation
  const { mutate: uploadDoc, isPending: isUploading } = useMutation({
    mutationKey: ['upload'],
    mutationFn: async (formData) => {
      console.log('Uploading file...');
      try {
        const response = await uploadFile(formData);

        if (!response?.data?.newFile?.fileId) {
          throw new Error('File upload successful but no file ID was returned');
        }

        return response.data.newFile.fileId;
      } catch (error) {
        // Re-throw for onError handler
        throw error;
      }
    },
    onSuccess: (fileId) => {
      console.log('File uploaded successfully with ID:', fileId);
      const values = form.getFieldsValue();
      // Remove file and attachments fields as they are not needed in the document payload
      const { file, attachments, ...documentData } = values;
      startDocument({ ...documentData, fileId, isPrivate, ccEnableForward });
    },
    onError: (error) => {
      setLoading(false);
      showErrorNotification('File Upload Failed', error);
    },
  });

  // Multiple file upload mutation
  const { mutate: uploadMultipleFiles, isPending: isMultipleUploading } =
    useMutation({
      mutationKey: ['uploadMultiple'],
      mutationFn: async ({ files, subject, ref }) => {
        console.log('Uploading multiple files...');

        console.log({ files });

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
      onSuccess: (fileIds, variables) => {
        console.log('All files uploaded successfully with IDs:', fileIds);

        // Get main file ID
        const mainFileId = variables.mainFileId;

        // Get form values and remove file/attachments fields
        const values = form.getFieldsValue();
        const { file, attachments, ...documentData } = values;
        startDocument({
          ...documentData,
          fileId: mainFileId,
          attachmentIds: fileIds,
          isPrivate,
          ccEnableForward,
        });
      },
      onError: (error) => {
        setLoading(false);
        showErrorNotification('Attachment Upload Failed', error);
      },
    });

  // Event handlers
  const handleDivisionChange = (value) => {
    setSelectedDivision(value);
    setSelectedDepartment('');
    form.setFieldsValue({
      departmentId: undefined,
      userId: undefined,
    });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    form.setFieldsValue({
      userId: undefined,
    });
  };

  const handleRequestChange = (value) => {
    setRequestType(value);
    // Reset related fields when request type changes
    form.setFieldsValue({
      budgetAllocations: undefined,
      amount: undefined,
    });
  };

  const handleItemCategoryChange = (categoryId, fieldKey) => {
    const selectedBudget = budgetaryItems?.data?.data?.find(
      (item) => item.id === categoryId
    );

    if (selectedBudget?.budgetItems) {
      const options = selectedBudget.budgetItems.map((unit) => ({
        label: capitalize(unit.item),
        value: unit.id,
      }));

      // Update state with new options for this specific field
      setBudgetUnits((prev) => ({
        ...prev,
        [fieldKey]: options,
      }));

      // Reset the budgetItemId for this row
      const budgetAllocations = form.getFieldValue('budgetAllocations') || [];
      if (budgetAllocations[fieldKey]) {
        budgetAllocations[fieldKey].budgetItemId = undefined;
        form.setFieldValue('budgetAllocations', budgetAllocations);
      }
    }
  };

  // Form submission handler
  const handleSubmit = (values) => {
    const submissionData = {
      ...values,
      physicalDoc: isPhysical,
      isPrivate,
      ccEnableForward,
    };
    if (isPhysical) {
      startDocument(submissionData);
      return;
    }
    if (values.file === undefined && values.attachments) {
      showErrorNotification(
        'Missing File',
        'Please upload a main document file.'
      );
      return;
    }

    setLoading(true);
    // Prepare submission data

    // For physical documents, no file uploads needed

    // For electronic documents, check if main file exists
    if (!values.file || !values.file.file) {
      setLoading(false);
      showErrorNotification(
        'Missing File',
        'Please upload a main document file.'
      );
      return;
    }

    // First upload the main document file
    const mainFormData = new FormData();
    mainFormData.append('file', values.file.file);
    mainFormData.append('ref', values.ref || '');
    mainFormData.append('subject', values.subject || '');

    // Check if we have attachments
    const attachmentFiles = values.attachments?.fileList;

    console.log({ values });

    if (!attachmentFiles || attachmentFiles.length === 0) {
      // No attachments, just upload the main file
      console.log('No attachments, just upload the main file');
      uploadDoc(mainFormData);
    } else {
      // Upload main file first
      uploadFile(mainFormData)
        .then((response) => {
          if (!response?.data?.newFile?.fileId) {
            throw new Error(
              'Main file upload successful but no file ID was returned'
            );
          }

          const mainFileId = response.data.newFile.fileId;

          // Now upload all attachments
          const attachmentFilesArray = attachmentFiles.map(
            (fileItem) => fileItem.originFileObj
          );
          console.log('Upload all attachments with reference to main file');
          // Upload all attachments with reference to main file
          uploadMultipleFiles({
            files: attachmentFilesArray,
            subject: values.subject || '',
            ref: values.ref || '',
            mainFileId: mainFileId,
          });
        })
        .catch((error) => {
          setLoading(false);
          showErrorNotification('Main File Upload Failed', error);
        });
    }
  };

  // Upload configuration for main document
  const uploadProps = {
    name: 'file',
    beforeUpload: () => false, // Prevent auto upload
    onChange(info) {
      console.log('Main file selected:', info.file.name);
    },
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
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
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
  };

  // Loading state
  const isPageLoading =
    divisionsLoading || departmentsLoading || usersLoading || budgetsLoading;
  const isSubmitting =
    loading || isDocumentSubmitting || isUploading || isMultipleUploading;

  // Close processing notification when done
  React.useEffect(() => {
    if (!isSubmitting) {
      notification.destroy('document-processing');
    }
  }, [isSubmitting]);

  // if (isPageLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <Spin size="large" tip="Loading form..." />
  //     </div>
  //   );
  // }

  return (
    <div className="py-6 px-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-md shadow-md">
        <div className="px-8 py-6">
          <div className="pb-4">
            <p className="font-bold text-2xl text-[#694421]">
              Add Document
              <div className="w-44 h-1 bg-[#694421] mt-1"></div>
            </p>
          </div>

          <div className="py-4">
            <Form
              form={form}
              layout="vertical"
              name="addDocumentForm"
              onFinish={handleSubmit}
              disabled={isSubmitting}
              initialValues={{
                documentType: undefined,
                divisionId: undefined,
                departmentId: undefined,
                userId: undefined,
              }}
            >
              {/* Request Type */}
              <Form.Item
                name="documentType"
                label="Request Type"
                rules={[
                  { required: true, message: 'Please select a request type' },
                ]}
              >
                <Select
                  placeholder="Select Request Type"
                  onChange={handleRequestChange}
                  options={[
                    { label: 'General Correspondence', value: 'General' },
                    { label: 'Budget Release', value: 'BudgetRelease' },
                    {
                      label: 'Out of Budget Release',
                      value: 'OutOfBudget',
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: 'Please input a Subject' }]}
              >
                <Input placeholder="Input a Subject" />
              </Form.Item>
              {/* Amount (for Out of Budget) */}
              {requestType === 'OutOfBudgetRelease' && (
                <>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={
                      [
                        // { required: true, message: 'Please enter an amount' },
                      ]
                    }
                  >
                    <InputNumber
                      placeholder="Enter Amount"
                      className="w-full"
                      formatter={(value) =>
                        `₵ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value?.replace(/₵\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                  {/* <Form.Item
                    name="dollarAmount"
                    label="Dollar Amount"
                    rules={
                      [
                        // { required: true, message: 'Please enter an amount' },
                      ]
                    }
                  >
                    <InputNumber
                      placeholder="Enter Dollar Amount"
                      className="w-full"
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item> */}
                </>
              )}
              {/* Budget Items (for Budget Release) */}
              {requestType === 'BudgetRelease' && (
                <Form.List name="budgetAllocations">
                  {(fields, { add, remove }) => (
                    <div className="border border-dashed p-5 mb-4 rounded-md">
                      <div className="mb-3 font-medium">Budget Allocations</div>

                      {fields.map((field) => (
                        <div
                          key={field.key}
                          className="mb-4 pb-4 border-b border-dashed last:border-b-0"
                        >
                          <Row gutter={16}>
                            <Col span={8}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'itemCategory']}
                                label="Item Category"
                                rules={[
                                  { required: true, message: 'Required' },
                                ]}
                              >
                                <Select
                                  placeholder="Select Item Category"
                                  optionFilterProp="label"
                                  showSearch
                                  onChange={(value) =>
                                    handleItemCategoryChange(value, field.name)
                                  }
                                  options={
                                    budgetaryItems?.data?.data?.map((item) => ({
                                      label: item?.name,
                                      value: item?.id,
                                    })) || []
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'budgetItemId']}
                                label="Budgetary Item"
                                rules={[
                                  { required: true, message: 'Required' },
                                ]}
                              >
                                <Select
                                  placeholder="Select Budgetary Item"
                                  optionFilterProp="label"
                                  showSearch
                                  options={budgetUnits[field.name] || []}
                                  disabled={
                                    !form.getFieldValue([
                                      'budgetAllocations',
                                      field.name,
                                      'itemCategory',
                                    ])
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={5}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'amount']}
                                label="Amount"
                                rules={
                                  [
                                    // { required: true, message: 'Required' },
                                  ]
                                }
                              >
                                <InputNumber
                                  placeholder="Amount"
                                  className="w-full"
                                  formatter={(value) =>
                                    `₵ ${value}`.replace(
                                      /\B(?=(\d{3})+(?!\d))/g,
                                      ','
                                    )
                                  }
                                  parser={(value) =>
                                    value?.replace(/₵\s?|(,*)/g, '')
                                  }
                                />
                              </Form.Item>
                            </Col>
                            {/* <Col span={5}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'dollarAmount']}
                                label="Dollar Amount"
                              >
                                <InputNumber
                                  placeholder="Amount"
                                  className="w-full"
                                  formatter={(value) =>
                                    `$ ${value}`.replace(
                                      /\B(?=(\d{3})+(?!\d))/g,
                                      ','
                                    )
                                  }
                                  parser={(value) =>
                                    value?.replace(/\$\s?|(,*)/g, '')
                                  }
                                />
                              </Form.Item>
                            </Col> */}
                            <Col
                              span={2}
                              className="flex  justify-center items-center pb-2"
                            >
                              <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(field.name)}
                              />
                            </Col>
                          </Row>
                        </div>
                      ))}

                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                          className="mt-2"
                        >
                          Add Budget Item
                        </Button>
                      </Form.Item>
                    </div>
                  )}
                </Form.List>
              )}
              {/* Division */}
              <Form.Item
                name="divisionId"
                label="Recipient Division"
                rules={[
                  { required: true, message: 'Please select a Division' },
                ]}
              >
                <Select
                  placeholder="Select Division"
                  onChange={handleDivisionChange}
                  options={
                    divisions?.data?.map((division) => ({
                      label: division?.divisionName,
                      value: division?.divisionId,
                    })) || []
                  }
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
              {/* Department */}
              <Form.Item
                name="departmentId"
                label="Recipient Department"
                rules={[
                  { required: true, message: 'Please select a Department' },
                ]}
              >
                <Select
                  placeholder="Select Department"
                  onChange={handleDepartmentChange}
                  options={
                    departments?.data?.data?.map((department) => ({
                      label: department?.departmentName,
                      value: department?.departmentId,
                    })) || []
                  }
                  disabled={!selectedDivision}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
              {/* Recipient */}
              <Form.Item
                name="userId"
                label="Recipient"
                rules={[
                  { required: true, message: 'Please select a Recipient' },
                ]}
              >
                <Select
                  placeholder="Select Recipient"
                  options={(users?.data || [])
                    .filter((emp) => emp.userId !== user?.userId)
                    .map((user) => ({
                      label: user?.name,
                      value: user?.userId,
                    }))}
                  disabled={!selectedDepartment}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
              <Form.Item name={'carbonCopyIds'} label="CC" initialValue={[]}>
                <Select
                  optionFilterProp="label"
                  mode="multiple"
                  showSearch
                  placeholder="Copy group or Users"
                  options={[
                    {
                      label: <span>User Groups</span>,
                      title: 'User Groups',
                      options:
                        userGroups &&
                        userGroups?.data?.data?.map((group) => ({
                          label: group?.name,
                          value: group?.id,
                        })),
                    },
                    {
                      label: <span>Users</span>,
                      title: 'Users',
                      options:
                        ccUsers &&
                        ccUsers?.data?.users
                          ?.filter((emp) => emp.userId !== user?.userId)
                          .map((user) => ({
                            label: user?.name,
                            value: user?.userId,
                          })),
                    },
                  ]}
                />
              </Form.Item>

              {/* Enable Forward for CC Recipients */}
              <Form.Item>
                <Checkbox
                  checked={ccEnableForward}
                  onChange={(e) => setCcEnableForward(e.target.checked)}
                >
                  Enable Forward for CC Recipients
                </Checkbox>
                <div className="text-gray-500 text-sm mt-1">
                  {ccEnableForward
                    ? 'CC recipients will be able to forward and comment on this document'
                    : 'CC recipients will only be able to view this document'}
                </div>
              </Form.Item>

              {/* Comment */}

              <Form.Item>
                <Checkbox onChange={() => setIsPrivate(!isPrivate)}>
                  Private Comment
                </Checkbox>
              </Form.Item>

              {isPrivate && (
                <Form.Item name="privateComment" label="Private Comment">
                  <TextArea
                    rows={4}
                    placeholder="Enter your private comments..."
                    className="outline outline-1 outline-red-500 rounded-md p-2"
                  />
                </Form.Item>
              )}

              <Form.Item label="Comment" name="comment">
                <TextArea
                  rows={4}
                  placeholder="Enter any additional comments..."
                />
              </Form.Item>
              {/* Physical Document */}
              {/* <Form.Item>
                <Checkbox
                  checked={isPhysical}
                  onChange={(e) => setIsPhysical(e.target.checked)}
                >
                  Physical Document?
                </Checkbox>
                <div className="text-gray-500 text-sm mt-1">
                  {isPhysical
                    ? 'No file upload needed for physical documents'
                    : 'Please upload a PDF file for electronic documents'}
                </div>
              </Form.Item> */}

              {/* Main File Upload (for electronic documents) */}

              {!isPhysical && (
                <>
                  <Form.Item
                    name="file"
                    label="Main Document"
                    // rules={[
                    //   { required: true, message: 'Please upload a PDF file' },
                    // ]}
                  >
                    <Upload
                      {...uploadProps}
                      listType="text"
                      className="w-full"
                      maxCount={1}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        className="w-full cursor-pointer"
                      >
                        Upload PDF
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item name="attachments" label="Attachments">
                    <Upload
                      {...attachmentUploadProps}
                      listType="text"
                      className="w-full"
                      style={{ width: '100%' }}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        className="w-full cursor-pointer"
                      >
                        Upload Attachments
                      </Button>
                    </Upload>
                    <div className="text-gray-500 text-sm mt-1">
                      You can upload multiple attachment files
                    </div>
                  </Form.Item>
                </>
              )}

              {/* Submit Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-[#582F08] hover:bg-[#694421] text-white w-full py-1 h-10"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Submit Document'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDocument;
