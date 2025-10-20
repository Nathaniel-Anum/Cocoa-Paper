import axios from 'axios';
import './Home.css';
import { Button, Form, Input, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance, { baseURL } from '../Components/axiosInstance';
import { useCookies } from 'react-cookie';
import { useState } from 'react';
import QRCodeModal from '../Components/QRCodeModal';
import { useUser } from './CustomHook/useUser';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import LoginOTPModal from '../Components/LoginOTPModal';

const Home = () => {
  // New state for scanComplete
  const [scanComplete, setScanComplete] = useState(false);
  const [form] = Form.useForm();

  const location = useLocation();

  // console.log(location.state);

  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { setUser, setIsLoading } = useUser();
  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);

  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/login', values);

      // Case 1: User hasn't scanned QR code yet (2FA setup initiated but not scanned)
      if (
        res.data.qrCodeUrl &&
        res.data.scanComplete === false &&
        res.data.isEnabled === false
      ) {
        setQrCodeUrl(res.data.qrCodeUrl);
        setShowQRModal(true);
        setScanComplete(false);
        setLoading(false);
        setPendingLoginData({ email: values.email, password: values.password });
        return;
      }

      // Case 2: User has scanned QR but hasn't completed first-time verification (2FA setup in progress)
      if (
        res.data.scanComplete === true &&
        res.data.isEnabled === false &&
        res.data.requiresOTP === true
      ) {
        setPendingLoginData({ email: values.email, password: values.password });
        setShowOTPModal(true);
        setLoading(false);
        return;
      }

      // Case 3: 2FA is fully enabled - user must verify OTP
      if (
        res.data.isEnabled === true &&
        res.data.scanComplete === true &&
        res.data.requiresOTP === true
      ) {
        setPendingLoginData({ email: values.email, password: values.password });
        setShowOTPModal(true);
        setLoading(false);
        return;
      }

      // Case 4: Normal login flow (no 2FA or OTP already verified)
      if (res.data.token) {
        localStorage.setItem('accessToken', res?.data?.token);
        localStorage.setItem('refreshToken', res?.data?.refreshToken);

        setIsLoading(true);
        const user = await axiosInstance.get('/user');
        setUser(user?.data?.user);
        setIsLoading(false);

        navigate('/');
      }
    } catch (err) {
      message.error(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = async (loginData) => {
    try {
      localStorage.setItem('accessToken', loginData.token);
      localStorage.setItem('refreshToken', loginData.refreshToken);

      setIsLoading(true);
      const user = await axiosInstance.get('/user');
      setUser(user?.data?.user);
      setIsLoading(false);

      setShowOTPModal(false);
      setPendingLoginData(null);
      navigate('/');
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
            src="/asset/login-image.9da40248fe499c8eb28c2a4efe3b916e.svg"
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
              src="/asset/logo.9a18109e1c16584832d5.png"
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
              Login
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center">
          <button
            className="font-semibold"
            onClick={() => navigate('/confirm-email')}
          >
            Forgot Password?
          </button>
        </div>
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

      <LoginOTPModal
        visible={showOTPModal}
        onCancel={handleOTPCancel}
        onSuccess={handleOTPSuccess}
        userEmail={pendingLoginData?.email || ''}
        userPassword={pendingLoginData?.password || ''}
        isLoading={loading}
      />
      <QRCodeModal
        visible={showQRModal}
        onCancel={() => setShowQRModal(false)}
        qrCodeUrl={qrCodeUrl}
        staffName={pendingLoginData?.email || ''}
        onScanComplete={async () => {
          // Call backend to set scanComplete
          try {
            await axiosInstance.post('/otp/scan-complete', {
              email: pendingLoginData?.email,
            });
            setShowQRModal(false);
            setScanComplete(true);
            setShowOTPModal(true);
          } catch (err) {
            message.error('Failed to mark scan as complete');
          }
        }}
      />
    </div>
  );
};

export default Home;
