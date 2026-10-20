import React from 'react';
import { useJob } from '../../context/JobContext';
import { Bell, Smartphone, MessageSquare, X, ExternalLink, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state, setPersona } = useJob();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Simulated Event & Message Feed</h3>
              <p className="text-xs text-slate-500">Live platform push & SMS notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">No notifications yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Notifications will appear when extra work is requested, completion is received, or reminders trigger.
              </p>
            </div>
          ) : (
            [...state.notifications].reverse().map((notif) => {
              const isSMS = notif.channel === 'sms';
              const recipientColor =
                notif.recipient === 'customer'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : notif.recipient === 'provider'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200';

              return (
                <div
                  key={notif.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${recipientColor}`}>
                        To: {notif.recipient.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        {isSMS ? <MessageSquare className="w-3 h-3 text-slate-400" /> : <Smartphone className="w-3 h-3 text-slate-400" />}
                        {notif.channel.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 mb-1">{notif.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>

                  {notif.recipient === 'contact' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-purple-600 font-medium">Single-use contact link</span>
                      <button
                        onClick={() => {
                          setPersona('contact');
                          onClose();
                        }}
                        className="text-[11px] font-medium text-purple-700 hover:text-purple-800 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded"
                      >
                        Open Link as Ananya <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            Simulated message delivery engine active
          </p>
        </div>
      </div>
    </div>
  );
};
