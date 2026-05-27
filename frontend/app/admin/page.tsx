"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Dashboard Data
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!user || !token) {
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role === 'admin') {
      setIsAdmin(true);
      fetchAdminData(token);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/auth/admin-login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsAdmin(true);
      fetchAdminData(res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Admin login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAdmin(false);
    window.location.href = '/login';
  };

  const fetchAdminData = async (token?: string) => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) {
      handleLogout();
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${currentToken}` };

      const [usersRes, reqsRes, chatsRes] = await Promise.all([
        axios.get('http://localhost:5000/admin/users', { headers }),
        axios.get('http://localhost:5000/admin/requests', { headers }),
        axios.get('http://localhost:5000/admin/chats', { headers })
      ]);
      
      setUsers(usersRes.data);
      setRequests(reqsRes.data);
      setChats(chatsRes.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or unauthorized. Please log in again.');
        handleLogout();
        return;
      }
      console.error('Error fetching admin data', err);
      setError('Error fetching admin data. Please try again later.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
        <h2 className="text-3xl font-bold text-center text-red-600 mb-6">Admin Access Only</h2>
        {error && <p className="text-red-500 text-center mb-4 bg-red-50 py-2 rounded">{error}</p>}
        <form className="space-y-6" onSubmit={handleAdminLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Email</label>
            <input 
              type="email" 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-black" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-black" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Login to Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Logout
        </button>
      </div>
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-medium text-indigo-800">Total Users</h3>
          <p className="text-4xl font-bold text-indigo-600 mt-2">{users.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-medium text-green-800">Total Requests</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{requests.length}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-medium text-blue-800">Total Messages</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{chats.length}</p>
        </div>
      </div>

      {/* USER MANAGEMENT */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.profile?.name || 'No Profile'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
