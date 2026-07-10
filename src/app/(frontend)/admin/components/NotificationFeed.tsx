'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications'
import { Button } from '@/components/ui/button'

type Notification = {
  id: string
  message: string
  isRead: boolean
  createdAt: Date
}

export function NotificationFeed() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const data = await getNotifications()
    setNotifications(data as Notification[])
    setLoading(false)
  }

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await markNotificationAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await markAllNotificationsAsRead()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 h-64 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-card"></span>
            )}
          </div>
          <h2 className="text-lg font-medium">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs text-muted-foreground hover:text-foreground">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="overflow-y-auto flex-grow p-0">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm font-light">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-muted/30 transition-colors flex items-start gap-4 ${!notification.isRead ? 'bg-primary/5' : ''}`}
              >
                <div className="mt-1">
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className={`text-sm ${!notification.isRead ? 'font-medium text-foreground' : 'font-light text-muted-foreground'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
