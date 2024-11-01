import { DownOutlined, LoadingOutlined } from "@ant-design/icons";
import { Dropdown, Space, Modal, Button, Steps } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "./CustomHook/useUser";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../Components/axiosInstance";
import _ from "lodash";
import useDebounce from "./CustomHook/use-debounce";
import { useNavigate } from "react-router-dom";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const Navbar = () => {
  //Searching files components
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false); // New: State to track loading
  const [trailId, setTrailId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileModalVisible, setFileModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

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

  // Handle search input change
  const handleInputChange = (searchTerm) => {
    if (searchTerm.trim() !== "") {
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
          setResults(res?.data);
          console.log(res?.data);
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
    localStorage.removeItem("accessToken");
  };

  // Assuming `user` is accessible globally in your app
  const items = [
    {
      label: (
        <a href="/login" onClick={handleLogout}>
          Logout
        </a>
      ),
      key: "0",
    },
  ];

  // Conditionally add the "Go to Admin Console" option if the user is an admin
  if (user?.role[0].role === "ADMIN") {
    items.push({
      label: <a href="/backoffice/bod">Go to Admin Console</a>,
      key: "1",
    });
  }

  // Function to render menu items in the dropdown based on search results
  const renderMenuItems = () => {
    if (!results || results.length === 0) {
      return <div className="text-gray-500 p-4">No results found</div>;
    }

    // Map to store unique items based on subject (combines file and document items with the same subject)
    const uniqueItemsMap = new Map();

    // Process incoming and outgoing documents
    (results?.incomingAndOutgoing || []).forEach((item) => {
      const { document, status, sender, receiver } = item;
      const isArchivedByUser =
        status === "Archived" && sender.userId === user?.userId;
      const isArchiver =
        status === "Archived" && receiver.userId === user?.userId;

      // Add or update the map to store unique items by subject
      if (!uniqueItemsMap.has(document.subject)) {
        uniqueItemsMap.set(document.subject, {
          ...document,
          isArchivedByUser,
          isArchiver,
          status,
          type: "Document",
        });
      }
    });

    // Process files and merge with the documents based on subject
    (results?.files || []).forEach((file) => {
      const existingItem = uniqueItemsMap.get(file.subject);

      if (existingItem) {
        // Update existing item with file information and add 'hasFile' flag
        uniqueItemsMap.set(file.subject, {
          ...existingItem,
          fileId: file.fileId,
          fileName: file.fileName,
          hasFile: true, // Indicates both file and document are present
        });
      } else {
        // If no document with the same subject exists, add file as a unique item
        uniqueItemsMap.set(file.subject, {
          ...file,
          type: "File",
          hasFile: true,
        });
      }
    });

    // Render the items in the dropdown
    return Array.from(uniqueItemsMap.values()).map((item, index) => {
      // Determine which buttons to show based on user and item properties
      const showTrailButton =
        item.isArchiver || (item.type === "Document" && item.isArchivedByUser);
      const showTrackButton = !item.isArchiver && item.type === "Document";

      // Set button text based on conditions
      const buttonText = item.hasFile
        ? "View"
        : showTrailButton
        ? "Trail"
        : showTrackButton
        ? "Track"
        : "";

      return (
        <div key={index} className="p-4  bg-white rounded-md  mb-2">
          <div className="text-lg font-semibold">{item.subject}</div>

          {/* Show Trail button if user archived the document, Track if they didn’t, and View for files */}
          {item.hasFile && (
            <Button
              type="primary"
              className="mt-2 bg-[#582F08] mr-2"
              onClick={() => handleButtonClick(item, "View")}
            >
              View
            </Button>
          )}
          {showTrailButton && (
            <Button
              type="primary"
              className="mt-2 bg-[#582F08]"
              onClick={() => handleButtonClick(item, "Trail")}
            >
              Trail
            </Button>
          )}
          {showTrackButton && (
            <Button
              type="primary"
              className="mt-2 bg-[#582F08]"
              onClick={() => handleButtonClick(item, "Track")}
            >
              Track
            </Button>
          )}
        </div>
      );
    });
  };

  //useQUery to fetch trail associated to doc ID
  const { data: trailData } = useQuery({
    queryKey: ["trailData", trailId],
    queryFn: async () => {
      return axiosInstance.get(`/trail/${trailId}`);
    },
    enabled: !!trailId, // Only fetch if trailId is set
  });

  // console.log(trailData?.data);

  // const handleButtonClick = (item) => {
  //   if (item.type === "File") {
  //     console.log(`Viewing file with file ID: ${item.fileId}`);
  //   } else {
  //     console.log(
  //       `${item.isArchivedByUser ? "Trailing" : "Tracking"} document with ID: ${
  //         item.docID
  //       }`
  //     );

  //     // Set trailId to item.docID and open the modal
  //     setTrailId(item.docID);
  //     setIsModalOpen(true);
  //   }
  // };

  // Function to handle button click actions based on button type and item properties
  const handleButtonClick = async (item, actionType) => {
    if (actionType === "View") {
      try {
        // Fetch the file as a blob if the "View" button is clicked
        const response = await axiosInstance.get(
          `/archive/file/${item.fileId}`,
          {
            responseType: "blob", // Important for handling binary PDF data
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
    } else if (actionType === "Trail") {
      // Log trailing action for the document and set the trail ID
      console.log(`Trailing document with ID: ${item.docID}`);
      setTrailId(item.docID);
      setIsModalOpen(true);
    } else if (actionType === "Track") {
      // Log tracking action for the document and set the trail ID
      console.log(`Tracking document with ID: ${item.docID}`);
      setTrailId(item.docID);
      setIsModalOpen(true);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center pt-[20px]">
        <div className="pl-[200px]">
          <p className="font-semibold text-[23px]">Dashboard</p>

          <p className="font-semibold text-[#694421]">
            {currentDate.toDateString()}
          </p>
          {/* <p>{currentDate.toLocaleTimeString()}</p> */}
        </div>
        <div className="  flex flex-col bg-[#EADFD5]">
          <div className="bg-white flex items-center rounded-t-lg px-[20px] h-full ">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="search"
              placeholder="Search files and documents"
              className="w-[400px] h-[40px] px-[30px] rounded-[10px] outline-none"
            />
            <div className="ml-2">
              {loading ? (
                <LoadingOutlined style={{ fontSize: 24 }} spin /> // Loader next to search input
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              )}
            </div>
          </div>
          <div className="">
            <div className=" absolute  w-[468px] ">
              {/* Dropdown: only displays when results are loaded */}
              {searchTerm && results && (
                <div className="bg-white  absolute z-50 w-full max-h-64 overflow-y-auto shadow-lg  rounded-lg  mt-2">
                  {renderMenuItems()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="svgs1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </div>

        <div className="pr-[80px] flex gap-2 items-center">
          <p className="bg-[#E3BC97] text-[#582F08] px-3 py-2 font-semibold rounded-md text-[18px]">
            IS
          </p>
          <Dropdown
            menu={{
              items,
            }}
            trigger={["click"]}
          >
            <a
              className="font-semibold text-[#9D4D01] cursor-pointer"
              onClick={(e) => e.preventDefault()}
            >
              <Space>
                {user?.name}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>
      </div>

      <Modal
        title="Locator"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered="true"
        width={"60%"}
      >
        <div className="py-6">
          <Steps
            responsive
            className="grid grid-cols-2 gap-y-2 "
            items={trailData?.data?.trails.flatMap((trail, index) => {
              if (index === 0) {
                return [
                  {
                    title: "Sent",
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
        title={currentFile?.fileName || "Document Viewer"}
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
      <ToastContainer />
    </div>
  );
};

export default Navbar;
