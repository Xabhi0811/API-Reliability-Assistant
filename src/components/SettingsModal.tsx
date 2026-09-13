import React, { useState } from 'react';
import type { AISettings } from '../services/aiService';
import { X, ShieldCheck, Key, Cpu, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (newSettings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [provider, setProvider] = useState<'local' | 'gemini' | 'openai'>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model || 'gemini-1.5-flash');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      provider,
      apiKey: apiKey.trim(),
      model,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" id="settings-modal-overlay">
      <div className="modal-card" id="settings-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={20} color="#6366f1" />
            <h3 id="settings-modal-title">Engine & AI Configuration</h3>
          </div>
          <button
            type="button"
            className="modal-close"
            id="btn-close-settings"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
              fontSize: '0.825rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>100% Free & Local by default:</strong> No paid subscription or API key is
              required. The local deterministic engine parses all REST semantics and provides full
              structured test suites.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="engine-provider-select">
              Analysis Engine Provider
            </label>
            <select
              id="engine-provider-select"
              className="form-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'local' | 'gemini' | 'openai')}
            >
              <option value="local">Local Deterministic Engine (Zero cost, offline, built-in)</option>
              <option value="gemini">Google Gemini API (Optional free-tier key)</option>
              <option value="openai">OpenAI / Compatible Endpoint (Optional)</option>
            </select>
          </div>

          {provider !== 'local' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="ai-api-key-input">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Key size={14} /> {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
                  </span>
                  <span className="hint">Stored only in local session memory</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="ai-api-key-input"
                    type={showKey ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowKey(!showKey)}
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ai-model-select">
                  Model Name
                </label>
                <select
                  id="ai-model-select"
                  className="form-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {provider === 'gemini' ? (
                    <>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Free Tier)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                      <option value="gpt-4o">gpt-4o</option>
                    </>
                  )}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setProvider('local');
              setApiKey('');
            }}
          >
            Reset to Local Default
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            id="btn-save-settings"
            onClick={handleSave}
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
