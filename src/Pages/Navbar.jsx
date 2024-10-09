import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, message } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "./CustomHook/useUser";
import { useEffect, useState } from "react";
import axiosInstance from "../Components/axiosInstance";
import _ from "lodash";
import useDebounce from "./CustomHook/use-debounce";
import { Link } from "react-router-dom";

const Navbar = () => {
  //Searching files components
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const term = useDebounce(searchTerm, 3000);

  //Debounced search function to avoid too many API calls
  // const debouncedSearch = _.debounce((term) => {
  //   if (!term) {
  //     setResults({ files: [], documents: [] });
  //     setLoading(false);
  //     return;
  //   }

  //   setLoading(true);
  //   setError(" ");
  //   axiosInstance
  //     .get(`/search`, {
  //       params: { searchTerm },
  //     })
  //     .then((res) => {
  //       console.log(res?.data);
  //       setResults(res?.data);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       setResults({ files: [], documents: [] });
  //       setError(err?.response?.data?.error);
  //       setLoading(false);
  //     });
  // }, 3000);
  //300ms debounce delay

  // useEffect(() => {
  //   if (!searchTerm.trim()) {
  //     console.log({ searchTerm });

  //     setResults({ files: [], documents: [] });
  //     debouncedSearch.cancel();
  //   }
  // }, [searchTerm]);

  useEffect(() => {
    if (term) {
      handleInputChange(term);
    }
  }, [term]);

  //Handle search input change
  const handleInputChange = (searchTerm) => {
    // const term = e.target.value;
    // setSearchTerm(term);

    if (term.trim() !== " ") {
      setLoading(true);
      setError(" ");
      axiosInstance
        .get(`/search`, {
          params: { searchTerm },
        })
        .then((res) => {
          console.log(res?.data);
          setResults(res?.data);
          setLoading(false);
        })
        .catch((err) => {
          setResults({ files: [], documents: [] });
          setError(err?.response?.data?.error);
          setLoading(false);
        });
    } else {
      setResults({ files: [], documents: [] });
    }
  };

  useEffect(() => {
    if (error) {
      // message.error(error);
      console.log(error);
    }
  }, [error]);

  // console.log(results);

  const currentDate = new Date();
  // console.log(currentDate);

  const { user, setUser } = useUser();
  // console.log(user);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
  };
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

  // Combine files and documents, normalizing their names
  const combineResults = [
    ...(results?.files || []).map((file) => ({ ...file, name: file.fileName })),
    ...(results?.documents || []).map((document) => ({
      ...document,
      name: document.subject,
    })),
  ];

  console.log(combineResults);

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
              disabled={loading}
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
          <div className="">
            {loading && !combineResults ? (
              <>loading</>
            ) : combineResults.length ? (
              <div>
                {combineResults?.map((item, index) => (
                  <Link
                    to={
                      item?.folderId ? `/archive/${item.folderId}` : "/archive"
                    }
                    key={index}
                    className="flex flex-col"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p>No results found.</p>
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
