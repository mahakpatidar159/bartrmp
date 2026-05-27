"use client";
import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/auth/register', { email, password });
      
      const loginRes = await axios.post('http://localhost:5000/auth/login', { email, password });
      const token = loginRes.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));

      await axios.post('http://localhost:5000/profiles/create', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Join BARTR</h2>
      {error && <p className="text-red-500 text-center mb-4 bg-red-50 py-2 rounded">{error}</p>}
      <form className="space-y-6" onSubmit={handleRegister}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            type="text" 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" 
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email address</label>
          <input 
            type="email" 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Sign Up
        </button>
      </form>
    </div>
  );
}
