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
import { SafeAvatar } from "@/components/ui/safe-avatar";
import MultiReaction from "@/components/ui/multi-reaction";
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
import NotificationPanel from "@/components/NotificationPanel";
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
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
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
  const { currentUser, logout, getFriendRequests, getFollowingPosts, acceptFriendRequest, rejectFriendRequest } = useAuth();
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
  const [showNotifications, setShowNotifications] = useState(false);
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

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      // Refresh friend requests
      loadFriendRequests();
    } catch (error) {
      logError(error, 'Accepting friend request');
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      // Refresh friend requests
      loadFriendRequests();
    } catch (error) {
      logError(error, 'Rejecting friend request');
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
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 overflow-x-hidden" style={{maxWidth: '100vw'}}>
        <TopBar 
          dark={dark} 
          setDark={setDark} 
          onSearch={setQuery} 
          notifications={notify} 
          currentUser={currentUser}
          friendRequests={friendRequests}
          onShowFriendDiscovery={() => setShowFriendDiscovery(true)}
          showNotifications={showNotifications}
          onToggleNotifications={(show) => typeof show === 'boolean' ? setShowNotifications(show) : setShowNotifications(!showNotifications)}
          onAcceptFriendRequest={handleAcceptFriendRequest}
          onRejectFriendRequest={handleRejectFriendRequest}
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
              getFollowingPosts={getFollowingPosts}
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

function TopBar({ 
  dark, 
  setDark, 
  onSearch, 
  notifications, 
  currentUser, 
  friendRequests, 
  onShowFriendDiscovery,
  showNotifications,
  onToggleNotifications,
  onAcceptFriendRequest,
  onRejectFriendRequest
}) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800"
    >
      <div className="w-full flex items-center justify-between gap-2 px-2 h-14">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="h-9 w-9 grid place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-lg"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <div className="font-extrabold tracking-tight text-xl md:text-2xl">Vyvoxa</div>
        </div>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-60" />
            <Input
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search posts, people, tags…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-2xl relative"
                  onClick={onToggleNotifications}
                >
                  <Bell className="h-5 w-5" />
                  {(notifications.length > 0 || friendRequests.length > 0) && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {notifications.length + friendRequests.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Notifications ({notifications.length})
                {friendRequests.length > 0 && ` • ${friendRequests.length} friend requests`}
              </TooltipContent>
            </Tooltip>

            {/* Notification Panel */}
            <NotificationPanel
              notifications={notifications}
              friendRequests={friendRequests}
              onAcceptRequest={onAcceptFriendRequest}
              onRejectRequest={onRejectFriendRequest}
              onClose={() => onToggleNotifications(false)}
              isVisible={showNotifications}
            />
          </div>

          {onShowFriendDiscovery && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-2xl"
                  onClick={onShowFriendDiscovery}
                >
                  <Users className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Find friends</TooltipContent>
            </Tooltip>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70 hidden sm:block">Dark</span>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>

          <SafeAvatar 
            src={currentUser?.avatar} 
            fallback={currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            className="h-9 w-9"
          />
        </div>
      </div>
    </motion.header>
  );
}

function LeftNav({ tab, setTab, me, onLogout }) {
  const LinkBtn = ({ icon: Icon, label, value, onClick }) => (
    <Button
      variant={tab === value ? "default" : "ghost"}
      className={`w-full justify-start gap-2 rounded-xl text-sm ${tab === value ? "shadow" : ""
        }`}
      onClick={onClick || (() => setTab(value))}
    >
      <Icon className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{label}</span>
    </Button>
  );

  return (
    <aside className="hidden xl:block w-full max-w-[180px]">
      <Card className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-700">
            <SafeAvatar 
              src={me?.avatar} 
              fallback={me?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              className="h-8 w-8 flex-shrink-0"
            />
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
  currentUser,
  getFollowingPosts,
  onToggleReaction
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
            onToggleReaction={onToggleReaction}
          />
        </TabsContent>
        <TabsContent value="following" className="mt-4">
          {(() => {
            const followingPosts = getFollowingPosts(posts);
            return followingPosts.length > 0 
              ? <PostList 
                  posts={followingPosts} 
                  users={users} 
                  onUpdatePost={onUpdatePost} 
                  savedIds={savedIds} 
                  onToggleSave={onToggleSave}
                  currentUser={currentUser}
                  onToggleReaction={onToggleReaction}
                />
              : <EmptyState title="No posts from friends" subtitle="Add friends to see their posts here." />;
          })()}
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
                onToggleReaction={onToggleReaction}
              />
            : <EmptyState title="No saved posts" subtitle="Tap the bookmark on any post to save it." />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <Card className="rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <CardContent className="p-10 text-center">
        <Sparkles className="mx-auto mb-3" />
        <div className="font-semibold text-lg">{title}</div>
        <p className="opacity-70">{subtitle}</p>
      </CardContent>
    </Card>
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
    <Card className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base">Stories</CardTitle>
        <div className="flex gap-2">
          <Button size="icon" variant="secondary" onClick={() => scrollBy(-1)} className="rounded-2xl"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="secondary" onClick={() => scrollBy(1)} className="rounded-2xl"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div ref={containerRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-2 pr-1">
          {users.map((u, i) => (
            <motion.div key={u.id} whileHover={{ y: -4 }} className="min-w-[160px]">
              <div className="relative h-40 w-40 rounded-3xl overflow-hidden shadow">
                {u.avatar && u.avatar.trim() ? (
                  <img src={u.avatar} alt={u.name} className="object-cover h-full w-full" onError={(e) => {
                    e.target.style.display = 'none';
                  }} />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 text-white font-medium drop-shadow">{u.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Composer({ composer, setComposer, addPost, currentUser }) {
  return (
    <Card className="rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <CardContent className="p-3">
        <div className="flex gap-2">
          <SafeAvatar 
            src={currentUser?.avatar} 
            fallback={currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            className="h-9 w-9 shrink-0"
          />
          <div className="w-full space-y-2">
            <Textarea
              value={composer.text}
              onChange={(e) => setComposer((s) => ({ ...s, text: e.target.value }))}
              placeholder="Share something with Vyvoxa…"
              className="min-h-[80px] rounded-2xl"
            />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Optional image URL"
                value={composer.image}
                onChange={(e) => setComposer((s) => ({ ...s, image: e.target.value }))}
                className="rounded-2xl"
              />
              <Button onClick={addPost} className="rounded-2xl">
                <Send className="h-4 w-4 mr-2" /> Post
              </Button>
            </div>
            <div className="flex items-center gap-3 text-sm opacity-70">
              <div className="flex items-center gap-1"><ImageIcon className="h-4 w-4" /> Image</div>
              <div className="flex items-center gap-1"><Smile className="h-4 w-4" /> Feeling</div>
              <div className="flex items-center gap-1"><Camera className="h-4 w-4" /> Live</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostList({ posts, users, onUpdatePost, savedIds, onToggleSave, currentUser, onToggleReaction }) {
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
              onToggleReaction={onToggleReaction}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function PostCard({ p, user, onUpdate, saved, onToggleSave, currentUser, onToggleReaction }) {
  const [commentText, setCommentText] = useState("");
  const [openComments, setOpenComments] = useState(false);

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
          <SafeAvatar 
            src={user?.avatar} 
            fallback={user?.name?.[0] || 'U'}
            className="h-9 w-9"
          />
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
          <MultiReaction 
            post={p} 
            currentUser={currentUser} 
            onReaction={onToggleReaction}
          />
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
                    <SafeAvatar 
                      src={commentUser?.avatar} 
                      fallback={commentUser?.name?.[0] || 'U'}
                      className="h-7 w-7"
                    />
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
  const { sendFriendRequest, getFriends, isFollowing } = useAuth();
  const friends = getFriends();

  const handleSendFriendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      // Show success feedback - could add toast notification here
    } catch (error) {
      console.error('Error sending friend request:', error);
      // Show error feedback
    }
  };

  return (
    <aside className="hidden xl:block space-y-2 w-full max-w-[220px]">
      <Card className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <CardHeader className="py-2 border-b border-zinc-100 dark:border-zinc-700">
          <CardTitle className="text-xs font-semibold">People you may know</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          <div className="space-y-2">
            {users.filter(u => !isFollowing(u.id)).slice(0, 3).map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <SafeAvatar 
                    src={u.avatar} 
                    fallback={u.name[0]} 
                    className="h-7 w-7 flex-shrink-0"
                  />
                  <div className="leading-tight min-w-0 flex-1">
                    <div className="font-medium text-xs truncate">{u.name}</div>
                    <div className="text-xs opacity-60 truncate">@{u.name.toLowerCase().replace(/\s+/g, "")}</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="rounded-xl h-6 text-xs px-2 flex-shrink-0"
                  onClick={() => handleSendFriendRequest(u.id)}
                >
                  <UserPlus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <CardHeader className="py-2 border-b border-zinc-100 dark:border-zinc-700">
          <CardTitle className="text-xs font-semibold">Trends</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          <div className="space-y-1 text-xs">
            {[
              { tag: "#nightRun", posts: "3.1k" },
              { tag: "#devSynth", posts: "1.2k" },
              { tag: "#weekendHike", posts: "5.7k" },
            ].map((t) => (
              <div key={t.tag} className="flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg px-2 py-1 cursor-pointer transition-colors">
                <div className="font-medium truncate">{t.tag}</div>
                <div className="opacity-60 text-xs flex-shrink-0">{t.posts}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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