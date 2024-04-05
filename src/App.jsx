import "./App.css";
import Home from "./Pages/Home";
import Layout from "./Pages/Layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./Pages/Main";
import axiosInstance from "./Components/axiosInstance";
import Dashboard from "./../src/Components/BackOffice/Dashboard";
import Staff from "./Components/BackOffice/Staff";
import Department from "./Components/BackOffice/Department";

function App() {
  // API call for the users.
  // axiosInstance.get("/division").then((res) => {
  //   console.log(res?.data);
  // });

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<Main />} />
          </Route>
          <Route path="/" element={<Dashboard />}>
            <Route path="/bod" element={<Staff />} />
            <Route path="/department" element={<Department />} />
          </Route>

          {/* <Route path="/dashboard" element={<Layout />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
