import React, { useState } from 'react';
import { Modal, Input, Button, Typography, Alert, Space, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';

const { Text, Title } = Typography;

const OTPVerificationModal = ({
  visible,
  onCancel,
  onSuccess,
  documentSubject,
  isLoading = false,
}) => {
  const [otpToken, setOtpToken] = useState('');

  // Verify OTP token
  const { mutate: verifyOTP, isPending: isVerifying } = useMutation({
    mutationFn: (token) => axiosInstance.post('/otp/verify', { token }),
    onSuccess: (response) => {
      if (response.data.data.isValid) {
        onSuccess(otpToken);
        setOtpToken('');
      } else {
        // Show backend error message if available, else fallback
        const backendMsg = response.data?.error || response.data?.message || 'Invalid OTP token';
        message.error(backendMsg);
      }
    },
    onError: (error) => {
      console.error('OTP verification failed:', error);
      // Show backend error message if available, else fallback
      const backendMsg = error.response?.data?.error || error.response?.data?.message || 'Invalid OTP token';
      message.error(backendMsg);
    },
  });

  const handleVerify = () => {
    if (!otpToken || otpToken.length !== 6) {
      message.error('Please enter a valid 6-digit OTP token');
      return;
    }
    verifyOTP(otpToken);
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
    >
      <div className="space-y-4">
        <Alert
          message="Security Verification"
          description={`To approve the document "${documentSubject}", please enter the 6-digit code from your authenticator app.`}
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
          />
        </div>

        <Space direction="vertical" className="w-full">
          <Button
            type="primary"
            onClick={handleVerify}
            loading={isVerifying || isLoading}
            disabled={otpToken.length !== 6}
            className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80"
            block
            size="large"
          >
            Verify & Approve Document
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

export default OTPVerificationModal;
