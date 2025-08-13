import React, { useState } from 'react';
import { Modal, Input, Button, Typography, Alert, Space, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';

const { Text } = Typography;

const LoginOTPModal = ({
  visible,
  onCancel,
  onSuccess,
  userEmail,
  userPassword,
  isLoading = false,
}) => {
  const [otpToken, setOtpToken] = useState('');

  // Verify OTP token for login
  const { mutate: verifyLoginOTP, isPending: isVerifying } = useMutation({
    mutationFn: (token) =>
      axiosInstance.post('/login', {
        email: userEmail,
        password: userPassword,
        otpToken: token,
      }),
    onSuccess: (response) => {
      if (response.data.token) {
        onSuccess(response.data);
        setOtpToken('');
      } else {
        message.error('Invalid OTP token');
      }
    },
    onError: (error) => {
      console.error('OTP verification failed:', error);
      message.error(error.response?.data?.error || 'Invalid OTP token');
    },
  });

  const handleVerify = () => {
    if (!otpToken || otpToken.length !== 6) {
      message.error('Please enter a valid 6-digit OTP token');
      return;
    }
    verifyLoginOTP(otpToken);
  };

  const handleCancel = () => {
    setOtpToken('');
    onCancel();
  };

  return (
    <Modal
      title="Two-Factor Authentication Required"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
      centered
      closable={false}
      maskClosable={false}
    >
      <div className="space-y-4">
        <Alert
          message="Security Verification"
          description={`Please enter the 6-digit code from your authenticator app to complete login for ${userEmail}.`}
          type="info"
          showIcon
        />

        <div className="space-y-2">
          <Text strong>Enter 6-digit code:</Text>
          <Input
            placeholder="000000"
            value={otpToken}
            onChange={(e) =>
              setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            maxLength={6}
            size="large"
            style={{
              textAlign: 'center',
              fontSize: '18px',
              letterSpacing: '4px',
            }}
            onPressEnter={handleVerify}
          />
        </div>

        <Space direction="vertical" className="w-full">
          <Button
            type="primary"
            onClick={handleVerify}
            loading={isVerifying || isLoading}
            disabled={otpToken.length !== 6}
            block
            size="large"
            className="bg-[#9D4D01] hover:bg-[#9D4D01]/80"
          >
            Verify & Login
          </Button>

          <Button
            onClick={handleCancel}
            disabled={isVerifying || isLoading}
            block
          >
            Cancel
          </Button>
        </Space>

        <div className="text-center">
          <Text type="secondary" className="text-xs">
            Make sure your authenticator app is synced with the correct time
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default LoginOTPModal;
