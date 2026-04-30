'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  source: string | null;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentSubscribers, setRecentSubscribers] = useState<Subscriber[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [latestSubscriber, setLatestSubscriber] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    // Get last viewed timestamp from localStorage
    const lastViewed = localStorage.getItem('admin_notifications_last_viewed');
    const lastViewedDate = lastViewed ? new Date(lastViewed) : new Date(0);

    // Fetch recent subscribers
    const fetchRecentSubscribers = async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, created_at, source')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentSubscribers(data);
        // Count unread (subscribers since last viewed)
        const unread = data.filter(
          (sub) => new Date(sub.created_at) > lastViewedDate
        ).length;
        setUnreadCount(unread);
      }
    };

    fetchRecentSubscribers();

    // Set up real-time subscription
    const channel = supabase
      .channel('newsletter_subscribers_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'newsletter_subscribers',
        },
        (payload) => {
          const newSubscriber = payload.new as Subscriber;
          
          // Add to recent subscribers
          setRecentSubscribers((prev) => [newSubscriber, ...prev.slice(0, 9)]);
          
          // Increment unread count
          setUnreadCount((prev) => prev + 1);
          
          // Show toast notification
          setLatestSubscriber(newSubscriber.email);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      // Mark all as read when opening
      localStorage.setItem('admin_notifications_last_viewed', new Date().toISOString());
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-5 duration-300">
          <div className="bg-background border border-border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px]">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">New Newsletter Subscriber!</p>
              <p className="text-sm text-muted-foreground truncate">{latestSubscriber}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Bell */}
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          className="relative gap-2"
          onClick={handleToggle}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="hidden sm:inline">Notifications</span>
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Recent Subscribers</h3>
              <p className="text-xs text-muted-foreground">
                {recentSubscribers.length} recent newsletter subscriptions
              </p>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {recentSubscribers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No subscribers yet
                </div>
              ) : (
                <div className="divide-y">
                  {recentSubscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="px-4 py-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {subscriber.email}
                          </p>
                          {subscriber.source && (
                            <p className="text-xs text-muted-foreground">
                              via {subscriber.source}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(subscriber.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

