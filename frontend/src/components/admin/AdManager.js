import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdManager() {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, adId: null });
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchAds();
  }, []);
  
  const fetchAds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API}/admin/ads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAds(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError('Failed to load ads. Please try again later.');
      setLoading(false);
    }
  };
  
  const deleteAd = async (adId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API}/admin/ads/${adId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted ad from the list
      setAds(ads.filter(ad => ad.id !== adId));
      setDeleteDialog({ open: false, adId: null });
    } catch (err) {
      console.error('Error deleting ad:', err);
      setError('Failed to delete the ad. Please try again.');
    }
  };
  
  // Filter ads
  const filteredAds = ads.filter(ad => {
    if (filter === 'all') return true;
    if (filter === 'active') return ad.is_active;
    if (filter === 'inactive') return !ad.is_active;
    if (filter === 'expired') {
      if (!ad.end_date) return false;
      return new Date(ad.end_date) < new Date();
    }
    if (filter === 'future') {
      if (!ad.start_date) return false;
      return new Date(ad.start_date) > new Date();
    }
    return true;
  });
  
  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Ad Space Management</h1>
        <Link
          to="/admin/ads/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Ad
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filter Ads
        </label>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setFilter('all')}
          >
            All Ads
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'active' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'inactive' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'expired' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setFilter('expired')}
          >
            Expired
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'future' 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setFilter('future')}
          >
            Future
          </button>
        </div>
      </div>
      
      {filteredAds.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">No ads found</h3>
            <div className="mt-2 max-w-xl mx-auto text-sm text-gray-500">
              <p>
                {filter !== 'all' 
                  ? 'Try adjusting your filter.' 
                  : 'Get started by creating your first ad.'}
              </p>
            </div>
            {filter !== 'all' ? (
              <div className="mt-5 flex flex-wrap gap-4">
                <Link
                  to="/admin/ads/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Manage Ads
                </Link>
              </div>
            ) : (
              <div className="mt-5">
                <Link
                  to="/admin/ads/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Ad
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Placement
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAds.map(ad => (
                      <tr key={ad.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {ad.image_url && (
                              <div className="flex-shrink-0 h-10 w-10 mr-4">
                                <img className="h-10 w-10 rounded-sm object-cover" src={ad.image_url} alt="" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {ad.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ad.description && ad.description.length > 30 
                                  ? `${ad.description.substring(0, 30)}...` 
                                  : ad.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ad.placement}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ad.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>From: {formatDate(ad.start_date)}</div>
                          <div>To: {formatDate(ad.end_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${ad.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <a 
                              href={ad.destination_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Link
                            </a>
                            <Link
                              to={`/admin/ads/edit/${ad.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setDeleteDialog({ open: true, adId: ad.id })}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      {deleteDialog.open && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Ad
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this ad? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => deleteAd(deleteDialog.adId)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setDeleteDialog({ open: false, adId: null })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}