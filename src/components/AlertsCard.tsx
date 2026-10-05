import React, { useState } from 'react';
import { Bell, AlertCircle, CheckCircle2, AlertTriangle, Info, Trash2, Filter } from 'lucide-react';
import { AlertItem } from '../types/farm';

interface AlertsCardProps {
  alerts: AlertItem[];
  onClearAlerts: () => void;
  onViewAllClick?: () => void;
}

export const AlertsCard: React.FC<AlertsCardProps> = ({ 
  alerts, 
  onClearAlerts,
  onViewAllClick 
}) => {
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'critical') return a.type === 'error' || a.type === 'warning';
    return true;
  });

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'error':
        return (
          <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertCircle className="w-3.5 h-3.5 fill-rose-500/20" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        );
      case 'success':
        return (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div className="glow-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 h-full">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-rose-400">
            <Bell className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide">
            Alerts & Notifications
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onViewAllClick ? (
            <button
              onClick={onViewAllClick}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View All
            </button>
          ) : (
            <button
              onClick={() => setFilter(filter === 'all' ? 'critical' : 'all')}
              className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                filter === 'critical' 
                  ? 'bg-rose-950/70 text-rose-300 border border-rose-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'critical' ? 'Critical Only' : 'View All'}
            </button>
          )}
        </div>
      </div>

      {/* Alerts List matching screenshot */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[170px] pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-1" />
            <span>All system metrics optimal. No active alerts.</span>
          </div>
        ) : (
          filteredAlerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 transition-colors"
            >
              {/* Left: Icon + Title */}
              <div className="flex items-center gap-2.5 min-w-0">
                {getAlertIcon(alert.type)}
                <span className="text-xs font-medium text-slate-200 truncate">
                  {alert.title}
                </span>
              </div>

              {/* Right: Timestamp */}
              <span className="text-[11px] font-mono-numbers text-slate-400 whitespace-nowrap flex-shrink-0">
                {alert.timestamp}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer quick action */}
      {filteredAlerts.length > 0 && (
        <div className="pt-2 border-t border-emerald-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>{filteredAlerts.length} total event logs</span>
          <button
            onClick={onClearAlerts}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear list</span>
          </button>
        </div>
      )}
    </div>
  );
};
