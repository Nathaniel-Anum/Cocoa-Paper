import {
  Table,
  Modal,
  Form,
  Input,
  Button,
  message,
  Upload,
  Divider,
  Popconfirm,
  Radio,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DeleteTwoTone,
  EditTwoTone,
  FilePdfFilled,
  FolderAddOutlined,
  FolderFilled,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import axiosInstance from "../Components/axiosInstance";
import { Link, useParams } from "react-router-dom";
import useArchiveTransform from "./CustomHook/useArchiveTransform";
import CreateFolder from "../Components/modals/Archive/CreateFolder";
import UploadFile from "../Components/modals/Archive/UploadFile";

const Archive = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wholerecord, setWholeRecord] = useState({});
  const [allrecord, setAllRecord] = useState({});
  const [form] = Form.useForm();
  const { id } = useParams();

  const handleSubmit = (values) => {
    console.log(values);
    EditFolder(values?.folderName);
  };

  function handleClick() {
    setOpen(true);
  }

  function handleFile() {
    setShow(true);
  }
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (record) => {
    setWholeRecord(record);
    console.log(wholerecord);
    setIsModalOpen(true);
  };

  const [folderId, setFolderId] = useState("");

  const cancel = (e) => {
    console.log(e);
    // message.error("Click on No");
  };

  //Mutate to delete folders and files
  const { mutate } = useMutation({
    mutationKey: "delete",
    mutationFn: () => {
      if (allrecord?.type === "Folder") {
        return axiosInstance.delete(`/archive/${allrecord?.folderId}`);
      } else if (allrecord?.type === "File") {
        return axiosInstance.delete(`/archive/${allrecord?.fileId}`);
      } else {
        throw new Error ("Unknown file type")
      }
    },
    onSuccess: () => {
      message.success("Deleted Successfully");
      queryClient.invalidateQueries({ queryKey: ["archive"] });
    },
    onError: (error) => {
      message.error(error);
    },
  });

  //Mutate function to edit folder (name)
  const { mutate: EditFolder } = useMutation({
    mutationKey: "editFolder",
    mutationFn: (folderName) => {
      return axiosInstance.patch(`/archive/${wholerecord?.folderId}`, {
        folderName: folderName,
      });
    },
    onSuccess: () => {
      message.success("Folder Successfully updated");
      queryClient.invalidateQueries({ queryKey: ["archive"] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      message.error(error);
    },
  });

  // const handleDelete = (record) => {
  //   console.log(record);
  //   setFolderId(record?.folderId);
  //   mutate(record);
  // };

  function handleDelete(record) {
    console.log(record);
    setAllRecord(record);
    mutate(record);
  }

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
        <div>{value ? record?.ref : <div className="  "> - </div>}</div>
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
      render: (value) => <div>{value ? value : <div>-</div>}</div>,
    },
    {
      title: "Action",
      dataIndex: "archiveId",
      render: (value, record) => (
        <div className="flex gap-3 text-[17px]">
          <button onClick={() => handleEdit(record)}>
            <EditTwoTone />
          </button>
          <Popconfirm
            title="Delete Archive"
            description="Are you sure to delete this archive?"
            onConfirm={() => handleDelete(record)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <button>
              <DeleteTwoTone twoToneColor="#FF0000" />
            </button>
          </Popconfirm>
        </div>
      ),
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

  const data = _data?.map((archive, index) => ({
    ...archive,
    key: index,
  }));
  // console.log(_data);

  return (
    <div className="pt-[70px]  h-screen w-full pl-[200px] pr-[72px]">
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

      <div></div>

      <Modal
        title="Edit Folder"
        name="Edit Folder"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <div className="mt-3">
          <Form
            name="Edit Folder"
            onFinish={(values) => handleSubmit(values)}
            form={form}
          >
            <Form.Item
              name="folderName"
              initialValue={wholerecord?.folderName}
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
      <Table
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
      />

      {open ? <CreateFolder open={open} setOpen={setOpen} id={id} /> : null}
      {show ? <UploadFile show={show} setShow={setShow} id={id} /> : null}
    </div>
  );
};

export default Archive;
