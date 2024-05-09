import axios from "axios";
import "./Home.css";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance, { baseURL } from "../Components/axiosInstance";
import { useCookies } from "react-cookie";
import { useState } from "react";
import { useUser } from "./CustomHook/useUser";

const Home = () => {
  const [form] = Form.useForm();

 

  const [loading, setLoading] = useState(false);
  const [cookie, setCookie] = useCookies(["refresh_token"]);
  const { setUser, setIsLoading } = useUser();

  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    console.log(values);
    setLoading(true);
    await setTimeout(() => {
      setLoading(false);
      form.resetFields();
    }, 2500);
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
        // message.success("Login successful!");
        navigate("/dashboard");
      }, 2500);
    } catch (err) {
      setTimeout(() => {
        message.error(err?.response?.data?.error);
      }, 2500);
    }
  };

  return (
    <div className="h-screen relative flex items-center justify-center w-screen gap-[150px] overflow-hidden bg-[#966945]">
      <div className="flex flex-col justify-end h-[82%] gap-[20px]">
        <div className="text-white">
          <p className="text-[49px] font-bold  ">COCOA PAPERS</p>
          <p className="">The Paperless Solution.</p>
        </div>
        <div className="">
          <img
            className="w-[530px] h-auto object-contain "
            src="../../src/assets/login-image.9da40248fe499c8eb28c2a4efe3b916e.svg"
            alt=""
          />
        </div>
      </div>

      <div className="bg-[#fff] text-[#9D4D01] p-[15px] rounded-[10px] py-[40px] ">
        <div>
          <p className="text-center font-semibold">WELCOME TO </p>
        </div>
        <div>
          <div className="flex items-center">
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
        <div>
          <p className="text-[14px] text-center pb-[15px] font-semibold">
            Login to Proceed to your Dashboard
          </p>
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
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="absolute bottom-0 right-0 h-32 w-32">
        <div className="relative">
          <div className="absolute left-0 -top-[380px] w-[38px] h-[610px] bg-[#c3a183] rotate-45"></div>
          <div className="absolute left-0 -top-[280px] w-[38px] h-[610px] bg-[#c3a183] rotate-45"></div>
          <div className="absolute left-0 -top-[180px] w-[38px] h-[610px] bg-[#c3a183] rotate-45"></div>
        </div>
      </div>
      <div className="absolute left-0 h-32 w-32 top-0 ">
        <div className="relative  w-32 h-32">
          <div className="absolute overflow-hidden rounded-full w-[260px] h-[260px] bg-[#c3a183] flex justify-center items-center -top-[80px] -left-[80px]">
            <div className="absolute overflow-hidden rounded-full w-[180px] h-[180px] bg-[#966945]  "></div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;
