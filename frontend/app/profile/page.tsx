"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    city: '',
    bio: '',
    skillsOffered: '',
    skillsNeeded: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeMessage, setResumeMessage] = useState('');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        const res = await axios.get('http://localhost:5000/profiles/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          setProfile({
            name: res.data.name || '',
            city: res.data.city || '',
            bio: res.data.bio || '',
            skillsOffered: res.data.skillsOffered ? res.data.skillsOffered.join(', ') : '',
            skillsNeeded: res.data.skillsNeeded ? res.data.skillsNeeded.join(', ') : ''
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: profile.name,
        city: profile.city,
        bio: profile.bio,
        skillsOffered: profile.skillsOffered.split(',').map(s => s.trim()).filter(s => s),
        skillsNeeded: profile.skillsNeeded.split(',').map(s => s.trim()).filter(s => s)
      };

      await axios.post('http://localhost:5000/profiles/create', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Profile saved successfully!');
      
      // Also handle resume upload if selected
      if (resumeFile) {
        await handleResumeUpload();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error saving profile');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', resumeFile);

      await axios.post('http://localhost:5000/upload/resume', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResumeMessage('Resume uploaded successfully!');
    } catch (err: any) {
      setResumeMessage('Error uploading resume');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Your Profile</h1>
      
      {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">{message}</div>}
      
      <form onSubmit={handleProfileSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" 
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" 
              value={profile.city}
              onChange={e => setProfile({...profile, city: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea 
            rows={3} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={profile.bio}
            onChange={e => setProfile({...profile, bio: e.target.value})}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Skills Offered (comma separated)</label>
            <input 
              type="text" 
              placeholder="React, Design, Python" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" 
              value={profile.skillsOffered}
              onChange={e => setProfile({...profile, skillsOffered: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Skills Needed (comma separated)</label>
            <input 
              type="text" 
              placeholder="SEO, Marketing" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black" 
              value={profile.skillsNeeded}
              onChange={e => setProfile({...profile, skillsNeeded: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Resume Upload (PDF/DOC)</label>
          <div className="flex items-center space-x-4">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={e => setResumeFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
            />
          </div>
          {resumeMessage && <p className="mt-2 text-sm text-green-600">{resumeMessage}</p>}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
