import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalVisits: 0,
    visitsPerDay: [],
    topIslands: [],
    userGrowth: [],
    topAtolls: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // For demonstration purposes, we'll use the existing endpoints to gather analytics data
      // Ideally, we'd have dedicated analytics endpoints
      const [users, islands, visits] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/islands`),
        // Since we don't have a "get all visits" endpoint for admins, we'll use user visits
        axios.get(`${API}/visits/user`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      // Artificial visit data for demo purposes
      const dailyVisitData = generateDailyVisitData(30); // Generate 30 days of mock data
      
      // Calculate top islands
      const islandVisits = calculateTopIslands(islands.data, visits.data);
      
      // Calculate top atolls
      const atollVisits = calculateTopAtolls(islands.data);
      
      // Calculate user growth
      const userGrowthData = generateUserGrowthData(users.data);
      
      setAnalytics({
        totalVisits: visits.data.length,
        visitsPerDay: dailyVisitData,
        topIslands: islandVisits,
        userGrowth: userGrowthData,
        topAtolls: atollVisits
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Generate mock data for daily visits
  const generateDailyVisitData = (days) => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        visits: Math.floor(Math.random() * 20) + 1 // Random number between 1-20
      });
    }
    return data;
  };
  
  // Calculate top visited islands
  const calculateTopIslands = (islands, visits) => {
    // Count visits per island
    const islandVisitCount = {};
    visits.forEach(visit => {
      islandVisitCount[visit.island_id] = (islandVisitCount[visit.island_id] || 0) + 1;
    });
    
    // Match with island details and sort
    return islands
      .map(island => ({
        id: island.id,
        name: island.name,
        atoll: island.atoll,
        type: island.type,
        visits: islandVisitCount[island.id] || 0
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5); // Top 5
  };
  
  // Calculate top atolls
  const calculateTopAtolls = (islands) => {
    // Count islands per atoll and assign a random visit count for demonstration
    const atollCounts = {};
    islands.forEach(island => {
      if (!atollCounts[island.atoll]) {
        atollCounts[island.atoll] = {
          name: island.atoll,
          islands: 0,
          visits: 0
        };
      }
      atollCounts[island.atoll].islands += 1;
      // For demo purposes, assign random visit counts
      atollCounts[island.atoll].visits += Math.floor(Math.random() * 50);
    });
    
    return Object.values(atollCounts)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5); // Top 5
  };
  
  // Generate mock user growth data
  const generateUserGrowthData = (users) => {
    // For demonstration purposes, distribute user registrations over past months
    const monthlyGrowth = [
      { month: 'Jan', users: Math.floor(users.length * 0.1) },
      { month: 'Feb', users: Math.floor(users.length * 0.12) },
      { month: 'Mar', users: Math.floor(users.length * 0.15) },
      { month: 'Apr', users: Math.floor(users.length * 0.18) },
      { month: 'May', users: users.length - Math.floor(users.length * 0.1) - Math.floor(users.length * 0.12) - 
        Math.floor(users.length * 0.15) - Math.floor(users.length * 0.18) }
    ];
    
    return monthlyGrowth;
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics Dashboard</h1>
      
      {/* Time range filter */}
      <div className="mb-6">
        <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
          Time Range
        </label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last 12 months</option>
        </select>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase font-medium">Total Visits</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalVisits}</p>
          <div className="mt-4 flex items-center text-sm">
            <svg className="w-4 h-4 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
            </svg>
            <span className="text-green-500">12% growth</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase font-medium">Average Daily Visits</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {Math.round(analytics.visitsPerDay.reduce((sum, day) => sum + day.visits, 0) / analytics.visitsPerDay.length)}
          </p>
          <div className="mt-4 flex items-center text-sm">
            <svg className="w-4 h-4 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
            </svg>
            <span className="text-green-500">8% growth</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase font-medium">Top Visited Atoll</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {analytics.topAtolls.length > 0 ? analytics.topAtolls[0].name : 'N/A'}
          </p>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {analytics.topAtolls.length > 0 ? `${analytics.topAtolls[0].visits} visits` : ''}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase font-medium">Top Visited Island</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {analytics.topIslands.length > 0 ? analytics.topIslands[0].name : 'N/A'}
          </p>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {analytics.topIslands.length > 0 ? `${analytics.topIslands[0].visits} visits` : ''}
            </span>
          </div>
        </div>
      </div>
      
      {/* Visits over time chart */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Visits Over Time</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end space-x-2">
            {analytics.visitsPerDay.slice(-14).map((day, index) => (
              <div key={day.date} className="relative flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(day.visits / 20) * 100}%`,
                    maxHeight: '90%',
                    minHeight: '5%'
                  }}
                ></div>
                <div className="absolute bottom-0 transform translate-y-full mt-2 text-xs text-gray-500">
                  {index % 2 === 0 ? new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Top islands and atolls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Top islands table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Visited Islands</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Island</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atoll</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topIslands.map((island) => (
                  <tr key={island.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{island.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{island.atoll}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{island.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{island.visits}</td>
                  </tr>
                ))}
                {analytics.topIslands.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top atolls table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Atolls</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atoll</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Islands</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topAtolls.map((atoll) => (
                  <tr key={atoll.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{atoll.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{atoll.islands}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{atoll.visits}</td>
                  </tr>
                ))}
                {analytics.topAtolls.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* User growth */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">User Growth</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end space-x-6 px-10">
            {analytics.userGrowth.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-500 rounded-t"
                  style={{ 
                    height: `${(item.users / Math.max(...analytics.userGrowth.map(i => i.users))) * 100}%`,
                    maxHeight: '90%',
                    minHeight: '5%'
                  }}
                ></div>
                <div className="mt-2 text-xs text-gray-500">{item.month}</div>
                <div className="text-xs font-medium">{item.users}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}