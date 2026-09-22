import React from "react";
import { QUICK_ACTIONS } from "../utils/quickActions";

export const QuickActionsBar = ({ onSelectAction }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md w-full px-2">
      {QUICK_ACTIONS.map(({ id, label, Icon, ...action }) => (
        <button
          key={id}
          onClick={() => onSelectAction({ id, label, Icon, ...action })}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 rounded-full text-xs font-medium shadow-xs transition-all duration-200"
        >
          <Icon className="w-3.5 h-3.5 text-purple-600" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};