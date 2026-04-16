import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from './CookieConsent';

// Generate a session ID
const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
axios.defaults.headers.common['X-Session-ID'] = sessionId;

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Create "busy" network activity
    const interval = setInterval(() => {
      axios.get('/api/health', { params: { _t: Date.now(), sid: sessionId } }).catch(() => {});
      // Random dummy requests for "busy" look
      const endpoints = ['/api/stats', '/api/trending', '/api/config', '/api/ping'];
      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      axios.get(randomEndpoint, { params: { _t: Date.now(), sid: sessionId } }).catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
