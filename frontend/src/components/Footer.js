import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">🌴 IslandLogger.mv</h3>
            <p className="text-blue-100 text-sm">
              Track your adventures across the Maldives, collect badges, and discover new islands.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-blue-100 hover:text-white">Home</a></li>
              <li><a href="/dashboard" className="text-blue-100 hover:text-white">Dashboard</a></li>
              <li><a href="/login" className="text-blue-100 hover:text-white">Login</a></li>
              <li><a href="/register" className="text-blue-100 hover:text-white">Register</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-blue-100 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-blue-100 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-blue-100 hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-blue-500 text-sm text-center text-blue-200">
          <p>&copy; {new Date().getFullYear()} IslandLogger.mv. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
