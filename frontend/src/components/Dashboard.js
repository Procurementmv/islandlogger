import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const { user } = useAuth();
  const [visitedIslands, setVisitedIslands] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueIslands: 0,
    atolls: new Set(),
    types: {}
  });
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch user's visited islands
      const islandsResponse = await axios.get(`${API}/islands/visited`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch user's visits
      const visitsResponse = await axios.get(`${API}/visits/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const islands = islandsResponse.data;
      const userVisits = visitsResponse.data;
      
      setVisitedIslands(islands);
      setVisits(userVisits);
      
      // Calculate stats
      const uniqueIslandIds = new Set(islands.map(island => island.id));
      const atolls = new Set(islands.map(island => island.atoll));
      
      // Count islands by type
      const typeCount = islands.reduce((acc, island) => {
        acc[island.type] = (acc[island.type] || 0) + 1;
        return acc;
      }, {});
      
      setStats({
        totalVisits: userVisits.length,
        uniqueIslands: uniqueIslandIds.size,
        atolls: atolls,
        types: typeCount
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };
  
  // Calculate badges
  const calculateBadges = () => {
    const badges = [];
    
    // Islands visited badges
    if (stats.uniqueIslands >= 10) {
      badges.push({
        name: "Island Explorer",
        description: "Visited 10+ islands",
        icon: "🏝️",
        earned: true
      });
    } else {
      badges.push({
        name: "Island Explorer",
        description: "Visit 10+ islands",
        icon: "🏝️",
        earned: false,
        progress: (stats.uniqueIslands / 10) * 100
      });
    }
    
    // Resort explorer
    const resortsVisited = stats.types.resort || 0;
    if (resortsVisited >= 5) {
      badges.push({
        name: "Resort Connoisseur",
        description: "Visited 5+ resort islands",
        icon: "🏖️",
        earned: true
      });
    } else {
      badges.push({
        name: "Resort Connoisseur",
        description: "Visit 5+ resort islands",
        icon: "🏖️",
        earned: false,
        progress: (resortsVisited / 5) * 100
      });
    }
    
    // Local explorer
    const localIslandsVisited = stats.types.inhabited || 0;
    if (localIslandsVisited >= 5) {
      badges.push({
        name: "Local Explorer",
        description: "Visited 5+ inhabited islands",
        icon: "🏘️",
        earned: true
      });
    } else {
      badges.push({
        name: "Local Explorer",
        description: "Visit 5+ inhabited islands",
        icon: "🏘️",
        earned: false,
        progress: (localIslandsVisited / 5) * 100
      });
    }
    
    // Atoll badges
    const atollCount = stats.atolls.size;
    if (atollCount >= 3) {
      badges.push({
        name: "Atoll Hopper",
        description: "Visited islands in 3+ different atolls",
        icon: "🧭",
        earned: true
      });
    } else {
      badges.push({
        name: "Atoll Hopper",
        description: "Visit islands in 3+ different atolls",
        icon: "🧭",
        earned: false,
        progress: (atollCount / 3) * 100
      });
    }
    
    return badges;
  };
  
  const badges = calculateBadges();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mt-8 mb-6">Your Island Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h2 className="text-lg text-gray-500">Total Visits</h2>
          <p className="text-4xl font-bold text-blue-600">{stats.totalVisits}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h2 className="text-lg text-gray-500">Islands Visited</h2>
          <p className="text-4xl font-bold text-green-600">{stats.uniqueIslands}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h2 className="text-lg text-gray-500">Atolls Explored</h2>
          <p className="text-4xl font-bold text-yellow-600">{stats.atolls.size}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h2 className="text-lg text-gray-500">Resorts Visited</h2>
          <p className="text-4xl font-bold text-purple-600">{stats.types.resort || 0}</p>
        </div>
      </div>
      
      {/* Badges Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold">Your Badges</h2>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {badges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className={`badge mx-auto ${badge.earned ? 'badge-earned' : ''}`}>
                  <span className="badge-icon">{badge.icon}</span>
                </div>
                <h3 className="mt-2 font-medium">{badge.name}</h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
                
                {!badge.earned && badge.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${badge.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(badge.progress)}% complete</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Visited Islands */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Islands You've Visited</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
            View on Map
          </Link>
        </div>
        
        <div className="p-4">
          {visitedIslands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You haven't visited any islands yet.</p>
              <Link to="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Explore the Map
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visitedIslands.map(island => (
                <Link 
                  key={island.id} 
                  to={`/island/${island.id}`}
                  className="island-card block bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md"
                >
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{island.name}</h3>
                    <p className="text-sm text-gray-600">{island.atoll} Atoll</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize
                        ${island.type === 'resort' ? 'bg-green-100 text-green-800' : 
                         island.type === 'inhabited' ? 'bg-blue-100 text-blue-800' :
                         island.type === 'uninhabited' ? 'bg-yellow-100 text-yellow-800' :
                         'bg-gray-100 text-gray-800'}`}
                      >
                        {island.type}
                      </span>
                      
                      {/* Count of visits to this island */}
                      {visits.filter(v => v.island_id === island.id).length > 1 && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {visits.filter(v => v.island_id === island.id).length} visits
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Visits */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold">Recent Visits</h2>
        </div>
        
        <div className="p-4">
          {visits.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No visits recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {visits.slice(0, 5).map(visit => {
                const island = visitedIslands.find(i => i.id === visit.island_id);
                return (
                  <div key={visit.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/island/${visit.island_id}`} className="font-medium hover:text-blue-600">
                          {island ? island.name : 'Unknown Island'}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </p>
                      </div>
                      {island && (
                        <span className={`text-xs px-2 py-1 rounded-full capitalize
                          ${island.type === 'resort' ? 'bg-green-100 text-green-800' : 
                           island.type === 'inhabited' ? 'bg-blue-100 text-blue-800' :
                           island.type === 'uninhabited' ? 'bg-yellow-100 text-yellow-800' :
                           'bg-gray-100 text-gray-800'}`}
                        >
                          {island.type}
                        </span>
                      )}
                    </div>
                    {visit.notes && (
                      <p className="mt-2 text-sm text-gray-700">{visit.notes}</p>
                    )}
                  </div>
                );
              })}
              
              {visits.length > 5 && (
                <div className="text-center pt-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View all {visits.length} visits
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Ad space */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <p className="text-xs text-gray-500 uppercase mb-2 text-center">Advertisement</p>
        <div className="bg-gray-100 h-32 flex items-center justify-center text-gray-400">
          Ad Space - 728x90
        </div>
      </div>
    </div>
  );
}