import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Components/axiosInstance";
import { useState } from "react";

const ConfirmEmail = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); //loading state for button

  function handleSubmit(values) {
    console.log(values);
    setLoading(true);
    axiosInstance
      .post("/forgotPassword", values)
      .then((res) => {
        message.success(res?.data?.msg);
        setLoading(false);
      })
      .catch((err) => {
        message.error(err?.response?.data?.error);
        setLoading(false);
      });
  }
  return (
    <>
      <div className=" py-[11rem] mx-[28rem]">
        <div className="bg-[#fff] flex flex-col gap-6 px-[3rem] py-[28px] shadow-xl">
          <div>
            <p className="text-center font-semibold text-[1.8rem] ">
              Confirm Email{" "}
            </p>
          </div>
          <p className="text-[18px]">
            Forgot your account’s password or having trouble logging into your
            account? Enter your email address and we’ll send you a recovery
            link.
          </p>
          <Form
            form={form}
            onFinish={(values) => handleSubmit(values)}
            name="login"
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input placeholder="Input your email" allowClear />
            </Form.Item>

            <Form.Item>
              <Button
                className="w-full bg-[#9D4D01]"
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>
          <button
            className="font-semibold underline"
            onClick={() => navigate("/login")}
          >
            Back to login
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmEmail;
