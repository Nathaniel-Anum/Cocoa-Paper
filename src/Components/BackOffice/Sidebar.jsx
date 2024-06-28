import "../../Pages/Home.css";
import { Link } from "react-router-dom";
const BackOfficeSideBar = () => {
  return (
    <div>
      <div className="w-full h-full bg-center ">
        <div className="w-[201px] h-screen fixed top-0 left-0 px-[15px] py-[19px] bg-[#582f08]  ">
          <div>
            <img src="../../src/assets/logo.9a18109e1c16584832d5.png" alt="" />
          </div>
          <ul className="list-none py-[34px]  flex flex-col gap-[40px]  my-[30px] ">
            <Link to="/backoffice/bod">
              <li className=" flex  gap-3 ">
                <img
                  className="w-[19px]"
                  src="../../src/assets/home-icon.a1cb008ba41682badfae94e2877d0206.svg"
                  alt=""
                />
                <p className="text-[15px] ">Staff</p>
              </li>
            </Link>
            <Link to="/backoffice/department">
              <li className="flex  gap-3">
                <img
                  className="w-[19px]"
                  src="../../src/assets/tracker-icon.6371fcdb202ad14b09e06a9391bf8cc2.svg"
                  alt=""
                />
                <p className="text-[15px] ">Department</p>
              </li>
            </Link>
            <Link to="/backoffice/division">
              <li className=" flex  gap-3">
                <img
                  className="w-[19px]"
                  src="../../src/assets/archive.3b9ddd7f65d8f9353f8fd0efad0c45e5.svg"
                  alt=""
                />
                <p className="text-[15px]">Division</p>
              </li>
            </Link>
            <Link to="/backoffice/roles">
              <li className="flex  gap-3">
                <img
                  className="w-[19px]"
                  src="../../src/assets/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                  alt=""
                />
                <p className="text-[15px]">Roles </p>
              </li>
            </Link>
            <Link to="/backoffice/rolemanagement">
              <li className="flex  gap-3">
                <img
                  className="w-[19px]"
                  src="../../src/assets/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                  alt=""
                />
                <p className="text-[15px]">Role Management </p>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackOfficeSideBar;
