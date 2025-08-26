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
} from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import ProfileSettings from "@/components/auth/ProfileSettings";
import WelcomeScreen from "@/components/WelcomeScreen";
import { seedDemoUsers } from "@/lib/demoData";

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
      "../assets/bismaya.jpg",
  },
  {
    id: "u2",
    name: "Knox Emberlyn",
    avatar:
      "../assets/knox.jpg",
  },
  {
    id: "u3",
    name: "Ayesha Dixit",
    avatar:
      "../assets/ayesha.jpg",
  },
  {
    id: "u4",
    name: "Liza Emberlyn",
    avatar:
      "../assets/liza.jpg",
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
  const { currentUser, logout } = useAuth();
  const [dark, setDark] = useState(true);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState(initialPosts); // defer loading
  const [tab, setTab] = useState("for-you");
  const [notify, setNotify] = useState([{ id: uid(), text: "Welcome to Vyvoxa!" }]);
  const [composer, setComposer] = useState({ text: "", image: "" });
  const [storyIndex, setStoryIndex] = useState(0);
  const [savedIds, setSavedIds] = useState(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('vyvoxa_visited'));

  // Load persisted posts after mount (avoids SSR/window issues)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vyvoxa_posts");
      if (saved) setPosts(JSON.parse(saved));
    } catch { }
  }, []);

  useEffect(() => {
    localStorage.setItem("vyvoxa_posts", JSON.stringify(posts));
  }, [posts]);

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
    const q = query.trim().toLowerCase();
    return q ? posts.filter(p => p.text.toLowerCase().includes(q)) : posts;
  }, [query, posts]);

  const addPost = () => {
    if (!composer.text.trim() && !composer.image.trim()) return;
    setPosts(prev => [
      {
        id: uid(),
        userId: currentUser.id,
        text: composer.text.trim(),
        image: composer.image.trim(),
        likes: 0,
        comments: [],
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setComposer({ text: "", image: "" });
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
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100">
        <TopBar 
          dark={dark} 
          setDark={setDark} 
          onSearch={setQuery} 
          notifications={notify} 
          currentUser={currentUser}
        />
        <main className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6 px-4 md:px-6 py-6">
          <LeftNav 
            tab={tab} 
            setTab={setTab} 
            me={currentUser} 
            onLogout={handleLogout}
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
            />
          )}
          <RightRail users={Object.values(users).filter(u => u.id !== currentUser.id)} />
        </main>
      </div>
    </TooltipProvider>
  );
}

function TopBar({ dark, setDark, onSearch, notifications, currentUser }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 md:px-6 h-16">
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-2xl">
                <Bell className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications ({notifications.length})</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70 hidden sm:block">Dark</span>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>

          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback>
              {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </motion.header>
  );
}

function LeftNav({ tab, setTab, me, onLogout }) {
  const LinkBtn = ({ icon: Icon, label, value, onClick }) => (
    <Button
      variant={tab === value ? "default" : "ghost"}
      className={`w-full justify-start gap-3 rounded-2xl ${tab === value ? "shadow" : ""
        }`}
      onClick={onClick || (() => setTab(value))}
    >
      <Icon className="h-4 w-4" /> {label}
    </Button>
  );

  return (
    <aside className="hidden lg:block">
      <Card className="rounded-3xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={me?.avatar} />
              <AvatarFallback>
                {me?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold leading-tight">{me?.name || 'User'}</div>
              <Badge variant="secondary" className="rounded-full">Creator</Badge>
            </div>
          </div>
          <div className="grid gap-1.5">
            <LinkBtn icon={Home} label="For you" value="for-you" />
            <LinkBtn icon={Users} label="Following" value="following" />
            <LinkBtn icon={Bookmark} label="Saved" value="saved" />
            <Separator className="my-2" />
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
  currentUser
}) {
return (
    <div className="space-y-4">
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
    <Card className="rounded-3xl">
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
    <Card className="rounded-3xl overflow-hidden">
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
                <img src={u.avatar} alt={u.name} className="object-cover h-full w-full" />
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
    <Card className="rounded-3xl">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
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
    <Card className="rounded-3xl overflow-hidden">
      <CardHeader className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold leading-tight">{user?.name || 'Unknown User'}</div>
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
      <CardContent className="pt-4">
        <p className="text-[15px] leading-relaxed">{p.text}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" className="rounded-2xl" onClick={toggleLike}>
            <ThumbsUp className="h-4 w-4 mr-1" /> {p.likes}
          </Button>
          <Button size="sm" variant="ghost" className="rounded-2xl" onClick={() => setOpenComments(o => !o)}>
            <MessageCircle className="h-4 w-4 mr-1" /> {p.comments?.length || 0}
          </Button>
        </div>
        <Button size="sm" variant={saved ? "default" : "ghost"} className="rounded-2xl" onClick={onToggleSave}>
          <Bookmark className="h-4 w-4 mr-1" /> {saved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
      <AnimatePresence initial={false}>
        {openComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Separator />
            <div className="p-4 space-y-3">
              {(p.comments || []).map(c => {
                const commentUser = Object.values(seedUsers).find(u => u.id === c.userId) || currentUser;
                return (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={commentUser?.avatar} alt="" />
                      <AvatarFallback>{commentUser?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-3 py-2">
                      <div className="text-sm">{c.text}</div>
                      <div className="text-[11px] opacity-60">{formatTime(new Date(c.at))}</div>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-2 pt-2">
                <Input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment…" className="rounded-2xl" />
                <Button onClick={addComment} className="rounded-2xl" size="sm">
                  <Send className="h-4 w-4" />
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
    <aside className="hidden xl:block space-y-4">
      <Card className="rounded-3xl">
        <CardHeader className="py-4">
          <CardTitle className="text-base">People you may know</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs opacity-60">@{u.name.toLowerCase().replace(/\s+/g, "")}</div>
                  </div>
                </div>
                <Button size="sm" className="rounded-2xl"><Plus className="h-4 w-4 mr-1" /> Follow</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader className="py-4">
          <CardTitle className="text-base">Trends</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            {[
              { tag: "#nightRun", posts: "3.1k" },
              { tag: "#devSynth", posts: "1.2k" },
              { tag: "#weekendHike", posts: "5.7k" },
            ].map((t) => (
              <div key={t.tag} className="flex items-center justify-between">
                <div>{t.tag}</div>
                <div className="opacity-60">{t.posts} posts</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="p-4 text-xs opacity-70">
          <div>© {new Date().getFullYear()} Bismaya • Vyvoxa Prototype build</div>
          <div>Made with React, Tailwind, shadcn/ui, Framer Motion.</div>
        </CardContent>
      </Card>
    </aside>
  );
}

export default function App() {
  // Seed demo users for testing
  useEffect(() => {
    seedDemoUsers();
  }, []);

  return (
    <AuthProvider>
      <VyvoxaApp />
    </AuthProvider>
  );
}