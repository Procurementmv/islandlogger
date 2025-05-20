import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    placement: 'header', // Default value
    image_url: '',
    destination_url: '',
    alt_text: '',
    size: '728x90', // Default value
    is_active: true,
    start_date: '',
    end_date: ''
  });
  
  // Available placement options
  const placementOptions = [
    { value: 'header', label: 'Header Banner' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'footer', label: 'Footer' },
    { value: 'blog-inline', label: 'Blog Inline' },
    { value: 'island-detail', label: 'Island Detail Page' }
  ];
  
  // Available size options
  const sizeOptions = [
    { value: '728x90', label: 'Leaderboard (728x90)' },
    { value: '300x250', label: 'Medium Rectangle (300x250)' },
    { value: '160x600', label: 'Wide Skyscraper (160x600)' },
    { value: '320x50', label: 'Mobile Banner (320x50)' },
    { value: '468x60', label: 'Banner (468x60)' }
  ];
  
  useEffect(() => {
    if (id) {
      fetchAdData();
    }
  }, [id]);
  
  const fetchAdData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API}/ads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ad = response.data;
      
      // Format dates for input fields
      const formattedStartDate = ad.start_date ? new Date(ad.start_date).toISOString().split('T')[0] : '';
      const formattedEndDate = ad.end_date ? new Date(ad.end_date).toISOString().split('T')[0] : '';
      
      setFormData({
        name: ad.name,
        description: ad.description || '',
        placement: ad.placement,
        image_url: ad.image_url || '',
        destination_url: ad.destination_url,
        alt_text: ad.alt_text || '',
        size: ad.size,
        is_active: ad.is_active,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching ad:', err);
      setError('Failed to load ad data. Please try again later.');
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        // Convert empty strings to null for dates
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };
      
      if (id) {
        // Update existing ad
        await axios.put(`${API}/admin/ads/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new ad
        await axios.post(`${API}/admin/ads`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      navigate('/admin/ads');
    } catch (err) {
      console.error('Error saving ad:', err);
      setError('Failed to save ad. Please check the form and try again.');
      setSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {id ? 'Edit Ad' : 'Create New Ad'}
      </h1>
      
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
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Ad Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the advertisement.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Ad Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Brief description of the ad"
                  ></textarea>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="placement" className="block text-sm font-medium text-gray-700">
                    Placement*
                  </label>
                  <select
                    id="placement"
                    name="placement"
                    required
                    value={formData.placement}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {placementOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                    Size*
                  </label>
                  <select
                    id="size"
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {sizeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    id="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL to the advertisement image. Leave empty for text/HTML ads.
                  </p>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="destination_url" className="block text-sm font-medium text-gray-700">
                    Destination URL*
                  </label>
                  <input
                    type="url"
                    name="destination_url"
                    id="destination_url"
                    required
                    value={formData.destination_url}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://advertiser-website.com/landing-page"
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="alt_text" className="block text-sm font-medium text-gray-700">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    name="alt_text"
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Descriptive text for accessibility"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to start immediately
                  </p>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for no expiration
                  </p>
                </div>
                
                <div className="col-span-6">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_active" className="font-medium text-gray-700">Active</label>
                      <p className="text-gray-500">Enable this ad to be displayed on the site</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/ads')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}