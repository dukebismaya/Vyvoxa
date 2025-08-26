// Enhanced demo users and posts for a more realistic social media experience
export const seedDemoUsers = () => {
  const demoUsers = [
    {
      id: "demo_user_1",
      email: "demo@vyvoxa.com",
      password: "e0c9035898dd52fc65c41454cec9c4d2611bfb37", // "demo123" hashed
      name: "Demo User",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Welcome to Vyvoxa! I'm here to help you explore the platform. ✨",
      location: "San Francisco, CA",
      website: "vyvoxa.com",
      coverPhoto: "https://images.unsplash.com/photo-1519638831568-d9897f573d12?w=800&h=200&fit=crop",
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
      isVerified: true,
      isOnline: true,
      lastSeen: Date.now(),
      followers: ["demo_user_2", "demo_user_3"],
      following: ["demo_user_2", "demo_user_3", "demo_user_4"],
      postsCount: 5,
      settings: { privacy: 'public', notifications: true, darkMode: true, language: 'en' },
      interests: ['technology', 'design', 'travel'],
      socialLinks: { twitter: '@vyvoxa', linkedin: 'vyvoxa', instagram: '@vyvoxa' }
    },
    {
      id: "demo_user_2",
      email: "alex@vyvoxa.com",
      password: "356a192b7913b04c54574d18c28d46e6395428ab", // "test123" hashed
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Digital nomad 🌍 | Coffee enthusiast ☕ | Building amazing things",
      location: "Mexico City, Mexico",
      website: "alexrivera.dev",
      coverPhoto: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop",
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
      isVerified: false,
      isOnline: false,
      lastSeen: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      followers: ["demo_user_1", "demo_user_4"],
      following: ["demo_user_1", "demo_user_3"],
      postsCount: 8,
      settings: { privacy: 'public', notifications: true, darkMode: false, language: 'en' },
      interests: ['coding', 'travel', 'photography'],
      socialLinks: { twitter: '@alexrivera', linkedin: 'alex-rivera', instagram: '@alexcodes' }
    },
    {
      id: "demo_user_3",
      email: "sarah@vyvoxa.com",
      password: "da39a3ee5e6b4b0d3255bfef95601890afd80709", // "hello123" hashed
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      bio: "UX Designer & Artist 🎨 | Spreading positivity one design at a time",
      location: "Toronto, Canada",
      website: "sarahchen.design",
      coverPhoto: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop",
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
      isVerified: true,
      isOnline: true,
      lastSeen: Date.now(),
      followers: ["demo_user_1", "demo_user_2", "demo_user_4", "demo_user_5"],
      following: ["demo_user_1", "demo_user_4"],
      postsCount: 12,
      settings: { privacy: 'friends', notifications: true, darkMode: true, language: 'en' },
      interests: ['design', 'art', 'mindfulness'],
      socialLinks: { twitter: '@sarahdesigns', linkedin: 'sarah-chen-ux', instagram: '@sarahartstudio' }
    },
    {
      id: "demo_user_4",
      email: "mike@vyvoxa.com",
      password: "7c4a8d09ca3762af61e59520943dc26494f8941b", // "welcome123" hashed
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      bio: "Entrepreneur | Tech Enthusiast | Always learning something new 🚀",
      location: "Austin, TX",
      website: "mikejohnson.co",
      coverPhoto: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=200&fit=crop",
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 21, // 21 days ago
      isVerified: false,
      isOnline: false,
      lastSeen: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      followers: ["demo_user_3"],
      following: ["demo_user_1", "demo_user_2", "demo_user_3", "demo_user_5"],
      postsCount: 15,
      settings: { privacy: 'public', notifications: false, darkMode: false, language: 'en' },
      interests: ['startups', 'innovation', 'fitness'],
      socialLinks: { twitter: '@mikejtech', linkedin: 'mike-johnson-entrepreneur', instagram: '@mikejfitness' }
    },
    {
      id: "demo_user_5",
      email: "emma@vyvoxa.com",
      password: "b1d5781111d84f7b3fe45a0852e59758cd7a87e5", // "creative123" hashed
      name: "Emma Wilson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      bio: "Content Creator | Photography Lover � | Sharing life's beautiful moments",
      location: "Los Angeles, CA",
      website: "emmawilson.photo",
      coverPhoto: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&h=200&fit=crop",
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
      isVerified: true,
      isOnline: true,
      lastSeen: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      followers: ["demo_user_3", "demo_user_4"],
      following: ["demo_user_1", "demo_user_3"],
      postsCount: 20,
      settings: { privacy: 'public', notifications: true, darkMode: true, language: 'en' },
      interests: ['photography', 'fashion', 'lifestyle'],
      socialLinks: { twitter: '@emmawphoto', linkedin: 'emma-wilson-photographer', instagram: '@emmacaptures' }
    }
  ];

  // Only seed if no users exist
  const existingUsers = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
  if (existingUsers.length === 0) {
    localStorage.setItem('vyvoxa_users', JSON.stringify(demoUsers));
    
    // Create some demo posts
    seedDemoPosts();
    
    console.log('✨ Demo users and posts seeded!');
    console.log('Demo accounts:', {
      'demo@vyvoxa.com': 'demo123',
      'alex@vyvoxa.com': 'test123',
      'sarah@vyvoxa.com': 'hello123',
      'mike@vyvoxa.com': 'welcome123',
      'emma@vyvoxa.com': 'creative123'
    });
  }
};

