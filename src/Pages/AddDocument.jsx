import React, { useEffect, useState } from 'react';
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
  Modal,
} from 'antd';
import axiosInstance from '../Components/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Lottie from 'react-lottie';
import CreateDoc from '../../src/lotties/create-doc.json';
import { useUser } from './CustomHook/useUser';
import { addDocument, uploadFile } from '../http/addDocument';
import TextArea from 'antd/es/input/TextArea';
import { useGetAllBudgets } from '../queryHooks/budget';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { multiply } from 'lodash';
import { capitalize, formatMoney } from '../../utils/typography';
import { useGetAllUserGroups, useGetAllUsers } from '../queryHooks/user';
import { buildHrMergeLetter } from './hrLetterTemplates';
import { isHrDepartment } from '../utils/isHrDepartment';
import { getHrTemplate, listHrTemplates } from '../utils/hrTemplateStore';
import { PlaceholderInput, formatFillValues } from './HrTemplates/placeholderFields';
import ArchiveFolderPicker from '../Components/modals/Archive/ArchiveFolderPicker';
import {
  canIssuePersonalFile,
  normalizeVolume,
  previewPersonalFileNumber,
  staffFileIssueHint,
  staffFileLabel,
} from '../utils/personalFileNumber';

// Set up notification configuration
notification.config({
  placement: 'topRight',
  duration: 4,
});

