import React from 'react';
import { LayoutDashboard, Stethoscope, Bell, Users, TestTube, Pill, Receipt, Settings, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { ALL_ROLES } from './RoleSwitcherHeader.jsx';

export default function DoctorOSSidebar({ activeRole, onSelectRole, activeTab, onSelectTab, userSession, onSignOut }) {
  return (
    <aside className="doctoros-sidebar-container">
      {/* 1. Sidebar Brand Header */}
      <div className="sidebar-brand-box">
        <div className="brand-logo-badge">🩺</div>
        <div>
          <h1 className="sidebar-title">AI CLINIC OS</h1>
          <span className="sidebar-subtitle">City Care Clinic • OPD</span>
        </div>
      </div>

      {/* 2. Active Role Switcher Box */}
      <div className="sidebar-role-box">
        <label>ACTIVE CLINICAL ROLE:</label>
        <div className="role-dropdown-wrapper">
          <select value={activeRole} onChange={(e) => onSelectRole(e.target.value)} className="sidebar-role-select">
            {ALL_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="dropdown-arrow-icon" />
        </div>
      </div>

      {/* 3. Navigation Menu Items */}
      <nav className="sidebar-nav-menu">
        <div className="menu-group-label">CLINICAL WORKSPACE</div>
        
        <button
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard & Queue</span>
          <span className="nav-badge-pill">18</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'consultation' ? 'active' : ''}`}
          onClick={() => onSelectTab('consultation')}
        >
          <Stethoscope size={18} />
          <span>Live Consultation & Scribe</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => onSelectTab('alerts')}
        >
          <Bell size={18} />
          <span>Follow-up Alerts</span>
          <span className="nav-badge-alert">2</span>
        </button>

        <div className="menu-group-label" style={{ marginTop: '1rem' }}>DEPARTMENTS</div>

        <button className="sidebar-nav-item" onClick={() => onSelectRole('receptionist')}>
          <Users size={18} />
          <span>Front Desk & Queue</span>
        </button>

        <button className="sidebar-nav-item" onClick={() => onSelectRole('lab_tech')}>
          <TestTube size={18} />
          <span>Lab Orders & Reports</span>
        </button>

        <button className="sidebar-nav-item" onClick={() => onSelectRole('pharmacist')}>
          <Pill size={18} />
          <span>Pharmacy Counter</span>
        </button>

        <button className="sidebar-nav-item" onClick={() => onSelectRole('accountant')}>
          <Receipt size={18} />
          <span>Billing & Invoices</span>
        </button>

        <button className="sidebar-nav-item disabled-item">
          <Settings size={18} />
          <span>Clinic Settings</span>
        </button>
      </nav>

      {/* 4. Sidebar Compliance Footer & User Info */}
      <div className="sidebar-footer-box">
        <div className="compliance-shield">
          <ShieldCheck size={14} /> DPDP Act 2023 Compliant
        </div>
        <div className="user-profile-row">
          <div className="user-avatar">DR</div>
          <div className="user-info">
            <strong className="user-name">Dr. Ahmed</strong>
            <span className="user-email">doctor@ai-hospital.com</span>
          </div>
        </div>

        {onSignOut && (
          <button className="sidebar-signout-btn" onClick={onSignOut}>
            <LogOut size={16} /> Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
