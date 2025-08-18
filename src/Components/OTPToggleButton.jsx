import React from 'react';
import { Switch, Modal, message } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';

const OTPToggleButton = ({ staffUserId, staffName }) => {
  // Get OTP status for the staff member
  const { data: otpStatus, refetch: refetchOTPStatus } = useQuery({
    queryKey: ['staffOTPStatus', staffUserId],
    queryFn: () => axiosInstance.get(`/otp/admin/status/${staffUserId}`),
    enabled: !!staffUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle 2FA mutation (no QR modal logic)
  const { mutate: toggleOTP, isPending: isToggling } = useMutation({
    mutationFn: ({ action }) =>
      axiosInstance.patch(`/otp/admin/toggle/${staffUserId}`, { action }),
    onSuccess: (response) => {
      message.success(response.data.message);
      refetchOTPStatus();
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Failed to toggle 2FA');
    },
  });

  const handleToggle = (checked) => {
    const action = checked ? 'enable' : 'disable';

    if (action === 'disable') {
      Modal.confirm({
        title: 'Disable 2FA',
        content: `Are you sure you want to disable 2FA for ${staffName}? This will remove the additional security layer.`,
        onOk: () => toggleOTP({ action }),
        okText: <span style={{ color: '#fff' }}>Disable</span>,
        cancelText: 'Cancel',
        okButtonProps: {
          style: {
            backgroundColor: '#582f08',
            borderColor: '#582f08',
            color: '#fff',
          },
        },
      });
    } else {
      toggleOTP({ action });
    }
  };

  const isOTPEnabled = otpStatus?.data?.data?.isEnabled;

  return (
    <Switch
      checked={isOTPEnabled}
      onChange={handleToggle}
      loading={isToggling}
      checkedChildren="2FA ON"
      unCheckedChildren="2FA OFF"
      size="small"
    />
  );
};

export default OTPToggleButton;


