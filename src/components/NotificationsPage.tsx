import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onDelete: (notificationId: string) => void;
}

export function NotificationsPage({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}: NotificationsPageProps) {
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Notifications
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Activity inbox</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Track project requests, assignments, visible project updates, and the latest
              document activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {unreadCount} unread
            </div>
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Bell className="mx-auto mb-4 text-slate-300" size={40} />
            <h2 className="text-lg font-semibold text-slate-900">No notifications yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              New request activity, project events, and team updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-3xl border p-6 shadow-sm transition-colors ${
                notification.isRead
                  ? 'border-slate-200 bg-white'
                  : 'border-indigo-200 bg-indigo-50/40'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                      {notification.type.replaceAll('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">{notification.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => onMarkRead(notification.id)}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50"
                    >
                      Mark read
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDelete(notification.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
