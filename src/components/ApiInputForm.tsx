import React, { useState } from 'react';
import type {
  ApiFormData,
  HttpMethod,
  AuthType,
  KeyValuePair,
} from '../types';
import { EXAMPLE_GET_API, EXAMPLE_POST_API, DEFAULT_EMPTY_FORM } from '../data/sampleApis';
import {
  Play,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  FileCode,
  AlertCircle,
  Code2,
} from 'lucide-react';

interface ApiInputFormProps {
  formData: ApiFormData;
  onChange: (data: ApiFormData) => void;
  onGenerate: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

export const ApiInputForm: React.FC<ApiInputFormProps> = ({
  formData,
  onChange,
  onGenerate,
  isLoading,
  errors,
}) => {
  const [jsonFormatError, setJsonFormatError] = useState<string | null>(null);

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const authTypes: AuthType[] = ['None', 'Bearer Token', 'API Key', 'Basic Auth'];

  const handleFieldChange = <K extends keyof ApiFormData>(key: K, value: ApiFormData[K]) => {
    onChange({ ...formData, [key]: value });
  };

  const addHeader = (presetKey = '', presetValue = '') => {
    const newHeader: KeyValuePair = {
      id: 'h_' + Date.now() + Math.random().toString(36).substring(2, 6),
      key: presetKey,
      value: presetValue,
      enabled: true,
    };
    handleFieldChange('headers', [...formData.headers, newHeader]);
  };

  const updateHeader = (id: string, updates: Partial<KeyValuePair>) => {
    handleFieldChange(
      'headers',
      formData.headers.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const removeHeader = (id: string) => {
    handleFieldChange(
      'headers',
      formData.headers.filter((h) => h.id !== id)
    );
  };

  const addQueryParam = () => {
    const newParam: KeyValuePair = {
      id: 'q_' + Date.now() + Math.random().toString(36).substring(2, 6),
      key: '',
      value: '',
      enabled: true,
    };
    handleFieldChange('queryParams', [...formData.queryParams, newParam]);
  };

  const updateQueryParam = (id: string, updates: Partial<KeyValuePair>) => {
    handleFieldChange(
      'queryParams',
      formData.queryParams.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQueryParam = (id: string) => {
    handleFieldChange(
      'queryParams',
      formData.queryParams.filter((q) => q.id !== id)
    );
  };

  const formatRequestBody = () => {
    if (!formData.requestBody.trim()) return;
    try {
      const parsed = JSON.parse(formData.requestBody);
      handleFieldChange('requestBody', JSON.stringify(parsed, null, 2));
      setJsonFormatError(null);
    } catch (e) {
      setJsonFormatError(e instanceof Error ? e.message : 'Invalid JSON format');
    }
  };

  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(formData.method);

  return (
    <section className="glass-panel form-card" id="api-input-panel">
      {/* Quick Load Example APIs Bar */}
      <div className="examples-bar" id="demo-examples-bar">
        <div className="examples-title">
          <Sparkles size={16} color="#6366f1" />
          <span>Preconfigured Demo Examples:</span>
        </div>
        <div className="examples-buttons">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="btn-load-example-1"
            onClick={() => onChange(EXAMPLE_GET_API)}
          >
            <span className="method-pill method-GET">GET</span>
            Load Example 1 (User by ID)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="btn-load-example-2"
            onClick={() => onChange(EXAMPLE_POST_API)}
          >
            <span className="method-pill method-POST">POST</span>
            Load Example 2 (Create Post)
          </button>
        </div>
      </div>

      {/* Endpoint & Method */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="http-method-select">
            HTTP Method
          </label>
          <select
            id="http-method-select"
            className="form-select"
            value={formData.method}
            onChange={(e) => handleFieldChange('method', e.target.value as HttpMethod)}
          >
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="api-endpoint-input">
            API Endpoint URL <span className="hint">(Must start with http:// or https://)</span>
          </label>
          <input
            id="api-endpoint-input"
            type="url"
            className={`form-input ${errors.endpoint ? 'error' : ''}`}
            placeholder="https://api.example.com/users"
            value={formData.endpoint}
            onChange={(e) => handleFieldChange('endpoint', e.target.value)}
          />
          {errors.endpoint && (
            <div className="error-text" id="endpoint-error">
              <AlertCircle size={14} />
              <span>{errors.endpoint}</span>
            </div>
          )}
        </div>
      </div>

      {/* Authentication */}
      <div className="form-group">
        <label className="form-label" htmlFor="auth-type-select">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={15} color="#818cf8" />
            Authentication Scheme
          </span>
          <span className="hint">Credentials are processed strictly in-browser</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: formData.auth.type !== 'None' ? '200px 1fr' : '1fr', gap: '0.75rem' }}>
          <select
            id="auth-type-select"
            className="form-select"
            value={formData.auth.type}
            onChange={(e) =>
              handleFieldChange('auth', {
                ...formData.auth,
                type: e.target.value as AuthType,
              })
            }
          >
            {authTypes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {formData.auth.type === 'Bearer Token' && (
            <input
              id="auth-bearer-token-input"
              type="password"
              className="form-input"
              placeholder="Enter Bearer Token (e.g. eyJhbGciOi...)"
              value={formData.auth.token || ''}
              onChange={(e) =>
                handleFieldChange('auth', { ...formData.auth, token: e.target.value })
              }
            />
          )}

          {formData.auth.type === 'API Key' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input
                id="auth-api-key-header-input"
                type="text"
                className="form-input"
                placeholder="Key Name (e.g. X-API-Key)"
                value={formData.auth.apiKeyName || ''}
                onChange={(e) =>
                  handleFieldChange('auth', { ...formData.auth, apiKeyName: e.target.value })
                }
              />
              <input
                id="auth-api-key-val-input"
                type="password"
                className="form-input"
                placeholder="Key Value (e.g. secret_key_123)"
                value={formData.auth.apiKeyValue || ''}
                onChange={(e) =>
                  handleFieldChange('auth', { ...formData.auth, apiKeyValue: e.target.value })
                }
              />
            </div>
          )}

          {formData.auth.type === 'Basic Auth' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input
                id="auth-basic-username-input"
                type="text"
                className="form-input"
                placeholder="Username"
                value={formData.auth.username || ''}
                onChange={(e) =>
                  handleFieldChange('auth', { ...formData.auth, username: e.target.value })
                }
              />
              <input
                id="auth-basic-password-input"
                type="password"
                className="form-input"
                placeholder="Password"
                value={formData.auth.password || ''}
                onChange={(e) =>
                  handleFieldChange('auth', { ...formData.auth, password: e.target.value })
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Query Parameters */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Query Parameters ({formData.queryParams.filter((q) => q.enabled).length} active)
          </label>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            id="btn-add-query-param"
            onClick={addQueryParam}
          >
            <Plus size={14} /> Add Parameter
          </button>
        </div>

        {formData.queryParams.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
            No query parameters configured. Click "+ Add Parameter" to define parameters (e.g., page=1, limit=10).
          </div>
        ) : (
          <div className="kv-container">
            {formData.queryParams.map((param) => (
              <div className="kv-row" key={param.id}>
                <input
                  type="checkbox"
                  className="kv-checkbox"
                  checked={param.enabled}
                  onChange={(e) => updateQueryParam(param.id, { enabled: e.target.checked })}
                  title="Enable/Disable parameter"
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Key (e.g. page)"
                  value={param.key}
                  onChange={(e) => updateQueryParam(param.id, { key: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Value (e.g. 1)"
                  value={param.value}
                  onChange={(e) => updateQueryParam(param.id, { value: e.target.value })}
                />
                <button
                  type="button"
                  className="kv-delete-btn"
                  onClick={() => removeQueryParam(param.id)}
                  title="Remove parameter"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Headers */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Request Headers ({formData.headers.filter((h) => h.enabled).length} active)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              id="btn-add-header-json"
              onClick={() => addHeader('Content-Type', 'application/json')}
            >
              + Content-Type
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              id="btn-add-header-custom"
              onClick={() => addHeader('', '')}
            >
              <Plus size={14} /> Add Header
            </button>
          </div>
        </div>

        {formData.headers.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
            No headers specified. Default client headers will be applied.
          </div>
        ) : (
          <div className="kv-container">
            {formData.headers.map((hdr) => (
              <div className="kv-row" key={hdr.id}>
                <input
                  type="checkbox"
                  className="kv-checkbox"
                  checked={hdr.enabled}
                  onChange={(e) => updateHeader(hdr.id, { enabled: e.target.checked })}
                  title="Enable/Disable header"
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Header Name (e.g. Accept)"
                  value={hdr.key}
                  onChange={(e) => updateHeader(hdr.id, { key: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Header Value (e.g. application/json)"
                  value={hdr.value}
                  onChange={(e) => updateHeader(hdr.id, { value: e.target.value })}
                />
                <button
                  type="button"
                  className="kv-delete-btn"
                  onClick={() => removeHeader(hdr.id)}
                  title="Remove header"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Body (Visible or Emphasized for POST/PUT/PATCH) */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label" htmlFor="request-body-editor" style={{ marginBottom: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileCode size={15} color="#06b6d4" />
              Request Body (JSON / Raw Payload)
            </span>
            {isBodyMethod ? (
              <span className="hint" style={{ color: '#38bdf8' }}>
                Recommended for {formData.method}
              </span>
            ) : (
              <span className="hint">Optional for {formData.method}</span>
            )}
          </label>
          {formData.requestBody.trim() && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              id="btn-format-json"
              onClick={formatRequestBody}
            >
              <Code2 size={13} /> Prettify JSON
            </button>
          )}
        </div>

        <textarea
          id="request-body-editor"
          className={`form-textarea code-editor ${errors.requestBody || jsonFormatError ? 'error' : ''}`}
          placeholder={
            isBodyMethod
              ? '{\n  "title": "Sample Resource",\n  "body": "Validation payload",\n  "userId": 1\n}'
              : 'Body not normally required for GET/DELETE/HEAD operations.'
          }
          value={formData.requestBody}
          onChange={(e) => {
            handleFieldChange('requestBody', e.target.value);
            if (jsonFormatError) setJsonFormatError(null);
          }}
        />

        {errors.requestBody && (
          <div className="error-text" id="body-error">
            <AlertCircle size={14} />
            <span>{errors.requestBody}</span>
          </div>
        )}
        {jsonFormatError && (
          <div className="error-text" id="json-format-error">
            <AlertCircle size={14} />
            <span>JSON Syntax Error: {jsonFormatError}</span>
          </div>
        )}
      </div>

      {/* Expected Behaviour */}
      <div className="form-group">
        <label className="form-label" htmlFor="expected-behaviour-textarea">
          <span>Expected API Behaviour / Requirements Contract</span>
          <span className="hint">Describe expected functional and negative behaviors</span>
        </label>
        <textarea
          id="expected-behaviour-textarea"
          className={`form-textarea ${errors.expectedBehaviour ? 'error' : ''}`}
          rows={3}
          placeholder="e.g. The API should return the user with ID 1 when the user exists. If the requested user does not exist, the API should return an appropriate not-found response (404)."
          value={formData.expectedBehaviour}
          onChange={(e) => handleFieldChange('expectedBehaviour', e.target.value)}
        />
        {errors.expectedBehaviour && (
          <div className="error-text" id="behaviour-error">
            <AlertCircle size={14} />
            <span>{errors.expectedBehaviour}</span>
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          id="btn-clear-form"
          onClick={() => onChange(DEFAULT_EMPTY_FORM)}
          disabled={isLoading}
        >
          <RotateCcw size={15} /> Clear Form
        </button>

        <div className="action-buttons-group">
          <button
            type="button"
            className="btn btn-primary"
            id="btn-generate-plan"
            onClick={onGenerate}
            disabled={isLoading}
            style={{ minWidth: '200px' }}
          >
            {isLoading ? (
              <>
                <span className="spinner">⟳</span>
                Analyzing API Reliability...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Generate Test Plan
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
