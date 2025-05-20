import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Map from "./components/Map";
import IslandDetails from "./components/IslandDetails";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Blog from "./components/Blog";
import BlogPost from "./components/BlogPost";
import Home from "./components/Home";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminHome from "./components/admin/AdminHome";
import IslandManager from "./components/admin/IslandManager";
import IslandForm from "./components/admin/IslandForm";
import BlogManager from "./components/admin/BlogManager";
import UserManager from "./components/admin/UserManager";
import AnalyticsDashboard from "./components/admin/AnalyticsDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!user.is_admin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const [islands, setIslands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchIslands();
  }, []);
  
  const fetchIslands = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/islands`);
      setIslands(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching islands:", err);
      setError("Failed to load island data. Please try again later.");
      setIsLoading(false);
    }
  };
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-blue-50">
          <Navbar />
          
          <main className="flex-grow">
            {isLoading ? (
              <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center p-8 text-red-600">{error}</div>
            ) : (
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<Map islands={islands} />} />
                <Route path="/island/:id" element={<IslandDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminHome />} />
                  
                  {/* Island management */}
                  <Route path="islands" element={<IslandManager />} />
                  <Route path="islands/create" element={<IslandForm />} />
                  <Route path="islands/edit/:id" element={<IslandForm />} />
                  
                  {/* Blog management */}
                  <Route path="blog" element={<BlogManager />} />
                  
                  {/* User management */}
                  <Route path="users" element={<UserManager />} />
                  
                  {/* Analytics */}
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                </Route>
              </Routes>
            )}
          </main>
          
          <Footer />
          
          {/* Ad Space - Bottom Banner */}
          <div className="bg-white p-2 border-t border-gray-200 text-center">
            <div className="max-w-6xl mx-auto">
              <p className="text-gray-500 text-xs">ADVERTISEMENT</p>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-400">Ad Space - 728x90</p>
              </div>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;