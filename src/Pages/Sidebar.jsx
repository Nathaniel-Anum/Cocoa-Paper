import { Link } from 'react-router-dom';
import './Home.css';

const Sidebar = () => {
  return (
    <div>
      <div className="w-full h-full bg-center">
        <div className="w-[140px] h-screen fixed top-0 left-0 px-[15px] py-[19px] bg-[#582f08]  ">
          <div>
            <img src="../../src/assets/logo.9a18109e1c16584832d5.png" alt="" />
          </div>
          <ul className="list-none  px-[15px] py-[25px]  flex flex-col gap-[35px]  my-[20px] cursor-pointer ">
            <Link to="/dashboard">
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <img
                  className="w-[43px]"
                  src="../../src/assets/home-icon.a1cb008ba41682badfae94e2877d0206.svg"
                  alt=""
                />
                <p>Home</p>
              </li>
            </Link>
            <Link to="/dashboard/locator">
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-500 py-2 px-2 hover:scale-105 hover:rounded-md ">
                <img
                  className="w-[43px]"
                  src="../../src/assets/tracker-icon.6371fcdb202ad14b09e06a9391bf8cc2.svg"
                  alt=""
                />
                <p>Locator</p>
              </li>
            </Link>
            <Link to="/archive">
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <img
                  className="w-[43px]"
                  src="../../src/assets/archive.3b9ddd7f65d8f9353f8fd0efad0c45e5.svg"
                  alt=""
                />

                <p>Archive</p>
              </li>
            </Link>
            <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
              <img
                className="w-[43px]"
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

export default Sidebar;
