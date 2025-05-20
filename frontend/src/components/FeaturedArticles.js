import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FeaturedArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchFeaturedArticles();
  }, []);
  
  const fetchFeaturedArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/featured/articles`);
      setArticles(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching featured articles:', err);
      setError('Failed to load featured articles. Please try again later.');
      setLoading(false);
    }
  };
  
  // Format date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Create excerpt from content if none provided
  const getExcerpt = (article) => {
    if (article.excerpt) return article.excerpt;
    
    // Strip HTML tags and truncate to 120 chars
    const strippedContent = article.content.replace(/<[^>]*>?/gm, '');
    return strippedContent.length > 120 
      ? strippedContent.substring(0, 120) + '...'
      : strippedContent;
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
  
  if (articles.length === 0) {
    return null; // Hide this section if no featured articles
  }
  
  // Split articles into main feature and rest
  const mainFeature = articles[0];
  const secondaryArticles = articles.slice(1, 4); // Get next 3 articles
  const remainingArticles = articles.slice(4); // Get remaining articles
  
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Featured Stories
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Explore the latest guides, tips, and tales from the Maldivian islands
          </p>
        </div>
        
        <div className="mt-12">
          {/* Main feature */}
          {mainFeature && (
            <div className="mb-10">
              <Link to={`/blog/${mainFeature.slug}`} className="block">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <div className="md:flex">
                    {mainFeature.featured_image && (
                      <div className="md:flex-shrink-0 h-64 md:h-auto">
                        <img 
                          className="h-full w-full md:w-96 object-cover" 
                          src={mainFeature.featured_image} 
                          alt={mainFeature.title} 
                        />
                      </div>
                    )}
                    <div className="p-8 bg-white">
                      <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                        Featured Article
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                        {mainFeature.title}
                      </h3>
                      <p className="mt-4 text-gray-600">
                        {getExcerpt(mainFeature)}
                      </p>
                      <div className="mt-6 flex items-center">
                        <div className="text-sm text-gray-500">
                          <span>{formatDate(mainFeature.published_date || mainFeature.created_at)}</span>
                        </div>
                        <div className="ml-auto">
                          <span className="text-blue-500 inline-flex items-center">
                            Read more
                            <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
          
          {/* Secondary features */}
          {secondaryArticles.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {secondaryArticles.map(article => (
                <Link 
                  key={article.id} 
                  to={`/blog/${article.slug}`} 
                  className="block bg-white rounded-lg overflow-hidden shadow-md transform transition duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {article.featured_image && (
                    <div className="h-48 w-full">
                      <img 
                        className="h-full w-full object-cover" 
                        src={article.featured_image} 
                        alt={article.title} 
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-gray-600 line-clamp-3">
                      {getExcerpt(article)}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <span>{formatDate(article.published_date || article.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Remaining articles in a smaller grid */}
          {remainingArticles.length > 0 && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {remainingArticles.map(article => (
                <Link 
                  key={article.id} 
                  to={`/blog/${article.slug}`} 
                  className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow"
                >
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {getExcerpt(article)}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatDate(article.published_date || article.created_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse All Articles
            <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}