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
  Breadcrumb,
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
import React, { useEffect, useState } from "react";
import axiosInstance from "../Components/axiosInstance";
import { Link, useLocation, useParams } from "react-router-dom";
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

  const { pathname } = useLocation();

  const cancel = (e) => {
    console.log(e);
    // message.error("Click on No");
  };

  const handleEdit = (record) => {
    setWholeRecord(record);
    console.log(wholerecord);
    setIsModalOpen(true);
  };

  //Mutation to delete folders and files
  const { mutate } = useMutation({
    mutationKey: "delete",
    mutationFn: () => {
      if (allrecord?.type === "Folder") {
        return axiosInstance.delete(`/archive/${allrecord?.folderId}`);
      } else if (allrecord?.type === "File") {
        return axiosInstance.delete(`/archive/${allrecord?.fileId}`);
      } else {
        throw new Error("Unknown file type");
      }
    },
    onSuccess: () => {
      message.success("Folder Successfully Deleted");
      queryClient.invalidateQueries({ queryKey: ["archive"] });
    },
    onError: (error) => message.error(error),
  });

  function handleDelete(record) {
    setAllRecord(record);
    mutate(record);

    queryClient.invalidateQueries(["archive"]);
  }

  //Mutate function to edit folders and file
  const { mutate: EditFolder } = useMutation({
    mutationKey: "edit",
    mutationFn: (values) => {
      if (wholerecord?.type === "Folder") {
        return axiosInstance.patch(`/archive/${wholerecord?.folderId}`, {
          folderName: values.folderName,
        });
      } else if (wholerecord?.type === "File") {
        return axiosInstance.patch(`/archive/${wholerecord?.fileId}`, values);
      } else {
        throw new Error("Unknown file type");
      }
    },
    onSuccess: () => {
      message.success(" Successfully Updated");
      queryClient.invalidateQueries({ queryKey: ["archive"] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      message.error(error);
    },
  });

  // //Mutate function to edit folder (name)
  // const { mutate: EditFolder } = useMutation({
  //   mutationKey: "editFolder",
  //   mutationFn: (folderName) => {
  //     return axiosInstance.patch(`/archive/${wholerecord?.folderId}`, {
  //       folderName: folderName,
  //     });
  //   },
  //   onSuccess: () => {
  //     message.success("Folder Name Successfully Updated");
  //     queryClient.invalidateQueries({ queryKey: ["archive"] });
  //     setIsModalOpen(false);
  //   },
  //   onError: (error) => {
  //     message.error(error);
  //   },
  // });

  const handleSubmit = (values) => {
    console.log(values);
    EditFolder(values);
  };

  //Bright Code start

  // const [crumbs, setCrumbs] = useState([
  //   {
  //     title: "Archive",
  //     path: "/archive",
  //     id: 0,
  //     onClick: (e) => console.log(e),
  //   },
  // ]);

  // const handleAddItem = (itemToAdd) => {
  //   //check if the item is already  in items array

  //   const itemsExist = crumbs.find((item) => item.id === itemToAdd.folderId);

  //   if (itemsExist) {
  //     const itemIndex = crumbs.findIndex(
  //       (item) => item.folderId === itemsExist.folderId
  //     );

  //     if (itemIndex !== crumbs.length - 1 || itemIndex !== 0) {
  //       setCrumbs(crumbs.slice(0, itemIndex + 1));
  //     }
  //   } else {
  //     setCrumbs([
  //       ...crumbs,
  //       {
  //         title: itemToAdd.folderName,
  //         path: `/${itemToAdd.folderId}`,
  //         id: itemToAdd.folderId,
  //       },
  //     ]);
  //   }
  // };

  // useEffect(() => {
  //   const storedCrumbs = JSON.parse(localStorage.getItem("crumbs")) || [];
  //   if (storedCrumbs.length) {
  //     setCrumbs(storedCrumbs);
  //   }
  // }, []);

  //Bright Code end

  // useEffect(() => {
  //   if (id || pathname.split('/')[1] !== 'archive') {
  //     const storedCrumbs = JSON.parse(localStorage.getItem('crumbs')) || [];
  //     console.log(storedCrumbs)
  //     const itemIndex = storedCrumbs.findIndex((item) => item.id === id);
  //     if (itemIndex) {
  //       setCrumbs(storedCrumbs.slice(0, itemIndex + 1));
  //       localStorage.setItem(
  //         'crumbs',
  //         JSON.stringify(storedCrumbs.slice(0, itemIndex + 1))
  //       );
  //     }
  //   }
  // }, [id, pathname]);

  //Bright code again
  // useEffect(() => {
  //   localStorage.setItem("crumbs", JSON.stringify(crumbs));
  // }, [crumbs]);

  useEffect(() => {
    if (wholerecord) {
      form.setFieldValue("folderName", wholerecord?.folderName);
    }
  }, [wholerecord]);

  // useEffect(() => {
  //   if (pathname) {
  //     console.log('I have been called');
  //     const ItemIndex = crumbs.findIndex((item) => item.id === id);
  //     console.log(ItemIndex);
  //     if (ItemIndex !== 0 || ItemIndex !== -1) {
  //       setCrumbs(crumbs.slice(0, ItemIndex + 1));
  //       localStorage.setItem(
  //         'crumbs',
  //         JSON.stringify(crumbs.slice(1, ItemIndex + 1))
  //       );
  //     } else if (ItemIndex === -1) {
  //       setCrumbs([
  //         {
  //           title: 'Archive',
  //           path: '/archive',
  //           id: 0,
  //         },
  //       ]);
  //       localStorage.setItem(
  //         'crumbs',
  //         JSON.stringify([{ title: 'Archive', path: '/archive', id: 0 }])
  //       );
  //     }
  //   } else {
  //     setCrumbs([
  //       {
  //         title: 'Archive',
  //         path: '/archive',
  //         id: 0,
  //       },
  //     ]);
  //     localStorage.setItem(
  //       'crumbs',
  //       JSON.stringify([{ title: 'Archive', path: '/archive', id: 0 }])
  //     );
  //   }
  // }, [pathname]);

  //Bright code
  // function itemRender(currentRoute, params, items, paths) {
  //   console.log({ route: currentRoute.path, items, paths });
  //   return (
  //     <Link
  //       to={
  //         currentRoute.path === "/archive"
  //           ? "/archive"
  //           : `/archive${currentRoute.path}`
  //       }
  //     >
  //       {currentRoute.title}
  //     </Link>
  //   );
  // }

  const [crumbs, setCrumbs] = useState([
    {
      title: "Archive",
      path: "/archive",
      id: 0,
      onClick: (e) => console.log(e),
    },
  ]);

  // Load crumbs from localStorage on component mount
  useEffect(() => {
    const storedCrumbs = JSON.parse(localStorage.getItem("crumbs")) || [];
    if (storedCrumbs.length) {
      setCrumbs(storedCrumbs);
    }
  }, []);

  // Update localStorage whenever crumbs state changes
  useEffect(() => {
    localStorage.setItem("crumbs", JSON.stringify(crumbs));
  }, [crumbs]);

  const handleAddItem = (itemToAdd) => {
    const itemsExist = crumbs.find((item) => item.id === itemToAdd.folderId);

    if (itemsExist) {
      const itemIndex = crumbs.findIndex((item) => item.id === itemsExist.id);

      // Slice the array to include only the clicked item and its predecessors
      if (itemIndex !== crumbs.length - 1 || itemIndex !== 0) {
        const newCrumbs = crumbs.slice(0, itemIndex + 1);
        setCrumbs(newCrumbs);
      }
    } else {
      setCrumbs([
        ...crumbs,
        {
          title: itemToAdd.folderName,
          path: `/${itemToAdd.folderId}`,
          id: itemToAdd.folderId,
        },
      ]);
    }
  };

  const itemRender = (currentRoute) => {
    return (
      <Link
        to={
          currentRoute.path === "/archive"
            ? "/archive"
            : `/archive${currentRoute.path}`
        }
        onClick={() => {
          const itemIndex = crumbs.findIndex(
            (item) => item.path === currentRoute.path
          );
          setCrumbs(crumbs.slice(0, itemIndex + 1));
        }}
      >
        {currentRoute.title}
      </Link>
    );
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "folderName",
      render: (value, record) => (
        <div
          className="flex gap-2 cursor-pointer "
          onClick={() => {
            handleAddItem(record);
            // console.log(crumbs);
          }}
        >
          <Link to={`/archive/${record?.folderId}`}>
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
      render: (value, record) => {
        const isFile = record?.type === "File";
        return (
          <div className="flex gap-3 text-[17px]">
            <button onClick={() => handleEdit(record)}>
              <EditTwoTone />
            </button>
            <Popconfirm
              title={` Are you sure you want to  delete this ${
                isFile ? "file" : "folder"
              } ?`}
              onConfirm={() => handleDelete(record)}
              onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <button onClick={() => console.log(record)}>
                <DeleteTwoTone twoToneColor="#FF0000" />
              </button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  console.log("Test");
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
  console.log({ archives });

  const { _data } = useArchiveTransform(archives, id);

  console.log(_data);
  const data = _data?.map((archive, index) => ({
    ...archive,
    key: index,
  }));

  function handleClick() {
    setOpen(true);
  }

  function handleFile() {
    setShow(true);
  }

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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

      <Breadcrumb itemRender={itemRender} items={crumbs} />

      <Modal
        title={wholerecord?.type === "Folder" ? "Edit Folder" : "Edit File"}
        // name="Edit Folder"
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
            {wholerecord?.type === "Folder" && (
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
            )}
            {wholerecord.type === "File" && (
              <>
                <Form.Item
                  name="fileName"
                  label="File Name"
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
                      message: "Please input a reference for your file!",
                    },
                  ]}
                >
                  <Input placeholder="Reference" allowClear />
                </Form.Item>
              </>
            )}
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