const seedDemoPosts = () => {
  const demoPosts = [
    {
      id: `post_${Date.now()}_1`,
      userId: "demo_user_1",
      text: "Welcome to Vyvoxa! 🎉 We're so excited to have you join our community. Share your thoughts, connect with friends, and discover amazing content! #Welcome #Vyvoxa",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
      privacy: "public",
      likes: [],
      comments: [],
      shares: [],
      reactions: { like: [], love: ["demo_user_2", "demo_user_3"], laugh: [], angry: [], sad: [], wow: ["demo_user_4"] },
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      updatedAt: Date.now() - 1000 * 60 * 60 * 2,
      isEdited: false,
      mentions: [],
      hashtags: ["Welcome", "Vyvoxa"]
    },
    {
      id: `post_${Date.now()}_2`,
      userId: "demo_user_2",
      text: "Just finished coding for 6 hours straight! ☕️ Time for a well-deserved coffee break. What keeps you motivated during long work sessions? #coding #developer #coffee",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
      location: "Mexico City, Mexico",
      privacy: "public",
      likes: [],
      comments: [
        {
          id: `comment_${Date.now()}_1`,
          userId: "demo_user_3",
          text: "Coffee is life! ☕️ I also take short walks to refresh my mind",
          likes: ["demo_user_2"],
          replies: [],
          createdAt: Date.now() - 1000 * 60 * 30,
          mentions: []
        }
      ],
      shares: [],
      reactions: { like: ["demo_user_1", "demo_user_3"], love: [], laugh: [], angry: [], sad: [], wow: [] },
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
      updatedAt: Date.now() - 1000 * 60 * 60 * 4,
      isEdited: false,
      mentions: [],
      hashtags: ["coding", "developer", "coffee"]
    },
    {
      id: `post_${Date.now()}_3`,
      userId: "demo_user_3",
      text: "Working on a new design system for mobile apps 📱 The challenge is creating consistency while keeping it flexible for different use cases. Design is problem-solving at its finest! #UXDesign #MobileDesign",
      image: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=600&h=400&fit=crop",
      privacy: "public",
      likes: [],
      comments: [],
      shares: [],
      reactions: { like: ["demo_user_1", "demo_user_4"], love: ["demo_user_5"], laugh: [], angry: [], sad: [], wow: [] },
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      updatedAt: Date.now() - 1000 * 60 * 60 * 6,
      isEdited: false,
      mentions: [],
      hashtags: ["UXDesign", "MobileDesign"]
    },
    {
      id: `post_${Date.now()}_4`,
      userId: "demo_user_4",
      text: "Startup life update: We just hit our first 1000 users! 🚀 It's been a wild ride with lots of ups and downs, but the team's dedication is incredible. Grateful for everyone who believed in our vision! #startup #milestone #grateful",
      privacy: "public",
      likes: [],
      comments: [
        {
          id: `comment_${Date.now()}_2`,
          userId: "demo_user_1",
          text: "Congratulations! 🎉 That's a huge milestone. What's next?",
          likes: ["demo_user_4"],
          replies: [
            {
              id: `reply_${Date.now()}_1`,
              userId: "demo_user_4",
              text: "Thank you! Next goal is 10K users by end of quarter 💪",
              likes: ["demo_user_1"],
              createdAt: Date.now() - 1000 * 60 * 15,
              mentions: []
            }
          ],
          createdAt: Date.now() - 1000 * 60 * 45,
          mentions: []
        }
      ],
      shares: [],
      reactions: { like: ["demo_user_1", "demo_user_2", "demo_user_3"], love: [], laugh: [], angry: [], sad: [], wow: ["demo_user_5"] },
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
      updatedAt: Date.now() - 1000 * 60 * 60 * 8,
      isEdited: false,
      mentions: [],
      hashtags: ["startup", "milestone", "grateful"]
    },
    {
      id: `post_${Date.now()}_5`,
      userId: "demo_user_5",
      text: "Golden hour magic ✨ Captured this beautiful moment during my evening walk. There's something so peaceful about watching the sunset. What's your favorite time of day for photography? #photography #goldenhour #sunset",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      location: "Los Angeles, CA",
      feeling: "😍 feeling blessed",
      privacy: "public",
      likes: [],
      comments: [],
      shares: [],
      reactions: { like: ["demo_user_1", "demo_user_3"], love: ["demo_user_2", "demo_user_4"], laugh: [], angry: [], sad: [], wow: [] },
      createdAt: Date.now() - 1000 * 60 * 60 * 1,
      updatedAt: Date.now() - 1000 * 60 * 60 * 1,
      isEdited: false,
      mentions: [],
      hashtags: ["photography", "goldenhour", "sunset"]
    }
  ];

  localStorage.setItem('vyvoxa_posts', JSON.stringify(demoPosts));
};

export const clearAllData = () => {
  localStorage.removeItem('vyvoxa_users');
  localStorage.removeItem('vyvoxa_token');
  localStorage.removeItem('vyvoxa_user');
  localStorage.removeItem('vyvoxa_posts');
  localStorage.removeItem('vyvoxa_friend_requests');
  localStorage.removeItem('vyvoxa_notifications');
  localStorage.removeItem('vyvoxa_visited');
  console.log('🧹 All Vyvoxa data cleared');
};