const AddDocument = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const { user } = useUser();
  const showHrOperations = isHrDepartment(user);

  // State variables
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [isPhysical, setIsPhysical] = useState(false);
  const [budgetUnits, setBudgetUnits] = useState({});
  const [selectedItemBalances, setSelectedItemBalances] = useState({});
  const [isPrivate, setIsPrivate] = useState(false);
  const [ccEnableForward, setCcEnableForward] = useState(false);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [pickedFolder, setPickedFolder] = useState(null);
  const [hrPreview, setHrPreview] = useState(null);
  const [hrPreviewBody, setHrPreviewBody] = useState('');
  const [hrPreviewing, setHrPreviewing] = useState(false);

  const { data: userGroups, isLoading: loadingUserGroups } =
    useGetAllUserGroups();

  const { data: ccUsers } = useGetAllUsers();

  useEffect(() => {
    if (showHrOperations && searchParams.get('type') === 'HROperations') {
      form.setFieldValue('documentType', 'HROperations');
      setRequestType('HROperations');
    }
  }, [searchParams, form, showHrOperations]);

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
    } else if (error?.message) {
      description = error.message;
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
  const { mutate: startDocument, mutateAsync: startDocumentAsync, isPending: isDocumentSubmitting } =
    useMutation({
      mutationKey: ['document'],
      mutationFn: async (values) => {
        console.log('Creating document with data:', values);
        const response = await addDocument(values);
        return response;
      },
      onSuccess: () => {
        setLoading(false);
        setPickedFolder(null);
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
    form.setFieldsValue({
      budgetAllocations: undefined,
      amount: undefined,
      hrTemplateId: undefined,
      hrFill: undefined,
      hrArchiveFolderId: undefined,
      hrPersonalStaffUserId: undefined,
      hrFileVolume: undefined,
    });
    if (value === 'HROperations') {
      form.setFieldValue('subject', undefined);
    }
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

      // Clear any previously shown balance for this row
      setSelectedItemBalances((prev) => {
        const updated = { ...prev };
        delete updated[fieldKey];
        return updated;
      });

      // Reset the budgetItemId for this row
      const budgetAllocations = form.getFieldValue('budgetAllocations') || [];
      if (budgetAllocations[fieldKey]) {
        budgetAllocations[fieldKey].budgetItemId = undefined;
        form.setFieldValue('budgetAllocations', budgetAllocations);
      }
    }
  };

  const handleBudgetItemChange = (itemId, fieldKey) => {
    let found = null;
    for (const budget of budgetaryItems?.data?.data || []) {
      const item = budget.budgetItems?.find((u) => u.id === itemId);
      if (item) {
        const allocations = item.budgetAllocation || [];
        const sorted = [...allocations].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const balance = sorted[0]?.balance ?? item.amount;
        found = { amount: item.amount, balance };
        break;
      }
    }
    setSelectedItemBalances((prev) => ({ ...prev, [fieldKey]: found }));
  };

  const allPeople = ccUsers?.data?.users || ccUsers?.data || [];
  const staffNameOptions = allPeople
    .map((person) => person?.name)
    .filter(Boolean)
    .map((name) => ({ value: name }));
  const staffByUserId = Object.fromEntries(
    allPeople.filter((person) => person?.userId).map((person) => [person.userId, person]),
  );
  const letterStaffOptions = allPeople
    .filter((person) => person?.staff)
    .map((person) => {
      const hint = staffFileIssueHint(person);
      return {
        label: hint ? `${staffFileLabel(person)} (${hint})` : staffFileLabel(person),
        value: person.userId,
      };
    });
  const formDocumentType = Form.useWatch('documentType', form);
  const isHrRequest =
    formDocumentType === 'HROperations' || requestType === 'HROperations';
  const hrTemplates = showHrOperations ? listHrTemplates() : [];
  const selectedHrTemplateId = Form.useWatch('hrTemplateId', form);
  const selectedHrTemplate = selectedHrTemplateId
    ? getHrTemplate(selectedHrTemplateId)
    : null;
  const isHrLetter = selectedHrTemplate && selectedHrTemplate.kind !== 'memo';
  const hrFillWatch = Form.useWatch('hrFill', form) || {};
  const personalStaffUserId = Form.useWatch('hrPersonalStaffUserId', form);
  const letterStaffUserId = hrFillWatch.staff_name || personalStaffUserId;
  const letterStaff = letterStaffUserId ? staffByUserId[letterStaffUserId] : null;
  const letterVolume = Form.useWatch('hrFileVolume', form);
  const letterQuotePreview = letterStaff
    ? previewPersonalFileNumber(letterStaff, letterVolume)
    : '';

  useEffect(() => {
    if (!isHrLetter || !letterStaff?.staff?.personalFolderId) return;
    if (form.getFieldValue('hrArchiveFolderId')) return;
    form.setFieldValue('hrArchiveFolderId', letterStaff.staff.personalFolderId);
  }, [form, isHrLetter, letterStaff]);

  const closeHrPreview = () => {
    if (hrPreview?.blobUrl) URL.revokeObjectURL(hrPreview.blobUrl);
    setHrPreview(null);
    setHrPreviewBody('');
  };

  const recipientNameFromValues = (values) => {
    const recipient = values?.userId ? staffByUserId[values.userId] : null;
    return recipient?.name || '';
  };

  const buildHrLetterFromValues = async (values, { issue = false, body } = {}) => {
    const template = getHrTemplate(values.hrTemplateId);
    if (!template) {
      throw new Error('Select an HR template to send.');
    }
    const isLetter = template.kind !== 'memo';
    const recipientName = recipientNameFromValues(values);
    const filledValues = {
      ...formatFillValues(values.hrFill || {}, isLetter ? template.placeholders : [], staffByUserId),
      staff_name: recipientName || values.hrFill?.staff_name,
      recipient: recipientName,
    };
    let fileNumber;
    let issued;
    let archiveFolderId = values.hrArchiveFolderId;
    if (isLetter) {
      const staffUserId = values.hrFill?.staff_name || values.hrPersonalStaffUserId;
      if (!staffUserId) {
        throw new Error('Select the staff whose personal file this letter belongs to.');
      }
      if (!archiveFolderId) {
        throw new Error('Select the archive folder for this personal file.');
      }
      const volume = normalizeVolume(values.hrFileVolume);
      if (!volume) {
        throw new Error('Type the volume for this file, for example V1, V2, or V3.');
      }
      const staffPerson = staffByUserId[staffUserId];
      if (issue) {
        const issueRes = await axiosInstance.post('/personal-file/issue', {
          userId: staffUserId,
          folderId: archiveFolderId,
          volume,
        });
        issued = issueRes?.data?.issue;
        fileNumber = issued?.fileNumber;
        if (!fileNumber) {
          throw new Error('Could not issue a personal file number');
        }
      } else {
        fileNumber = previewPersonalFileNumber(staffPerson, volume);
      }
    }
    const letter = await buildHrMergeLetter({
      title: values.subject || template.name,
      body: body ?? template.body,
      values: filledValues,
      senderName: user?.name,
      kind: template.kind,
      fileNumber,
    });
    return { letter, issued, fileNumber, template, isLetter, archiveFolderId };
  };

  const openHrPreview = async (values) => {
    try {
      const template = getHrTemplate(values.hrTemplateId);
      if (!template) {
        showErrorNotification('Choose a template', 'Select an HR template to send.');
        return;
      }
      setHrPreviewing(true);
      const built = await buildHrLetterFromValues(values, {
        issue: false,
        body: template.body,
      });
      if (hrPreview?.blobUrl) URL.revokeObjectURL(hrPreview.blobUrl);
      const blobUrl = URL.createObjectURL(built.letter.blob);
      setHrPreviewBody(template.body);
      setHrPreview({
        values,
        blobUrl,
        template,
        fileNumber: built.fileNumber,
      });
    } catch (error) {
      showErrorNotification('Could not preview', error);
    } finally {
      setHrPreviewing(false);
    }
  };

  const refreshHrPreview = async () => {
    if (!hrPreview?.values) return;
    try {
      setHrPreviewing(true);
      const built = await buildHrLetterFromValues(hrPreview.values, {
        issue: false,
        body: hrPreviewBody,
      });
      if (hrPreview.blobUrl) URL.revokeObjectURL(hrPreview.blobUrl);
      const blobUrl = URL.createObjectURL(built.letter.blob);
      setHrPreview((prev) => ({ ...prev, blobUrl, fileNumber: built.fileNumber }));
    } catch (error) {
      showErrorNotification('Could not update preview', error);
    } finally {
      setHrPreviewing(false);
    }
  };

  const sendHrFromPreview = async () => {
    if (!hrPreview?.values) return;
    const values = hrPreview.values;
    try {
      setLoading(true);
      const built = await buildHrLetterFromValues(values, {
        issue: true,
        body: hrPreviewBody,
      });
      const { letter, issued, fileNumber, template, isLetter, archiveFolderId } = built;
      const mainFormData = new FormData();
      mainFormData.append('file', letter.file);
      mainFormData.append('ref', fileNumber || values.subject || template.name || 'MEMO');
      mainFormData.append('subject', values.subject || template.name);
      const response = await uploadFile(mainFormData);
      const fileId = response?.data?.newFile?.fileId;
      if (!fileId) {
        throw new Error('File upload successful but no file ID was returned');
      }
      let archivedFileId;
      if (isLetter && archiveFolderId) {
        const archiveData = new FormData();
        archiveData.append('file', letter.file);
        archiveData.append('ref', fileNumber);
        archiveData.append('subject', values.subject || template.name);
        archiveData.append('folderId', archiveFolderId);
        archiveData.append('isArchive', true);
        const archiveRes = await uploadFile(archiveData);
        archivedFileId = archiveRes?.data?.newFile?.fileId;
      }
      if (issued?.issueId) {
        try {
          await axiosInstance.patch(`/personal-file/issue/${issued.issueId}`, {
            fileId: archivedFileId || fileId,
          });
        } catch (attachError) {
          console.error('Could not attach issued file', attachError);
        }
      }
      await startDocumentAsync({
        subject: values.subject || template.name,
        documentType: 'General',
        divisionId: values.divisionId,
        departmentId: values.departmentId,
        userId: values.userId,
        carbonCopyIds: values.carbonCopyIds,
        comment: values.comment,
        privateComment: values.privateComment,
        fileId,
        physicalDoc: false,
        isPrivate,
        ccEnableForward,
      });
      closeHrPreview();
    } catch (error) {
      showErrorNotification('HR letter failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHrOperationsSubmit = async (values) => {
    await openHrPreview(values);
  };

  // Form submission handler
  const handleSubmit = (values) => {
    if (values.documentType === 'HROperations') {
      if (!showHrOperations) {
        showErrorNotification(
          'Not allowed',
          'HR Operations is only available to Human Resource staff.',
        );
        return;
      }
      handleHrOperationsSubmit(values);
      return;
    }
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

    // Debug: Log the file structure to understand how Ant Design Upload stores it
    console.log('File value structure:', values.file);
    console.log('File keys:', values.file ? Object.keys(values.file) : 'undefined');

    // Get the main file from the upload component
    // Ant Design Upload stores files in different ways depending on the structure
    let mainFile = null;
    
    if (values.file) {
      // Check various possible structures
      if (values.file.file?.originFileObj) {
        mainFile = values.file.file.originFileObj;
        console.log('Found file at: file.file.originFileObj');
      } else if (values.file.fileList?.[0]?.originFileObj) {
        mainFile = values.file.fileList[0].originFileObj;
        console.log('Found file at: file.fileList[0].originFileObj');
      } else if (values.file.originFileObj) {
        mainFile = values.file.originFileObj;
        console.log('Found file at: file.originFileObj');
      } else if (values.file.file) {
        mainFile = values.file.file;
        console.log('Found file at: file.file');
      } else if (values.file instanceof File) {
        mainFile = values.file;
        console.log('Found file as direct File instance');
      }
    }

    if (!mainFile && values.attachments) {
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
    if (!mainFile) {
      setLoading(false);
      showErrorNotification(
        'Missing File',
        'Please upload a main document file.'
      );
      return;
    }

    // First upload the main document file
    const mainFormData = new FormData();
    mainFormData.append('file', mainFile);
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
      // Manually update form field value since beforeUpload returns false
      form.setFieldsValue({ file: info });
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
    if (!isSubmitting && typeof notification.destroy === 'function') {
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
                    ...(showHrOperations
                      ? [{ label: 'HR Operations', value: 'HROperations' }]
                      : []),
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
              {isHrRequest && (
                <div className="mb-6 rounded-xl border border-[#ead9cb] bg-[#fffaf7] p-4">
                  <p className="mb-1 text-sm font-semibold text-[#582f08]">
                    Choose a saved template
                  </p>
                  <p className="mb-3 text-xs text-[#7a6859]">
                    Car loan and Contract are no longer options here. Use a template from Templates, then send it.
                  </p>
                  {hrTemplates.length === 0 ? (
                    <p className="text-sm text-[#7a6859]">
                      No templates yet.{' '}
                      <Link to="/templates" className="font-semibold text-[#9D4D01]">
                        Create a template
                      </Link>{' '}
                      first, then come back here to fill and send it.
                    </p>
                  ) : (
                    <>
                      <Form.Item
                        name="hrTemplateId"
                        label="Choose template"
                        rules={[{ required: true, message: 'Choose a template' }]}
                      >
                        <Select
                          placeholder="Select a saved template"
                          options={hrTemplates.map((template) => ({
                            label: `${template.name} · ${template.kind === 'memo' ? 'Memo' : 'Any type'}`,
                            value: template.id,
                          }))}
                          onChange={(id) => {
                            const template = getHrTemplate(id);
                            form.setFieldsValue({
                              hrTemplateId: id,
                              hrFill: {},
                              hrArchiveFolderId: undefined,
                              hrPersonalStaffUserId: undefined,
                              subject: template?.name || form.getFieldValue('subject'),
                            });
                            setPickedFolder(null);
                          }}
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                      {selectedHrTemplate && (
                        <>
                          <p className="mb-3 text-xs text-[#7a6859]">
                            {selectedHrTemplate.kind === 'memo'
                              ? 'This prints on the official memo form. To, From, Date, and Subject come from this form. You will preview and can edit the body before sending. Memos do not get a personal file number.'
                              : 'This prints on the Ghana Cocoa Board letterhead. PLEASE QUOTE and DATE are filled in for you. You will preview before sending.'}
                          </p>
                          {isHrLetter &&
                            !(selectedHrTemplate.placeholders || []).some(
                              (item) => item.type === 'staff',
                            ) && (
                              <Form.Item
                                name="hrPersonalStaffUserId"
                                label="Staff personal file"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Select the staff for this letter',
                                  },
                                ]}
                              >
                                <Select
                                  placeholder="Nathaniel — staff ID — dept code — PF — next"
                                  options={letterStaffOptions}
                                  showSearch
                                  optionFilterProp="label"
                                  size="large"
                                />
                              </Form.Item>
                            )}
                          {isHrLetter &&
                            (selectedHrTemplate.placeholders || []).map((item) => (
                            <Form.Item
                              key={item.key}
                              name={['hrFill', item.key]}
                              label={item.label}
                              rules={[
                                {
                                  required: true,
                                  message: `Enter ${item.label.toLowerCase()}`,
                                },
                              ]}
                            >
                              <PlaceholderInput
                                field={item}
                                staffNameOptions={staffNameOptions}
                                staffSelectOptions={letterStaffOptions}
                              />
                            </Form.Item>
                          ))}
                          {isHrLetter && (
                            <>
                              <Form.Item
                                name="hrFileVolume"
                                label="Volume"
                                extra="Typed into PLEASE QUOTE as PRS/{dept}/{PF}/{volume}/{sequence}."
                                rules={[
                                  {
                                    required: true,
                                    message: 'Enter the volume, e.g. V2',
                                  },
                                  {
                                    validator: (_, value) =>
                                      normalizeVolume(value)
                                        ? Promise.resolve()
                                        : Promise.reject(
                                            new Error('Use V1, V2, V3, and so on'),
                                          ),
                                  },
                                ]}
                              >
                                <Input placeholder="e.g. V2" maxLength={6} allowClear />
                              </Form.Item>
                              {letterQuotePreview ? (
                                <p className="mb-3 text-sm font-semibold text-[#582F08]">
                                  PLEASE QUOTE: {letterQuotePreview}
                                </p>
                              ) : letterStaffUserId && !canIssuePersonalFile(letterStaff) ? (
                                <p className="mb-3 text-sm text-red-600">
                                  This staff needs a personal file number and a department code.
                                </p>
                              ) : letterStaffUserId ? (
                                <p className="mb-3 text-xs text-[#7a6859]">
                                  Type the volume to see the next file number.
                                </p>
                              ) : (
                                <p className="mb-3 text-xs text-[#7a6859]">
                                  Select staff and type the volume to see the next file number.
                                </p>
                              )}
                              <Form.Item
                                name="hrArchiveFolderId"
                                hidden
                                rules={[
                                  {
                                    required: true,
                                    message: 'Choose the archive folder for this file',
                                  },
                                ]}
                              >
                                <Input />
                              </Form.Item>
                              <div className="-mt-4 mb-4 flex items-center gap-2">
                                <Button
                                  htmlType="button"
                                  onClick={() => setFolderPickerOpen(true)}
                                >
                                  Choose folder
                                </Button>
                                <span className="text-sm text-[#7a6859]">
                                  {pickedFolder?.folderName ||
                                    (letterStaff?.staff?.personalFolderId
                                      ? 'Using the staff personal folder'
                                      : 'No folder selected')}
                                </span>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
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
                                  onChange={(itemId) =>
                                    handleBudgetItemChange(itemId, field.name)
                                  }
                                />
                              </Form.Item>
                              {selectedItemBalances[field.name] != null && (
                                <div className="-mt-4 mb-3 px-1 text-xs">
                                  <span className="text-gray-500">Remaining balance: </span>
                                  <span
                                    className={`font-semibold ${
                                      selectedItemBalances[field.name].balance <= 0
                                        ? 'text-red-600'
                                        : 'text-green-700'
                                    }`}
                                  >
                                    ₵{formatMoney(selectedItemBalances[field.name].balance)}
                                  </span>
                                </div>
                              )}
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
              {/* Recipient, CC, comments */}
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

              {!isPhysical && !isHrRequest && (
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
                        Upload Document
                      </Button>
                    </Upload>
                    <div className="text-gray-500 text-sm mt-1">
                      Supports PDF, Word, and Excel files. Word/Excel files will be converted to PDF for annotation.
                    </div>
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
                      You can upload multiple files. Word/Excel files will be converted to PDF.
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
                  loading={isSubmitting || hrPreviewing}
                  disabled={isSubmitting || hrPreviewing}
                >
                  {isSubmitting || hrPreviewing
                    ? 'Processing...'
                    : isHrRequest
                      ? 'Preview'
                      : 'Submit Document'}
                </Button>
              </Form.Item>
            </Form>
            <ArchiveFolderPicker
              open={folderPickerOpen}
              onClose={() => setFolderPickerOpen(false)}
              selectedFolderId={pickedFolder?.folderId}
              onSelect={(folder) => {
                setPickedFolder(folder);
                form.setFieldValue('hrArchiveFolderId', folder.folderId);
              }}
            />
            <Modal
              open={Boolean(hrPreview)}
              onCancel={closeHrPreview}
              title="Preview before sending"
              width={920}
              footer={[
                <Button key="back" onClick={closeHrPreview}>
                  Back
                </Button>,
                <Button
                  key="refresh"
                  onClick={refreshHrPreview}
                  loading={hrPreviewing}
                >
                  Update preview
                </Button>,
                <Button
                  key="send"
                  type="primary"
                  onClick={sendHrFromPreview}
                  loading={isSubmitting}
                >
                  Send
                </Button>,
              ]}
            >
              <p className="mb-3 text-xs text-[#7a6859]">
                Edit the body if needed, then update the preview. Sending uses this version.
                {hrPreview?.fileNumber ? ` PLEASE QUOTE will be ${hrPreview.fileNumber}.` : ''}
              </p>
              <TextArea
                value={hrPreviewBody}
                onChange={(event) => setHrPreviewBody(event.target.value)}
                rows={8}
                className="mb-4"
              />
              {hrPreview?.blobUrl ? (
                <iframe
                  title="HR document preview"
                  src={hrPreview.blobUrl}
                  className="h-[480px] w-full rounded-md border border-[#ead9cb] bg-white"
                />
              ) : null}
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDocument;
