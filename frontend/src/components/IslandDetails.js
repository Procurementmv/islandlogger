import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import IslandGallery from './IslandGallery';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function IslandDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [island, setIsland] = useState(null);
  const [isVisited, setIsVisited] = useState(false);
  const [userVisits, setUserVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIslandDetails();
    if (user) {
      fetchUserVisits();
    }
  }, [id, user]);

  const fetchIslandDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/islands/${id}`);
      setIsland(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching island details:', err);
      setError('Failed to load island details.');
      setLoading(false);
    }
  };

  const fetchUserVisits = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/visits/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const visits = response.data;
      const islandVisits = visits.filter(visit => visit.island_id === id);
      
      setUserVisits(islandVisits);
      setIsVisited(islandVisits.length > 0);
    } catch (error) {
      console.error('Error fetching user visits:', error);
    }
  };

  const handleMarkVisited = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`${API}/visits`, {
        island_id: id,
        visit_date: new Date(visitDate).toISOString(),
        notes: notes,
        photos: []
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh visits
      fetchUserVisits();
      setNotes('');
      setSubmitting(false);
    } catch (error) {
      console.error('Error marking island as visited:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !island) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p>{error || 'Island not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Map
        </button>
      </div>
    );
  }

  // Get type-specific color classes
  const getTypeColorClasses = () => {
    switch (island.type) {
      case 'resort':
        return 'bg-green-100 text-green-800';
      case 'inhabited':
        return 'bg-blue-100 text-blue-800';
      case 'uninhabited':
        return 'bg-yellow-100 text-yellow-800';
      case 'industrial':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center mb-4 text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Map
      </button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Island header */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{island.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
              {island.atoll} Atoll
            </span>
            <span className={`text-sm px-3 py-1 rounded-full capitalize ${getTypeColorClasses()}`}>
              {island.type}
            </span>
            {isVisited && (
              <span className="text-sm bg-pink-100 text-pink-800 px-3 py-1 rounded-full">
                ✓ Visited
              </span>
            )}
          </div>
        </div>
        
        {/* Island details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">About this Island</h2>
              <p className="text-gray-700 mb-4">{island.description || 'No description available.'}</p>
              
              <div className="border-t border-gray-200 py-4">
                <h3 className="font-semibold mb-2">Island Details</h3>
                <dl className="space-y-2">
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Type:</dt>
                    <dd className="col-span-2 capitalize">{island.type}</dd>
                  </div>
                  
                  {island.population && (
                    <div className="grid grid-cols-3">
                      <dt className="text-gray-500">Population:</dt>
                      <dd className="col-span-2">{island.population.toLocaleString()}</dd>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Coordinates:</dt>
                    <dd className="col-span-2">{island.lat.toFixed(4)}, {island.lng.toFixed(4)}</dd>
                  </div>
                </dl>
              </div>
              
              {/* Tags */}
              {island.tags && island.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {island.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - Visit log section */}
            <div>
              <h2 className="text-xl font-semibold mb-3">
                {isVisited ? 'Your Visit Log' : 'Mark as Visited'}
              </h2>
              
              {/* User visits */}
              {isVisited && userVisits.length > 0 && (
                <div className="mb-6">
                  <div className="space-y-4">
                    {userVisits.map(visit => (
                      <div key={visit.id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            {new Date(visit.visit_date).toLocaleDateString()}
                          </span>
                        </div>
                        {visit.notes && (
                          <p className="mt-2 text-sm text-gray-700">{visit.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add visit form */}
              <form onSubmit={handleMarkVisited} className="bg-gray-50 rounded p-4">
                <h3 className="font-semibold mb-3">
                  {isVisited ? 'Add Another Visit' : 'Mark as Visited'}
                </h3>
                
                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-4">
                    Please <a href="/login" className="underline font-medium">login</a> to track your visits.
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visit Date
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!user}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Share your experience..."
                      disabled={!user}
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting || !user}
                    className={`w-full py-2 px-4 rounded font-medium text-white 
                      ${submitting || !user ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {submitting ? 'Saving...' : 'Mark as Visited'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ad space */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <p className="text-xs text-gray-500 uppercase mb-2 text-center">Advertisement</p>
        <div className="bg-gray-100 h-20 flex items-center justify-center text-gray-400">
          Ad Space - 728x90
        </div>
      </div>
    </div>
  );
}