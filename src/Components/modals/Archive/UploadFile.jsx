import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import axiosInstance from "../../axiosInstance";
import { Button, Form, Input, Modal, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const UploadFile = ({ setShow, show, id }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState("");

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
  );
};

export default UploadFile;
