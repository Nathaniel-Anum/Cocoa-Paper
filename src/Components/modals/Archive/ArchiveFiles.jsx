import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import { Button, Form, Input, Modal, Upload, message, Cascader } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useUser } from "../../../Pages/CustomHook/useUser";
import { useTrail } from "../../../Pages/CustomHook/useTrail";
import useArchiveTransform from "../../../Pages/CustomHook/useArchiveTransform";
import { getArchive, getArchiveByFolderId } from "../../../http/archive";

const ArchiveFiles = ({ setShow, show, record, sender = null }) => {
  const { user } = useUser();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [options, setOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  //Mutation to change document status
  const { mutate: status } = useMutation({
    mutationKey: "status",
    mutationFn: () => {
      return axiosInstance.patch(`/trail/${record?.docID}`, {
        userId: sender,
        status: "Archived",
      });
    },
    onSuccess: () => {
      setShow(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["trail"] });
    },
    onError: (error) => {
      setOpen(false);
      message.error(error);
    },
  });

  //Mutation to upload file
  const { mutate: uploadFile } = useMutation({
    mutationKey: "fileUpload",
    mutationFn: (values) => {
      console.log(values);
      return axiosInstance.post("/upload", values);
    },
    onSuccess: () => {
      setShow(false);
      form.resetFields();
      message.success("file uploaded successfully!");
      status("status");
      queryClient.invalidateQueries({ mutationKey: "folder" });
    },
    onError: (error) => {
      setOpen(false);
      message.error(error);
    },
  });

  function transformData(data) {
    return (
      data &&
      data
        .filter((item) => item.type === "Folder")
        .map((folder) => ({
          value: folder?.folderId,
          label: folder?.folderName,
          isLeaf: false,
          children: [],
        }))
    );
  }

  const loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];

    getArchiveByFolderId(targetOption.value).then((data) => {
      targetOption.children = transformData(data);
      setOptions([...options]);
    });
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleUpload = (values) => {
    if (selectedFile) {
      const folderId = values?.folderId
        ? values?.folderId[values.folderId.length - 1]
        : "undefined";
      console.log(values, typeof folderId);

      let formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("ref", values.ref);
      formData.append("subject", values.subject);
      formData.append("folderId", folderId);

      console.log(formData);
      uploadFile(formData);
    }
  };

  //fetching initial archive folders
  useEffect(() => {
    function getInitialArchiveFolders() {
      getArchive().then((data) => {
        console.log(data);
        const folderOptions = transformData(data);
        setOptions(folderOptions);
      });
    }
    getInitialArchiveFolders();
  }, []);

  return (
    <Modal open={show} title="Upload File" footer={null} onCancel={handleClose}>
      <Form
        name="Upload File"
        onFinish={(values) => handleUpload(values)}
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="subject"
          initialValue={record?.subject}
          label="Subject"
          rules={[
            {
              required: true,
              message: "Please input a subject for your file!",
            },
          ]}
        >
          <Input placeholder="Subject" allowClear disabled />
        </Form.Item>
        <Form.Item
          name="ref"
          initialValue={record?.ref}
          label="Reference"
          rules={[
            {
              required: true,
              message: "Please enter a reference for your file!",
            },
          ]}
        >
          <Input placeholder="Reference" allowClear disabled />
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
        <Form.Item name="folderId" label="Folder">
          <Cascader
            label="Folder"
            options={options}
            loadData={loadData}
            changeOnSelect
          />
        </Form.Item>
        <Form.Item>
          <Button
            className="w-full bg-[#9D4D01]"
            type="primary"
            htmlType="submit"
          >
            Archive
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ArchiveFiles;
