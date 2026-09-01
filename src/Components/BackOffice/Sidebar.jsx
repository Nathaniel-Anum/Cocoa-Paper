import { NavLink } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { LuCalendar, LuStamp } from 'react-icons/lu';
import { CalendarFilled } from '@ant-design/icons';
import { GiTrail } from 'react-icons/gi';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import { FaUserGroup } from 'react-icons/fa6';
import { useUser } from '../../Pages/CustomHook/useUser';
import { DIVISIONS } from '../../../utils/constants';

const navLink = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
    isActive
      ? 'bg-white/20 text-white shadow-sm'
      : 'text-white/75 hover:bg-white/10 hover:text-white'
  }`;

const SectionLabel = ({ label }) => (
  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-3 pt-3 pb-1">
    {label}
  </p>
);

const BackOfficeSideBar = () => {
  const { user } = useUser();

  return (
    <div className="w-[220px] h-screen fixed top-0 left-0 bg-[#582f08] flex flex-col overflow-y-auto z-20 shadow-lg">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
        <img
          src="/asset/logo.9a18109e1c16584832d5.png"
          alt="Cocoa Papers"
          className="h-11 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        <SectionLabel label="General" />

        <NavLink to="/backoffice/bod" className={navLink}>
          <FaUser className="text-[#E3BC97] text-base flex-shrink-0" />
          <span>Staff</span>
        </NavLink>

        <NavLink to="/backoffice/user-groups" className={navLink}>
          <FaUserGroup className="text-[#E3BC97] text-base flex-shrink-0" />
          <span>User Groups</span>
        </NavLink>

        <NavLink to="/backoffice/department" className={navLink}>
          <img
            className="w-4 h-4 flex-shrink-0 opacity-75"
            src="/asset/tracker-icon.6371fcdb202ad14b09e06a9391bf8cc2.svg"
            alt=""
          />
          <span>Department</span>
        </NavLink>

        {user && user?.division?.divisionName === DIVISIONS.COCOBOD && (
          <>
            <SectionLabel label="Administration" />

            <NavLink to="/backoffice/division" className={navLink}>
              <img
                className="w-4 h-4 flex-shrink-0 opacity-75"
                src="/asset/archive.3b9ddd7f65d8f9353f8fd0efad0c45e5.svg"
                alt=""
              />
              <span>Division</span>
            </NavLink>

            <NavLink to="/backoffice/financialYears" className={navLink}>
              <CalendarFilled className="text-[#E3BC97] text-base flex-shrink-0" />
              <span>Financial Years</span>
            </NavLink>

            <NavLink to="/backoffice/roles" className={navLink}>
              <img
                className="w-4 h-4 flex-shrink-0 opacity-75"
                src="/asset/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                alt=""
              />
              <span>Roles</span>
            </NavLink>

            <NavLink to="/backoffice/rolemanagement" className={navLink}>
              <img
                className="w-4 h-4 flex-shrink-0 opacity-75"
                src="/asset/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                alt=""
              />
              <span>Role Management</span>
            </NavLink>

            <NavLink to="/backoffice/config" className={navLink}>
              <HiOutlineWrenchScrewdriver className="text-[#E3BC97] text-base flex-shrink-0" />
              <span>Configuration</span>
            </NavLink>

            <NavLink to="/backoffice/retention" className={navLink}>
              <LuCalendar className="text-[#E3BC97] text-base flex-shrink-0" />
              <span>Retention Policy</span>
            </NavLink>

            <NavLink to="/backoffice/scripts" className={navLink}>
              <HiOutlineWrenchScrewdriver className="text-[#E3BC97] text-base flex-shrink-0" />
              <span>Scripts</span>
            </NavLink>
          </>
        )}

        <SectionLabel label="Tools" />

        <NavLink to="/backoffice/stamps" className={navLink}>
          <LuStamp className="text-[#E3BC97] text-base flex-shrink-0" />
          <span>Stamps</span>
        </NavLink>

        <NavLink to="/backoffice/auditTrail" className={navLink}>
          <GiTrail className="text-[#E3BC97] text-base flex-shrink-0" />
          <span>Audit Trail</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
        <a
          href="/"
          className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors duration-150"
        >
          <span>← Back to App</span>
        </a>
      </div>
    </div>
  );
};

export default BackOfficeSideBar;
