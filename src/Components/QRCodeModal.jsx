import React from 'react';
import { Modal, Typography, Alert, Button } from 'antd';
import { QRCode } from 'antd';

const { Text } = Typography;

const QRCodeModal = ({
  visible,
  onCancel,
  qrCodeUrl,
  staffName,
  onScanComplete,
}) => (
  <Modal
    title="2FA Setup QR Code"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={400}
    centered
  >
    <div className="space-y-4">
      <Alert
        message="2FA Setup Required"
        description={`2FA has been enabled for ${staffName}. Scan this QR code to complete setup.`}
        type="info"
        showIcon
      />
      {qrCodeUrl && (
        <div className="text-center">
          <Text strong className="block mb-4">
            Scan this QR code with Google Authenticator:
          </Text>
          <div className="flex justify-center mb-4">
            <QRCode value={qrCodeUrl} size={200} />
          </div>
          <Button
            type="button"
            className="bg-[#582f08] text-white"
            style={{ marginTop: 16 }}
            onClick={onScanComplete}
          >
            <span>Scan Complete</span>
            <span>Verify</span>
          </Button>
        </div>
      )}
      <div className="text-center">
        <Text type="secondary" className="text-xs">
          You must scan this QR code with your authenticator app to complete 2FA
          setup.
        </Text>
      </div>
    </div>
  </Modal>
);

export default QRCodeModal;
