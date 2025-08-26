import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Heart,
  MessageCircle,
  Send,
  ThumbsUp,
  Sparkles,
  Plus,
  Bell,
  Home,
  Users,
  Bookmark,
  Settings,
  LogOut,
  Camera,
  Image as ImageIcon,
  Smile,
  ChevronRight,
  ChevronLeft,
  Share2,
  MoreHorizontal,
  UserPlus,
  TrendingUp,
  Hash,
  MapPin,
  Globe,
  Edit3,
  Trash2
} from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import ProfileSettings from "@/components/auth/ProfileSettings";
import WelcomeScreen from "@/components/WelcomeScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import FriendDiscovery from "@/components/FriendDiscovery";
import EnhancedPostComposer from "@/components/EnhancedPostComposer";
import { seedDemoUsers } from "@/lib/demoData";
import { postManager } from "@/lib/postManager";
import { logError, isDevelopment } from "@/lib/config";

// --- Helpers ---
const uid = () => Math.random().toString(36).slice(2);
const formatTime = (d) => new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
}).format(d);

// --- Seed Data ---
const seedUsers = [
  {
    id: "u1",
    name: "Bismaya Jyoti Dalei",
    avatar:
      "https://github.com/dukebismaya/Vyvoxa/blob/main/assets/knox.jpg?raw=true?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "u2",
    name: "Knox Emberlyn",
    avatar:
      "",
  },
  {
    id: "u3",
    name: "Ayesha Dixit",
    avatar:
      "https://cdn.pixabay.com/photo/2024/02/15/13/55/ai-generated-8575453_1280.png?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "u4",
    name: "Liza Emberlyn",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
];

const sampleImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=1200&auto=format&fit=crop",
];

const initialPosts = [
  {
    id: uid(),
    userId: "u2",
    text: "Sunset sprints and city lights. Who's up for a night run?",
    image: sampleImages[0],
    likes: 12,
    comments: [
      { id: uid(), userId: "u1", text: "Count me in!", at: Date.now() - 1000 * 60 * 15 },
    ],
    createdAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: uid(),
    userId: "u3",
    text: "Built a tiny synth in JS today. Sounds surprisingly good!",
    image: sampleImages[1],
    likes: 24,
    comments: [],
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: uid(),
    userId: "u4",
    text: "Weekend hike dump 🌲",
    image: sampleImages[2],
    likes: 7,
    comments: [],
    createdAt: Date.now() - 1000 * 60 * 180,
  },
];

