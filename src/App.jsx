import './App.css';
import Home from './Pages/Home';
import Layout from './Pages/Layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeDashboard from './Pages/HomeDashboard';
import PublicRoutes from '.././src/Pages/Routes/PublicRoutes';
import ProtectedRoutes from '.././src/Pages/Routes/ProtectedRoutes';
import axiosInstance from './Components/axiosInstance';
import Dashboard from './../src/Components/BackOffice/Dashboard';
import Staff from './Components/BackOffice/Staff';
import Department from './Components/BackOffice/Department';
import Division from './Components/BackOffice/Division';
import Role from './Components/BackOffice/Role';
import RoleManagement from './Components/BackOffice/RoleManagement';
import AddDocument from './Pages/AddDocument';
import Incoming from './Pages/Incoming';
import Outgoing from './Pages/Outgoing';
import { useEffect } from 'react';
import { useUser } from './Pages/CustomHook/useUser';
import { useTrail } from './Pages/CustomHook/useTrail';
import Locator from './Pages/Locator';
import PhysicalDocs from './Pages/PhysicalDocs';
import Archive from './Pages/Archive';
import { SignIn } from './Pages/SignIn';
import ConfirmEmail from './Pages/ConfirmEmail';
import ResetPassword from './Pages/ResetPassword';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../utils/Roles';
import WorkHistory from './Pages/WorkHistory';
import RecycleBin from './Pages/RecycleBin';
import ViewDocument from './Pages/ViewDocument';
import BudgetIndex from './Pages/Routes/Budget/BudgetIndex';
import AddBudget from './Pages/Routes/Budget/Add';
import UpdateBudget from './Pages/Routes/Budget/Update';
import Analytics from './Pages/Analytics';
import AdvancedAnalytics from './Pages/AdvancedAnalytics';
import FinancialYear from './Components/BackOffice/FinancialYear';
import AuditTrail from './Components/BackOffice/AuditTrail';
import Attachments from './Pages/Attachments';
import Configuration from './Components/BackOffice/Configuration';
import RetentionPolicy from './Components/BackOffice/RetentionPolicy';
import UserGroups from './Components/BackOffice/UserGroups';
import Stamp from './Components/BackOffice/Stamp';
import OTPSettings from './Components/OTPSettings';
import UserGuide from './Pages/UserGuide';
import { socket } from './utils/socket';
import useStore from './store/store';
import { isPushSupported, subscribeToPush, isSubscribedToPush } from './utils/pushNotifications';
import { ConfigProvider } from 'antd';

