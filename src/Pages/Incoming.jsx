import {
  Table,
  Modal,
  Form,
  Select,
  Steps,
  Button,
  Upload,
  message,
  Dropdown,
  Mentions,
  Checkbox,
  Tag,
} from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { SlOptionsVertical } from "react-icons/sl";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { useTrail } from "./CustomHook/useTrail";
import axiosInstance from "../Components/axiosInstance";
import ArchiveFiles from "../Components/modals/Archive/ArchiveFiles";

import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from "../../utils/Roles";
import useStore from "../store/store";
import { useUser } from "./CustomHook/useUser";
import { uploadFile } from "../http/addDocument";

const Incoming = () => {
  const navigate = useNavigate();
  const { trails, isLoading } = useTrail("incoming");

  const [show, setShow] = useState(false);
  const [open, SetOpen] = useState(false);
  const [record, setRecord] = useState({});
  const [trailId, setTrailId] = useState("");
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const setLocation = useStore((state) => state.setLocation);
  const setChosenRecord = useStore((state) => state.setChosenRecord);

  const { user: authUser } = useUser();
  const allRolePermissions = getAllRolePermissions(authUser);

  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  function handleFile(selectedRecord) {
    setShow(true);
    setRecord(selectedRecord?.document);
  }

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleClose = () => {
    SetOpen(false);
  };

  // useQuery for getting all  divisions
  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => {
      return axiosInstance.get("/division");
    },
  });

  // useQuery for getting all departments in a selected Division
  const { data: departments, refetch } = useQuery({
    queryKey: ["options"],
    queryFn: () => {
      return axiosInstance.get(`/department/${selectedDivision}`);
    },
    enabled: false,
  });

  // useQuery for getting all users in a selected Department
  const { data: users, refetch: fetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return axiosInstance.get(`/all-users/${selectedDepartment}`);
    },
    enabled: false,
  });

  // useMutation to forward Document
  const { mutate: forwardDocument } = useMutation({
    mutationKey: "forwardDocument",
    mutationFn: (values) => {
      return axiosInstance.patch(`/trail/${selected}`, values);
    },
    onSuccess: () => {
      setLoading(false);
      setIsModalOpen(false);
      message.success("Document has been successfully forwarded!");
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["trail"] });
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

  //useQUery to fetch trail associated to doc ID
  const { data: trailData } = useQuery({
    queryKey: ["trailData", trailId],
    queryFn: async () => {
      return axiosInstance.get(`/trail/${trailId}`);
    },
    enabled: !!trailId, // Only fetch if trailId is set
  });

  const { mutate: uploadMultipleFiles, isPending: isMultipleUploading } =
    useMutation({
      mutationKey: ["uploadMultiple"],
      mutationFn: async ({ files, subject, ref }) => {
        console.log("Uploading multiple files...");

        // Create an array of promises for each file upload
        const uploadPromises = files.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("subject", subject);
          formData.append("ref", ref);

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
        console.log("All files uploaded successfully with IDs:", fileIds);

        // Get form values and add file IDs
        const values = form.getFieldsValue();
        forwardDocument({
          ...values,
          status: "Forwarded",
          isPrivate,
          attachmentIds: fileIds,
        });
      },
      onError: (error) => {
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

  const handleClick = (selectedRecord) => {
    setIsModalOpen(true);
    setSelected(selectedRecord?.docID);
  };

  const handleFormSubmit = (values) => {
    setLoading(true);

    const attachmentFiles = values.attachments?.fileList;

    if (!attachmentFiles || attachmentFiles.length === 0) {
      forwardDocument({ ...values, status: "Forwarded", isPrivate });
    } else {
      const attachmentFilesArray = attachmentFiles.map(
        (fileItem) => fileItem.originFileObj
      );

      // Upload all attachments with reference to main file
      uploadMultipleFiles({
        files: attachmentFilesArray,
        subject: "",
        ref: "",
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
    name: "file", // The name of the file input field, not the form field name
    multiple: true,
    beforeUpload: () => false, // Prevent auto upload
    onChange(info) {
      console.log(
        "Attachment files selected:",
        info.fileList.map((f) => f.name)
      );
      // The fileList will be stored in the form
      form.setFieldsValue({ attachments: { fileList: info.fileList } });
    },
    accept: ".pdf",
  };

  const getItems = (selectedRecord) => {
    return [
      {
        label: (
          <span
            onClick={() => {
              setLocation("incoming");
              handleViewDocument(selectedRecord);
            }}
          >
            View
          </span>
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
      title: "Subject",
      key: "subject",
      render: (data) => {
        return (
          <div className="flex items-start">
            {data.document.subject}{" "}
            {data.isCarbonCopy ? (
              <span>
                <Tag color="warning">CC</Tag>
              </span>
            ) : (
              ""
            )}
          </div>
        );
      },
    },
    {
      title: "Reference",
      dataIndex: "document",
      key: "ref",
      render: (document) => {
        return <div>{document.ref}</div>;
      },
    },

    {
      title: "Sender",
      dataIndex: ["sender", "name"],
      key: "receiver",
    },
    {
      title: "Intended Receipients",
      dataIndex: ["userIntendedFor", "name"],
      key: "userIntendedFor",
    },

    {
      title: "Division",
      key: "division",
      render: (document) => {
        return <div>{document.document.division.divisionName}</div>;
      },
    },

    {
      title: "Department",
      key: "department",
      render: (document) => {
        return <div>{document.document.department.departmentName}</div>;
      },
    },
    {
      title: "Date",
      key: "action",
      dataIndex: "createdAt",
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return <div>{dateTime.toDateString()}</div>;
      },
    },
    {
      title: "Time",
      key: "time",
      dataIndex: "createdAt",
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        return <div>{dateTime.toLocaleTimeString()}</div>;
      },
    },
    {
      title: "Actions",
      key: "action",

      render: (selectedRecord) => (
        <Dropdown
          menu={{ items: getItems(selectedRecord) }}
          trigger={["click"]}
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

  return (
    <div className="mt-8">
      <Table columns={columns} dataSource={_data} loading={isLoading} />
      {isModalOpen && (
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
                    message: "Please choose your Division!",
                  },
                ]}
              >
                <Select
                  placeholder="Please choose your Division"
                  optionFilterProp="label"
                  showSearch
                  allowClear
                  labelInValue
                  options={divisions?.data.map((division) => ({
                    label: division?.divisionName,
                    value: division?.divisionId,
                  }))}
                  onChange={handleDivisionChange}
                />
              </Form.Item>
              <Form.Item
                label="Department"
                name="department"
                rules={[
                  {
                    required: true,
                    message: "Please choose your Department!",
                  },
                ]}
              >
                <Select
                  placeholder="Please choose your Department"
                  optionFilterProp="label"
                  showSearch
                  allowClear
                  labelInValue
                  options={departments?.data?.data?.map((department) => ({
                    label: department?.departmentName,
                    value: department?.departmentId,
                  }))}
                  onChange={handleDepartmentChange}
                />
              </Form.Item>
              <Form.Item
                name="userId"
                label="User"
                rules={[
                  {
                    required: true,
                    message: "Please select a User!",
                  },
                ]}
              >
                <Select
                  placeholder="Please select a User"
                  optionFilterProp="label"
                  showSearch
                  allowClear
                  options={
                    (users &&
                      users?.data
                        .filter((emp) => emp.userId !== authUser?.userId)
                        .map((user) => ({
                          label: user?.name,
                          value: user?.userId,
                        }))) ||
                    []
                  }
                />
              </Form.Item>
              <Form.Item>
                <Checkbox onChange={() => setIsPrivate(!isPrivate)}>
                  Private Comment?
                </Checkbox>
              </Form.Item>

              <Form.Item label="Comment" name="comment">
                <Mentions
                  rows={4}
                  placeholder="Enter Comment...."
                  options={
                    (users &&
                      users?.data
                        ?.filter((emp) => emp.userId !== authUser?.userId)
                        .map((user) => ({
                          label: user?.name,
                          value: user?.name,
                        }))) ||
                    []
                  }
                />
              </Form.Item>

              <Form.Item name="attachments">
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
            </Form>{" "}
          </div>
        </Modal>
      )}
      <Modal
        title="Locator"
        open={open}
        onCancel={handleClose}
        footer={null}
        centered="true"
        width={"60%"}
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
                    title: "Sent",
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
