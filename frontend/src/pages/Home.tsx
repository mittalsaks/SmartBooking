import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold mb-4">Welcome to Smart Booking</h2>
      <p className="text-gray-600 mb-6">Your frontend architecture is successfully set up!</p>
      
      <Link 
        to="/admin" 
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Go to Admin Dashboard
      </Link>
    </div>
  );
}