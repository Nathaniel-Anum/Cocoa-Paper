import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const handleLogout = () => {
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("refreshToken");
//   toast("You have successfully logged out.");
// };

const items = [
  {
    label: <a href="/">Logout</a>,
    key: "0",
  },
];

const BackOfficeNavBar = () => {
  const currentDate = new Date();
  console.log(currentDate);

  return (
    <div>
      <div className="flex justify-between items-center pt-[20px] ">
        <div className="pl-[230px]">
          <p className="font-semibold text-[23px]">Dashboard</p>

          <p className="font-semibold text-[#694421]">
            {currentDate.toDateString()}
          </p>
          {/* <p>{currentDate.toLocaleTimeString()}</p> */}
        </div>
        <div className="bg-white flex items-center rounded-t-lg px-[20px] h-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 "
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>

          <input
            type="search"
            placeholder="Search files and documents"
            className="w-[400px] h-[40px] px-[30px] rounded-[10px] outline-none"
          />
        </div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.0"
            stroke="currentColor"
            className="svgs1 text-[#A74D01] w-[47.99px] h-[47.99px] font-light hover:cursor-pointer hover:fill-[#A74D01] transition-color duration-[5s] ease-in"
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
                Information Systems
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

export default BackOfficeNavBar;
