import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./Components/DashboardLayout";
import { AdminDashboard } from "./Pages/AdminPage/AdminDashboard";
import Leads from "./Pages/AdminPage/Leads";
import Counsellor from "./Pages/AdminPage/Counsellor";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/counsellor" element={<Counsellor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
