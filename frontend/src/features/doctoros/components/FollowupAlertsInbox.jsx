import React from 'react';
import { AlertCircle, PhoneCall, CheckCircle, MessageSquare, ShieldAlert } from 'lucide-react';

export default function FollowupAlertsInbox({ alerts = [], onResolveAlert }) {
  const sampleAlerts = [
    {
      id: 'ALT-101',
      patientName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      status: 'NEEDS_REVIEW',
      patientReply: 'I still have a high fever (102°F) and severe headache even after taking Paracetamol.',
      time: '10 mins ago',
      recommendedAction: 'Doctor Call Back Required'
    },
    {
      id: 'ALT-102',
      patientName: 'Priya Patel',
      phone: '+91 98123 45678',
      status: 'EMERGENCY',
      patientReply: 'Sudden severe chest tightness and difficulty breathing.',
      time: '2 mins ago',
      recommendedAction: '🚨 EMERGENCY: On-call Doctor Notified / Advised ER Visit'
    }
  ];

  const activeAlerts = alerts.length > 0 ? alerts : sampleAlerts;

  return (
    <div className="alerts-inbox-container">
      <div className="card-header">
        <h3>📱 Follow-up Recovery Alerts Inbox</h3>
        <span className="alert-count-pill">{activeAlerts.length} Action Items</span>
      </div>

      <div className="alerts-list">
        {activeAlerts.map((alt) => (
          <div key={alt.id} className={`alert-card-item ${alt.status.toLowerCase()}`}>
            <div className="alert-card-header">
              <div className="alert-patient-name">
                <strong>{alt.patientName}</strong> <span className="alert-phone">({alt.phone})</span>
              </div>
              <span className={`alert-status-badge ${alt.status.toLowerCase()}`}>
                {alt.status === 'EMERGENCY' ? <ShieldAlert size={14} /> : <AlertCircle size={14} />}
                {alt.status}
              </span>
            </div>

            <div className="alert-patient-reply">
              <MessageSquare size={16} />
              <span>"{alt.patientReply}"</span>
            </div>

            <div className="alert-card-footer">
              <div className="alert-time">{alt.time}</div>
              <div className="alert-actions">
                <button className="btn-call-patient">
                  <PhoneCall size={14} /> Call Patient Now
                </button>
                <button className="btn-resolve" onClick={() => onResolveAlert && onResolveAlert(alt.id)}>
                  <CheckCircle size={14} /> Mark Resolved
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
