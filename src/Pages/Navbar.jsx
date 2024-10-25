import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, message } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "./CustomHook/useUser";
import { useEffect, useState } from "react";
import axiosInstance from "../Components/axiosInstance";
import _ from "lodash";
import useDebounce from "./CustomHook/use-debounce";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  //Searching files components
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const { user, setUser } = useUser();
  // console.log(user);
  const navigate = useNavigate();

  const term = useDebounce(searchTerm, 3000);

  useEffect(() => {
    if (term) {
      console.log(term);
      handleInputChange(term);
    } else {
      setResults([]);
    }
  }, [term]);

  //Handle search input change
  const handleInputChange = (searchTerm) => {
    // const term = e.target.value;
    // setSearchTerm(term);

    if (term.trim() !== " ") {
      axiosInstance
        .get(`/search`, {
          params: { searchTerm },
        })
        .then((res) => {
          console.log(res?.data);
          setResults(res?.data);
        })
        .catch((err) => {
          console.log(err?.response?.data?.error);
          message.error(err?.response?.data?.error, 2);
        });
    }
  };

  // Ensure incomingAndOutgoing exists and is an array
  const incomingAndOutgoing = results?.incomingAndOutgoing || [];

  // Separate incoming and outgoing based on receiver and sender
  const incoming = incomingAndOutgoing.filter(
    (i) => i?.receiver?.userId === user?.userId
  );

  const outgoing = incomingAndOutgoing.filter(
    (i) => i?.sender?.userId === user?.userId
  );

  console.log("Incoming:", incoming);
  console.log("Outgoing:", outgoing);

  // Files from search results
  const files = results?.files || [];

  // Function to handle navigation
  const handleNavigation = (item) => {
    // Check if it's a file
    if (item.type === "File") {
      if (item.folderId === null) {
        // If folderId is null, navigate to the archive
        navigate("/archive");
      } else {
        // If folderId exists, navigate to the folder's page
        navigate(`/archive/${item.folderId}`);
      }
    } else if (incoming.includes(item)) {
      // If it's an incoming document
      navigate("/dashboard/incoming");
    } else if (outgoing.includes(item)) {
      // If it's an outgoing document
      navigate("/dashboard/outgoing");
    }
  };

  // Check if there are no results
  const noResults =
    files.length === 0 && incoming.length === 0 && outgoing.length === 0;

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
            <div className=" cursor-pointer ">
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
            </div>
          </div>
          <div className="absolute">
            {/* Render Files */}
            {files.length > 0 && (
              <div>
                <h2>Files</h2>
                {files.map((file) => (
                  <div key={file.fileId} onClick={() => handleNavigation(file)}>
                    <p>
                      <strong>File Name:</strong> {file.fileName}
                    </p>
                    <p>
                      <strong>Subject:</strong> {file.subject}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Render Incoming Documents */}
            {incoming.length > 0 && (
              <div>
                <h2>Incoming Documents</h2>
                {incoming.map((doc) => (
                  <div key={doc.docID} onClick={() => handleNavigation(doc)}>
                    <p>
                      <strong>Subject:</strong> {doc.document.subject}
                    </p>
                    <p>
                      <strong>Reference:</strong> {doc.document.ref}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Render Outgoing Documents */}
            {outgoing.length > 0 && (
              <div>
                <h2>Outgoing Documents</h2>
                {outgoing.map((doc) => (
                  <div key={doc.docID} onClick={() => handleNavigation(doc)}>
                    <p>
                      <strong>Subject:</strong> {doc.document.subject}
                    </p>
                    <p>
                      <strong>Reference:</strong> {doc.document.ref}
                    </p>
                  </div>
                ))}
              </div>
            )}
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

      <ToastContainer />
    </div>
  );
};

export default Navbar;
