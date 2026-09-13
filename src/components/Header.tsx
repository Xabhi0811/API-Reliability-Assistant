import React from 'react';
import { ShieldCheck, Cpu, Settings, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  engineMode: 'local' | 'ai';
  engineNotice?: string;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ engineMode, engineNotice, onOpenSettings }) => {
  return (
    <header className="glass-panel app-header" id="app-header">
      <div className="header-brand">
        <div className="brand-icon-wrapper" aria-hidden="true">
          <ShieldCheck size={28} />
        </div>
        <div className="brand-text">
          <h1 id="app-title">AI API Reliability Assistant</h1>
          <p className="subtitle" id="app-subtitle">
            Analyze APIs. Find failures. Improve reliability.
          </p>
        </div>
      </div>

      <div className="header-actions">
        {engineMode === 'local' ? (
          <span
            className="badge badge-demo"
            id="engine-badge"
            title="Running completely free and locally using deterministic QA engine"
          >
            <Cpu size={13} />
            Demo / Local Analysis
          </span>
        ) : (
          <span
            className="badge badge-ai"
            id="engine-badge"
            title="Connected to AI Engine"
          >
            <Sparkles size={13} />
            AI-Powered Analysis
          </span>
        )}

        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
          <CheckCircle2 size={13} color="#10b981" />
          Offline Ready
        </span>

        <button
          className="btn btn-outline btn-sm"
          id="btn-open-settings"
          onClick={onOpenSettings}
          title="Engine & AI Configuration"
        >
          <Settings size={15} />
          Settings
        </button>
      </div>

      {engineNotice && (
        <div
          style={{
            width: '100%',
            fontSize: '0.8rem',
            color: engineMode === 'ai' ? '#818cf8' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '0.25rem',
          }}
        >
          <span>●</span>
          <span>{engineNotice}</span>
        </div>
      )}
    </header>
  );
};
