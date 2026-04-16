import { MainContent } from "../../Components/MainContent";

export const AdminDashboard = () => {
  return ( 
    // This opening tag (Fragment) fixes the "one parent element" error
    <>
      <div className="bg-white rounded-lg shadow-sm min-h-[400px]">
  
        <MainContent />
      </div>

     
    </>
  );
};