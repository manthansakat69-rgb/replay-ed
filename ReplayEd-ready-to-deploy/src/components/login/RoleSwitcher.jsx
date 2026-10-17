import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Presentation, ShieldCheck } from 'lucide-react';
import { ROLES } from '../../config/mockUsers';

const ROLES_LIST = [
  { id: ROLES.STUDENT, label: 'Student', icon: GraduationCap },
  { id: ROLES.TEACHER, label: 'Teacher', icon: Presentation },
  { id: ROLES.ADMIN, label: 'Admin', icon: ShieldCheck },
];

/**
 * RoleSwitcher Component
 * Segmented control for switching user roles with an animated sliding white pill.
 */
export default function RoleSwitcher({ activeRole, onRoleChange }) {
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % ROLES_LIST.length;
      onRoleChange(ROLES_LIST[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + ROLES_LIST.length) % ROLES_LIST.length;
      onRoleChange(ROLES_LIST[prevIndex].id);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label
          id="role-switcher-label"
          className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
        >
          Select User Role
        </label>
        <span className="text-[10px] text-zinc-400 font-medium">
          {ROLES_LIST.find((r) => r.id === activeRole)?.label} mode
        </span>
      </div>

      <div
        role="tablist"
        aria-labelledby="role-switcher-label"
        className="relative grid grid-cols-3 gap-1 rounded-2xl bg-zinc-200/60 p-1 border border-zinc-200/80"
      >
        {ROLES_LIST.map((role, idx) => {
          const isActive = activeRole === role.id;
          const IconComponent = role.icon;

          return (
            <button
              key={role.id}
              role="tab"
              id={`role-tab-${role.id}`}
              aria-selected={isActive}
              aria-controls={`role-panel-${role.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onRoleChange(role.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative z-10 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-800 ${
                isActive ? 'text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {/* Active Role Sliding White Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeRoleIndicator"
                  className="absolute inset-0 z-[-1] rounded-xl bg-white shadow-sm border border-zinc-200/60"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <IconComponent
                className={`w-4 h-4 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-zinc-900' : 'text-zinc-500'
                }`}
              />
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
