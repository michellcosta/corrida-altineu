'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read_at: string | null
  created_at: string
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications', { credentials: 'include' })
      if (!res.ok) return
      const json = await res.json()
      setNotifications(json.notifications || [])
      setUnreadCount(json.unreadCount ?? 0)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = useCallback(async (ids?: string[], markAll?: boolean) => {
    try {
      const body = markAll || !ids?.length ? { all: true } : { ids }
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (res.ok) await fetchNotifications()
    } catch {
      // ignore
    }
  }, [fetchNotifications])

  return { notifications, unreadCount, loading, fetchNotifications, markAsRead }
}
