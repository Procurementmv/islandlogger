import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    islands: 0,
    visits: 0,
    blogPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchAdminStats();
  }, []);
  
  const fetchAdminStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // For a real implementation, you'd have a dedicated stats endpoint
      // Here we'll gather stats from various endpoints
      const [usersRes, islandsRes, blogRes] = await Promise.all([
        axios.get(`${API}/admin/users?limit=1000`, { headers }),
        axios.get(`${API}/islands`),
        axios.get(`${API}/blog?limit=1000`)
      ]);
      
      // Count visits (in a real app, this would be a dedicated endpoint)
      let totalVisits = 0;
      for (const user of usersRes.data) {
        totalVisits += user.visits_count || 0;
      }
      
      setStats({
        users: usersRes.data.length,
        islands: islandsRes.data.length,
        visits: totalVisits,
        blogPosts: blogRes.data.length
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin statistics.');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      
      <div className="mt-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Users stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Users
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {stats.users}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <a href="/admin/users" className="font-medium text-blue-600 hover:text-blue-500">
                  View all users
                </a>
              </div>
            </div>
          </div>
          
          {/* Islands stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Islands
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {stats.islands}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <a href="/admin/islands" className="font-medium text-blue-600 hover:text-blue-500">
                  Manage islands
                </a>
              </div>
            </div>
          </div>
          
          {/* Visits stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Visits
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                {stats.visits}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-500">
                  Across all users
                </span>
              </div>
            </div>
          </div>
          
          {/* Blog stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Blog Posts
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-purple-600">
                {stats.blogPosts}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <a href="/admin/blog" className="font-medium text-blue-600 hover:text-blue-500">
                  Manage blog
                </a>
              </div>
            </div>
          </div>
        </dl>
      </div>
      
      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/islands/create"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true"></span>
              <p className="text-sm font-medium text-gray-900">
                Add New Island
              </p>
              <p className="text-sm text-gray-500">
                Create a new island profile
              </p>
            </div>
          </a>
          
          <a
            href="/admin/blog/create"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true"></span>
              <p className="text-sm font-medium text-gray-900">
                Write New Blog Post
              </p>
              <p className="text-sm text-gray-500">
                Create new content for the blog
              </p>
            </div>
          </a>
          
          <a
            href="/admin/users"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true"></span>
              <p className="text-sm font-medium text-gray-900">
                Manage Users
              </p>
              <p className="text-sm text-gray-500">
                View and edit user permissions
              </p>
            </div>
          </a>
        </div>
      </div>
      
      {/* System status */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">System Status</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Island Tracker System
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current system status and information.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Admin user
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.username}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  API Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Database Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Connected
                  </span>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date().toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}