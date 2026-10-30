import React from 'react';

export default function Card({ children, title, subtitle, icon: Icon, badge, action, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden transition-all duration-200 hover:shadow-card ${className}`}>
      {(title || Icon || badge || action) && (
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
                {badge}
              </div>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
