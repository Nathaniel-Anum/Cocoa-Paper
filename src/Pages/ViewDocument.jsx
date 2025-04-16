import React, { useState } from 'react';
import {
  Button,
  Form,
  Select,
  Input,
  Card,
  Layout,
  Typography,
  Avatar,
  Statistic,
  Row,
  Col,
  Mentions,
} from 'antd';

import pdf from '../assets/pdf.svg';

import {
  LuArchive,
  LuDollarSign,
  LuFileText,
  LuMessageSquare,
  LuSend,
  LuUser,
} from 'react-icons/lu';
import { useGetAllUsers } from '../queryHooks/user';
import useStore from '../store/store';
import { FaHandshake } from 'react-icons/fa';

const { TextArea } = Input;
const { Content } = Layout;
const { Title } = Typography;

function ViewDocument() {
  const chosenRecord = useStore((state) => state.chosenRecord);

  console.log({ chosenRecord });

  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'John Doe',
      text: 'This is a received comment.',
      timestamp: '2025-04-14 10:00 AM',
      type: 'received',
    },
    {
      id: 2,
      author: 'You',
      text: 'This is a sent comment.',
      timestamp: '2025-04-14 10:05 AM',
      type: 'sent',
    },
  ]);

  const [newComment, setNewComment] = useState('');

  const { data: users } = useGetAllUsers();

  // console.log(users && users?.data?.users);

  const handleSubmit = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: comments.length + 1,
        author: 'You',
        text: newComment,
        timestamp: new Date().toLocaleString(),
        type: 'sent',
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  return (
    <div className="">
      <Content className="p-4 h-full">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Document Preview Section */}
          <Card
            bordered={false}
            className="flex flex-col h-full"
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}
          >
            <h1 level={4} className="font-semibold text-xl mb-4 flex-shrink-0">
              Document Preview
            </h1>
            <div className="flex-1 overflow-hidden rounded-lg mb-4 bg-white flex items-center justify-center">
              <div className="text-center">
                {/* <LuFileText className="w-48 h-48 text-[#582F08] mx-auto cursor-zoom-in" /> */}
                <img
                  src={pdf}
                  alt="PDF placeholder"
                  className="w-48 h-48 mx-auto cursor-zoom-in"
                />
                <p className="mt-4 text-gray-600 font-medium">
                  document-preview.pdf
                </p>
              </div>
            </div>
            <Card
              bordered={false}
              className="bg-[#582F08]/5 flex-shrink-0"
              bodyStyle={{ padding: '16px' }}
            >
              <Row gutter={16} className="mb-4">
                <Col span={12}>
                  <Statistic
                    title="Reference"
                    value={chosenRecord ? chosenRecord?.document?.ref : ''}
                    precision={2}
                    valueStyle={{
                      color: '#582F08',
                      fontWeight: '600',
                      fontSize: '12px',
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Subject"
                    value={chosenRecord ? chosenRecord?.document?.subject : ''}
                    precision={2}
                    valueStyle={{
                      color: '#582F08',
                      fontWeight: '600',
                      fontSize: '12px',
                    }}
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Amount"
                    value={10000}
                    precision={2}
                    prefix={<LuDollarSign className="w-4 h-4" />}
                    valueStyle={{ color: '#582F08', fontWeight: '600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Budget"
                    value={10000}
                    precision={2}
                    prefix={<LuDollarSign className="w-4 h-4" />}
                    valueStyle={{ color: '#582F08', fontWeight: '600' }}
                  />
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                icon={<FaHandshake className="w-4 h-4" />}
                className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80 w-full mt-6"
              >
                Approve
              </Button>
            </Card>
          </Card>

          {/* Comments Section */}
          <Card
            bordered={false}
            className="flex flex-col h-[calc(100vh-10rem)] no-scrollbar"
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}
          >
            <Title
              level={4}
              className="flex items-center gap-2 mb-4 flex-shrink-0"
            >
              <LuMessageSquare className="w-6 h-6" />
              Comments
            </Title>

            <div className="flex-1 bg-[#e4c8ad] rounded-lg p-4 overflow-y-auto mb-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`flex ${
                    comment.type === 'sent' ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      comment.type === 'sent' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar icon={<LuUser className="w-5 h-5" />} />
                    <div
                      className={`rounded-lg p-4 ${
                        comment.type === 'sent'
                          ? 'bg-[#582F08] text-white'
                          : 'bg-[#9d4d01] text-white'
                      }`}
                    >
                      <p className="font-medium text-sm">{comment.author}</p>
                      <p className="mt-1">{comment.text}</p>
                      <p className="text-xs mt-2 opacity-75">
                        {comment.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Form
              onFinish={handleSubmit}
              layout="vertical"
              className="flex-shrink-0"
            >
              <Form.Item label="Forward To" name="recipient" className="mb-2">
                <Select placeholder="Select recipient...">
                  <Select.Option value="john">John Doe</Select.Option>
                  <Select.Option value="jane">Jane Smith</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Comment" name="comment" className="mb-2">
                {/* <TextArea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment..."
                  autoSize={{ minRows: 2, maxRows: 3 }}
                /> */}

                <Mentions
                  style={{ width: '100%' }}
                  value={newComment}
                  autoSize={{ minRows: 2, maxRows: 3 }}
                  onChange={(value) => {
                    console.log(value);
                    setNewComment(value);
                  }}
                  onSelect={(onSelect) => console.log(onSelect)}
                  // defaultValue="@afc163"
                  options={
                    users &&
                    users?.data?.users?.map((user) => ({
                      label: user.name,
                      value: user.name,
                    }))
                  }
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex gap-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<LuSend className="w-4 h-4" />}
                    className="flex-1 bg-[#582F08] hover:bg-[#582F08]/80"
                  >
                    Send
                  </Button>
                  <Button
                    icon={<LuArchive className="w-4 h-4" />}
                    className="flex-1 bg-[#9d4d01] hover:bg-[#9d4d01]/80 text-white"
                  >
                    Archive
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </div>
  );
}

export default ViewDocument;
