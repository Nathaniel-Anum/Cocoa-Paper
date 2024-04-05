import "../../Pages/Home.css";
import { Link } from "react-router-dom";
const BackOfficeSideBar = () => {
  return (
    <div>
      <div className="w-full h-full bg-center">
        <div className="w-[154px] h-screen fixed top-0 left-0 px-[15px] py-[19px] bg-[#582f08]  ">
          <div> 
            <img src="../../src/assets/logo.9a18109e1c16584832d5.png" alt="" />
          </div>
          <ul className="list-none py-[15px]  flex flex-col gap-[40px]  my-[30px] ">
            <Link to="/bod">
              <li className=" flex items-center justify-center gap-2 ">
                <img
                  className="w-[14px]"
                  src="../../src/assets/home-icon.a1cb008ba41682badfae94e2877d0206.svg"
                  alt=""
                />
                <p className="text-[13px] ">Staff</p>
              </li>
            </Link>
            <Link to='/department'>

            <li className="flex items-center justify-center gap-2">
              <img
                className="w-[14px]"
                src="../../src/assets/tracker-icon.6371fcdb202ad14b09e06a9391bf8cc2.svg"
                alt=""
                />
              <p className="text-[13px] ">Department</p>
            </li>
                </Link>
            <li className=" flex items-center justify-center gap-2">
              <img
                className="w-[14px]"
                src="../../src/assets/archive.3b9ddd7f65d8f9353f8fd0efad0c45e5.svg"
                alt=""
                />
                <p>Archive</p>
            </li>
            <li className="flex items-center justify-center gap-2">
              <img
                className="w-[14px]"
                src="../../src/assets/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                alt=""
                />
                <p>Work History</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackOfficeSideBar;
