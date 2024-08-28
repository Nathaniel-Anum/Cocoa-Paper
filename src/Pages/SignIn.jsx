import { Button, Form, Input, message } from "antd";
import axiosInstance from "../Components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useUser } from "./CustomHook/useUser";
import { useState } from "react";
export const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { setUser, setIsLoading } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    console.log(values);
    setLoading(true);
    await setTimeout(() => {
      setLoading(false);
      form.resetFields();
    }, 0);
    try {
      const res = await axiosInstance.post("/login", values);
      localStorage.setItem("accessToken", res?.data?.token);

      if (res.data) {
        setIsLoading(true);
        const user = await axiosInstance.get("/user");
        setUser(user?.data?.user);
        setIsLoading(false);
      }
      setTimeout(() => {
        navigate("/backoffice/bod");
        message.success("Login successful!");
      }, 0);
    } catch (err) {
      setTimeout(() => {
        message.error(err?.response?.data?.error);
      }, 0);
    }
  };

  // function handleSubmit(values) {
  //   // console.log(values);
  //   axiosInstance
  //     .post("/login", values)
  //     .then((res) => {
  //       console.log(res?.data);

  //       localStorage.setItem("accessToken", res?.data?.token);
  //       navigate("/backoffice/bod");
  //       message.success("Welcome");
  //     })
  //     .catch((err) => message.error(err?.response?.data?.error));
  // }

  return (
    <>
      <div className="flex justify-center py-[12rem]">
        <div className="bg-[#fff] text-[#9D4D01] p-[41px] py-[40px]  shadow-xl">
          <div>
            <p className="text-center font-semibold ">BACKOFFICE </p>
          </div>
          <div>
            <div className="flex items-center py-4">
              <img
                className="w-[70px] h-auto"
                src="../../src/assets/logo.9a18109e1c16584832d5.png"
                alt=""
              />
              <div className="h-[20px] w-[2px] bg-[#9D4D01] mr-2"></div>
              <div>
                <p className="font-bold">Ghana Cocoa Board</p>
                <p className="text-[9px] font-semibold">
                  Poised to Maintain Premium Quality Cocoa
                </p>
              </div>
            </div>
          </div>

          <Form
            form={form}
            onFinish={(values) => handleSubmit(values)}
            className=""
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
              <Input placeholder="Email" allowClear />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <Form.Item>
              <Button
                className="w-full bg-[#9D4D01]"
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Log In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};
