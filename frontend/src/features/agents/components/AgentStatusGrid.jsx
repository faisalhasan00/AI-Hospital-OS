import React, { useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';

export default function AgentStatusGrid({ agents, logs }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'var(--color-cyan)';
      case 'processing':
        return 'var(--color-teal)';
      case 'success':
        return 'var(--color-green)';
      case 'warning':
        return 'var(--color-amber)';
      case 'danger':
        return 'var(--color-crimson)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getStatusGlow = (status) => {
    switch (status) {
      case 'active':
        return 'glow-cyan';
      case 'processing':
        return 'glow-teal';
      case 'success':
        return 'glow-green';
      case 'warning':
        return 'glow-amber';
      case 'danger':
        return 'glow-crimson';
      default:
        return '';
    }
  };

  const getAgentIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={20} /> : <Icons.HelpCircle size={20} />;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', height: '100%' }}>
      {/* Agent Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Cpu size={22} style={{ color: 'var(--color-cyan)' }} />
          Capsule Agent Registry
        </h2>
        <div className="agent-grid">
          {agents.map((agent) => {
            const statusColor = getStatusColor(agent.status);
            const glowClass = getStatusGlow(agent.status);
            return (
              <div 
                key={agent.id} 
                className={`glass-panel glass-panel-hover ${glowClass}`} 
                style={{ 
                  padding: '15px', 
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Agent Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ 
                    color: statusColor,
                    background: `rgba(${agent.status === 'idle' ? '15, 23, 42' : agent.status === 'active' || agent.status === 'processing' ? '2, 132, 199' : agent.status === 'success' ? '22, 163, 74' : '220, 38, 38'}, 0.08)`,
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getAgentIcon(agent.icon)}
                  </div>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: statusColor,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(0, 0, 0, 0.05)'
                  }}>
                    {agent.status}
                  </span>
                </div>

                {/* Agent Info */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {agent.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3', height: '30px', overflow: 'hidden' }}>
                    {agent.role}
                  </p>
                </div>

                {/* Pulse Line & Current Action */}
                <div style={{ 
                  marginTop: 'auto', 
                  paddingTop: '8px', 
                  borderTop: '1px solid var(--border-muted)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: agent.status === 'idle' ? 'var(--text-muted)' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {agent.activity}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Terminal size={22} style={{ color: 'var(--color-teal)' }} />
          Capsule Live Diagnostics
        </h2>
        <div 
          className="terminal-view" 
          style={{ 
            height: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 'auto', textAlign: 'center' }}>
              <Icons.ShieldAlert size={36} style={{ marginBottom: '10px', opacity: 0.3, display: 'inline-block' }} />
              <p>System stands by. Initiate patient reception to stream logs...</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="terminal-line" style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span className="timestamp">[{log.time}]</span>
                <span className="agent-tag" style={{ color: log.color || 'var(--color-cyan)' }}>
                  {log.agent}:
                </span>
                <span style={{ flex: 1, color: 'var(--text-primary)' }}>{log.message}</span>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
