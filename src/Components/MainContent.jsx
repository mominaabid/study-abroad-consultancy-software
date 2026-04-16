export const MainContent = () => {
  return (
    <>
      <p className="text-gray-600 mt-2">Welcome back! Here is your overview.</p>
      
      {/* Dashboard widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">Stats 1</div>
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">Stats 2</div>
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">Stats 3</div>
      </div>
    </>
  );
};