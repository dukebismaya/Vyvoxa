import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  ThumbsUp, 
  Laugh, 
  Frown, 
  Angry,
  Plus
} from 'lucide-react';

const reactions = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-600' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500' },
  { type: 'laugh', icon: Laugh, label: 'Laugh', color: 'text-yellow-500' },
  { type: 'wow', icon: Plus, label: 'Wow', color: 'text-orange-500' },
  { type: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-400' },
  { type: 'angry', icon: Angry, label: 'Angry', color: 'text-red-600' }
];

export default function MultiReaction({ post, currentUser, onReaction }) {
  const [showReactions, setShowReactions] = useState(false);
  
  // Get user's current reaction
  const getUserReaction = () => {
    if (!post.reactions || !currentUser) return null;
    
    for (const [type, users] of Object.entries(post.reactions)) {
      if (users && users.includes(currentUser.id)) {
        return type;
      }
    }
    return null;
  };

  const userReaction = getUserReaction();
  const hasReacted = userReaction !== null;

  // Get total reaction count
  const getTotalReactions = () => {
    if (!post.reactions) return 0;
    return Object.values(post.reactions).reduce((total, users) => {
      return total + (users ? users.length : 0);
    }, 0);
  };

  const handleReaction = (reactionType) => {
    onReaction(post.id, reactionType);
    setShowReactions(false);
  };

  // Get the most common reactions to show
  const getTopReactions = () => {
    if (!post.reactions) return [];
    
    const reactionCounts = Object.entries(post.reactions)
      .map(([type, users]) => ({ type, count: users ? users.length : 0 }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
      
    return reactionCounts;
  };

  const topReactions = getTopReactions();
  const totalReactions = getTotalReactions();

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Main reaction button */}
        <div className="relative">
          <Button
            size="sm"
            variant={hasReacted ? "default" : "secondary"}
            className={`rounded-2xl h-8 transition-all ${
              hasReacted ? reactions.find(r => r.type === userReaction)?.color : ''
            }`}
            onClick={() => setShowReactions(!showReactions)}
            onMouseEnter={() => setShowReactions(true)}
          >
            {hasReacted ? (
              <>
                {React.createElement(reactions.find(r => r.type === userReaction)?.icon, { 
                  className: "h-4 w-4 mr-1" 
                })}
                {reactions.find(r => r.type === userReaction)?.label}
              </>
            ) : (
              <>
                <ThumbsUp className="h-4 w-4 mr-1" />
                Like
              </>
            )}
          </Button>

          {/* Reaction picker */}
          <AnimatePresence>
            {showReactions && (
              <>
                {/* Backdrop to close reactions */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowReactions(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full p-2 shadow-lg flex gap-1 z-20"
                  onMouseLeave={() => setShowReactions(false)}
                >
                  {reactions.map((reaction) => (
                    <motion.button
                      key={reaction.type}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${reaction.color}`}
                      onClick={() => handleReaction(reaction.type)}
                      title={reaction.label}
                    >
                      {React.createElement(reaction.icon, { className: "h-5 w-5" })}
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Reaction count and summary */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex -space-x-1">
              {topReactions.map((reaction) => {
                const reactionConfig = reactions.find(r => r.type === reaction.type);
                return (
                  <div
                    key={reaction.type}
                    className={`flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 ${reactionConfig?.color}`}
                    title={`${reaction.count} ${reactionConfig?.label}`}
                  >
                    {React.createElement(reactionConfig?.icon, { className: "h-3 w-3" })}
                  </div>
                );
              })}
            </div>
            <span className="ml-1">{totalReactions}</span>
          </div>
        )}
      </div>
    </div>
  );
}
