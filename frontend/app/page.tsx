"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));

    axios.get('http://localhost:5000/profiles')
      .then(res => setProfiles(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSendRequest = async (receiverId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      await axios.post('http://localhost:5000/requests/send', { receiverId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequestedIds(prev => [...prev, receiverId]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const filteredProfiles = profiles.filter((p: any) => {
    const offered = Array.isArray(p.skillsOffered) ? p.skillsOffered : [];
    const needed = Array.isArray(p.skillsNeeded) ? p.skillsNeeded : [];
    return (
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      offered.some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
      needed.some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
      p.city?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const avatarColors = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
    'bg-blue-500', 'bg-teal-500', 'bg-orange-500'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Welcome to <span className="text-yellow-300">BARTR</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto mb-10">
            Exchange your skills with others — no money needed. Teach what you know, learn what you need.
          </p>

          {!currentUser ? (
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/register" className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl hover:bg-indigo-50 transition">
                Get Started Free
              </Link>
              <Link href="/login" className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full text-lg hover:bg-white hover:text-indigo-700 transition">
                Login
              </Link>
            </div>
          ) : (
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/dashboard" className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:bg-indigo-50 transition">
                Go to Dashboard
              </Link>
              <Link href="/profile" className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full text-lg hover:bg-white hover:text-indigo-700 transition">
                Edit Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center gap-12 flex-wrap text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{profiles.length}</p>
            <p className="text-sm text-gray-500">Skill Traders</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">{[...new Set(profiles.flatMap((p: any) => p.skillsOffered || []))].length}</p>
            <p className="text-sm text-gray-500">Skills Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">Free</p>
            <p className="text-sm text-gray-500">Always</p>
          </div>
        </div>
      </div>

      {/* Profiles Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Browse Skill Traders</h2>
          <input
            type="text"
            placeholder="🔍  Search by name, skill or city..."
            className="w-full md:w-96 px-5 py-3 rounded-full border border-gray-300 shadow-sm bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-lg text-gray-900 placeholder-gray-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-lg">Loading profiles...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-lg">
            No profiles found for "<span className="font-semibold text-gray-600">{search}</span>"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile: any, i: number) => {
              const initials = profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';
              const color = avatarColors[i % avatarColors.length];
              const alreadyRequested = requestedIds.includes(profile.userId);
              const isMe = currentUser?.id === profile.userId;

              return (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 pt-6 pb-4 flex items-center gap-4">
                    <div className={`${color} text-white text-xl font-bold rounded-full w-14 h-14 flex items-center justify-center shadow-md flex-shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{profile.name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-500">📍 {profile.city || 'Unknown City'}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="px-6 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">{profile.bio || 'No bio provided.'}</p>
                  </div>

                  {/* Skills */}
                  <div className="px-6 py-4 flex flex-col gap-3 flex-grow">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1.5">✅ Offers</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(profile.skillsOffered) && profile.skillsOffered.length > 0
                          ? profile.skillsOffered.map((s: string, j: number) => (
                              <span key={j} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full border border-indigo-100">{s}</span>
                            ))
                          : <span className="text-gray-400 text-xs">None listed</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-1.5">🎯 Needs</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(profile.skillsNeeded) && profile.skillsNeeded.length > 0
                          ? profile.skillsNeeded.map((s: string, j: number) => (
                              <span key={j} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full border border-green-100">{s}</span>
                            ))
                          : <span className="text-gray-400 text-xs">None listed</span>}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-6 pb-6 pt-2">
                    {isMe ? (
                      <Link href="/profile" className="block w-full text-center bg-gray-100 text-gray-600 font-medium py-2 rounded-xl text-sm hover:bg-gray-200 transition">
                        ✏️ Edit My Profile
                      </Link>
                    ) : alreadyRequested ? (
                      <div className="w-full text-center bg-green-50 text-green-600 font-medium py-2 rounded-xl text-sm border border-green-200">
                        ✓ Request Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(profile.userId)}
                        className="w-full bg-indigo-600 text-white font-medium py-2 rounded-xl text-sm hover:bg-indigo-700 transition shadow-sm"
                      >
                        Send Barter Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">How BARTR Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Your Profile', desc: 'List what skills you offer and what you want to learn.', icon: '👤' },
              { step: '2', title: 'Find Matches', desc: 'Discover people who want what you offer and offer what you need.', icon: '🔍' },
              { step: '3', title: 'Chat & Barter', desc: 'Send a request, accept, and start your skill exchange via chat.', icon: '💬' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="text-center p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Step {step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
