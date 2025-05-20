import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FeaturedIslands() {
  const [islands, setIslands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchFeaturedIslands();
  }, []);
  
  const fetchFeaturedIslands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/featured/islands`);
      setIslands(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching featured islands:', err);
      setError('Failed to load featured islands. Please try again later.');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin mx-auto rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return null; // Hide this section on error instead of showing error message
  }
  
  if (islands.length === 0) {
    return null; // Hide this section if no featured islands
  }
  
  return (
    <div className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Featured Islands
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover our handpicked selection of must-visit destinations in the Maldives
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {islands.map(island => (
            <Link
              key={island.id}
              to={`/island/${island.id}`}
              className="group"
            >
              <div className="relative rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 h-64">
                {/* Background image */}
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center"
                  style={{ 
                    backgroundImage: island.featured_image 
                      ? `url(${island.featured_image})` 
                      : `url(https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)` 
                  }}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                </div>
                
                {/* Island name and type */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-xl">{island.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-sm">{island.atoll} Atoll</span>
                    <span className="mx-2">•</span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize
                      ${island.type === 'resort' ? 'bg-green-100 text-green-800' : 
                      island.type === 'inhabited' ? 'bg-blue-100 text-blue-800' :
                      island.type === 'uninhabited' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}
                    >
                      {island.type}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Explore All Islands
            <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}