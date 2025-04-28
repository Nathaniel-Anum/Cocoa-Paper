import { Link } from 'react-router-dom';
import { useUser } from './CustomHook/useUser';
import './Home.css';
import { hasPermission, requiredPermissions } from '../../utils/Roles';
import { GiTakeMyMoney } from 'react-icons/gi';
import { HiMiniPresentationChartLine } from 'react-icons/hi2';

const Sidebar = () => {
  const { user } = useUser();

  return (
    <div className="">
      <div className="w-full h-full bg-center ">
        <div className="w-[10rem] z-30 h-screen fixed  px-[15px] py-[19px] bg-[#582f08] overflow-y-auto no-scrollbar">
          <div>
            <img src="/asset/logo.9a18109e1c16584832d5.png" alt="" />
          </div>
          <ul className="list-none  px-[15px] py-[25px]  flex flex-col gap-[35px]  my-[20px] cursor-pointer ">
            {hasPermission(user?.role[0].rolePermissions, [
              requiredPermissions.READ_ANALYTICS,
            ]) && (
              <Link to="/analytics">
                <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                  <HiMiniPresentationChartLine
                    className="w-[6rem] text-[#E3BC97]"
                    size={50}
                  />

                  <p>Analytics</p>
                </li>
              </Link>
            )}
            <Link to="/">
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <img
                  className="w-[43px]"
                  src="/asset/home-icon.a1cb008ba41682badfae94e2877d0206.svg"
                  alt=""
                />
                <p>Home</p>
              </li>
            </Link>

            <Link to="/locator">
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-500 py-2 px-2 hover:scale-105 hover:rounded-md ">
                <img
                  className="w-[43px]"
                  src="/asset/tracker-icon.6371fcdb202ad14b09e06a9391bf8cc2.svg"
                  alt=""
                />
                <p>Locator</p>
              </li>
            </Link>

            {hasPermission(user?.role[0].rolePermissions, [
              requiredPermissions.CREATE_ARCHIVE,
            ]) && (
              <Link to="/archive">
                <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                  <img
                    className="w-[43px]"
                    src="/asset/archive.3b9ddd7f65d8f9353f8fd0efad0c45e5.svg"
                    alt=""
                  />

                  <p>Archive</p>
                </li>
              </Link>
            )}
            {hasPermission(user?.role[0].rolePermissions, [
              requiredPermissions.CREATE_ARCHIVE,
            ]) && (
              <Link to="/work-history">
                <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                  <img
                    className="w-[43px]"
                    src="/asset/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                    alt=""
                  />

                  <p>Work History</p>
                </li>
              </Link>
            )}

            {hasPermission(user?.role[0].rolePermissions, [
              requiredPermissions.READ_BUDGET,
            ]) && (
              <Link to="/budget">
                <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                  <GiTakeMyMoney
                    className="w-[6rem] text-[#E3BC97]"
                    size={60}
                  />

                  <p>Budget</p>
                </li>
              </Link>
            )}
            <Link to="/trash">
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10  duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <img
                  className="w-[43px]"
                  src="/asset/full trash.6648e39921b830096f076502815f16eb.svg"
                  alt=""
                />

                <p>Recycle Bin</p>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
