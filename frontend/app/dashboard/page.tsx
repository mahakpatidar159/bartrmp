"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

const avatarColors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  'bg-blue-500', 'bg-teal-500', 'bg-orange-500'
];

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <div className={`${avatarColors[index % avatarColors.length]} text-white font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-sm`}>
      {initials}
    </div>
  );
}

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'connections' | 'matches' | 'pending' | 'chat'>('connections');

  // Chat state
  const [activeChatRequest, setActiveChatRequest] = useState<any>(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { window.location.href = '/login'; return; }
    setCurrentUser(JSON.parse(user));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [matchesRes, reqsRes] = await Promise.all([
        axios.get('http://localhost:5000/match', { headers }),
        axios.get('http://localhost:5000/requests/my', { headers })
      ]);
      setMatches(matchesRes.data);
      setRequests(reqsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestAction = async (requestId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/requests/update', { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating request');
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/requests/send', { receiverId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Request sent!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const openChat = (req: any) => {
    setActiveChatRequest(req);
    setActiveTab('chat');
    fetchMessages(req.id);
  };

  const fetchMessages = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/messages/chat/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatRequest) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/messages/send', {
        requestId: activeChatRequest.id,
        text: newMessage
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewMessage('');
      fetchMessages(activeChatRequest.id);
    } catch (err) { console.error(err); }
  };

  if (!currentUser) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const pendingRequests  = requests.filter((r: any) => r.status === 'pending');
  const acceptedRequests = requests.filter((r: any) => r.status === 'accepted');
  const incomingPending  = pendingRequests.filter((r: any) => r.receiverId === currentUser.id);

  const tabs = [
    { key: 'connections', label: '🔗 Connections', count: acceptedRequests.length },
    { key: 'matches',     label: '✨ Matches',     count: matches.length },
    { key: 'pending',     label: '⏳ Requests',    count: incomingPending.length },
    { key: 'chat',        label: '💬 Chat',         count: acceptedRequests.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {currentUser.email.split('@')[0]} 👋</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/messages" className="bg-white text-indigo-700 border border-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
            Chat with everyone
          </Link>
          <a href="/profile" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Edit Profile
          </a>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`p-4 rounded-xl border text-left transition ${activeTab === t.key ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'}`}
          >
            <p className={`text-2xl font-bold ${activeTab === t.key ? 'text-white' : 'text-indigo-600'}`}>{t.count}</p>
            <p className={`text-sm ${activeTab === t.key ? 'text-indigo-100' : 'text-gray-500'}`}>{t.label}</p>
          </button>
        ))}
      </div>

      {/* ──────────── CONNECTIONS ──────────── */}
      {activeTab === 'connections' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Your Connections</h2>
          <p className="text-sm text-gray-500 mb-6">People you've successfully connected with for skill exchange</p>

          {acceptedRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🤝</p>
              <p className="font-medium">No connections yet</p>
              <p className="text-sm">Accept or send a request to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedRequests.map((r: any, i: number) => {
                const partner = r.otherProfile;
                return (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition flex gap-4 items-start bg-gray-50">
                    <Avatar name={partner?.name || '?'} index={i} />
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-gray-900">{partner?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500 mb-1">📍 {partner?.city || 'Unknown City'}</p>
                      {partner?.skillsOffered && Array.isArray(partner.skillsOffered) && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {partner.skillsOffered.map((s: string, j: number) => (
                            <span key={j} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openChat(r)}
                          className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                        >
                          💬 Chat
                        </button>
                        <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1.5 rounded-lg">
                          ✓ Connected
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──────────── MATCHES ──────────── */}
      {activeTab === 'matches' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Skill Matches</h2>
          <p className="text-sm text-gray-500 mb-6">People whose skills align with what you offer and need</p>

          {matches.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">✨</p>
              <p className="font-medium">No matches found</p>
              <p className="text-sm">Update your skills in your profile to find matches</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m: any, i: number) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:shadow-md transition flex gap-4 items-start">
                  <Avatar name={m.name} index={i} />
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500 mb-2">📍 {m.city || 'Unknown'}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {Array.isArray(m.skillsOffered) && m.skillsOffered.map((s: string, j: number) => (
                        <span key={j} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSendRequest(m.userId)}
                      className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────── PENDING REQUESTS ──────────── */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Requests</h2>
          <p className="text-sm text-gray-500 mb-6">Incoming and outgoing barter requests</p>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">⏳</p>
              <p className="font-medium">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((r: any, i: number) => {
                const isIncoming = r.receiverId === currentUser.id;
                return (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex items-center gap-4">
                    <Avatar name={r.otherProfile?.name || '?'} index={i} />
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">{r.otherProfile?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{isIncoming ? '📥 Incoming request' : '📤 Sent by you'}</p>
                    </div>
                    {isIncoming ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestAction(r.id, 'accepted')}
                          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(r.id, 'rejected')}
                          className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-200"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs px-3 py-1.5 rounded-lg">
                        Pending...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──────────── CHAT ──────────── */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex h-[480px]">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold text-gray-700 text-sm">Active Chats</p>
              </div>
              {acceptedRequests.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No active chats</p>
              ) : (
                acceptedRequests.map((r: any, i: number) => (
                  <div
                    key={r.id}
                    onClick={() => openChat(r)}
                    className={`flex gap-3 items-center p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-100 transition ${activeChatRequest?.id === r.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                  >
                    <Avatar name={r.otherProfile?.name || '?'} index={i} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{r.otherProfile?.name || 'User'}</p>
                      <p className="text-xs text-gray-400">Skill Exchange Partner</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeChatRequest ? (
                <>
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                    <p className="font-semibold text-gray-800">💬 {activeChatRequest.otherProfile?.name || 'User'}</p>
                    <button onClick={() => fetchMessages(activeChatRequest.id)} className="text-xs text-indigo-500 hover:text-indigo-700">Refresh</button>
                  </div>

                  <div className="flex-grow p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-400 mt-10 text-sm">No messages yet. Say hello! 👋</p>
                    ) : (
                      messages.map((m: any) => {
                        const isMe = m.senderId === currentUser.id;
                        return (
                          <div key={m.id} className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-500 text-white self-end rounded-br-none' : 'bg-white text-gray-800 self-start rounded-bl-none shadow-sm border border-gray-100'}`}>
                            <p className="text-sm">{m.text}</p>
                            <span className={`text-[10px] mt-1 block ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm hover:bg-indigo-700">
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm">Click a name on the left to open chat</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
