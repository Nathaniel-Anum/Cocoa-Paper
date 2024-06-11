import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import { Button, Form, Input, Modal, Upload, message, Cascader } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useUser } from "../../../Pages/CustomHook/useUser";
import { useTrail } from "../../../Pages/CustomHook/useTrail";
import useArchiveTransform from "../../../Pages/CustomHook/useArchiveTransform";

const ArchiveFiles = ({ setShow, show, id, record, sender = null }) => {



  // const { trails } = useTrail("incoming");
  // console.log(trails);

  const { user } = useUser();
  // console.log(user);
  // const options = [
  //   {
  //     value: "zhejiang",
  //     label: "Zhejiang",
  //     children: [
  //       {
  //         value: "hangzhou",
  //         label: "Hanzhou",
  //         children: [
  //           {
  //             value: "xihu",
  //             label: "West Lake",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     value: "jiangsu",
  //     label: "Jiangsu",
  //     children: [
  //       {
  //         value: "nanjing",
  //         label: "Nanjing",
  //         children: [
  //           {
  //             value: "zhonghuamen",
  //             label: "Zhong Hua Men",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  // console.log(user)

  //   console.log(record)

  //UseQuery to fetch all archives/folders
  const { data: archive } = useQuery({
    queryKey: ["archive", id],
    queryFn: () => {
      if (!id) return axiosInstance.get("/archive");

      return axiosInstance.get(`archive/${id}`);
    },
  });

  const archives = id ? archive?.data?.archive : archive?.data?.archives;
  const { _data } = useArchiveTransform(archives, id); //Getting all the archive files (files and folders)
  console.log(_data); //displaying everything in the /archive

  //Filtering and mapping the all archives array
  const folderOptions = _data && _data.filter(item=> item.type === "Folder").map(folder => (
   { value: folder?.folderId,
    label: folder?.folderName,
    children: folder?.children?.map (child => (
      {
        value: child?.folderId,
        label: child?.folderName

      }
    )) }
  ))




  const onChange = (value) => {
    console.log(value);
  };

  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState("");

  //Mutation to change document status
  const { mutate: status } = useMutation({
    mutationKey: "status",
    mutationFn: () => {
      return axiosInstance.patch(`/trail/${record?.docID}`, {
        userId: sender,
        status: "Archived"
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

  const handleClose = () => {
    setShow(false);
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
        <Form.Item
          label="Folder"
          rules={[
            {
              required: true,
              message: "Select a folder",
            },
          ]}
        >
          <Cascader
            options={folderOptions }
            onChange={onChange}
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