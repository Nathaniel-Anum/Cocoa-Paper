import { Button, Form, Input, message } from 'antd';
import axiosInstance from '../Components/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useUser } from './CustomHook/useUser';
import { useState } from 'react';
import LoginOTPModal from '../Components/LoginOTPModal';
export const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);
  const [form] = Form.useForm();
  const { setUser, setIsLoading } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/login', values);

      // Check if 2FA is required
      if (res.status === 202 && res.data.requiresOTP) {
        setPendingLoginData({ email: values.email, password: values.password });
        setShowOTPModal(true);
        setLoading(false);
        return;
      }

      // Normal login flow
      localStorage.setItem('accessToken', res?.data?.token);

      if (res.data) {
        setIsLoading(true);
        const user = await axiosInstance.get('/user');
        setUser(user?.data?.user);
        setIsLoading(false);
      }

      navigate('/backoffice/bod');
      message.success('Login successful!');
    } catch (err) {
      message.error(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = async (loginData) => {
    try {
      localStorage.setItem('accessToken', loginData.token);

      setIsLoading(true);
      const user = await axiosInstance.get('/user');
      setUser(user?.data?.user);
      setIsLoading(false);

      setShowOTPModal(false);
      setPendingLoginData(null);
      navigate('/backoffice/bod');
      message.success('Login successful!');
    } catch (error) {
      message.error('Failed to complete login');
    }
  };

  const handleOTPCancel = () => {
    setShowOTPModal(false);
    setPendingLoginData(null);
    form.resetFields();
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
                  message: 'Please input your email!',
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
                  message: 'Please input your password!',
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

      <LoginOTPModal
        visible={showOTPModal}
        onCancel={handleOTPCancel}
        onSuccess={handleOTPSuccess}
        userEmail={pendingLoginData?.email || ''}
        userPassword={pendingLoginData?.password || ''}
        isLoading={loading}
      />
    </>
  );
};
