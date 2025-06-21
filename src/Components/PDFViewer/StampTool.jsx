import PropTypes from 'prop-types';
import { Modal, Button, Upload, message, Card, Row, Col, Space, Typography, Divider } from 'antd';
import { useRef, useState } from 'react';
import { 
  InboxOutlined, 
  PictureOutlined, 
  CheckCircleOutlined, 
  UploadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const StampTool = ({ visible, position, onClose, onStampAnnotation }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const imgRef = useRef(null);

  const handleUpload = (info) => {
    const file = info.fileList[0]?.originFileObj;
    if (file) {
      setUploading(true);
      setFileName(file.name);
      
      // Simulate upload delay for better UX
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImageUrl(e.target.result);
          setUploading(false);
          message.success('Stamp image uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }, 500);
    }
  };

  const resizeImage = (dataUrl, maxWidth, maxHeight, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to optimized format
      const optimizedDataUrl = canvas.toDataURL('image/webp', quality);
      resolve(optimizedDataUrl);
    };
    
    img.src = dataUrl;
  });
};

  const handleInsert = async () => {
    if (!imageUrl) {
      message.error('Please upload a stamp image first.');
      return;
    }

    // const optimizedImageUrl = await resizeImage(imageUrl, 200, 200, 0.9);
    
    const annotation = {
      type: 'stamp',
      data: {
        dataUrl: imageUrl, // Use the original image URL for the stamp
        x: position.x,
        y: position.y,
        width: 150,
        height: 150,
        fileName: fileName,
      },
      pageNumber: position.pageNumber,
    };
    
    onStampAnnotation(annotation);
    message.success('Stamp inserted successfully!');
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setImageUrl(null);
    setFileName('');
    setUploading(false);
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PictureOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Insert Digital Stamp
          </Title>
        </div>
      }
      onCancel={handleCancel}
      footer={null}
      centered
      width={520}
      styles={{
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Upload Section */}
        <Card 
          size="small" 
          style={{ 
            background: imageUrl ? '#f6ffed' : '#fafafa',
            border: imageUrl ? '1px solid #b7eb8f' : '1px solid #d9d9d9',
            transition: 'all 0.3s ease'
          }}
        >
          {!imageUrl ? (
            <Dragger
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUpload}
              maxCount={1}
              style={{
                background: 'white',
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
              }}
            >
              <div>
                <InboxOutlined 
                  style={{ 
                    fontSize: '48px', 
                    color: uploading ? '#1890ff' : '#bfbfbf',
                    marginBottom: '16px',
                    display: 'block'
                  }} 
                />
                <Title level={5} style={{ color: '#595959', margin: '8px 0' }}>
                  {uploading ? 'Uploading...' : 'Click or drag stamp image here'}
                </Title>
                <Text type="secondary">
                  Support only PNG formats • Max size: 2MB
                </Text>
              </div>
            </Dragger>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Space direction="vertical" size="middle">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Stamp Preview"
                    style={{ 
                      maxWidth: '120px', 
                      maxHeight: '120px', 
                      border: '2px solid #52c41a',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <CheckCircleOutlined 
                    style={{ 
                      position: 'absolute', 
                      top: '-8px', 
                      right: '-8px', 
                      fontSize: '20px', 
                      color: '#52c41a',
                      background: 'white',
                      borderRadius: '50%'
                    }} 
                  />
                </div>
                <div>
                  <Text strong style={{ color: '#52c41a', display: 'block' }}>
                    <CheckCircleOutlined style={{ marginRight: '4px' }} />
                    Image uploaded successfully
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {fileName}
                  </Text>
                </div>
              </Space>
            </div>
          )}
        </Card>

        {/* Position Info */}
        {position && (
          <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #d6e4ff' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary">Position X:</Text>
                <br />
                <Text strong>{Math.round(position.x)}px</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Position Y:</Text>
                <br />
                <Text strong>{Math.round(position.y)}px</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Page:</Text>
                <br />
                <Text strong>{position.pageNumber}</Text>
              </Col>
            </Row>
          </Card>
        )}

        <Divider style={{ margin: '8px 0' }} />

        {/* Action Buttons */}
        <Row gutter={12}>
          <Col span={24}>
            <Button
              type="primary"
              block
              onClick={handleInsert}
              disabled={!imageUrl}
              loading={uploading}
              className="!bg-[#582F08] hover:bg-[#582F08]/80"
              icon={imageUrl ? <CheckCircleOutlined /> : <UploadOutlined />}
              style={{ 
                height: '40px',
                background: imageUrl ? '#52c41a' : undefined,
                borderColor: imageUrl ? '#52c41a' : undefined
              }}
            >
              {imageUrl ? 'Insert Stamp' : 'Upload Image First'}
            </Button>
          </Col>
        </Row>
      </Space>
    </Modal>
  );
};

StampTool.propTypes = {
  visible: PropTypes.bool.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    pageNumber: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onStampAnnotation: PropTypes.func.isRequired,
};

export default StampTool;