import { Button, Form, Input, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../Components/axiosInstance";
import { useEffect, useState } from "react";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirectLoading, setRedirectLoading] = useState(false); // Loading state for spinner

  // Extracting the token directly from the URL path
  const token = location.pathname.split("/resetPassword/")[1];

  const validatePassword = (_, value) => {
    if (value && value !== form.getFieldValue("password")) {
      return Promise.reject(new Error("The passwords do not match!"));
    }
    return Promise.resolve();
  };

  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    if (!token) {
      message.error("Invalid or missing token.");
      return;
    }

    // Sending token as a Bearer in the Authorization header
    axiosInstance
      .post(
        `/resetPassword/${token}`,
        { password: values.password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res?.data?.message);
        setRedirectLoading(true);
        setTimeout(() => {
          setRedirectLoading(false);
          navigate("/login"); // Redirect to login after successful reset
        }, 2000); // Adjust the delay time as needed
      })
      .catch((err) => {
        message.error(err?.response?.data?.error);
        console.log(err?.response?.data);
      });
  };

  useEffect(() => {
    if (token) {
      console.log("Token detected:", token);
    } else {
      message.error("Token not found. Please check the link.");
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div className="py-[11rem] mx-[28rem]">
      {redirectLoading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Password reset successful. Redirecting to login page.</p>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      ) : (
        <div className="bg-[#fff] flex flex-col gap-6 px-[3rem] py-[28px] shadow-xl">
          <div>
            <p className="text-center font-semibold text-[1.8rem]">
              Reset Password
            </p>
          </div>

          <Form
            form={form}
            onFinish={(values) => handleSubmit(values)}
            layout="vertical"
            name="password_form"
          >
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password!" },
              ]}
              validateTrigger={["onSubmit"]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                { validator: validatePassword },
              ]}
              validateTrigger={["onSubmit"]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
            <Form.Item>
              <Button
                className="w-full bg-[#9D4D01]"
                type="primary"
                htmlType="submit"
              >
                Reset Password
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
      )}
    </div>
  );
};

export default ResetPassword;
