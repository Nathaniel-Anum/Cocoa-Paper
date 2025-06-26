import {
  Row,
  Col,
  Card,
  Space,
  Modal,
  Button,
  message,
  Divider,
  Typography,
  Spin,
  Badge,
} from "antd";
import {
  PictureOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import axiosInstance, { baseURL } from "../axiosInstance";
import { useUser } from "../../Pages/CustomHook/useUser";

const { Title, Text } = Typography;


async function imageUrlToBase64(imageUrl) {
  try {
    const response = await axiosInstance.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });
    
    const contentType = response.headers['content-type'] || 'image/png';
    
    const base64String = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );
    
    return `data:${contentType};base64,${base64String}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to load image. Please try again.');
  }
}

const StampTool = ({ visible, position, onClose, onStampAnnotation }) => {
  const imgRef = useRef(null);
  const { user } = useUser();
  const [stamps, setStamps] = useState([]);
  const [base64, setBase64] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [loadingStamps, setLoadingStamps] = useState(false);
  const [convertingImage, setConvertingImage] = useState(false);

  useEffect(() => {
    if (visible && user?.userId) {
      setLoadingStamps(true);
      axiosInstance
        .get(`/stamp?userId=${user.userId}`)
        .then((res) => {
          setStamps(res.data || []);
        })
        .catch((error) => {
          console.error('Error loading stamps:', error);
          setStamps([]);
          message.error('Failed to load stamps');
        })
        .finally(() => setLoadingStamps(false));
    }
  }, [visible, user]);

  // Enhanced image conversion with loading states
  useEffect(() => {
    if (imageUrl) {
      setConvertingImage(true);
      setImageError(null);
      
      imageUrlToBase64(imageUrl)
        .then((b64) => {
          setBase64(b64);
          setImageError(null);
        })
        .catch((error) => {
          console.error('Base64 conversion error:', error);
          setImageError(error.message);
          setBase64(null);
          message.error(error.message);
        })
        .finally(() => {
          setConvertingImage(false);
        });
    } else {
      setBase64(null);
      setImageError(null);
    }
  }, [imageUrl]);

  const handleSelectStamp = (stamp) => {
    setSelectedStamp(stamp);
    setImageUrl(`${baseURL}/uploads/${stamp.stamp.uniqueName}`);
    setFileName(stamp.name);
  };

  const handleInsert = async () => {
    if (!base64) {
      message.error("Please select a stamp image first.");
      return;
    }
    
    try {
      const annotation = {
        type: "stamp",
        data: {
          dataUrl: base64,
          x: position.x,
          y: position.y,
          width: 150,
          height: 150,
          fileName: fileName,
        },
        pageNumber: position.pageNumber,
      };
      
      await onStampAnnotation(annotation);
      message.success("Stamp inserted successfully!");
      handleReset();
      onClose();
    } catch (error) {
      console.error('Error inserting stamp:', error);
      message.error("Failed to insert stamp. Please try again.");
    }
  };

  const handleReset = () => {
    setFileName("");
    setBase64(null);
    setImageUrl(null);
    setImageError(null);
    setSelectedStamp(null);
    setConvertingImage(false);
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          padding: "8px 0"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}>
            <PictureOutlined style={{ fontSize: "20px" }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
              Digital Stamp Tool
            </Title>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Select and insert your digital stamps
            </Text>
          </div>
        </div>
      }
      onCancel={handleCancel}
      footer={null}
      centered
      width={600}
      styles={{
        body: { padding: "24px" },
        header: { 
          borderBottom: "1px solid #f0f0f0",
          marginBottom: "0"
        }
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Stamp Selection Section */}
        <Card
          size="small"
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            // boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ 
              marginBottom: "4px", 
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <FileImageOutlined style={{ color: "#6366f1" }} />
              Available Stamps
              {stamps.length > 0 && (
                <Badge 
                  count={stamps.length} 
                  style={{ backgroundColor: "#6366f1" }}
                />
              )}
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Click on a stamp to select it for insertion
            </Text>
          </div>
          
          {loadingStamps ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px 20px",
              color: "#6b7280"
            }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              <div style={{ marginTop: "12px" }}>Loading your stamps...</div>
            </div>
          ) : stamps.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px 20px",
              background: "#fef3c7",
              borderRadius: "12px",
              border: "1px solid #fcd34d"
            }}>
              <PictureOutlined style={{ fontSize: "32px", color: "#d97706", marginBottom: "8px" }} />
              <Text style={{ color: "#92400e", display: "block" }}>
                No stamps available
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Contact your administrator to add digital stamps
              </Text>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", 
              gap: "16px",
              padding: "8px"
            }}>
              {stamps.map((stamp) => {
                const isSelected = selectedStamp?.id === stamp.id;
                return (
                  <div
                    key={stamp.id}
                    style={{
                      border: isSelected
                        ? "3px solid #10b981"
                        : "2px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      background: isSelected 
                        ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" 
                        : "#ffffff",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      boxShadow: isSelected 
                        ? "0 8px 25px -5px rgba(16, 185, 129, 0.3)" 
                        : "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                      transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                    }}
                    onClick={() => handleSelectStamp(stamp)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 4px 8px -2px rgba(0, 0, 0, 0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 4px -1px rgba(0, 0, 0, 0.1)";
                      }
                    }}
                  >
                    {isSelected && (
                      <CheckCircleOutlined
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          fontSize: "20px",
                          color: "#10b981",
                          background: "white",
                          borderRadius: "50%",
                          zIndex: 1,
                        }}
                      />
                    )}
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={`${baseURL}/uploads/${stamp.stamp.uniqueName}`}
                        alt={stamp.name}
                        style={{ 
                          width: "60px", 
                          height: "60px", 
                          objectFit: "contain",
                          borderRadius: "8px"
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{
                        display: 'none',
                        width: "60px", 
                        height: "60px",
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f3f4f6',
                        borderRadius: "8px",
                        color: '#9ca3af'
                      }}>
                        <PictureOutlined />
                      </div>
                      <div style={{ 
                        fontSize: "11px", 
                        marginTop: "8px",
                        fontWeight: isSelected ? "600" : "400",
                        color: isSelected ? "#047857" : "#374151",
                        lineHeight: "1.3"
                      }}>
                        {stamp.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Preview Section */}
        {imageUrl && (
          <Card
            size="small"
            style={{
              background: convertingImage 
                ? "linear-gradient(135deg, #fef7cd 0%, #fef3c7 100%)"
                : imageError
                ? "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"
                : "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
              border: convertingImage 
                ? "1px solid #fcd34d"
                : imageError
                ? "1px solid #f87171"
                : "1px solid #10b981",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Space direction="vertical" size="middle">
                <div style={{ position: "relative", display: "inline-block" }}>
                  {convertingImage ? (
                    <div style={{
                      width: "120px",
                      height: "120px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#ffffff",
                      borderRadius: "8px",
                      border: "2px solid #fbbf24"
                    }}>
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: "#d97706" }} spin />} />
                    </div>
                  ) : imageError ? (
                    <div style={{
                      width: "120px",
                      height: "120px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      background: "#ffffff",
                      borderRadius: "12px",
                      border: "2px solid #f87171",
                      gap: "8px"
                    }}>
                      <PictureOutlined style={{ fontSize: "32px", color: "#dc2626" }} />
                      <Text style={{ fontSize: "10px", color: "#dc2626" }}>Failed to load</Text>
                    </div>
                  ) : (
                    <>
                      <img
                        ref={imgRef}
                        src={imageUrl}
                        alt="Stamp Preview"
                        style={{
                          maxWidth: "120px",
                          maxHeight: "120px",
                          border: "3px solid #10b981",
                          borderRadius: "12px",
                          boxShadow: "0 8px 25px -5px rgba(16, 185, 129, 0.3)",
                        }}
                      />
                      <CheckCircleOutlined
                        style={{
                          position: "absolute",
                          top: "-12px",
                          right: "-12px",
                          fontSize: "24px",
                          color: "#10b981",
                          background: "white",
                          borderRadius: "50%",
                          padding: "2px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      />
                    </>
                  )}
                </div>
                <div>
                  <Text strong style={{ 
                    color: convertingImage ? "#d97706" : imageError ? "#dc2626" : "#047857", 
                    display: "block",
                    fontSize: "14px"
                  }}>
                    {convertingImage && (
                      <>
                        <LoadingOutlined style={{ marginRight: "8px" }} />
                        Processing image...
                      </>
                    )}
                    {imageError && (
                      <>
                        <PictureOutlined style={{ marginRight: "8px" }} />
                        Error loading image
                      </>
                    )}
                    {!convertingImage && !imageError && (
                      <>
                        <CheckCircleOutlined style={{ marginRight: "8px" }} />
                        Ready for insertion
                      </>
                    )}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {fileName}
                  </Text>
                </div>
              </Space>
            </div>
          </Card>
        )}

        {/* Position Info */}
        {position && (
          <Card
            size="small"
            style={{ 
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", 
              border: "1px solid #3b82f6",
              borderRadius: "12px",
              boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Row gutter={16} align="middle">
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Position X
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: "16px", color: "#1e40af" }}>
                    {Math.round(position.x)}px
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Position Y
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: "16px", color: "#1e40af" }}>
                    {Math.round(position.y)}px
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Page
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: "16px", color: "#1e40af" }}>
                    {position.pageNumber}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        <Divider style={{ margin: "16px 0", background: "#e5e7eb" }} />

        <Row gutter={12}>
          <Col span={24}>
            <Button
              type="primary"
              block
              onClick={handleInsert}
              disabled={!base64 || convertingImage}
              loading={convertingImage}
              icon={base64 && !convertingImage ? <CheckCircleOutlined /> : null}
              style={{
                height: "48px",
                fontSize: "16px",
                fontWeight: "600",
                background: base64 && !convertingImage 
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                  : undefined,
                borderColor: base64 && !convertingImage 
                  ? "#10b981" 
                  : undefined,
                boxShadow: base64 && !convertingImage 
                  ? "0 4px 12px rgba(16, 185, 129, 0.4)" 
                  : undefined,
              }}
              className="!bg-[#9D4D01]"
            >
              {convertingImage 
                ? "Processing Image..." 
                : base64 
                  ? "Insert Stamp" 
                  : "Select a Stamp First"
              }
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