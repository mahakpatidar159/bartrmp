"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

const avatarColors = [
  'bg-indigo-500','bg-purple-500','bg-pink-500',
  'bg-blue-500','bg-teal-500','bg-orange-500'
];

function Avatar({ name, index, size = 'md' }: { name: string; index: number; size?: 'sm' | 'md' }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-11 h-11 text-sm';
  return (
    <div className={`${avatarColors[index % avatarColors.length]} text-white font-bold rounded-full ${sz} flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function Messages() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'inbox' | 'browse'>('browse');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    setCurrentUser(JSON.parse(stored));
    fetchAllProfiles();
    fetchInbox();
  }, []);

  const fetchAllProfiles = async () => {
    const res = await axios.get('http://localhost:5000/profiles');
    setAllProfiles(res.data);
  };

  const fetchInbox = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/direct/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInbox(res.data);
    } catch (err) { console.error(err); }
  };

  const openChat = async (userId: string, profile: any) => {
    setActiveUser({ userId, profile });
    fetchConversation(userId);
  };

  const fetchConversation = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/direct/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversation(res.data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeUser) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/direct/send', {
        toUserId: activeUser.userId,
        text: newMsg
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewMsg('');
      fetchConversation(activeUser.userId);
      fetchInbox();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending message');
    }
  };

  if (!currentUser) return <div className="p-8 text-center">Loading...</div>;

  const filteredProfiles = allProfiles.filter(p =>
    p.userId !== currentUser.id &&
    (p.name?.toLowerCase().includes(search.toLowerCase()) ||
     p.city?.toLowerCase().includes(search.toLowerCase()) ||
     (Array.isArray(p.skillsOffered) && p.skillsOffered.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Chat with anyone on the platform — no request needed</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex h-[580px]">
        {/* LEFT PANEL */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab('browse')}
              className={`flex-1 py-3 text-sm font-medium transition ${tab === 'browse' ? 'text-indigo-600 border-b-2 border-indigo-500 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              👥 Browse Users
            </button>
            <button
              onClick={() => setTab('inbox')}
              className={`flex-1 py-3 text-sm font-medium transition ${tab === 'inbox' ? 'text-indigo-600 border-b-2 border-indigo-500 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📥 Inbox {inbox.length > 0 && <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full">{inbox.length}</span>}
            </button>
          </div>

          {/* Search (browse tab only) */}
          {tab === 'browse' && (
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {/* User List */}
          <div className="flex-grow overflow-y-auto">
            {tab === 'browse' ? (
              filteredProfiles.length === 0 ? (
                <p className="p-4 text-sm text-gray-400 text-center mt-4">No users found</p>
              ) : (
                filteredProfiles.map((p, i) => (
                  <div
                    key={p.userId}
                    onClick={() => openChat(p.userId, p)}
                    className={`flex gap-3 items-center p-3 cursor-pointer border-b border-gray-100 hover:bg-white transition ${activeUser?.userId === p.userId ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                  >
                    <Avatar name={p.name || '?'} index={i} />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{p.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {Array.isArray(p.skillsOffered) && p.skillsOffered.length > 0
                          ? p.skillsOffered.slice(0, 2).join(', ')
                          : p.city || 'BARTR User'}
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : (
              inbox.length === 0 ? (
                <p className="p-4 text-sm text-gray-400 text-center mt-4">No conversations yet</p>
              ) : (
                inbox.map((item, i) => (
                  <div
                    key={item.userId}
                    onClick={() => openChat(item.userId, item.profile)}
                    className={`flex gap-3 items-center p-3 cursor-pointer border-b border-gray-100 hover:bg-white transition ${activeUser?.userId === item.userId ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                  >
                    <Avatar name={item.profile?.name || '?'} index={i} />
                    <div className="min-w-0 flex-grow">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.profile?.name || item.email || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{item.lastMessage?.text || 'No messages yet'}</p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Chat */}
        <div className="flex-1 flex flex-col bg-white">
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3 bg-white">
                <Avatar name={activeUser.profile?.name || '?'} index={0} />
                <div>
                  <p className="font-semibold text-gray-900">{activeUser.profile?.name || 'User'}</p>
                  <p className="text-xs text-gray-400">📍 {activeUser.profile?.city || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => fetchConversation(activeUser.userId)}
                  className="ml-auto text-xs text-indigo-500 hover:text-indigo-700"
                >
                  Refresh
                </button>
              </div>

              {/* Messages */}
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                {conversation.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p className="text-3xl mb-2">👋</p>
                    <p className="font-medium text-sm">Say hello to {activeUser.profile?.name || 'this user'}!</p>
                    <p className="text-xs">This is the beginning of your conversation</p>
                  </div>
                ) : (
                  conversation.map((m: any) => {
                    const isMe = m.fromUserId === currentUser.id;
                    return (
                      <div key={m.id} className={`max-w-[70%] ${isMe ? 'self-end' : 'self-start'}`}>
                        <div className={`rounded-2xl px-4 py-2.5 ${isMe ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'}`}>
                          <p className="text-sm">{m.text}</p>
                        </div>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2 items-center">
                <input
                  type="text"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder={`Message ${activeUser.profile?.name || 'user'}...`}
                  className="flex-grow px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
              <p className="text-5xl mb-4">💬</p>
              <p className="font-semibold text-gray-600 text-lg">Open a conversation</p>
              <p className="text-sm mt-1">Select a user from the left to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
