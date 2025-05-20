import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);
  
  useEffect(() => {
    fetchBlogPosts();
  }, [selectedTag]);
  
  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      
      // Construct URL based on whether a tag is selected
      let url = `${API}/blog?limit=20`;
      if (selectedTag) {
        url += `&tag=${selectedTag}`;
      }
      
      const response = await axios.get(url);
      setPosts(response.data);
      
      // Extract all unique tags from posts
      if (!selectedTag) {
        const allTags = response.data.reduce((acc, post) => {
          post.tags.forEach(tag => acc.add(tag));
          return acc;
        }, new Set());
        
        setTags(Array.from(allTags));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
      setLoading(false);
    }
  };
  
  const clearTagFilter = () => {
    setSelectedTag(null);
  };
  
  // Format date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Create excerpt from content if none provided
  const getExcerpt = (post) => {
    if (post.excerpt) return post.excerpt;
    
    // Strip HTML tags and truncate to 150 chars
    const strippedContent = post.content.replace(/<[^>]*>?/gm, '');
    return strippedContent.length > 150 
      ? strippedContent.substring(0, 150) + '...'
      : strippedContent;
  };
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Island Tracker Blog</h1>
        <p className="mt-2 text-lg text-gray-600">Stories, updates, and guides about the Maldives islands</p>
      </div>
      
      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedTag && (
              <button
                onClick={clearTagFilter}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                <span>Clear filter</span>
                <svg className="ml-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {!selectedTag && tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {selectedTag && (
        <div className="mb-8 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Showing posts tagged with: {selectedTag}
          </span>
        </div>
      )}
      
      {/* Blog posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No blog posts found.</p>
          {selectedTag && (
            <button
              onClick={clearTagFilter}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <div key={post.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
              {post.featured_image && (
                <div className="flex-shrink-0">
                  <img className="h-48 w-full object-cover" src={post.featured_image} alt={post.title} />
                </div>
              )}
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-600">
                    <span className="hover:underline">
                      {formatDate(post.published_date || post.created_at)}
                    </span>
                  </p>
                  <Link to={`/blog/${post.slug}`} className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900">{post.title}</p>
                    <p className="mt-3 text-base text-gray-500">{getExcerpt(post)}</p>
                  </Link>
                </div>
                
                {post.tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-base font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Read full story →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Ad space */}
      <div className="mt-16 p-4 bg-white rounded-lg shadow">
        <p className="text-xs text-gray-500 uppercase mb-2 text-center">Advertisement</p>
        <div className="bg-gray-100 h-32 flex items-center justify-center text-gray-400">
          Ad Space - 728x90
        </div>
      </div>
    </div>
  );
}