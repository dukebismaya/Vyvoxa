import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SafeAvatar } from '@/components/ui/safe-avatar';
import { 
  Bell, 
  UserPlus, 
  Heart, 
  MessageCircle, 
  Check, 
  X,
  Clock
} from 'lucide-react';

export default function NotificationPanel({ 
  notifications, 
  friendRequests, 
  onAcceptRequest, 
  onRejectRequest,
  onClose,
  isVisible 
}) {
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="absolute right-0 top-full mt-2 w-80 z-50"
      >
        <Card className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl">
          <CardHeader className="py-3 border-b border-zinc-100 dark:border-zinc-700">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {(notifications.length + friendRequests.length) > 0 && (
                <Badge className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {notifications.length + friendRequests.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <div className="p-3 border-b border-zinc-100 dark:border-zinc-700">
                <h4 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                  Friend Requests ({friendRequests.length})
                </h4>
                <div className="space-y-2">
                  {friendRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <SafeAvatar 
                          src={request.sender?.avatar} 
                          fallback={request.sender?.name?.charAt(0)}
                          className="h-8 w-8 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {request.sender?.name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(request.sentAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => onAcceptRequest(request.id)}
                          className="h-7 w-7 p-0 bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRejectRequest(request.id)}
                          className="h-7 w-7 p-0 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* General Notifications */}
            {notifications.length > 0 && (
              <div className="p-3">
                <h4 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                  Activity ({notifications.length})
                </h4>
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex-shrink-0">
                        {notification.type === 'like' ? (
                          <Heart className="h-4 w-4" />
                        ) : notification.type === 'comment' ? (
                          <MessageCircle className="h-4 w-4" />
                        ) : notification.type === 'friend' ? (
                          <UserPlus className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {notification.text}
                        </p>
                        {notification.time && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(notification.time).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty State */}
            {notifications.length === 0 && friendRequests.length === 0 && (
              <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">We'll let you know when something happens!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
