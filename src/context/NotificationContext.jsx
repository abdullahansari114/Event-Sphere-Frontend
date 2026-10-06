import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { messageService } from '../services/messageService'
import { socket } from '../utils/socket'

const NotificationContext = createContext(null)

// This context supplies conversations/unread data to both the Navbar (bell badge)
// and the Notifications page (list) from a single place, so the two stay in sync
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])

  const refresh = useCallback(() => {
    if (!user) {
      setConversations([])
      return
    }
    messageService
      .getConversations()
      .then(setConversations)
      .catch(() => {})
  }, [user])

  // As soon as the user logs in (or changes), fetch all chat threads so far
  useEffect(() => {
    refresh()
  }, [refresh])

  // Live: whenever a new message arrives (on any page), update the list right away
  useEffect(() => {
    if (!user) return

    const handleReceive = (msg) => {
      const senderId = msg.sender?._id
      const receiverId = msg.receiver?._id
      const iAmReceiver = receiverId === user.id
      const otherUser = iAmReceiver ? msg.sender : msg.receiver
      if (!otherUser) return

      setConversations((prev) => {
        const existing = prev.find((c) => c.user._id === otherUser._id)
        const updated = {
          user: otherUser,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          lastSenderIsMe: !iAmReceiver,
          unreadCount: iAmReceiver ? (existing?.unreadCount || 0) + 1 : (existing?.unreadCount || 0),
        }
        const rest = prev.filter((c) => c.user._id !== otherUser._id)
        return [updated, ...rest]
      })
    }

    socket.on('receiveMessage', handleReceive)
    return () => socket.off('receiveMessage', handleReceive)
  }, [user])

  // Mark a conversation as "read" (as soon as the chat opens) — local state only,
  // the actual read-mark on the backend happens via ChatModal's getConversation call
  const markConversationRead = useCallback((otherUserId) => {
    setConversations((prev) =>
      prev.map((c) => (c.user._id === otherUserId ? { ...c, unreadCount: 0 } : c)),
    )
  }, [])

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  return (
    <NotificationContext.Provider
      value={{ conversations, unreadTotal, refresh, markConversationRead }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider')
  return ctx
}