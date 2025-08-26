import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SafeAvatar } from '@/components/ui/safe-avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Search, 
  UserPlus, 
  Users, 
  Check, 
  X, 
  MapPin, 
  Globe,
  Heart,
  MessageCircle,
  UserCheck,
  Clock
} from 'lucide-react';

export default function FriendDiscovery({ onClose }) {
  const { currentUser, getAllUsers, sendFriendRequest, getFriendRequests, acceptFriendRequest, cancelFriendRequest, rejectFriendRequest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    loadUsers();
    loadFriendRequests();
  }, []);

  const loadUsers = () => {
    try {
      const users = getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadFriendRequests = () => {
    try {
      const requests = getFriendRequests();
      setFriendRequests(requests);
      
      // Load sent requests
      const allRequests = JSON.parse(localStorage.getItem('vyvoxa_friend_requests') || '[]');
      const sent = allRequests.filter(req => req.senderId === currentUser.id);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const handleSendRequest = async (userId) => {
    setLoading(true);
    try {
      await sendFriendRequest(userId);
      loadFriendRequests(); // Reload to update UI
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
    setLoading(false);
  };

  const handleAcceptRequest = async (requestId) => {
    setLoading(true);
    try {
      await acceptFriendRequest(requestId);
      loadFriendRequests(); // Reload to update UI
      loadUsers(); // Refresh users list
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
    setLoading(false);
  };

  const handleCancelRequest = async (requestId) => {
    setLoading(true);
    try {
      await cancelFriendRequest(requestId);
      loadFriendRequests(); // Reload to update UI
    } catch (error) {
      console.error('Error canceling friend request:', error);
    }
    setLoading(false);
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await rejectFriendRequest(requestId);
      loadFriendRequests(); // Reload to update UI
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
    setLoading(false);
  };

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isRequestSent = (userId) => {
    return sentRequests.some(req => req.receiverId === userId && req.status === 'pending');
  };

  const isFriend = (userId) => {
    return currentUser.following?.includes(userId);
  };

  const UserCard = ({ user, showActions = true }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <SafeAvatar 
              src={user.avatar} 
              fallback={user.name.charAt(0)}
              className="h-16 w-16 border-2 border-white/50 shadow-lg"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {user.name}
                    {user.isVerified && (
                      <Badge className="bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                        <Check className="h-3 w-3" />
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    @{user.name.toLowerCase().replace(/\s+/g, '')}
                  </p>
                </div>
                
                {user.isOnline && (
                  <div className="flex items-center text-xs text-green-500">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </div>
                )}
              </div>
              
              {user.bio && (
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                  {user.bio}
                </p>
              )}
              
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {user.followers?.length || 0} followers
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {user.postsCount || 0} posts
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </div>
              </div>
              
              {showActions && (
                <div className="mt-4 flex gap-2">
                  {isFriend(user.id) ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      disabled
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Friends
                    </Button>
                  ) : isRequestSent(user.id) ? (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-orange-50 border-orange-200 text-orange-700"
                        disabled
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Pending
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const request = sentRequests.find(r => r.receiverId === user.id);
                          if (request) handleCancelRequest(request.id);
                        }}
                        disabled={loading}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleSendRequest(user.id)}
                      disabled={loading}
                      className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600 text-white border-0"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add Friend
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
              Connect with People
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="discover" className="text-sm">
                <Search className="h-4 w-4 mr-1" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="requests" className="text-sm relative">
                <Users className="h-4 w-4 mr-1" />
                Requests
                {friendRequests.length > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                    {friendRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="text-sm">
                <Heart className="h-4 w-4 mr-1" />
                Suggestions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="discover" className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  placeholder="Search people by name, email, or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
                />
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <UserCard key={user.id} user={user} />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-zinc-500 dark:text-zinc-400"
                    >
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found matching your search</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="requests" className="p-6 space-y-4">
              {friendRequests.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Friend Requests</h3>
                  <AnimatePresence>
                    {friendRequests.map(request => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <SafeAvatar 
                                  src={request.sender?.avatar} 
                                  fallback={request.sender?.name?.charAt(0)}
                                  className="h-12 w-12"
                                />
                                <div>
                                  <p className="font-medium">{request.sender?.name}</p>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Sent {new Date(request.sentAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptRequest(request.id)}
                                  disabled={loading}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button size="sm" 
                                  variant="outline"
                                  onClick={() => handleRejectRequest(request.id)}
                                  disabled={loading}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No friend requests at the moment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="p-6 space-y-4">
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Friend suggestions coming soon!</p>
                <p className="text-sm mt-2">We'll help you find people you might know</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
}
