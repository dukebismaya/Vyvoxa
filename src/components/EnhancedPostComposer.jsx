import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  Smile,
  Users,
  Globe,
  Lock,
  Eye,
  X,
  Video,
  Gift,
  Calendar,
  Hash,
  AtSign,
  Send
} from 'lucide-react';

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this post' },
  { value: 'friends', label: 'Friends', icon: Users, description: 'Only your friends can see this' },
  { value: 'private', label: 'Only me', icon: Lock, description: 'Only you can see this post' }
];

const FEELING_OPTIONS = [
  '😊 feeling happy', '😢 feeling sad', '😍 feeling loved', '🎉 feeling excited',
  '😴 feeling sleepy', '🤔 feeling thoughtful', '💪 feeling strong', '🏖️ feeling relaxed',
  '🎵 listening to music', '🍕 craving food', '☕ need coffee', '🌟 feeling blessed'
];

export default function EnhancedPostComposer({ onPost, onCancel, initialData = {} }) {
  const { currentUser } = useAuth();
  const [text, setText] = useState(initialData.text || '');
  const [image, setImage] = useState(initialData.image || '');
  const [video, setVideo] = useState(initialData.video || '');
  const [location, setLocation] = useState(initialData.location || '');
  const [feeling, setFeeling] = useState(initialData.feeling || '');
  const [privacy, setPrivacy] = useState(initialData.privacy || 'public');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [showPrivacyPicker, setShowPrivacyPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    if (!text.trim() && !image && !video) return;
    
    setIsPosting(true);
    try {
      await onPost({
        text: text.trim(),
        image,
        video,
        location,
        feeling,
        privacy
      });
      
      // Reset form
      setText('');
      setImage('');
      setVideo('');
      setLocation('');
      setFeeling('');
      setPrivacy('public');
      setShowImageInput(false);
      setShowVideoInput(false);
      setShowLocationInput(false);
    } catch (error) {
      console.error('Error posting:', error);
    }
    setIsPosting(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getPrivacyOption = (value) => PRIVACY_OPTIONS.find(opt => opt.value === value);
  const PrivacyIcon = getPrivacyOption(privacy)?.icon || Globe;

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }
    return hashtags;
  };

  const mentions = extractMentions(text);
  const hashtags = extractHashtags(text);
  const charCount = text.length;
  const maxChars = 280;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-12 w-12 border-2 border-white/50 shadow-sm">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white">
                {currentUser?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{currentUser?.name}</h3>
                {feeling && (
                  <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                    {feeling}
                  </Badge>
                )}
                {location && (
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                    <MapPin className="h-3 w-3 mr-1" />
                    {location}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => setShowPrivacyPicker(!showPrivacyPicker)}
                className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 mt-1"
              >
                <PrivacyIcon className="h-3 w-3" />
                {getPrivacyOption(privacy)?.label}
              </button>
            </div>
          </div>

          {/* Privacy Picker */}
          <AnimatePresence>
            {showPrivacyPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <Card className="border border-zinc-200 dark:border-zinc-700">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {PRIVACY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setPrivacy(option.value);
                              setShowPrivacyPicker(false);
                            }}
                            className={`w-full text-left p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                              privacy === option.value ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                              <div>
                                <div className="font-medium text-sm">{option.label}</div>
                                <div className="text-xs text-zinc-500">{option.description}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Area */}
          <div className="mb-4">
            <Textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="border-0 bg-transparent p-0 text-lg placeholder:text-zinc-400 resize-none focus:ring-0 min-h-[100px]"
              maxLength={maxChars}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2 flex-wrap">
                {hashtags.length > 0 && (
                  <div className="flex gap-1 items-center">
                    <Hash className="h-3 w-3 text-blue-500" />
                    {hashtags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {mentions.length > 0 && (
                  <div className="flex gap-1 items-center">
                    <AtSign className="h-3 w-3 text-purple-500" />
                    {mentions.map((mention, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                        @{mention}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className={`text-sm ${charCount > maxChars * 0.8 ? 'text-red-500' : 'text-zinc-400'}`}>
                {charCount}/{maxChars}
              </div>
            </div>
          </div>

          {/* Media Previews */}
          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 relative"
              >
                <img
                  src={image}
                  alt="Preview"
                  className="rounded-xl max-h-64 w-full object-cover border border-zinc-200 dark:border-zinc-700"
                />
                <button
                  onClick={() => setImage('')}
                  className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {video && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 relative"
              >
                <video
                  src={video}
                  controls
                  className="rounded-xl max-h-64 w-full object-cover border border-zinc-200 dark:border-zinc-700"
                />
                <button
                  onClick={() => setVideo('')}
                  className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Fields */}
          <AnimatePresence>
            {showImageInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <input
                  type="url"
                  placeholder="Enter image URL..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white/50 dark:bg-zinc-800/50"
                />
              </motion.div>
            )}

            {showLocationInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <input
                  type="text"
                  placeholder="Where are you?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white/50 dark:bg-zinc-800/50"
                />
              </motion.div>
            )}

            {showFeelingPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {FEELING_OPTIONS.map((feelingOption, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setFeeling(feelingOption);
                        setShowFeelingPicker(false);
                      }}
                      className="text-left p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm transition-colors"
                    >
                      {feelingOption}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`text-green-600 hover:bg-green-50 ${showImageInput ? 'bg-green-50' : ''}`}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:bg-blue-50"
              >
                <Camera className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className={`text-red-600 hover:bg-red-50 ${showLocationInput ? 'bg-red-50' : ''}`}
              >
                <MapPin className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeelingPicker(!showFeelingPicker)}
                className={`text-orange-600 hover:bg-orange-50 ${showFeelingPicker ? 'bg-orange-50' : ''}`}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={isPosting}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={(!text.trim() && !image && !video) || isPosting || charCount > maxChars}
                className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600 text-white border-0"
              >
                {isPosting ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
