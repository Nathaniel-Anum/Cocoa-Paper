import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, message } from "antd";
import React from "react";
import axiosInstance from "../../axiosInstance";

const CreateFolder = ({ setOpen, open, id }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

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

  const handleCancel = () => {
    setOpen(false);
  };

  const handleSubmit = (values) => {
    mutate(values);
    // console.log(values);
    //do my mutation value here
  };

  return (
    <Modal open={open} title="New Folder" onCancel={handleCancel} footer={null}>
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
  );
};

export default CreateFolder;
