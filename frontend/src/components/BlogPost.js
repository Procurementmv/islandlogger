import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchBlogPost();
  }, [slug]);
  
  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/blog/${slug}`);
      setPost(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post. It may have been removed or there is a temporary issue.');
      setLoading(false);
    }
  };
  
  // Format date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Blog post not found'}</p>
              <button 
                onClick={() => navigate('/blog')}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Go back to blog
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Blog
        </Link>
      </div>
      
      <article className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Featured image */}
        {post.featured_image && (
          <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          {/* Post metadata */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
            <time dateTime={post.published_date || post.created_at}>
              {formatDate(post.published_date || post.created_at)}
            </time>
            
            {post.tags.length > 0 && (
              <div className="flex items-center ml-4">
                <span className="sr-only">Tags:</span>
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {post.tags.map((tag, index) => (
                  <span key={tag}>
                    <Link
                      to={`/blog?tag=${tag}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {tag}
                    </Link>
                    {index < post.tags.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Post title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          {/* Post content */}
          <div 
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
      
      {/* Ad space */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <p className="text-xs text-gray-500 uppercase mb-2 text-center">Advertisement</p>
        <div className="bg-gray-100 h-20 flex items-center justify-center text-gray-400">
          Ad Space - 728x90
        </div>
      </div>
      
      {/* Related posts would go here */}
    </div>
  );
}