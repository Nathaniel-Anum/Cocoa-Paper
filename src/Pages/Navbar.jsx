import { DownOutlined, LoadingOutlined, BellOutlined, CheckOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { Dropdown, Space, Modal, Button, Steps, Badge, Popover, List, Empty, DatePicker, Form, message, Tabs } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from './CustomHook/useUser';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../Components/axiosInstance';
import _ from 'lodash';
import useDebounce from './CustomHook/use-debounce';
import { useNavigate } from 'react-router-dom';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import useOutsideClick from './CustomHook/useOutsideClick';
import { getAllRolePermissions, hasPermission, requiredPermissions } from '../../utils/Roles';
import { useGetAccessRequests, useGrantAccess, useDenyAccess, useRequestAccess } from './CustomHook/useAccessRequests';
import useStore from '../store/store';

const Navbar = () => {
  //Searching files components
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false); // New: State to track loading
  const [trailId, setTrailId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileModalVisible, setFileModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);

  // Define the callback to close the dropdown
  const handleCloseDropdown = () => {
    setIsOpen(false);
  };
  const dropdownRef = useOutsideClick(handleCloseDropdown);

  const LOADING_DELAY = 12000;
  const { user, setUser } = useUser();
  // console.log(user);
  const navigate = useNavigate();

  const term = useDebounce(searchTerm, 500);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (term) {
      // console.log(term);
      handleInputChange(term);
    } else {
      setResults([]);
    }
  }, [term]);

  // Automatically open the dropdown when searchTerm and results are present
  useEffect(() => {
    if (searchTerm && results) {
      setIsOpen(true);
    }
  }, [searchTerm, results]);

  // Handle search input change
  const handleInputChange = (searchTerm) => {
    if (searchTerm.trim() !== '') {
      setResults([]);
      setLoading(true); // Start loading animation

      const loadTimeout = setTimeout(() => {
        // This sets a minimum time for the loader
        setLoading(false);
      }, LOADING_DELAY);

      axiosInstance
        .get(`/search`, {
          params: { searchTerm },
        })
        .then((res) => {
          console.log('Search response:', res?.data);
          setResults(res?.data);
        })
        .catch((err) => {
          console.error(err?.response?.data?.error);
          setResults([]); // Clear results on error
        })
        .finally(() => {
          clearTimeout(loadTimeout);
          setLoading(false); // Stop loading animation
        });
    }
  };

  const currentDate = new Date();
  // console.log(currentDate);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Access requests hooks
  const { data: accessRequests, isLoading: accessRequestsLoading } = useGetAccessRequests();
  const { mutate: grantAccessMutation, isPending: grantingAccess } = useGrantAccess();
  const { mutate: denyAccessMutation, isPending: denyingAccess } = useDenyAccess();
  const { mutate: requestAccessMutation, isPending: requestingAccess } = useRequestAccess();

  // New documents from store
  const newDocuments = useStore((state) => state.newDocuments);
  const removeNewDocument = useStore((state) => state.removeNewDocument);
  const clearNewDocuments = useStore((state) => state.clearNewDocuments);
  const setShowToolbar = useStore((state) => state.setShowToolbar);

  // Get the actual array from the response (handle both data.data and data formats)
  const accessRequestsList = Array.isArray(accessRequests?.data) 
    ? accessRequests.data 
    : Array.isArray(accessRequests?.data?.data) 
      ? accessRequests.data.data 
      : [];
  
  const accessRequestCount = accessRequestsList.length || 0;
  const newDocumentCount = newDocuments?.length || 0;
  const totalNotificationCount = accessRequestCount + newDocumentCount;

  // Render new document notifications
  const renderNewDocumentsContent = () => {
    if (!newDocuments || newDocuments.length === 0) {
      return (
        <div className="py-8">
          <Empty 
            description={<span className="text-gray-400">No new documents</span>} 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
          <span className="text-sm font-medium text-gray-600">
            {newDocumentCount} new document{newDocumentCount > 1 ? 's' : ''}
          </span>
          <Button 
            size="small" 
            type="text" 
            onClick={clearNewDocuments}
            className="text-gray-500 hover:text-[#9D4D01]"
          >
            Clear all
          </Button>
        </div>
        <List
          className="max-h-72 overflow-y-auto"
          dataSource={newDocuments}
          renderItem={(doc) => (
            <List.Item
              key={doc.id}
              className="hover:bg-gray-50 transition-colors px-4"
              actions={[
                <Button
                  type="primary"
                  size="small"
                  className="bg-[#9D4D01] hover:bg-[#582F08] border-none"
                  onClick={() => {
                    setShowToolbar(true);
                    navigate('/incoming');
                    removeNewDocument(doc.id);
                  }}
                >
                  View
                </Button>,
                <Button
                  size="small"
                  type="text"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => removeNewDocument(doc.id)}
                >
                  <CloseOutlined />
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <FileTextOutlined className="text-lg text-[#9D4D01]" />
                  </div>
                }
                title={
                  <span className="font-medium text-gray-800 text-sm line-clamp-1">
                    {doc.subject}
                  </span>
                }
                description={
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">
                      From: <span className="font-medium text-gray-600">{doc.sentBy}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(doc.receivedAt).toLocaleString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  // Render combined notification content with tabs
  const renderNotificationContent = (isMobile = false) => {
    return (
      <div style={{ width: isMobile ? 'calc(100vw - 32px)' : 380, maxWidth: isMobile ? 320 : 380 }}>
        <Tabs
          defaultActiveKey="documents"
          size="small"
          className="notification-tabs"
          items={[
            {
              key: 'documents',
              label: (
                <span className="flex items-center gap-2 px-1">
                  <FileTextOutlined />
                  <span>Documents</span>
                  {newDocumentCount > 0 && (
                    <Badge 
                      count={newDocumentCount} 
                      size="small" 
                      className="ml-1"
                      style={{ backgroundColor: '#9D4D01' }}
                    />
                  )}
                </span>
              ),
              children: renderNewDocumentsContent(),
            },
            {
              key: 'access',
              label: (
                <span className="flex items-center gap-2 px-1">
                  <span>Access Requests</span>
                  {accessRequestCount > 0 && (
                    <Badge 
                      count={accessRequestCount} 
                      size="small" 
                      className="ml-1"
                      style={{ backgroundColor: '#9D4D01' }}
                    />
                  )}
                </span>
              ),
              children: renderAccessRequestContent(),
            },
          ]}
        />
      </div>
    );
  };

  // Render access request notifications
  const renderAccessRequestContent = () => {
    if (accessRequestsLoading) {
      return (
        <div className="py-8 flex justify-center">
          <LoadingOutlined className="text-xl text-[#9D4D01]" />
        </div>
      );
    }

    if (!accessRequestsList || accessRequestsList.length === 0) {
      return (
        <div className="py-8">
          <Empty 
            description={<span className="text-gray-400">No pending access requests</span>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
          <span className="text-sm font-medium text-gray-600">
            {accessRequestCount} pending request{accessRequestCount > 1 ? 's' : ''}
          </span>
        </div>
        <List
          className="max-h-72 overflow-y-auto"
          dataSource={accessRequestsList}
          renderItem={(request) => (
            <List.Item
              key={request.id}
              className="hover:bg-gray-50 transition-colors px-4"
              actions={[
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  className="bg-green-600 hover:bg-green-700 border-none"
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsGrantModalOpen(true);
                  }}
                >
                  Grant
                </Button>,
                <Button
                  danger
                  size="small"
                  type="text"
                  icon={<CloseOutlined />}
                  loading={denyingAccess}
                  onClick={() => denyAccessMutation(request.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {request.requester?.name?.charAt(0)}
                    </span>
                  </div>
                }
                title={
                  <span className="font-medium text-gray-800 text-sm">
                    {request.requester?.name}
                  </span>
                }
                description={
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500 line-clamp-1">
                      <span className="font-medium text-gray-600">{request.document?.subject}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Ref: {request.document?.ref}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  // Assuming `user` is accessible globally in your app
  const items = [
    {
      label: (
        <a href="/login" onClick={handleLogout}>
          Logout
        </a>
      ),
      key: '0',
    },
  ];

  const allRolePermissions = getAllRolePermissions(user);

  // Check if user has ADMIN role
  const isAdmin = user?.role?.some(r => r.role === 'ADMIN');

  // Only show Admin Console to users with ADMIN role
  if (isAdmin) {
    items.push({
      label: <span onClick={() => navigate('/backoffice/bod')} className="cursor-pointer">Admin Console</span>,
      key: '1',
    });
  }

  // Function to render menu items in the dropdown based on search results
  const renderMenuItems = () => {
    // Handle case where results might not have all expected properties
    const incomingAndOutgoing = results?.incomingAndOutgoing || [];
    const files = results?.files || [];
    const grantedAccessDocuments = results?.grantedAccessDocuments || [];
    const inaccessibleDocuments = results?.inaccessibleDocuments || [];

    const hasResults = 
      incomingAndOutgoing.length > 0 || 
      files.length > 0 || 
      grantedAccessDocuments.length > 0 || 
      inaccessibleDocuments.length > 0;

    if (!results || !hasResults) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">No results found</p>
          <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
        </div>
      );
    }

    const uniqueItemsMap = new Map();

    // Process incomingAndOutgoing - Full access documents
    incomingAndOutgoing.forEach((item) => {
      const { document, status, sender, receiver } = item;
      const isArchivedByUser =
        status === 'Archived' && sender.userId === user?.userId;
      const isArchiver =
        status === 'Archived' && receiver.userId === user?.userId;

      if (!uniqueItemsMap.has(document.ref)) {
        uniqueItemsMap.set(document.ref, {
          ...document,
          isArchivedByUser,
          isArchiver,
          status,
          type: 'Document',
          accessType: 'full', // Full access via trail
        });
      }
    });

    // Process files
    files.forEach((file) => {
      const existingItem = uniqueItemsMap.get(file.ref);

      if (existingItem) {
        uniqueItemsMap.set(file.ref, {
          ...existingItem,
          fileId: file.fileId,
          fileName: file.fileName,
          hasFile: true,
        });
      } else {
        uniqueItemsMap.set(file.ref, {
          ...file,
          type: 'File',
          hasFile: true,
          accessType: 'full',
        });
      }
    });

    // Process grantedAccessDocuments - View-only access
    grantedAccessDocuments.forEach((doc) => {
      if (!uniqueItemsMap.has(doc.ref)) {
        uniqueItemsMap.set(doc.ref, {
          ...doc,
          type: 'Document',
          accessType: 'granted', // View-only granted access
          hasFile: !!doc.fileId,
        });
      }
    });

    // Process inaccessibleDocuments - No access
    inaccessibleDocuments.forEach((doc) => {
      if (!uniqueItemsMap.has(doc.ref)) {
        uniqueItemsMap.set(doc.ref, {
          ...doc,
          type: 'Document',
          accessType: 'none', // No access
          hasFile: false,
        });
      }
    });

    const fullAccessItems = Array.from(uniqueItemsMap.values()).filter(item => item.accessType === 'full');
    const grantedAccessItems = Array.from(uniqueItemsMap.values()).filter(item => item.accessType === 'granted');
    const noAccessItems = Array.from(uniqueItemsMap.values()).filter(item => item.accessType === 'none');

    return (
      <>
        {/* Full Access Documents (incomingAndOutgoing) */}
        {fullAccessItems.map((item, index) => {
          const showTrailButton =
            item.isArchiver || (item.type === 'Document' && item.isArchivedByUser);
          const showTrackButton = !item.isArchiver && item.type === 'Document';

          return (
            <div
              key={`full-${index}`}
              className="p-3 md:p-4 border-b last:border-none border-gray-100 bg-white hover:bg-[#FDF8F4] transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#FDF4ED] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#9D4D01]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#582F08] line-clamp-1 group-hover:text-[#9D4D01] transition-colors">
                    {item.subject}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{item.ref}</p>
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {item.hasFile && (
                      <button
                        className="px-3 py-1 text-xs font-medium bg-[#582F08] text-white rounded-md hover:bg-[#6d3a0a] transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleButtonClick(item, 'View'); }}
                      >
                        View
                      </button>
                    )}
                    {showTrailButton && (
                      <button
                        className="px-3 py-1 text-xs font-medium bg-[#E3BC97] text-[#582F08] rounded-md hover:bg-[#d4a574] transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleButtonClick(item, 'Trail'); }}
                      >
                        Trail
                      </button>
                    )}
                    {showTrackButton && (
                      <button
                        className="px-3 py-1 text-xs font-medium bg-[#E3BC97] text-[#582F08] rounded-md hover:bg-[#d4a574] transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleButtonClick(item, 'Track'); }}
                      >
                        Track
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Granted Access Documents (View-Only) */}
        {grantedAccessItems.length > 0 && (
          <>
            {fullAccessItems.length > 0 && (
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-transparent border-l-2 border-blue-400">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Granted Access</span>
              </div>
            )}
            {grantedAccessItems.map((item, index) => (
              <div
                key={`granted-${index}`}
                className="p-3 md:p-4 border-b last:border-none border-gray-100 bg-blue-50/50 hover:bg-blue-50 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#582F08] line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.subject}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{item.ref}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">View Only</span>
                      <button
                        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleButtonClick(item, 'View'); }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Inaccessible Documents (Request Access) */}
        {noAccessItems.length > 0 && (
          <>
            {(fullAccessItems.length > 0 || grantedAccessItems.length > 0) && (
              <div className="px-4 py-2 bg-gradient-to-r from-gray-100 to-transparent border-l-2 border-gray-400">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Request Access</span>
              </div>
            )}
            {noAccessItems.map((item, index) => (
              <div
                key={`inaccessible-${index}`}
                className="p-3 md:p-4 border-b last:border-none border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-700 line-clamp-1">
                      {item.subject}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{item.ref}</p>
                    {item.currentHolder && (
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Held by: {item.currentHolder.name}
                      </p>
                    )}
                    <div className="mt-2">
                      <button
                        className="px-3 py-1 text-xs font-medium border border-[#582F08] text-[#582F08] rounded-md hover:bg-[#582F08] hover:text-white transition-colors disabled:opacity-50"
                        disabled={requestingAccess}
                        onClick={(e) => { e.stopPropagation(); requestAccessMutation(item.docID); }}
                      >
                        {requestingAccess ? 'Requesting...' : 'Request Access'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  //useQUery to fetch trail associated to doc ID
  const { data: trailData } = useQuery({
    queryKey: ['trailData', trailId],
    queryFn: async () => {
      return axiosInstance.get(`/trail/${trailId}`);
    },
    enabled: !!trailId, // Only fetch if trailId is set
  });

  // Function to handle button click actions based on button type and item properties
  const handleButtonClick = async (item, actionType) => {
    if (actionType === 'View') {
      try {
        // Fetch the file as a blob if the "View" button is clicked
        const response = await axiosInstance.get(
          `/archive/file/${item.fileId}`,
          {
            responseType: 'blob', // Important for handling binary PDF data
          }
        );

        // Convert Blob to URL and set it to display in the modal
        const pdfUrl = URL.createObjectURL(response.data);
        setCurrentFile({
          ...item,
          fileUrl: pdfUrl,
        });
        setFileModalVisible(true); // Open file modal
      } catch (error) {
        console.error(`Error viewing file with file ID: ${item.fileId}`, error);
      }
    } else if (actionType === 'Trail') {
      // Log trailing action for the document and set the trail ID
      console.log(`Trailing document with ID: ${item.docID}`);
      setTrailId(item.docID);
      setIsModalOpen(true);
    } else if (actionType === 'Track') {
      // Log tracking action for the document and set the trail ID
      console.log(`Tracking document with ID: ${item.docID}`);
      setTrailId(item.docID);
      setIsModalOpen(true);
    }
  };

  return (
    <div>
      {/* Desktop Navbar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-[#EADFD5] border-b border-[#D4C4B5]">
        <div className="flex items-center justify-between h-16 px-6">

          {/* Logo — left side, home link */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 flex-shrink-0 w-[200px] cursor-pointer border-none bg-transparent p-0 outline-none"
          >
            <img
              src="/asset/logo.9a18109e1c16584832d5.png"
              alt="Cocoa Papers"
              className="h-12 w-auto object-contain"
            />
          </button>

          {/* Center Section - Search Bar */}
          <div className="flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="flex items-center bg-white border border-[#D4C4B5] rounded-lg px-4 py-2 focus-within:border-[#9D4D01] focus-within:ring-1 focus-within:ring-[#9D4D01] transition-all shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 text-[#9D4D01]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="search"
                  placeholder="Search documents..."
                  className="w-full bg-transparent ml-3 text-sm text-[#582F08] placeholder-[#9D4D01]/60 outline-none"
                />
                {loading && (
                  <LoadingOutlined className="text-[#9D4D01]" spin />
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {searchTerm && results && isOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-hidden z-50"
                  ref={dropdownRef}
                >
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Search Results</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {renderMenuItems()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Notifications & User */}
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <Popover
              content={renderNotificationContent()}
              title={
                <span className="font-semibold text-[#582F08]">
                  Notifications
                </span>
              }
              trigger="click"
              placement="bottomRight"
            >
              <button className="relative p-2 text-[#582F08] hover:text-[#9D4D01] hover:bg-[#E3BC97]/50 rounded-full transition-colors">
                <Badge count={totalNotificationCount} size="small" offset={[-2, 2]}>
                  <BellOutlined className="text-xl" />
                </Badge>
              </button>
            </Popover>

            {/* Divider */}
            <div className="h-8 w-px bg-[#D4C4B5]" />

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <Dropdown
                menu={{ items }}
                trigger={['click']}
              >
                <button
                  className="flex items-center gap-2 text-[#582F08] hover:text-[#9D4D01] transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="w-9 h-9 bg-[#E3BC97] text-[#582F08] flex items-center justify-center rounded-full font-semibold text-sm border-2 border-[#9D4D01]">
                    {user?.name
                      ?.split(' ')
                      .map((name) => name.charAt(0))
                      .reduce((a, b) => `${a}${b}`, '')}
                  </div>
                  <span className="text-sm font-semibold max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <DownOutlined className="text-xs" />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
          {/* Menu Placeholder for sidebar */}
          <div className="w-10" />
          
          {/* Logo/Title — home link */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer border-none bg-transparent p-0 outline-none"
          >
            <img
              src="/asset/logo.9a18109e1c16584832d5.png"
              alt="Cocoa Papers"
              className="h-10 w-auto object-contain"
            />
          </button>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Popover
              content={renderNotificationContent(true)}
              title={<span className="font-semibold text-[#582F08] text-sm">Notifications</span>}
              trigger="click"
              placement="bottom"
              overlayStyle={{ maxWidth: 'calc(100vw - 16px)', right: 8 }}
              overlayClassName="mobile-notification-popover"
            >
              <button className="relative p-2 text-[#582F08]">
                <Badge count={totalNotificationCount} size="small" offset={[-2, 2]}>
                  <BellOutlined className="text-lg" />
                </Badge>
              </button>
            </Popover>
            
            <Dropdown menu={{ items }} trigger={['click']}>
              <button className="p-1" onClick={(e) => e.preventDefault()}>
                <div className="w-8 h-8 bg-[#E3BC97] text-[#582F08] flex items-center justify-center rounded-full font-semibold text-xs border border-[#9D4D01]">
                  {user?.name
                    ?.split(' ')
                    .map((name) => name.charAt(0))
                    .reduce((a, b) => `${a}${b}`, '')}
                </div>
              </button>
            </Dropdown>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="px-3 py-2.5 bg-white border-b border-gray-100">
          <div className="relative">
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#E3BC97] transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5 text-[#9D4D01]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="search"
                placeholder="Search documents..."
                className="w-full bg-transparent ml-3 text-sm text-[#582F08] placeholder-gray-400 outline-none font-medium"
              />
              {loading && <LoadingOutlined className="text-[#9D4D01]" spin />}
            </div>
            
            {/* Mobile Search Results */}
            {searchTerm && results && isOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[60vh] overflow-hidden z-50"
                ref={dropdownRef}
              >
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Results</span>
                </div>
                <div className="max-h-[calc(60vh-40px)] overflow-y-auto">
                  {renderMenuItems()}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-[104px] md:h-16" />

      <Modal
        title="Locator"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered="true"
        width={'60%'}
      >
        <div className="py-6">
          <Steps
            responsive
            direction
            className="grid grid-cols-2 gap-y-2 "
            items={trailData?.data?.trails.flatMap((trail, index) => {
              if (index === 0) {
                return [
                  {
                    title: 'Sent',
                    description: trail.sender.name,
                  },
                  {
                    title: trail?.status,
                    description: trail.receiver.name,
                  },
                ];
              } else {
                return {
                  title: trail.status,
                  description: trail.receiver.name,
                };
              }
            })}
          />
        </div>
      </Modal>
      <Modal
        title={currentFile?.fileName || 'Document Viewer'}
        visible={isFileModalVisible}
        onCancel={() => {
          setFileModalVisible(false);
          URL.revokeObjectURL(currentFile?.fileUrl); // Clean up URL
          setCurrentFile(null); // Clear current file
        }}
        footer={null}
        width={800}
        className="!top-9"
      >
        {currentFile && (
          <iframe
            src={currentFile.fileUrl}
            width="100%"
            height="600px" // Adjust as needed
            title="PDF Viewer"
          />
        )}
      </Modal>

      {/* Grant Access Modal with Date Picker */}
      <Modal
        title="Grant Access"
        open={isGrantModalOpen}
        onCancel={() => {
          setIsGrantModalOpen(false);
          setSelectedRequest(null);
          setExpirationDate(null);
        }}
        footer={null}
        centered
      >
        <div className="py-4">
          <p className="mb-2">
            Grant <strong>{selectedRequest?.requester?.name}</strong> access to:
          </p>
          <p className="text-gray-600 mb-4">
            <strong>{selectedRequest?.document?.subject}</strong> (Ref: {selectedRequest?.document?.ref})
          </p>
          
          <Form layout="vertical">
            <Form.Item 
              label="Access Expires On" 
              required
              help="Select when the access should expire. After this date, the user will need to request access again."
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                className="w-full"
                placeholder="Select expiration date and time"
                onChange={(date) => setExpirationDate(date)}
                disabledDate={(current) => current && current < new Date()}
              />
            </Form.Item>
          </Form>

          <div className="flex gap-2 justify-end mt-6">
            <Button 
              onClick={() => {
                setIsGrantModalOpen(false);
                setSelectedRequest(null);
                setExpirationDate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="bg-[#582F08] hover:bg-[#9D4D01]"
              loading={grantingAccess}
              disabled={!expirationDate}
              onClick={() => {
                if (!expirationDate) {
                  message.error('Please select an expiration date');
                  return;
                }
                grantAccessMutation({
                  requestId: selectedRequest.id,
                  expiresAt: expirationDate.toISOString(),
                });
                setIsGrantModalOpen(false);
                setSelectedRequest(null);
                setExpirationDate(null);
              }}
            >
              Grant Access
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Navbar;
