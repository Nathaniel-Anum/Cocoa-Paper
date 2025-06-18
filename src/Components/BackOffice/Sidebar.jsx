import '../../Pages/Home.css';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { LuCalendar } from 'react-icons/lu';
import { CalendarFilled } from '@ant-design/icons';
import { GiTrail, GiWheelbarrow } from 'react-icons/gi';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import { FaUserGroup } from 'react-icons/fa6';

const BackOfficeSideBar = () => {
  return (
    <div>
      <div className="w-full h-full bg-center ">
        <div className="w-[201px] h-screen fixed top-0 left-0 px-[15px] py-[19px]  bg-[#582f08]   ">
          <div>
            <img src="/asset/logo.9a18109e1c16584832d5.png" alt="" />
          </div>
          <ul className="list-none py-[34px]  flex flex-col gap-[40px]  my-[30px] ">
            <Link to="/backoffice/bod">
              <li className=" flex gap-3 duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md">
                <FaUser className="w-[22px] text-[#E3BC97]" />

                <p className="text-[15px] ">Staff</p>
              </li>
            </Link>
            <Link to="/backoffice/user-groups">
              <li className=" flex gap-3 duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md">
                <FaUserGroup className="w-[22px] text-[#E3BC97]" />

                <p className="text-[15px] ">User Groups</p>
              </li>
            </Link>
            <Link to="/backoffice/department">
              <li className="duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md  flex gap-3">
                <img
                  className="w-[22px]"
                  src="/asset/tracker-icon.6371fcdb202ad14b09e06a9391bf8cc2.svg"
                  alt=""
                />
                <p className="text-[15px] ">Department</p>
              </li>
            </Link>
            <Link to="/backoffice/division">
              <li className=" duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md flex  gap-3">
                <img
                  className="w-[22px]"
                  src="/asset/archive.3b9ddd7f65d8f9353f8fd0efad0c45e5.svg"
                  alt=""
                />
                <p className="text-[15px]">Division</p>
              </li>
            </Link>
            <Link to="/backoffice/financialYears">
              <li className=" duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md flex  gap-3">
                <CalendarFilled className="text-[#E3BC97] text-lg" />
                <p className="text-[15px]">Financial Years</p>
              </li>
            </Link>
            <Link to="/backoffice/roles">
              <li className="duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md flex  gap-3">
                <img
                  className="w-[22px]"
                  src="/asset/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                  alt=""
                />
                <p className="text-[15px]">Roles </p>
              </li>
            </Link>
            <Link to="/backoffice/rolemanagement">
              <li className="duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md flex gap-3">
                <img
                  className="w-[22px]"
                  src="/asset/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                  alt=""
                />
                <p className="text-[15px]">Role Management </p>
              </li>
            </Link>
            <Link to="/backoffice/auditTrail">
              <li className="duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md flex gap-3">
                <GiTrail className="text-[#E3BC97] text-lg" />
                <p className="text-[15px]">Audit Trail </p>
              </li>
            </Link>
            <Link to="/backoffice/config">
              <li className="duration-500 hover:bg-white/10 hover:py-2 hover:scale-105 hover:rounded-md flex gap-3">
                <HiOutlineWrenchScrewdriver className="text-[#E3BC97] text-lg" />
                <p className="text-[15px]">Configuration </p>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackOfficeSideBar;
