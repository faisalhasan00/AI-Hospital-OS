import React from 'react';
import { LayoutDashboard, Stethoscope, Bell, FileText, Pill, TestTube, LogOut, ShieldCheck, UserCheck } from 'lucide-react';

export default function DoctorOSSidebar({ activeTab, onSelectTab, userSession, onSignOut }) {
  return (
    <aside className="doctoros-sidebar-container">
      {/* 1. Sidebar Brand Header */}
      <div className="sidebar-brand-box">
        <div className="brand-logo-badge">🩺</div>
        <div>
          <h1 className="sidebar-title">AI CLINIC OS</h1>
          <span className="sidebar-subtitle">Doctor Clinical Portal</span>
        </div>
      </div>

      {/* 2. Doctor Clinical Navigation Menu */}
      <nav className="sidebar-nav-menu">
        <div className="menu-group-label">DOCTOR CLINICAL WORKSPACE</div>
        
        <button
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
        >
          <LayoutDashboard size={17} />
          <span>OPD Dashboard & Queue</span>
          <span className="nav-badge-pill">18</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'consultation' ? 'active' : ''}`}
          onClick={() => onSelectTab('consultation')}
        >
          <Stethoscope size={17} />
          <span>Active Consultation</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => onSelectTab('alerts')}
        >
          <Bell size={17} />
          <span>Follow-up Alerts</span>
          <span className="nav-badge-alert">2</span>
        </button>

        <div className="menu-group-label" style={{ marginTop: '1.25rem' }}>PATIENT RECORDS & ORDERS</div>

        <button
          className={`sidebar-nav-item ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
        >
          <FileText size={17} />
          <span>Patient Medical Files</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
        >
          <Pill size={17} />
          <span>E-Prescriptions & Rx</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'lab_orders' ? 'active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
        >
          <TestTube size={17} />
          <span>Lab Orders & Reports</span>
        </button>
      </nav>

      {/* 3. Doctor Profile & Security Footer */}
      <div className="sidebar-footer-box">
        <div className="compliance-shield">
          <ShieldCheck size={14} /> DPDP Act 2023 Compliant
        </div>

        <div className="user-profile-row">
          <div className="user-avatar">DR</div>
          <div className="user-info">
            <strong className="user-name">Dr. Faisal Hasan, MD</strong>
            <span className="user-email">General Physician · #8921</span>
          </div>
        </div>

        {onSignOut && (
          <button className="sidebar-signout-btn" onClick={onSignOut}>
            <LogOut size={15} /> Sign Out Doctor Portal
          </button>
        )}
      </div>
    </aside>
  );
}
