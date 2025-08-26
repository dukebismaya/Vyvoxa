// Demo users for testing the authentication system
// This will create some sample accounts for testing

export const seedDemoUsers = () => {
  const demoUsers = [
    {
      id: "demo_user_1",
      email: "demo@vyvoxa.com",
      password: "e0c9035898dd52fc65c41454cec9c4d2611bfb37", // "demo123" hashed
      name: "Demo User",
      avatar: "https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff",
      bio: "This is a demo account for testing Vyvoxa!",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
      isVerified: true
    },
    {
      id: "demo_user_2",
      email: "test@example.com",
      password: "356a192b7913b04c54574d18c28d46e6395428ab", // "test123" hashed
      name: "Test User",
      avatar: "https://ui-avatars.com/api/?name=Test+User&background=ec4899&color=fff",
      bio: "Testing the awesome features of Vyvoxa 🚀",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
      isVerified: false
    }
  ];

  // Only seed if no users exist
  const existingUsers = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
  if (existingUsers.length === 0) {
    localStorage.setItem('vyvoxa_users', JSON.stringify(demoUsers));
    console.log('Demo users seeded for testing:', {
      'demo@vyvoxa.com': 'demo123',
      'test@example.com': 'test123'
    });
  }
};

export const clearAllData = () => {
  localStorage.removeItem('vyvoxa_users');
  localStorage.removeItem('vyvoxa_token');
  localStorage.removeItem('vyvoxa_user');
  localStorage.removeItem('vyvoxa_posts');
  console.log('All Vyvoxa data cleared');
};
