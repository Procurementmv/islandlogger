import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BlogPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    excerpt: '',
    featured_image: '',
    tags: [],
    is_published: true,
    is_featured: false,
    featured_order: '',
    published_date: ''
  });
  
  // New tag input state
  const [newTag, setNewTag] = useState('');
  
  useEffect(() => {
    if (id) {
      fetchBlogPostData();
    }
  }, [id]);
  
  // When title changes, generate a slug
  useEffect(() => {
    if (!formData.slug || formData.slug === '') {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [formData.title]);
  
  const fetchBlogPostData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // In a real implementation, there would be an endpoint to get a specific post by ID
      // Here we'll fetch all posts and find the one we want
      const response = await axios.get(`${API}/blog?published_only=false`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const post = response.data.find(post => post.id === id);
      
      if (!post) {
        setError('Blog post not found');
        setIsLoading(false);
        return;
      }
      
      // Format dates for input fields
      const formattedPublishedDate = post.published_date ? new Date(post.published_date).toISOString().split('T')[0] : '';
      
      setFormData({
        title: post.title,
        content: post.content,
        slug: post.slug,
        excerpt: post.excerpt || '',
        featured_image: post.featured_image || '',
        tags: post.tags || [],
        is_published: post.is_published,
        is_featured: post.is_featured || false,
        featured_order: post.featured_order || '',
        published_date: formattedPublishedDate
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post data. Please try again later.');
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
  
  const handleAddTag = () => {
    if (newTag.trim() !== '' && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (id) {
        // Update existing post
        await axios.put(`${API}/admin/blog/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new post
        await axios.post(`${API}/admin/blog`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      navigate('/admin/blog');
    } catch (err) {
      console.error('Error saving blog post:', err);
      setError(err.response?.data?.detail || 'Failed to save blog post. Please check the form and try again.');
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
        {id ? 'Edit Blog Post' : 'Create New Blog Post'}
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Blog Post Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the blog post.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug*
                  </label>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The URL-friendly version of the title. Will be auto-generated if left empty.
                  </p>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                    Excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows="3"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="A brief summary of the post"
                  ></textarea>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content*
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows="10"
                    required
                    value={formData.content}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Your blog post content here. HTML is supported."
                  ></textarea>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    name="featured_image"
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                  
                  {formData.featured_image && (
                    <div className="mt-2">
                      <img 
                        src={formData.featured_image} 
                        alt="Featured preview" 
                        className="h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
                
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="newTag"
                      id="newTag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-800 hover:bg-blue-300"
                        >
                          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="published_date" className="block text-sm font-medium text-gray-700">
                    Published Date
                  </label>
                  <input
                    type="date"
                    name="published_date"
                    id="published_date"
                    value={formData.published_date}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to use current date
                  </p>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="featured_order" className="block text-sm font-medium text-gray-700">
                    Featured Order
                  </label>
                  <input
                    type="number"
                    name="featured_order"
                    id="featured_order"
                    min="1"
                    value={formData.featured_order}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Order in featured articles list (if featured)
                  </p>
                </div>
                
                <div className="col-span-6 space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="is_published"
                        id="is_published"
                        checked={formData.is_published}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_published" className="font-medium text-gray-700">Published</label>
                      <p className="text-gray-500">Make this post visible to all users</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="is_featured"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_featured" className="font-medium text-gray-700">Featured</label>
                      <p className="text-gray-500">Show this post in the featured articles section</p>
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
            onClick={() => navigate('/admin/blog')}
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