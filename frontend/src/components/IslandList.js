import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function IslandList() {
  const { user } = useAuth();
  const [islands, setIslands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitedIslands, setVisitedIslands] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAtoll, setFilterAtoll] = useState('all');
  const [atolls, setAtolls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [islandsPerPage] = useState(12);
  
  useEffect(() => {
    fetchIslands();
  }, []);
  
  useEffect(() => {
    if (user) {
      fetchVisitedIslands();
    }
    
    // Extract unique atolls from islands
    const uniqueAtolls = [...new Set(islands.map(island => island.atoll))].sort();
    setAtolls(uniqueAtolls);
  }, [user, islands]);
  
  const fetchIslands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/islands`);
      setIslands(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching islands:", err);
      setError("Failed to load island data. Please try again later.");
      setLoading(false);
    }
  };
  
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
      // If there's an error, set visitedIslands to an empty array
      setVisitedIslands([]);
    }
  };
  
  const filteredIslands = islands.filter(island => {
    // Type filter
    const matchesType = filterType === 'all' || island.type === filterType;
    
    // Atoll filter
    const matchesAtoll = filterAtoll === 'all' || island.atoll === filterAtoll;
    
    // Search query
    const matchesSearch = searchQuery === '' || 
      island.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      island.atoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (island.tags && island.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesType && matchesAtoll && matchesSearch;
  });
  
  // Get current islands for pagination
  const indexOfLastIsland = currentPage * islandsPerPage;
  const indexOfFirstIsland = indexOfLastIsland - islandsPerPage;
  const currentIslands = filteredIslands.slice(indexOfFirstIsland, indexOfLastIsland);
  
  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);
  
  // Total pages
  const totalPages = Math.ceil(filteredIslands.length / islandsPerPage);
  
  // Get type color based on island type
  const getTypeColor = (type) => {
    switch(type) {
      case 'resort': return 'bg-green-100 text-green-800';
      case 'inhabited': return 'bg-blue-100 text-blue-800';
      case 'uninhabited': return 'bg-yellow-100 text-yellow-800';
      case 'industrial': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-3 py-1 mx-1 rounded-md ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };
  
  // Render ad after every 4 rows (assuming 3 cards per row)
  const renderIslandCards = () => {
    const cards = [];
    const itemsPerRow = 3;
    const rowsBeforeAd = 4;
    
    currentIslands.forEach((island, index) => {
      const isVisited = visitedIslands.includes(island.id);
      
      cards.push(
        <Link
          key={island.id}
          to={`/island/${island.id}`}
          className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          {/* Island Image */}
          <div className="relative h-48 bg-blue-100 overflow-hidden">
            {island.featured_image ? (
              <img 
                src={island.featured_image} 
                alt={island.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-teal-500">
                <span className="text-white text-xl font-bold">{island.name}</span>
              </div>
            )}
            
            {/* Visited badge */}
            {isVisited && (
              <div className="absolute top-3 right-3 bg-pink-500 text-white rounded-full px-2 py-1 text-xs font-bold shadow-md">
                Visited
              </div>
            )}
          </div>
          
          {/* Island Info */}
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{island.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{island.atoll} Atoll</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(island.type)}`}>
                  {island.type}
                </span>
                
                {island.population ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    Pop: {island.population.toLocaleString()}
                  </span>
                ) : null}
              </div>
              
              {island.description && (
                <p className="text-sm text-gray-700 line-clamp-2 mb-3">{island.description}</p>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-auto">
              <div className="flex gap-1">
                {island.tags && island.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Details
              </button>
            </div>
          </div>
        </Link>
      );
      
      // Add an ad after every 4 rows
      if ((index + 1) % (itemsPerRow * rowsBeforeAd) === 0 && index < currentIslands.length - 1) {
        cards.push(
          <div key={`ad-${index}`} className="col-span-3 my-6">
            <p className="text-xs text-gray-500 uppercase text-center mb-2">Advertisement</p>
            <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              <p>Ad Space - 728x90</p>
            </div>
          </div>
        );
      }
    });
    
    return cards;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Ad space - Header Banner */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 uppercase text-center mb-2">Advertisement</p>
        <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          <p>Ad Space - 728x90</p>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Maldives Islands</h1>
      
      {/* Filters section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Islands
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, atoll, or tag..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Atoll filter */}
          <div>
            <label htmlFor="atoll" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Atoll
            </label>
            <select
              id="atoll"
              value={filterAtoll}
              onChange={(e) => {
                setFilterAtoll(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Atolls</option>
              {atolls.map(atoll => (
                <option key={atoll} value={atoll}>{atoll}</option>
              ))}
            </select>
          </div>
          
          {/* Results counter */}
          <div className="flex items-end">
            <p className="text-sm text-gray-500">
              Showing {currentIslands.length} of {filteredIslands.length} islands
              {filteredIslands.length !== islands.length && 
                ` (filtered from ${islands.length} total)`}
            </p>
          </div>
        </div>
        
        {/* Island type filters */}
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => {
              setFilterType('all');
              setCurrentPage(1);
            }}
          >
            All Islands
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'resort' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => {
              setFilterType('resort'); 
              setCurrentPage(1);
            }}
          >
            Resorts
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'inhabited' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => {
              setFilterType('inhabited');
              setCurrentPage(1);
            }}
          >
            Inhabited
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'uninhabited' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => {
              setFilterType('uninhabited');
              setCurrentPage(1);
            }}
          >
            Uninhabited
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'industrial' 
              ? 'bg-gray-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => {
              setFilterType('industrial');
              setCurrentPage(1);
            }}
          >
            Industrial
          </button>
        </div>
      </div>
      
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Island grid with ads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderIslandCards()}
      </div>
      
      {/* Side Banner Ad - Only visible on larger screens */}
      <div className="hidden lg:block fixed right-4 top-32 w-64">
        <p className="text-xs text-gray-500 uppercase text-center mb-2">Advertisement</p>
        <div className="bg-gray-100 h-[600px] w-[160px] rounded flex items-center justify-center text-gray-400 mx-auto">
          <p className="transform -rotate-90">Ad Space - 160x600</p>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 mx-1 rounded-md ${
              currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Prev
          </button>
          
          {renderPaginationButtons()}
          
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 mx-1 rounded-md ${
              currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Ad space - Footer Banner */}
      <div className="mt-12">
        <p className="text-xs text-gray-500 uppercase text-center mb-2">Advertisement</p>
        <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          <p>Ad Space - 728x90</p>
        </div>
      </div>
    </div>
  );
}