// --- Core UI ---
function VyvoxaApp() {
  const { currentUser, logout, getFriendRequests } = useAuth();
  const [dark, setDark] = useState(true);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]); // Start with empty array, load from postManager
  const [tab, setTab] = useState("for-you");
  const [notify, setNotify] = useState([{ id: uid(), text: "Welcome to Vyvoxa!" }]);
  const [composer, setComposer] = useState({ text: "", image: "" });
  const [storyIndex, setStoryIndex] = useState(0);
  const [savedIds, setSavedIds] = useState(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFriendDiscovery, setShowFriendDiscovery] = useState(false);
  const [showEnhancedComposer, setShowEnhancedComposer] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return !localStorage.getItem('vyvoxa_visited');
    } catch (error) {
      logError(error, 'localStorage access');
      return true; // Default to showing welcome if localStorage fails
    }
  });

  // Load posts from postManager
  useEffect(() => {
    const loadPosts = () => {
      const allPosts = postManager.getAllPosts();
      setPosts(allPosts);
    };

    // Load initial posts
    loadPosts();

    // Subscribe to post updates
    const unsubscribe = postManager.subscribe(loadPosts);

    return unsubscribe;
  }, []);

  // Load friend requests and trending hashtags
  useEffect(() => {
    if (currentUser) {
      try {
        const requests = getFriendRequests();
        setFriendRequests(requests);
        
        const trending = postManager.getTrendingHashtags(5);
        setTrendingHashtags(trending);
      } catch (error) {
        logError(error, 'Loading friend requests or trending hashtags');
      }
    }
  }, [currentUser, getFriendRequests]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Move scrollbar CSS injection here (once)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .scrollbar-hide::-webkit-scrollbar{ display:none; }
      .scrollbar-hide{ -ms-overflow-style:none; scrollbar-width:none; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  
  const users = useMemo(() => {
    // Include current user and seed users
    const allUsers = [...seedUsers];
    if (currentUser && !allUsers.find(u => u.id === currentUser.id)) {
      allUsers.unshift(currentUser);
    }
    return Object.fromEntries(allUsers.map(u => [u.id, u]));
  }, [currentUser]);

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    
    const q = query.trim().toLowerCase();
    return posts.filter(post => 
      post.text.toLowerCase().includes(q) ||
      (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes(q))) ||
      (post.mentions && post.mentions.some(mention => mention.toLowerCase().includes(q)))
    );
  }, [query, posts]);

  const addPost = async (postData) => {
    try {
      const newPost = postManager.createPost(postData, currentUser);
      setNotify(prev => [...prev, { id: uid(), text: "Post shared successfully!" }]);
      setShowEnhancedComposer(false);
      return newPost;
    } catch (error) {
      logError(error, 'Adding post');
      setNotify(prev => [...prev, { id: uid(), text: "Failed to share post" }]);
    }
  };

  const updatePost = (id, patch) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const savedPosts = posts.filter(p => savedIds.has(p.id));

  const toggleReaction = (postId, reactionType = 'like') => {
    try {
      postManager.toggleReaction(postId, currentUser.id, reactionType);
    } catch (error) {
      logError(error, 'Toggling reaction');
    }
  };

  const addComment = (postId, commentText) => {
    try {
      postManager.addComment(postId, { text: commentText }, currentUser);
    } catch (error) {
      logError(error, 'Adding comment');
    }
  };

  const sharePost = (postId, shareText = '') => {
    try {
      postManager.sharePost(postId, currentUser, shareText);
      setNotify(prev => [...prev, { id: uid(), text: "Post shared!" }]);
    } catch (error) {
      logError(error, 'Sharing post');
    }
  };

  const deletePost = (postId) => {
    try {
      postManager.deletePost(postId, currentUser.id);
      setNotify(prev => [...prev, { id: uid(), text: "Post deleted" }]);
    } catch (error) {
      logError(error, 'Deleting post');
    }
  };

  const handleLogout = () => {
    logout();
    setTab("for-you");
    setQuery("");
    setNotify([{ id: uid(), text: "You've been signed out" }]);
  };

  const handleGetStarted = () => {
    localStorage.setItem('vyvoxa_visited', 'true');
    setShowWelcome(false);
  };

  // Show welcome screen for first-time visitors
  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  if (!currentUser) {
    return <AuthModal onClose={() => setShowAuthModal(false)} />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-zinc-900 dark:text-zinc-100 overflow-x-hidden relative" style={{maxWidth: '100vw'}}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-300/20 to-pink-300/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-cyan-300/20 to-blue-300/20 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-fuchsia-300/10 to-violet-300/10 blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <TopBar 
          dark={dark} 
          setDark={setDark} 
          onSearch={setQuery} 
          notifications={notify} 
          currentUser={currentUser}
          friendRequests={friendRequests}
          onShowFriendDiscovery={() => setShowFriendDiscovery(true)}
        />
        <main className="w-full grid grid-cols-1 xl:grid-cols-[minmax(160px,180px)_1fr_minmax(200px,220px)] gap-2 px-1 sm:px-2 py-4 pb-20 min-h-[calc(100vh-3.5rem)]" style={{maxWidth: '100vw'}}>
          <LeftNav 
            tab={tab} 
            setTab={setTab} 
            me={currentUser} 
            onLogout={handleLogout}
            onShowFriendDiscovery={() => setShowFriendDiscovery(true)}
            friendRequestCount={friendRequests.length}
          />
          {tab === "settings" ? (
            <div className="space-y-4">
              <ProfileSettings />
            </div>
          ) : (
            <Feed
              tab={tab}
              setTab={setTab}
              posts={filtered}
              users={users}
              composer={composer}
              setComposer={setComposer}
              addPost={addPost}
              storyIndex={storyIndex}
              setStoryIndex={setStoryIndex}
              onUpdatePost={updatePost}
              savedIds={savedIds}
              onToggleSave={toggleSave}
              savedPosts={savedPosts}
              currentUser={currentUser}
              onShowEnhancedComposer={() => setShowEnhancedComposer(true)}
              onToggleReaction={toggleReaction}
              onAddComment={addComment}
              onSharePost={sharePost}
              onDeletePost={deletePost}
            />
          )}
          <RightRail 
            users={Object.values(users).filter(u => u.id !== currentUser.id)}
            trendingHashtags={trendingHashtags}
            onShowFriendDiscovery={() => setShowFriendDiscovery(true)}
          />
        </main>
        
        {/* Fixed Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800 z-30">
          <div className="w-full px-2 py-3 text-center">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              © {new Date().getFullYear()} Bismaya Jyoti Dalei • Vyvoxa Prototype
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <a 
                href="https://discord.gg/your-server" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                title="Discord"
              >
                Discord
              </a>
              <a 
                href="https://github.com/bismayajyotidali" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                title="GitHub"
              >
                GitHub
              </a>
              <a 
                href="https://linkedin.com/in/bismayajyotidali" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                title="LinkedIn"
              >
                LinkedIn
              </a>
              <a 
                href="https://youtube.com/@bismayajyotidali" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                title="YouTube"
              >
                YouTube
              </a>
            </div>
            {/* <div className="text-xs text-zinc-500 mt-1">Made with React, Tailwind, shadcn/ui, Framer Motion.</div> */}
          </div>
        </footer>

        {/* Modals */}
        <AnimatePresence>
          {showFriendDiscovery && (
            <FriendDiscovery onClose={() => setShowFriendDiscovery(false)} />
          )}
          {showEnhancedComposer && (
            <EnhancedPostComposer 
              onPost={addPost}
              onCancel={() => setShowEnhancedComposer(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

function TopBar({ dark, setDark, onSearch, notifications, currentUser }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-800/50"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between h-14 px-2 sm:px-4">
        {/* Logo Section */}
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </motion.div>
          <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Vyvoxa
          </span>
        </motion.div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search posts, people, tags..."
              className="pl-10 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 backdrop-blur-sm focus:bg-white/80 dark:focus:bg-slate-800/80 transition-all duration-200"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              size="sm"
              variant="ghost"
              className="relative p-2 hover:bg-white/20 dark:hover:bg-slate-800/50"
            >
              <Bell className="h-4 w-4" />
              {notifications?.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                >
                  {notifications.length}
                </motion.div>
              )}
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Switch
              checked={dark}
              onCheckedChange={setDark}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-cyan-500"
            />
          </motion.div>
          <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:inline">
            Dark
          </span>

          {/* User Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar className="h-8 w-8 ring-2 ring-gradient-to-r ring-purple-500/30 ring-cyan-500/30">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-sm">
                {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

function LeftNav({ tab, setTab, me, onLogout }) {
  const LinkBtn = ({ icon: Icon, label, value, onClick }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant={tab === value ? "default" : "ghost"}
        className={`w-full justify-start gap-2 rounded-xl text-sm transition-all duration-200 ${
          tab === value 
            ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30" 
            : "hover:bg-white/60 dark:hover:bg-slate-700/60 backdrop-blur-sm"
        }`}
        onClick={onClick || (() => setTab(value))}
      >
        <Icon className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{label}</span>
      </Button>
    </motion.div>
  );

  return (
    <aside className="hidden xl:block w-full max-w-[180px]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/30 dark:border-slate-600/30 shadow-xl shadow-black/5 backdrop-blur-md">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/30 dark:border-slate-600/30">
              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-white/20 dark:ring-slate-600/20">
                <AvatarImage src={me?.avatar} />
                <AvatarFallback>
                {me?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-tight text-sm truncate">{me?.name || 'User'}</div>
              <Badge variant="secondary" className="rounded-full text-xs">Creator</Badge>
            </div>
          </div>
          <div className="grid gap-1">
            <LinkBtn icon={Home} label="For you" value="for-you" />
            <LinkBtn icon={Users} label="Following" value="following" />
            <LinkBtn icon={Bookmark} label="Saved" value="saved" />
            <Separator className="my-1" />
            <LinkBtn icon={Settings} label="Settings" value="settings" />
            <LinkBtn icon={LogOut} label="Sign out" value="logout" onClick={onLogout} />
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </aside>
  );
}

function Feed({
  tab,
  setTab,
  posts,
  users,
  composer,
  setComposer,
  addPost,
  storyIndex,
  setStoryIndex,
  onUpdatePost,
  savedIds,
  onToggleSave,
  savedPosts,
  currentUser
}) {
return (
    <div className="space-y-3">
      <Stories users={Object.values(users)} index={storyIndex} setIndex={setStoryIndex} />
      <Composer 
        composer={composer} 
        setComposer={setComposer} 
        addPost={addPost} 
        currentUser={currentUser}
      />
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-3 rounded-2xl">
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="for-you" className="mt-4">
          <PostList 
            posts={posts} 
            users={users} 
            onUpdatePost={onUpdatePost} 
            savedIds={savedIds} 
            onToggleSave={onToggleSave}
            currentUser={currentUser}
          />
        </TabsContent>
        <TabsContent value="following" className="mt-4">
          <EmptyState title="No following yet" subtitle="Find people and start connecting." />
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          {savedPosts.length
            ? <PostList 
                posts={savedPosts} 
                users={users} 
                onUpdatePost={onUpdatePost} 
                savedIds={savedIds} 
                onToggleSave={onToggleSave}
                currentUser={currentUser}
              />
            : <EmptyState title="No saved posts" subtitle="Tap the bookmark on any post to save it." />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="rounded-3xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-white/30 dark:border-slate-600/30 shadow-xl shadow-black/5 backdrop-blur-md">
        <CardContent className="p-10 text-center">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="inline-block"
          >
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-purple-500" />
          </motion.div>
          <div className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">{title}</div>
          <p className="opacity-70 mt-2">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Stories({ users, index, setIndex }) {
  const containerRef = useRef(null);
  const scrollBy = (dir) => {
    const el = containerRef.current;
    if (!el) return;
    const amount = dir === 1 ? 280 : -280;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="rounded-3xl overflow-hidden bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-white/30 dark:border-slate-600/30 shadow-xl shadow-black/5 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between py-4 bg-gradient-to-r from-transparent to-purple-50/20 dark:to-purple-900/10">
          <CardTitle className="text-base font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">Stories</CardTitle>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="icon" variant="secondary" onClick={() => scrollBy(-1)} className="rounded-2xl bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 backdrop-blur-sm border-white/30 dark:border-slate-600/30">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="icon" variant="secondary" onClick={() => scrollBy(1)} className="rounded-2xl bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 backdrop-blur-sm border-white/30 dark:border-slate-600/30">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div ref={containerRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-2 pr-1">
            {users.map((u, i) => (
              <motion.div key={u.id} whileHover={{ y: -4, scale: 1.02 }} className="min-w-[160px]">
                <div className="relative h-40 w-40 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img src={u.avatar} alt={u.name} className="object-cover h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white font-medium drop-shadow-lg">{u.name}</div>
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-purple-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Composer({ composer, setComposer, addPost, currentUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="rounded-3xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-white/30 dark:border-slate-600/30 shadow-xl shadow-black/5 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white/20 dark:ring-slate-600/20">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>
                {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="w-full space-y-3">
              <Textarea
                value={composer.text}
                onChange={(e) => setComposer((s) => ({ ...s, text: e.target.value }))}
                placeholder="Share something with Vyvoxa…"
                className="min-h-[80px] rounded-2xl bg-white/60 dark:bg-slate-700/60 border-white/30 dark:border-slate-600/30 focus:border-purple-300 dark:focus:border-purple-500 focus:ring-purple-200 dark:focus:ring-purple-800 backdrop-blur-sm resize-none"
              />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Optional image URL"
                  value={composer.image}
                  onChange={(e) => setComposer((s) => ({ ...s, image: e.target.value }))}
                  className="rounded-2xl bg-white/60 dark:bg-slate-700/60 border-white/30 dark:border-slate-600/30 focus:border-purple-300 dark:focus:border-purple-500"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={addPost} 
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200"
                  >
                    <Send className="h-4 w-4 mr-2" /> Post
                  </Button>
                </motion.div>
              </div>
              <div className="flex items-center gap-4 text-sm opacity-70">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1 cursor-pointer hover:opacity-100 transition-opacity">
                  <ImageIcon className="h-4 w-4" /> Image
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1 cursor-pointer hover:opacity-100 transition-opacity">
                  <Smile className="h-4 w-4" /> Feeling
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1 cursor-pointer hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4" /> Live
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PostList({ posts, users, onUpdatePost, savedIds, onToggleSave, currentUser }) {
  return (
    <div className="grid gap-4">
      <AnimatePresence initial={false}>
        {posts.map(p => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <PostCard
              p={p}
              user={users[p.userId]}
              onUpdate={onUpdatePost}
              saved={savedIds.has(p.id)}
              onToggleSave={() => onToggleSave(p.id)}
              currentUser={currentUser}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function PostCard({ p, user, onUpdate, saved, onToggleSave, currentUser }) {
  const [commentText, setCommentText] = useState("");
  const [openComments, setOpenComments] = useState(false);

  const toggleLike = () => {
    onUpdate(p.id, { likes: p.likes + 1 });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const next = [...(p.comments || []), { 
      id: uid(), 
      userId: currentUser.id, 
      text: commentText.trim(), 
      at: Date.now() 
    }];
    onUpdate(p.id, { comments: next });
    setCommentText("");
  };

  return (
    <Card className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <CardHeader className="py-3 pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold leading-tight text-sm">{user?.name || 'Unknown User'}</div>
            <div className="text-xs opacity-60">{new Date(p.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </CardHeader>
      {p.image && (
        <div className="relative">
          <motion.img
            layout
            src={p.image}
            alt="Post media"
            className="w-full max-h-[520px] object-cover"
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
      <CardContent className="pt-2 pb-3">
        <p className="text-sm leading-relaxed">{p.text}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between py-2">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="secondary" className="rounded-2xl h-8" onClick={toggleLike}>
            <ThumbsUp className="h-3 w-3 mr-1" /> {p.likes}
          </Button>
          <Button size="sm" variant="ghost" className="rounded-2xl h-8" onClick={() => setOpenComments(o => !o)}>
            <MessageCircle className="h-3 w-3 mr-1" /> {p.comments?.length || 0}
          </Button>
        </div>
        <Button size="sm" variant={saved ? "default" : "ghost"} className="rounded-2xl h-8" onClick={onToggleSave}>
          <Bookmark className="h-3 w-3 mr-1" /> {saved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
      <AnimatePresence initial={false}>
        {openComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Separator />
            <div className="p-3 space-y-2">
              {(p.comments || []).map(c => {
                const commentUser = Object.values(seedUsers).find(u => u.id === c.userId) || currentUser;
                return (
                  <div key={c.id} className="flex gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={commentUser?.avatar} alt="" />
                      <AvatarFallback>{commentUser?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-2 py-1.5">
                      <div className="text-xs">{c.text}</div>
                      <div className="text-[10px] opacity-60">{formatTime(new Date(c.at))}</div>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-2 pt-1">
                <Input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment…" className="rounded-2xl text-sm h-8" />
                <Button onClick={addComment} className="rounded-2xl h-8" size="sm">
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function RightRail({ users }) {
  return (
    <aside className="hidden xl:block space-y-3 w-full max-w-[220px]">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-white/30 dark:border-slate-600/30 shadow-xl shadow-black/5 backdrop-blur-md">
          <CardHeader className="py-3 bg-gradient-to-r from-transparent to-purple-50/20 dark:to-purple-900/10 border-b border-white/20 dark:border-slate-600/20">
            <CardTitle className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">People you may know</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-3">
            <div className="space-y-3">
              {users.slice(0, 3).map((u, i) => (
                <motion.div 
                  key={u.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-700/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-white/20 dark:ring-slate-600/20">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight min-w-0 flex-1">
                      <div className="font-medium text-xs truncate">{u.name}</div>
                      <div className="text-xs opacity-60 truncate">@{u.name.toLowerCase().replace(/\s+/g, "")}</div>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" className="rounded-xl h-7 text-xs px-3 flex-shrink-0 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-md shadow-purple-500/25">
                      <Plus className="h-3 w-3 mr-1" />Follow
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-white/30 dark:border-slate-600/30 shadow-xl shadow-black/5 backdrop-blur-md">
          <CardHeader className="py-3 bg-gradient-to-r from-transparent to-cyan-50/20 dark:to-cyan-900/10 border-b border-white/20 dark:border-slate-600/20">
            <CardTitle className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">Trends</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-3">
            <div className="space-y-2 text-xs">
              {[
                { tag: "#nightRun", posts: "3.1k" },
                { tag: "#devSynth", posts: "1.2k" },
                { tag: "#weekendHike", posts: "5.7k" },
              ].map((t, i) => (
                <motion.div 
                  key={t.tag}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-700/40 rounded-lg px-2 py-2 cursor-pointer transition-all duration-200 group"
                >
                  <div className="font-medium truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t.tag}</div>
                  <div className="opacity-60 text-xs flex-shrink-0 group-hover:opacity-80">{t.posts}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </aside>
  );
}

export default function App() {
  // Seed demo users for testing
  useEffect(() => {
    try {
      seedDemoUsers();
    } catch (error) {
      logError(error, 'Seeding demo users');
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <VyvoxaApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}