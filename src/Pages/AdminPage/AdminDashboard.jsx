import { MainContent } from "../../Components/MainContent";
import { Footer } from "../../Components/Footer";

export const AdminDashboard = () => {
  return ( 
    // This opening tag (Fragment) fixes the "one parent element" error
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm min-h-[400px]">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        
        {/* These components are now safely inside the parent */}
        <MainContent />
      </div>

      <Footer />
    </>
  );
};