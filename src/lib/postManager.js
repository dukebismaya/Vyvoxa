import { logError } from './config';

const uid = () => Math.random().toString(36).slice(2);

// Enhanced post management system
export class PostManager {
  constructor() {
    this.posts = this.loadPosts();
    this.subscribers = [];
  }

  loadPosts() {
    try {
      const saved = localStorage.getItem("vyvoxa_posts");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logError(error, 'Loading posts from localStorage');
      return [];
    }
  }

  savePosts() {
    try {
      localStorage.setItem("vyvoxa_posts", JSON.stringify(this.posts));
      this.notifySubscribers();
    } catch (error) {
      logError(error, 'Saving posts to localStorage');
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.posts));
  }

  createPost(postData, currentUser) {
    const newPost = {
      id: uid(),
      userId: currentUser.id,
      text: postData.text || '',
      image: postData.image || '',
      video: postData.video || '',
      location: postData.location || '',
      feeling: postData.feeling || '',
      privacy: postData.privacy || 'public', // public, friends, private
      likes: [],
      comments: [],
      shares: [],
      reactions: {
        like: [],
        love: [],
        laugh: [],
        angry: [],
        sad: [],
        wow: []
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEdited: false,
      mentions: this.extractMentions(postData.text || ''),
      hashtags: this.extractHashtags(postData.text || '')
    };

    this.posts.unshift(newPost);
    this.savePosts();
    
    // Update user's post count
    this.updateUserPostCount(currentUser.id, 1);
    
    return newPost;
  }

  updatePost(postId, updates, userId) {
    const postIndex = this.posts.findIndex(p => p.id === postId);
    if (postIndex === -1 || this.posts[postIndex].userId !== userId) {
      throw new Error('Post not found or not authorized');
    }

    this.posts[postIndex] = {
      ...this.posts[postIndex],
      ...updates,
      updatedAt: Date.now(),
      isEdited: true,
      mentions: this.extractMentions(updates.text || this.posts[postIndex].text),
      hashtags: this.extractHashtags(updates.text || this.posts[postIndex].text)
    };

    this.savePosts();
    return this.posts[postIndex];
  }

  deletePost(postId, userId) {
    const postIndex = this.posts.findIndex(p => p.id === postId);
    if (postIndex === -1 || this.posts[postIndex].userId !== userId) {
      throw new Error('Post not found or not authorized');
    }

    this.posts.splice(postIndex, 1);
    this.savePosts();
    
    // Update user's post count
    this.updateUserPostCount(userId, -1);
    
    return true;
  }

  toggleReaction(postId, userId, reactionType = 'like') {
    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    // Remove user from all reaction types first
    Object.keys(post.reactions).forEach(type => {
      post.reactions[type] = post.reactions[type].filter(id => id !== userId);
    });

    // Add user to new reaction type
    if (!post.reactions[reactionType].includes(userId)) {
      post.reactions[reactionType].push(userId);
    }

    // Update legacy likes array for backward compatibility
    post.likes = post.reactions.like || [];

    this.savePosts();
    return post;
  }

  addComment(postId, commentData, currentUser) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const newComment = {
      id: uid(),
      userId: currentUser.id,
      text: commentData.text,
      image: commentData.image || '',
      mentions: this.extractMentions(commentData.text),
      likes: [],
      replies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEdited: false
    };

    post.comments.unshift(newComment);
    this.savePosts();
    
    return newComment;
  }

  addReply(postId, commentId, replyData, currentUser) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    const newReply = {
      id: uid(),
      userId: currentUser.id,
      text: replyData.text,
      mentions: this.extractMentions(replyData.text),
      likes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEdited: false
    };

    comment.replies = comment.replies || [];
    comment.replies.push(newReply);
    this.savePosts();
    
    return newReply;
  }

  sharePost(postId, currentUser, shareText = '') {
    const originalPost = this.posts.find(p => p.id === postId);
    if (!originalPost) throw new Error('Post not found');

    const sharePost = {
      id: uid(),
      userId: currentUser.id,
      text: shareText,
      isShare: true,
      originalPost: originalPost,
      originalPostId: postId,
      privacy: 'public',
      likes: [],
      comments: [],
      shares: [],
      reactions: {
        like: [], love: [], laugh: [], angry: [], sad: [], wow: []
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Add to original post's shares
    originalPost.shares.push({
      userId: currentUser.id,
      sharedAt: Date.now(),
      shareId: sharePost.id
    });

    this.posts.unshift(sharePost);
    this.savePosts();
    
    return sharePost;
  }

  getPostsByUser(userId, limit = 20) {
    return this.posts
      .filter(p => p.userId === userId)
      .slice(0, limit);
  }

  getPostsByPrivacy(privacy, currentUserId, friendIds = []) {
    return this.posts.filter(post => {
      if (post.privacy === 'public') return true;
      if (post.privacy === 'private' && post.userId === currentUserId) return true;
      if (post.privacy === 'friends' && 
          (post.userId === currentUserId || friendIds.includes(post.userId))) return true;
      return false;
    });
  }

  searchPosts(query, currentUserId, friendIds = []) {
    const normalizedQuery = query.toLowerCase();
    const visiblePosts = this.getPostsByPrivacy('public', currentUserId, friendIds);
    
    return visiblePosts.filter(post => 
      post.text.toLowerCase().includes(normalizedQuery) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      post.mentions.some(mention => mention.toLowerCase().includes(normalizedQuery))
    );
  }

  getTrendingHashtags(limit = 10) {
    const hashtagCount = {};
    const lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    this.posts
      .filter(p => p.createdAt > lastWeek)
      .forEach(post => {
        post.hashtags.forEach(tag => {
          hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
        });
      });

    return Object.entries(hashtagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  }

  extractHashtags(text) {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    
    while ((match = hashtagRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }
    
    return hashtags;
  }

  updateUserPostCount(userId, increment) {
    try {
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].postsCount = (users[userIndex].postsCount || 0) + increment;
        localStorage.setItem('vyvoxa_users', JSON.stringify(users));
      }
    } catch (error) {
      logError(error, 'Updating user post count');
    }
  }

  getAllPosts() {
    return this.posts;
  }
}

// Create global instance
export const postManager = new PostManager();
