import React, { useState } from 'react';
import { Modal, Input, Select, Button, List, Tag, Empty, Spin, message, Tooltip, notification } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  searchDocumentsForLinking, 
  createDocumentLink,
  LINK_TYPE_OPTIONS,
  LINK_TYPE_COLORS 
} from '../../http/documentLinks';
import { LuLink, LuSearch } from 'react-icons/lu';
import dayjs from 'dayjs';

const { Search } = Input;

const LinkDocumentModal = ({ open, onClose, documentId, documentSubject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [linkType, setLinkType] = useState('Reference');
  const [description, setDescription] = useState('');
  
  const queryClient = useQueryClient();

  // Search for documents
  const { data: searchResults, isLoading: isSearching, refetch } = useQuery({
    queryKey: ['documentSearch', documentId, searchTerm],
    queryFn: () => searchDocumentsForLinking(documentId, searchTerm),
    enabled: searchTerm.length >= 2,
  });

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: () => createDocumentLink(documentId, selectedDoc.docID, linkType, description || null),
    onSuccess: (data) => {
      notification.success({
        message: 'Link Created Successfully',
        description: 'The documents have been linked together successfully!',
      });
      queryClient.invalidateQueries(['documentLinks', documentId]);
      handleClose();
    },
    onError: (error) => {
      notification.error({
        message: 'Failed to Link Document',
        description: error.response?.data?.error || 'An error occurred while linking the documents.',
      });
    },
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleSelectDocument = (doc) => {
    setSelectedDoc(doc);
  };

  const handleCreateLink = () => {
    if (!selectedDoc) {
      message.warning('Please select a document to link');
      return;
    }
    createLinkMutation.mutate();
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedDoc(null);
    setLinkType('Reference');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <LuLink className="text-[#582F08]" />
          <span>Link Document</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
    >
      <div className="space-y-4">
        {/* Current Document */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Linking from:</p>
          <p className="font-medium text-gray-800">{documentSubject}</p>
        </div>

        {/* Search Section */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Search for a document to link
          </label>
          <Search
            placeholder="Search by subject or reference..."
            allowClear
            enterButton={<LuSearch />}
            size="large"
            onSearch={handleSearch}
            loading={isSearching}
          />
        </div>

        {/* Search Results */}
        {searchTerm.length >= 2 && (
          <div className="border rounded-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="flex justify-center items-center p-8">
                <Spin />
              </div>
            ) : searchResults?.documents?.length > 0 ? (
              <List
                dataSource={searchResults.documents}
                renderItem={(doc) => (
                  <List.Item
                    key={doc.docID}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedDoc?.docID === doc.docID ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                    }`}
                    onClick={() => handleSelectDocument(doc)}
                  >
                    <div className="px-4 py-2 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{doc.subject}</p>
                          <p className="text-sm text-gray-500 font-mono">{doc.ref}</p>
                        </div>
                        <div className="text-right">
                          <Tag color="blue">{doc.documentType}</Tag>
                          <p className="text-xs text-gray-400 mt-1">
                            {dayjs(doc.createdAt).format('MMM D, YYYY')}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">By: {doc.user?.name}</p>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No documents found" 
                className="py-8"
              />
            )}
          </div>
        )}

        {/* Selected Document */}
        {selectedDoc && (
          <div className="border-2 border-orange-200 bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Selected document:</p>
            <p className="font-medium text-gray-800">{selectedDoc.subject}</p>
            <p className="text-sm text-gray-500 font-mono">{selectedDoc.ref}</p>
          </div>
        )}

        {/* Link Type Selection */}
        {selectedDoc && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Link Type
              </label>
              <Select
                value={linkType}
                onChange={setLinkType}
                className="w-full"
                size="large"
                options={LINK_TYPE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: (
                    <div className="flex items-center gap-2">
                      <Tag color={LINK_TYPE_COLORS[opt.value]}>{opt.label}</Tag>
                      <span className="text-gray-500 text-sm">{opt.description}</span>
                    </div>
                  ),
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Description (Optional)
              </label>
              <Input.TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note about this link..."
                rows={2}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleCreateLink}
            disabled={!selectedDoc}
            loading={createLinkMutation.isLoading}
            className="bg-[#582F08]"
          >
            Link Document
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LinkDocumentModal;
