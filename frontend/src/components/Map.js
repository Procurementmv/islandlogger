import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fix for Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Custom icon function
const createCustomIcon = (type, isVisited) => {
  return L.divIcon({
    className: `custom-marker-icon marker-${type} ${isVisited ? 'marker-visited' : ''}`,
    iconSize: [25, 25],
    html: ''
  });
};

export default function Map({ islands }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visitedIslands, setVisitedIslands] = useState([]);
  const [filterType, setFilterType] = useState('all');
  
  // Center of the Maldives for initial map view
  const position = [3.2028, 73.2207];

  useEffect(() => {
    if (user) {
      fetchVisitedIslands();
    }
  }, [user]);

  const fetchVisitedIslands = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/islands/visited`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Create an array of visited island IDs for lookups
      const visitedIds = response.data.map(island => island.id);
      setVisitedIslands(visitedIds);
    } catch (error) {
      console.error('Error fetching visited islands:', error);
    }
  };

  const filteredIslands = filterType === 'all' 
    ? islands 
    : islands.filter(island => island.type === filterType);

  const openIslandDetails = (islandId) => {
    navigate(`/island/${islandId}`);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Island type filter buttons */}
      <div className="bg-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilterType('all')}
            >
              All Islands
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'resort' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilterType('resort')}
            >
              Resorts
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'inhabited' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilterType('inhabited')}
            >
              Inhabited
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'uninhabited' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilterType('uninhabited')}
            >
              Uninhabited
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'industrial' 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setFilterType('industrial')}
            >
              Industrial
            </button>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-grow relative">
        <MapContainer 
          center={position} 
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {filteredIslands.map(island => {
            const isVisited = visitedIslands.includes(island.id);
            return (
              <Marker
                key={island.id}
                position={[island.lat, island.lng]}
                icon={createCustomIcon(island.type, isVisited)}
                eventHandlers={{
                  click: () => openIslandDetails(island.id)
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold">{island.name}</h3>
                    <p className="text-sm text-gray-600">{island.atoll} Atoll</p>
                    <p className="capitalize mt-1 text-xs px-2 py-1 rounded bg-gray-100">
                      {island.type}
                      {island.population && ` • Pop: ${island.population.toLocaleString()}`}
                    </p>
                    {isVisited && (
                      <div className="mt-2 text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                        ✓ Visited
                      </div>
                    )}
                    <button 
                      onClick={() => openIslandDetails(island.id)}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded w-full"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Map sidebar - Ad space (desktop only) */}
        <div className="hidden lg:block absolute top-4 right-4 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-[1000]">
          <div className="p-4">
            <h3 className="font-bold text-gray-800 mb-2">Island Type Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span>Inhabited Island</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span>Resort Island</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                <span>Uninhabited Island</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
                <span>Industrial Island</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full border-2 border-pink-500 mr-2"></div>
                <span>Visited Island</span>
              </div>
            </div>
          </div>
          
          {/* Ad space in sidebar */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 uppercase mb-2">Advertisement</p>
            <div className="bg-gray-100 h-48 flex items-center justify-center text-gray-400 text-sm">
              Ad Space - 300x250
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}