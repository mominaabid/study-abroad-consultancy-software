import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./Components/DashboardLayout";
import { AdminDashboard } from "./Pages/AdminPage/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap protected routes with the Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          {/* Add more internal pages here, they will all share the same Sidebar/Header */}
          {/* <Route path="/analytics" element={<Analytics />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;