import {
  Table,
  Modal,
  Form,
  Input,
  Button,
  message,
  Upload,
  Divider,
  Radio,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  FilePdfFilled,
  FolderAddOutlined,
  FolderFilled,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import axiosInstance from "../Components/axiosInstance";
import { Link, useParams } from "react-router-dom";
import useArchiveTransform from "./CustomHook/useArchiveTransform";

const Archive = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();

  const columns = [
    {
      title: "Name",
      dataIndex: "folderName",
      render: (value, record) => (
        <div
          className="flex gap-2 cursor-pointer "
          onClick={() => console.log(record?.folderId)}
        >
          <Link to={`/dashboard/archive/${record?.folderId}`}>
            {value ? (
              <div className="flex gap-2">
                <FolderFilled className="text-[24px] text-[#FFAC28]" />
                {value}
              </div>
            ) : (
              <div className="flex gap-2">
                <FilePdfFilled className="text-[24px] text-[#eb3b3b]" />
                {record?.fileName}
              </div>
            )}
          </Link>
        </div>
      ),
    },
    {
      title: "Reference",
      dataIndex: "ref",
      render: (value, record) => (
        <div>{value ? record?.ref : <div className="  "> ----- </div>}</div>
      ),
    },
    {
      title: "Date Created",
      dataIndex: "createdAt",
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        const datesTime = new Date(createdAt);
        return (
          <div className="flex gap-2">
            <div>{dateTime.toDateString()}</div>
            <div>{datesTime.toLocaleTimeString()} </div>
          </div>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (value) => <div>{value}</div>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      render: (value) => <div>{value ? value : <div>-----</div>}</div>,
    },
    {
      title: "Action",
    },
  ];

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User",
      // Column configuration not to be checked
      name: record.name,
    }),
  };

  const [selectionType, setSelectionType] = useState("checkbox");

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [form] = Form.useForm();
  const [selectedFile, setSelectedFile] = useState("");

  //UseQuery to fetch all archives/folders
  const { data: archive } = useQuery({
    queryKey: ["archive", id],
    queryFn: () => {
      if (!id) return axiosInstance.get("/archive");

      return axiosInstance.get(`archive/${id}`);
    },
  });

  const archives = id ? archive?.data?.archive : archive?.data?.archives;
  const { _data } = useArchiveTransform(archives, id);

  //If there is an id send data.children to the dataIndex
  // let _data = flattenArray(
  //   id ? archive?.data?.archive.files : archive?.data?.archives
  // );
  const data = _data?.map((archive, index) => ({
    ...archive,
    key: index,
  }));
  // console.log(_data);

  //Usemutation to create folder
  const { mutate } = useMutation({
    mutationKey: "folder",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.post("/archive", { ...values, folderId: id });
    },
    onSuccess: () => {
      setOpen(false);
      form.resetFields();
      message.success("Folder created successfully!");
      queryClient.invalidateQueries({ mutationKey: "folder" });
    },
    onError: (error) => {
      setOpen(false);

      console.log(error);
    },
  });

  //Usemutation to upload files
  const { mutate: uploadFile } = useMutation({
    mutationKey: "fileUpload",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.post("/upload", values);
    },
    onSuccess: () => {
      setOpen(false);
      form.resetFields();
      message.success("file uploaded successfully!");
      queryClient.invalidateQueries({ mutationKey: "folder" });
    },
    onError: (error) => {
      setOpen(false);

      console.log(error);
    },
  });

  const handleSubmit = (values) => {
    mutate(values);
    // console.log(values);
    //do my mutation value here
  };

  const handleUpload = (values) => {
    console.log(values);
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("ref", values.ref);
      formData.append("subject", values.subject);
      formData.append("folderId", id);
      uploadFile(formData);
    }
  };

  function handleClick() {
    console.log("object");
    setOpen(true);
  }

  const handleCancel = () => {
    setOpen(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  function handleFile() {
    setShow(true);
  }

  return (
    <div className="pt-[70px]  h-screen w-full pl-[200px] pr-[72px]  ">
      <div>
        <div className="h-[2px] w-[1298px] bg-[#bb9673] m-4"></div>
        <div className="flex gap-4">
          <button
            className=" my-3 p-2 text-[#582F08] flex justify-center items-center gap-1 shadow-md rounded-md  text-[20px] font-semibold "
            onClick={handleClick}
          >
            <FolderAddOutlined className="text-[30px]" />
            <p>New Folder</p>
          </button>
          <button
            className=" my-3 p-2 text-[#582F08] flex justify-center items-center gap-1 shadow-md rounded-md  text-[20px] font-semibold "
            onClick={handleFile}
          >
            <UploadOutlined className="text-[30px]" />
            <p>Upload File</p>
          </button>
        </div>
        <div className="h-[2px] w-[1298px] bg-[#bb9673] m-4"></div>
      </div>

      <div>
        <Modal
          open={open}
          title="New Folder"
          onCancel={handleCancel}
          footer={null}
        >
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
                    message: "Please input a name for the Folder!",
                  },
                ]}
              >
                <Input placeholder="Enter folder Name" allowClear />
              </Form.Item>
              <Form.Item>
                {/* <div className="flex float-end"> */}
                <Button
                  className="w-full bg-[#9D4D01]"
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>
                {/* </div> */}
              </Form.Item>
            </Form>
          </div>
        </Modal>
        <Modal
          open={show}
          title="Upload File"
          footer={null}
          onCancel={handleClose}
        >
          <Form
            name="Upload File"
            onFinish={(values) => handleUpload(values)}
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="subject"
              label="Subject"
              rules={[
                {
                  required: true,
                  message: "Please input a subject for your file!",
                },
              ]}
            >
              <Input placeholder="Subject" allowClear />
            </Form.Item>
            <Form.Item
              name="ref"
              label="Reference"
              rules={[
                {
                  required: true,
                  message: "Please enter a reference for your file!",
                },
              ]}
            >
              <Input placeholder="Reference" allowClear />
            </Form.Item>
            <Form.Item label="File" name="file">
              <div className="flex justify-center">
                <Upload
                  // action={"http://localhost:5000/upload"}
                  name="file"
                  onChange={(info) => setSelectedFile(info.file.originFileObj)}
                  accept=".pdf"
                >
                  <button className="border border-black px-20 py-1">
                    <div className="flex gap-2 text-[18px]">
                      <UploadOutlined className="text-[19px]" />
                      <p>Upload</p>
                    </div>
                  </button>
                </Upload>
              </div>
            </Form.Item>
            <Form.Item>
              <Button
                className="w-full bg-[#9D4D01]"
                type="primary"
                htmlType="submit"
              >
                Upload
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>

      <Table
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
      />
    </div>
  );
};

export default Archive;
