const bcrypt = require('bcryptjs');
const { users, profiles, requests, messages, directMessages } = require('./memory');

const loadDemoData = async () => {
  const hash = async (pw) => await bcrypt.hash(pw, 10);
  
  // Users
  users.push(
    { id: '1', email: 'admin@bartr.com', password: await hash('admin123'), role: 'admin' },
    { id: '2', email: 'demo1@bartr.com', password: await hash('123456'), role: 'user' },
    { id: '3', email: 'demo2@bartr.com', password: await hash('123456'), role: 'user' },
    { id: '4', email: 'demo3@bartr.com', password: await hash('123456'), role: 'user' },
    { id: '5', email: 'mahakpatidar1509@gmail.com', password: await hash('Mahak@1509'), role: 'user' }
  );

  // Profiles
  profiles.push(
    {
      userId: '2',
      name: 'Alice Designer',
      bio: 'UI/UX enthusiast looking to learn React.',
      skillsOffered: ['Graphic Design', 'Figma'],
      skillsNeeded: ['React', 'Next.js'],
      city: 'New York',
      resume: null,
      profileImage: null
    },
    {
      userId: '3',
      name: 'Bob Coder',
      bio: 'Frontend dev wanting to learn design.',
      skillsOffered: ['React', 'Next.js', 'JavaScript'],
      skillsNeeded: ['Graphic Design', 'UI/UX'],
      city: 'San Francisco',
      resume: null,
      profileImage: null
    },
    {
      userId: '4',
      name: 'Charlie Marketer',
      bio: 'SEO expert who wants to learn python.',
      skillsOffered: ['SEO', 'Marketing'],
      skillsNeeded: ['Python'],
      city: 'Chicago',
      resume: null,
      profileImage: null
    },
    {
      userId: '5',
      name: 'Mahak Patidar',
      bio: 'Developer exploring new technologies and design.',
      skillsOffered: ['Python', 'Django'],
      skillsNeeded: ['React', 'Figma'],
      city: 'Indore',
      resume: null,
      profileImage: null
    }
  );

  // Requests
  requests.push(
    { id: 'r1', senderId: '2', receiverId: '3', status: 'accepted', timestamp: new Date() },
    { id: 'r2', senderId: '4', receiverId: '2', status: 'pending',  timestamp: new Date() },
    { id: 'r3', senderId: '5', receiverId: '2', status: 'accepted', timestamp: new Date() },
    { id: 'r4', senderId: '3', receiverId: '5', status: 'pending',  timestamp: new Date() },
    { id: 'r5', senderId: '5', receiverId: '4', status: 'accepted', timestamp: new Date() },
    { id: 'r6', senderId: '3', receiverId: '4', status: 'accepted', timestamp: new Date() }
  );

  // Messages
  messages.push(
    { id: 'm1', requestId: 'r1', senderId: '2', text: 'Hi Bob! Thanks for accepting.', timestamp: new Date() },
    { id: 'm2', requestId: 'r1', senderId: '3', text: 'Hey Alice! Excited to learn design.', timestamp: new Date() },
    { id: 'm3', requestId: 'r3', senderId: '2', text: 'Hi Mahak! I see you want to learn Figma. I can help with that.', timestamp: new Date() },
    { id: 'm4', requestId: 'r3', senderId: '5', text: 'That sounds perfect Alice! I can definitely teach you Python in return.', timestamp: new Date() }
  );

  // Direct Messages (open chat - no request required)
  directMessages.push(
    { id: 'd1', fromUserId: '5', toUserId: '3', text: "Hey Bob! I saw your profile. Can you help me learn React?", timestamp: new Date(Date.now() - 3600000) },
    { id: 'd2', fromUserId: '3', toUserId: '5', text: "Hi Mahak! Absolutely, I'd love to teach React. You can teach me Python!", timestamp: new Date(Date.now() - 3500000) },
    { id: 'd3', fromUserId: '5', toUserId: '3', text: "That's a great deal! Let's start this weekend.", timestamp: new Date(Date.now() - 3400000) },
    { id: 'd4', fromUserId: '5', toUserId: '4', text: "Hi Charlie! Your SEO skills look amazing.", timestamp: new Date(Date.now() - 7200000) },
    { id: 'd5', fromUserId: '4', toUserId: '5', text: "Thanks Mahak! I've been doing SEO for 3 years now.", timestamp: new Date(Date.now() - 7000000) }
  );

  console.log('Demo data loaded successfully.');
};

module.exports = loadDemoData;
