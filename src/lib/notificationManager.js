import { logError } from './config';

const uid = () => Math.random().toString(36).slice(2);

// Notification types
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPT: 'friend_accept',
  LIKE: 'like',
  COMMENT: 'comment',
  MENTION: 'mention',
  POST_SHARE: 'post_share',
  BIRTHDAY: 'birthday',
  MEMORY: 'memory',
  SYSTEM: 'system'
};

class NotificationManager {
  constructor() {
    this.notifications = this.loadNotifications();
    this.subscribers = [];
  }

  loadNotifications() {
    try {
      const saved = localStorage.getItem("vyvoxa_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logError(error, 'Loading notifications');
      return [];
    }
  }

  saveNotifications() {
    try {
      localStorage.setItem("vyvoxa_notifications", JSON.stringify(this.notifications));
      this.notifySubscribers();
    } catch (error) {
      logError(error, 'Saving notifications');
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.notifications));
  }

  createNotification(type, data, recipientId) {
    const notification = {
      id: uid(),
      type,
      recipientId,
      senderId: data.senderId || null,
      title: this.getNotificationTitle(type, data),
      message: this.getNotificationMessage(type, data),
      data: data,
      read: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    return notification;
  }

  getNotificationTitle(type, data) {
    switch (type) {
      case NOTIFICATION_TYPES.FRIEND_REQUEST:
        return 'New Friend Request';
      case NOTIFICATION_TYPES.FRIEND_ACCEPT:
        return 'Friend Request Accepted';
      case NOTIFICATION_TYPES.LIKE:
        return 'New Like';
      case NOTIFICATION_TYPES.COMMENT:
        return 'New Comment';
      case NOTIFICATION_TYPES.MENTION:
        return 'You were mentioned';
      case NOTIFICATION_TYPES.POST_SHARE:
        return 'Post Shared';
      case NOTIFICATION_TYPES.BIRTHDAY:
        return "It's someone's birthday!";
      case NOTIFICATION_TYPES.MEMORY:
        return 'Memory from this day';
      default:
        return 'Notification';
    }
  }

  getNotificationMessage(type, data) {
    const senderName = data.senderName || 'Someone';
    
    switch (type) {
      case NOTIFICATION_TYPES.FRIEND_REQUEST:
        return `${senderName} sent you a friend request`;
      case NOTIFICATION_TYPES.FRIEND_ACCEPT:
        return `${senderName} accepted your friend request`;
      case NOTIFICATION_TYPES.LIKE:
        return `${senderName} liked your post`;
      case NOTIFICATION_TYPES.COMMENT:
        return `${senderName} commented on your post`;
      case NOTIFICATION_TYPES.MENTION:
        return `${senderName} mentioned you in a post`;
      case NOTIFICATION_TYPES.POST_SHARE:
        return `${senderName} shared your post`;
      case NOTIFICATION_TYPES.BIRTHDAY:
        return `${senderName} is celebrating their birthday today!`;
      case NOTIFICATION_TYPES.MEMORY:
        return `You shared a memory ${data.yearsAgo} years ago`;
      default:
        return data.message || 'You have a new notification';
    }
  }

  getNotificationsByUser(userId, limit = 50) {
    const now = Date.now();
    return this.notifications
      .filter(n => n.recipientId === userId && n.expiresAt > now)
      .slice(0, limit);
  }

  getUnreadCount(userId) {
    const now = Date.now();
    return this.notifications.filter(n => 
      n.recipientId === userId && 
      !n.read && 
      n.expiresAt > now
    ).length;
  }

  markAsRead(notificationIds) {
    this.notifications.forEach(notification => {
      if (notificationIds.includes(notification.id)) {
        notification.read = true;
      }
    });
    this.saveNotifications();
  }

  markAllAsRead(userId) {
    this.notifications.forEach(notification => {
      if (notification.recipientId === userId) {
        notification.read = true;
      }
    });
    this.saveNotifications();
  }

  deleteNotification(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
    }
  }

  deleteOldNotifications() {
    const now = Date.now();
    const originalLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.expiresAt > now);
    
    if (this.notifications.length !== originalLength) {
      this.saveNotifications();
    }
  }

  // Auto-create notifications for common actions
  notifyFriendRequest(senderId, senderName, recipientId) {
    return this.createNotification(NOTIFICATION_TYPES.FRIEND_REQUEST, {
      senderId,
      senderName
    }, recipientId);
  }

  notifyFriendAccept(senderId, senderName, recipientId) {
    return this.createNotification(NOTIFICATION_TYPES.FRIEND_ACCEPT, {
      senderId,
      senderName
    }, recipientId);
  }

  notifyLike(senderId, senderName, recipientId, postId) {
    // Don't notify if user likes their own post
    if (senderId === recipientId) return null;
    
    return this.createNotification(NOTIFICATION_TYPES.LIKE, {
      senderId,
      senderName,
      postId
    }, recipientId);
  }

  notifyComment(senderId, senderName, recipientId, postId, commentText) {
    // Don't notify if user comments on their own post
    if (senderId === recipientId) return null;
    
    return this.createNotification(NOTIFICATION_TYPES.COMMENT, {
      senderId,
      senderName,
      postId,
      commentText
    }, recipientId);
  }

  notifyMention(senderId, senderName, recipientId, postId, mentionText) {
    return this.createNotification(NOTIFICATION_TYPES.MENTION, {
      senderId,
      senderName,
      postId,
      mentionText
    }, recipientId);
  }

  notifyPostShare(senderId, senderName, recipientId, postId) {
    // Don't notify if user shares their own post
    if (senderId === recipientId) return null;
    
    return this.createNotification(NOTIFICATION_TYPES.POST_SHARE, {
      senderId,
      senderName,
      postId
    }, recipientId);
  }

  getAllNotifications() {
    return this.notifications;
  }
}

// Global instance
export const notificationManager = new NotificationManager();

// Auto-cleanup old notifications every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    notificationManager.deleteOldNotifications();
  }, 60 * 60 * 1000);
}
