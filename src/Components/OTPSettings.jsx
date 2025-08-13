import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Input,
  message,
  Typography,
  Space,
  Alert,
  Spin,
  QRCode,
} from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';

const { Title, Text } = Typography;

const OTPSettings = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Fetch OTP status
  const {
    data: otpStatus,
    refetch: refetchOTPStatus,
    isLoading,
  } = useQuery({
    queryKey: ['otpStatus'],
    queryFn: () => axiosInstance.get('/otp/status'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Generate OTP secret
  const { mutate: generateSecret, isPending: isGenerating } = useMutation({
    mutationFn: () => axiosInstance.post('/otp/generate-secret'),
    onSuccess: (response) => {
      setQrCodeUrl(response.data.data.qrCodeUrl);
      setShowQRModal(true);
      message.success('OTP secret generated successfully');
      refetchOTPStatus();
    },
    onError: (error) => {
      message.error(
        error.response?.data?.error || 'Failed to generate OTP secret'
      );
    },
  });

  // Enable OTP
  const { mutate: enableOTP, isPending: isEnabling } = useMutation({
    mutationFn: (token) => axiosInstance.post('/otp/enable', { token }),
    onSuccess: () => {
      message.success('OTP enabled successfully');
      setShowEnableModal(false);
      setOtpToken('');
      refetchOTPStatus();
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to enable OTP');
    },
  });

  // Disable OTP
  const { mutate: disableOTP, isPending: isDisabling } = useMutation({
    mutationFn: () => axiosInstance.post('/otp/disable'),
    onSuccess: () => {
      message.success('OTP disabled successfully');
      refetchOTPStatus();
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to disable OTP');
    },
  });

  const handleGenerateSecret = () => {
    generateSecret();
  };

  const handleEnableOTP = () => {
    if (!otpToken || otpToken.length !== 6) {
      message.error('Please enter a valid 6-digit OTP token');
      return;
    }
    enableOTP(otpToken);
  };

  const handleDisableOTP = () => {
    Modal.confirm({
      title: 'Disable OTP',
      content:
        'Are you sure you want to disable OTP? This will remove the additional security layer.',
      okButtonProps: {
        style: {
          backgroundColor: '#582F08',
          color: 'white',
        },
      },
      onOk: () => disableOTP(),
    });
  };

  const isOTPEnabled = otpStatus?.data?.data?.isEnabled;
  const hasSecret = otpStatus?.data?.data?.hasSecret;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <Title level={3}>Two-Factor Authentication (2FA)</Title>

        <div className="mt-6 space-y-4">
          <Alert
            message="Security Information"
            description="Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need to enter a 6-digit code from Google Authenticator to approve documents."
            type="info"
            showIcon
          />

          {isOTPEnabled ? (
            <div className="space-y-4">
              <Alert
                message="2FA is Enabled"
                description="Your account is protected with two-factor authentication."
                type="success"
                showIcon
              />

              <Button
                type="primary"
                danger
                onClick={handleDisableOTP}
                loading={isDisabling}
                block
              >
                Disable 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {hasSecret ? (
                <div className="space-y-4">
                  <Alert
                    message="2FA Setup Required"
                    description="You have generated a secret but haven't enabled 2FA yet. Please scan the QR code and enter the token to complete setup."
                    type="warning"
                    showIcon
                  />

                  <Space direction="vertical" className="w-full">
                    <Button
                      type="primary"
                      onClick={() => setShowQRModal(true)}
                      className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80"
                      block
                    >
                      Show QR Code
                    </Button>

                    <Button
                      className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80"
                      onClick={() => setShowEnableModal(true)}
                      block
                    >
                      Enable 2FA
                    </Button>
                  </Space>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert
                    message="2FA Not Set Up"
                    description="Two-factor authentication is not set up for your account."
                    type="warning"
                    showIcon
                  />

                  <Button
                    type="primary"
                    className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80"
                    onClick={handleGenerateSecret}
                    loading={isGenerating}
                    block
                  >
                    Set Up 2FA
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* QR Code Modal */}
      <Modal
        title="Scan QR Code"
        open={showQRModal}
        onCancel={() => setShowQRModal(false)}
        footer={null}
        width={400}
      >
        <div className="text-center space-y-4">
          <Text>
            Scan this QR code with Google Authenticator or any other TOTP app:
          </Text>

          {qrCodeUrl && (
            <div className="flex justify-center">
              <QRCode value={qrCodeUrl} size={200} />
            </div>
          )}

          <Text type="secondary" className="block">
            After scanning, click "Enable 2FA" and enter the 6-digit code from
            your app.
          </Text>

          <Button
            type="primary"
            className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80"
            onClick={() => {
              setShowQRModal(false);
              setShowEnableModal(true);
            }}
            block
          >
            Enable 2FA
          </Button>
        </div>
      </Modal>

      {/* Enable OTP Modal */}
      <Modal
        title="Enable Two-Factor Authentication"
        open={showEnableModal}
        onCancel={() => {
          setShowEnableModal(false);
          setOtpToken('');
        }}
        footer={null}
      >
        <div className="space-y-4">
          <Text>
            Enter the 6-digit code from your authenticator app to enable 2FA:
          </Text>

          <Input
            placeholder="Enter 6-digit code"
            value={otpToken}
            onChange={(e) =>
              setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            maxLength={6}
            size="large"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowEnableModal(false);
                setOtpToken('');
              }}
              block
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className=" bg-[#582F08] hover:bg-[#582F08]/80"
              onClick={handleEnableOTP}
              loading={isEnabling}
              disabled={otpToken.length !== 6}
              block
            >
              Enable
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OTPSettings;
