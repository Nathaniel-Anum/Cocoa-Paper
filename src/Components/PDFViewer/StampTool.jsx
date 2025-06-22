import {
  Row,
  Col,
  Card,
  Space,
  Modal,
  Upload,
  Button,
  message,
  Divider,
  Typography,
} from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  PictureOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { useRef, useState } from "react";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const StampTool = ({ visible, position, onClose, onStampAnnotation }) => {
  const imgRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  
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
          message.success("Stamp image uploaded successfully!");
        };
        reader.readAsDataURL(file);
      }, 500);
    }
  };

  const handleInsert = async () => {
    if (!imageUrl) {
      message.error("Please upload a stamp image first.");
      return;
    }

    const annotation = {
      type: "stamp",
      data: {
        dataUrl: imageUrl,
        x: position.x,
        y: position.y,
        width: 150,
        height: 150,
        fileName: fileName,
      },
      pageNumber: position.pageNumber,
    };

    onStampAnnotation(annotation);
    message.success("Stamp inserted successfully!");
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setImageUrl(null);
    setFileName("");
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <PictureOutlined style={{ color: "#1890ff", fontSize: "18px" }} />
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            Insert Digital Stamp
          </Title>
        </div>
      }
      onCancel={handleCancel}
      footer={null}
      centered
      width={520}
      styles={{}}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Upload Section */}
        <Card
          size="small"
          style={{
            background: imageUrl ? "#f6ffed" : "#fafafa",
            border: imageUrl ? "1px solid #b7eb8f" : "1px solid #d9d9d9",
            transition: "all 0.3s ease",
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
                background: "white",
                border: "2px dashed #d9d9d9",
                borderRadius: "8px",
              }}
            >
              <div>
                <InboxOutlined
                  style={{
                    fontSize: "48px",
                    color: uploading ? "#1890ff" : "#bfbfbf",
                    marginBottom: "16px",
                    display: "block",
                  }}
                />
                <Title level={5} style={{ color: "#595959", margin: "8px 0" }}>
                  {uploading
                    ? "Uploading..."
                    : "Click or drag stamp image here"}
                </Title>
                <Text type="secondary">
                  Support only PNG formats • Max size: 2MB
                </Text>
              </div>
            </Dragger>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Space direction="vertical" size="middle">
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Stamp Preview"
                    style={{
                      maxWidth: "120px",
                      maxHeight: "120px",
                      border: "2px solid #52c41a",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <CheckCircleOutlined
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      fontSize: "20px",
                      color: "#52c41a",
                      background: "white",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div>
                  <Text strong style={{ color: "#52c41a", display: "block" }}>
                    <CheckCircleOutlined style={{ marginRight: "4px" }} />
                    Image uploaded successfully
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {fileName}
                  </Text>
                </div>
              </Space>
            </div>
          )}
        </Card>

        {/* Position Info */}
        {position && (
          <Card
            size="small"
            style={{ background: "#f0f5ff", border: "1px solid #d6e4ff" }}
          >
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

        <Divider style={{ margin: "8px 0" }} />

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
                height: "40px",
                background: imageUrl ? "#52c41a" : undefined,
                borderColor: imageUrl ? "#52c41a" : undefined,
              }}
            >
              {imageUrl ? "Insert Stamp" : "Upload Image First"}
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
