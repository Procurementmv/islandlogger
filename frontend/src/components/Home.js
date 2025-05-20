import { Link } from 'react-router-dom';
import FeaturedIslands from './FeaturedIslands';
import FeaturedArticles from './FeaturedArticles';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-blue-600">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Maldives Islands"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-transparent mix-blend-multiply"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Maldives Island Tracker
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl">
              Discover, track, and share your adventures across the beautiful islands of the Maldives. 
              Mark islands you've visited and explore new destinations in this tropical paradise.
            </p>
            <div className="mt-10 flex space-x-4">
              <Link
                to="/"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-lg"
              >
                Explore Map
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 bg-opacity-60 hover:bg-opacity-70"
              >
                Start Tracking
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <span className="text-4xl font-bold text-blue-600">190+</span>
              <p className="mt-2 text-sm text-gray-600">Islands</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <span className="text-4xl font-bold text-green-600">26</span>
              <p className="mt-2 text-sm text-gray-600">Natural Atolls</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 text-center">
              <span className="text-4xl font-bold text-yellow-600">150+</span>
              <p className="mt-2 text-sm text-gray-600">Resorts</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <span className="text-4xl font-bold text-indigo-600">1,192</span>
              <p className="mt-2 text-sm text-gray-600">Square Kilometers</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Islands Section */}
      <FeaturedIslands />
      
      {/* Ad Space - Middle Banner */}
      <div className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500 uppercase text-center mb-2">Advertisement</p>
          <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            <p>Ad Space - 728x90</p>
          </div>
        </div>
      </div>
      
      {/* Featured Articles Section */}
      <FeaturedArticles />
      
      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Track your Maldives adventures in three simple steps
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-blue-100 mx-auto rounded-full w-16 h-16 flex items-center justify-center">
                <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Explore Islands</h3>
              <p className="mt-2 text-base text-gray-500">
                Discover islands across the Maldives using our interactive map. Find detailed information about each location.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 mx-auto rounded-full w-16 h-16 flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Track Visits</h3>
              <p className="mt-2 text-base text-gray-500">
                Mark islands as visited and keep a personal log of your travels. Add notes and dates for each visit.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 mx-auto rounded-full w-16 h-16 flex items-center justify-center">
                <svg className="h-8 w-8 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Earn Badges</h3>
              <p className="mt-2 text-base text-gray-500">
                Collect badges for your achievements as you explore more islands. Show off your island explorer status.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              Create Your Account
              <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}