function App() {
  // API call for the users.
  const { setUser, setIsLoading, user } = useUser();

  // axiosInstance.get("/archive").then((res) => console.log(res?.data?.archives));

  // console.log(user, isLoading);
  console.log(user);

  useEffect(() => {
    const fetchUser = () => {
      axiosInstance
        .get('/user')
        .then((res) => {
          const user = res?.data?.user;
          setUser(user);
          
          // Identify user to socket server so they receive targeted notifications
          if (user?.userId) {
            socket.emit('identify', user.userId);
            console.log('User identified to socket server:', user.userId);
            
            // Subscribe to push notifications if supported
            if (isPushSupported()) {
              isSubscribedToPush().then(isSubscribed => {
                if (!isSubscribed) {
                  subscribeToPush()
                    .then(() => console.log('✅ Push notifications enabled'))
                    .catch(err => console.log('Push subscription skipped:', err.message));
                } else {
                  console.log('✅ Already subscribed to push notifications');
                }
              });
            }
          }
        })
        .finally(() => setIsLoading(false));
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    // Listen for socket connection/reconnection
    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      // Re-identify user when reconnected
      const userId = user?.userId;
      if (userId) {
        socket.emit('identify', userId);
        console.log('Re-identified user after socket reconnection:', userId);
      }
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
    };
    
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [user?.userId]);

  useEffect(() => {
    function handleDocumentSent(data) {
      console.log('New doc received ...', data);
      console.log('📨 Adding document to store');
      
      // Add to notification store using setState
      useStore.setState((state) => {
        const exists = state.newDocuments.some(d => d.subject === data.subject && d.sentBy === data.sentBy);
        if (exists) {
          console.log('Document already exists in notifications');
          return state;
        }
        const newDoc = { 
          id: Date.now(), 
          sentBy: data.sentBy || 'Unknown',
          subject: data.subject || 'No subject',
          receivedAt: new Date().toISOString() 
        };
        console.log('✅ Document added:', newDoc);
        return { 
          newDocuments: [newDoc, ...state.newDocuments] 
        };
      });
      
      // Also show browser notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('New Document Received', {
          body: `From: ${data.sentBy || 'Unknown'}\nSubject: ${
            data.subject || 'No subject'
          }`,
          requireInteraction: true, // This makes the notification persistent
        });
      }
    }
    console.log('🎧 Listening for document-sent events....');

    socket.on('document-sent', handleDocumentSent);
    return () => {
      socket.off('document-sent', handleDocumentSent);
    };
  }, []);

  const allRolePermissions = getAllRolePermissions(user);

  // Debug: Log permissions to see what the user has
  console.log('All role permissions:', allRolePermissions);
  console.log('Has READ_STAFF:', hasPermission(allRolePermissions, [requiredPermissions.READ_STAFF]));
  console.log('Has READ_USER:', hasPermission(allRolePermissions, [requiredPermissions.READ_USER]));
  console.log('Has READ_DEPT:', hasPermission(allRolePermissions, [requiredPermissions.READ_DEPT]));
  console.log('Has READ_ROLES:', hasPermission(allRolePermissions, [requiredPermissions.READ_ROLES]));

  // console.log(
  //   hasPermission(user?.role[0].rolePermissions, [
  //     requiredPermissions.CREATE_ARCHIVE,
  //     requiredPermissions.DELETE_ARCHIVE,
  //     requiredPermissions.CREATE_DOCUMENT,
  //     requiredPermissions.DELETE_DOCUMENT,
  //   ])
  // );

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Quicksand', sans-serif",
          colorPrimary: '#9D4D01',
          colorLink: '#9D4D01',
          borderRadius: 8,
        },
      }}
    >
    <div>
      <Router>
        <Routes>
          {/* <Route element={<ProtectedRoutes />}> */}
          {/* <Route path="/" element={<Layout />}> */}

          <Route
            path="/"
            element={
              <ProtectedRoutes
                isAllowed={!!user} // Example condition: only allow if `user` exists
              >
                <Layout />
              </ProtectedRoutes>
            }
          >
            <Route
              path="/"
              index
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_ALL_USERS,
                  ])}
                >
                  <HomeDashboard />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/add-document"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.UPDATE_DOCUMENT,
                    requiredPermissions.DELETE_DOCUMENT,
                    requiredPermissions.READ_DOCUMENT,
                    requiredPermissions.CREATE_DOCUMENT,
                  ])}
                >
                  <AddDocument />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/add-budget-item"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.UPDATE_DOCUMENT,
                    requiredPermissions.DELETE_DOCUMENT,
                    requiredPermissions.READ_DOCUMENT,
                    requiredPermissions.CREATE_DOCUMENT,
                  ])}
                >
                  <AddBudget />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/update-budget-item/:id"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.UPDATE_DOCUMENT,
                    requiredPermissions.DELETE_DOCUMENT,
                    requiredPermissions.READ_DOCUMENT,
                    requiredPermissions.CREATE_DOCUMENT,
                  ])}
                >
                  <UpdateBudget />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_ANALYTICS,
                  ])}
                >
                  <Analytics />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/advanced-analytics"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_ANALYTICS,
                  ])}
                >
                  <AdvancedAnalytics />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/view-document/:id"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.UPDATE_DOCUMENT,
                    requiredPermissions.DELETE_DOCUMENT,
                    requiredPermissions.READ_DOCUMENT,
                    requiredPermissions.CREATE_DOCUMENT,
                  ])}
                >
                  <ViewDocument />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/view-attachment/:id"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.UPDATE_DOCUMENT,
                    requiredPermissions.DELETE_DOCUMENT,
                    requiredPermissions.READ_DOCUMENT,
                    requiredPermissions.CREATE_DOCUMENT,
                  ])}
                >
                  <Attachments />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/incoming"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.CREATE_TRAIL,
                    requiredPermissions.DELETE_TRAIL,
                    requiredPermissions.READ_TRAIL,
                    requiredPermissions.UPDATE_TRAIL,
                  ])}
                >
                  <Incoming />
                </ProtectedRoutes>
              }
            />
            {/* TODO: Change Permissions */}
            <Route
              path="/budget"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_BUDGET,
                  ])}
                >
                  <BudgetIndex />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/outgoing"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.CREATE_TRAIL,
                    requiredPermissions.DELETE_TRAIL,
                    requiredPermissions.READ_TRAIL,
                    requiredPermissions.UPDATE_TRAIL,
                  ])}
                >
                  <Outgoing />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/physicaldocs"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.CREATE_TRAIL,
                    requiredPermissions.DELETE_TRAIL,
                    requiredPermissions.READ_TRAIL,
                    requiredPermissions.UPDATE_TRAIL,
                  ])}
                >
                  <PhysicalDocs />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/locator"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.CREATE_TRAIL,
                    requiredPermissions.DELETE_TRAIL,
                    requiredPermissions.READ_TRAIL,
                    requiredPermissions.UPDATE_TRAIL,
                  ])}
                >
                  <Locator />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/archive"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.CREATE_ARCHIVE,
                    requiredPermissions.READ_ARCHIVE,
                    requiredPermissions.DELETE_ARCHIVE,
                    requiredPermissions.UPDATE_ARCHIVE,
                  ])}
                >
                  <Archive />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/work-history"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.CREATE_ARCHIVE,
                    requiredPermissions.READ_ARCHIVE,
                    requiredPermissions.DELETE_ARCHIVE,
                    requiredPermissions.UPDATE_ARCHIVE,
                  ])}
                >
                  <WorkHistory />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/trash"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.CREATE_ARCHIVE,
                    requiredPermissions.READ_ARCHIVE,
                    requiredPermissions.DELETE_ARCHIVE,
                    requiredPermissions.UPDATE_ARCHIVE,
                  ])}
                >
                  <RecycleBin />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/archive/:id"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.CREATE_ARCHIVE,
                    requiredPermissions.READ_ARCHIVE,
                    requiredPermissions.DELETE_ARCHIVE,
                    requiredPermissions.UPDATE_ARCHIVE,
                  ])}
                >
                  <Archive />
                </ProtectedRoutes>
              }
            />
          </Route>
          <Route
            path="/backoffice"
            element={
              <ProtectedRoutes
                isAllowed={
                  hasPermission(allRolePermissions, [requiredPermissions.READ_USER]) ||
                  hasPermission(allRolePermissions, [requiredPermissions.READ_STAFF]) ||
                  hasPermission(allRolePermissions, [requiredPermissions.READ_ROLES]) ||
                  hasPermission(allRolePermissions, [requiredPermissions.READ_DEPT])
                }
              >
                <Dashboard />
              </ProtectedRoutes>
            }
          >
            <Route
              path="/backoffice/bod"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_STAFF,
                  ])}
                >
                  <Staff />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/user-groups"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_STAFF,
                  ])}
                >
                  <UserGroups />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/stamps"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_STAFF,
                  ])}
                >
                  <Stamp />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/financialYears"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_STAFF,
                  ])}
                >
                  <FinancialYear />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/backoffice/department"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_DEPT,
                  ])}
                >
                  <Department />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/auditTrail"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_DEPT,
                  ])}
                >
                  <AuditTrail />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/division"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_DIVISION,
                  ])}
                >
                  <Division />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/roles"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_ROLES,
                  ])}
                >
                  <Role />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/config"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    // requiredPermissions.READ_CONFIGURATION,
                    // requiredPermissions.CREATE_CONFIGURATION,
                    // requiredPermissions.DELETE_CONFIGURATION,
                    requiredPermissions.READ_ARCHIVE,
                  ])}
                >
                  <Configuration />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/retention"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(allRolePermissions, [
                    requiredPermissions.READ_ARCHIVE,
                  ])}
                >
                  <RetentionPolicy />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/rolemanagement"
              element={<RoleManagement />}
            />
          </Route>

          <Route path="/otp-settings" element={<OTPSettings />} />
          <Route
            path="/user-guide"
            element={
              <ProtectedRoutes isAllowed={!!user}>
                <UserGuide />
              </ProtectedRoutes>
            }
          />
          {/* </Route> */}

          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Home />} />
            <Route path="/backoffice/login" element={<SignIn />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/resetPassword/:token" element={<ResetPassword />} />
          </Route>
        </Routes>
      </Router>
    </div>
    </ConfigProvider>
  );
}

export default App;
