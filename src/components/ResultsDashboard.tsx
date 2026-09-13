import React, { useState } from 'react';
import type {
  TestPlanReport,
  TabId,
  PriorityLevel,
  TestCase,
} from '../types';
import {
  Copy,
  Download,
  Check,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Code,
  Flame,
  Zap,
  Filter,
  Search,
  Layers,
  Terminal,
  FileSpreadsheet,
} from 'lucide-react';
import { formatReportAsMarkdown, downloadReportFile } from '../utils/exportUtils';

interface ResultsDashboardProps {
  report: TestPlanReport;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ report, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'All'>('All');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const {
    summary,
    positiveTests,
    negativeTests,
    edgeCases,
    validationChecks,
    securityChecks,
    statusCodes,
    sampleData,
    reliabilityRecommendations,
    riskSummary,
  } = report;

  const handleCopyFullPlan = async () => {
    try {
      const md = formatReportAsMarkdown(report);
      await navigator.clipboard.writeText(md);
      setCopiedSection('full');
      onShowToast('Complete API Reliability Test Plan copied to clipboard!', 'success');
      setTimeout(() => setCopiedSection(null), 2500);
    } catch {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleCopySnippet = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(id);
      onShowToast('Snippet copied to clipboard!', 'success');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      onShowToast('Failed to copy snippet', 'error');
    }
  };

  const filterTestCases = (cases: TestCase[]) => {
    return cases.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.expectedBehaviour.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  };

  const getPriorityBadgeClass = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return 'badge-priority-critical';
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
        return 'badge-priority-low';
      default:
        return 'badge-priority-low';
    }
  };

  const getStatusBadgeClass = (status: number | string) => {
    const s = String(status);
    if (s.startsWith('2')) return 'badge-status-2xx';
    if (s.startsWith('4')) return 'badge-status-4xx';
    if (s.startsWith('5')) return 'badge-status-5xx';
    return 'badge-status-auth';
  };

  return (
    <section className="glass-panel" id="results-dashboard" style={{ overflow: 'hidden' }}>
      {/* Top Header & Export Controls */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <Layers size={22} color="#6366f1" />
          <div>
            <h2 id="dashboard-heading">Reliability Test Plan & Audit Results</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Generated for <span className={`method-pill method-${summary.method}`}>{summary.method}</span>{' '}
              <code style={{ color: '#38bdf8' }}>{summary.endpoint}</code>
            </p>
          </div>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="btn-copy-test-plan"
            onClick={handleCopyFullPlan}
            title="Copy complete structured test plan as markdown"
          >
            {copiedSection === 'full' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            Copy Test Plan
          </button>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              id="btn-export-report"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              title="Download test plan file"
            >
              <Download size={14} />
              Export Report ▾
            </button>

            {exportMenuOpen && (
              <div
                id="export-dropdown-menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  zIndex: 50,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: '180px',
                  padding: '0.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  id="btn-export-json"
                  style={{ justifyContent: 'flex-start', border: 'none' }}
                  onClick={() => {
                    downloadReportFile(report, 'json');
                    setExportMenuOpen(false);
                    onShowToast('Exported report as JSON', 'success');
                  }}
                >
                  <FileSpreadsheet size={14} color="#38bdf8" /> Download JSON (.json)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  id="btn-export-md"
                  style={{ justifyContent: 'flex-start', border: 'none' }}
                  onClick={() => {
                    downloadReportFile(report, 'md');
                    setExportMenuOpen(false);
                    onShowToast('Exported report as Markdown', 'success');
                  }}
                >
                  <Code size={14} color="#6366f1" /> Download Markdown (.md)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  id="btn-export-txt"
                  style={{ justifyContent: 'flex-start', border: 'none' }}
                  onClick={() => {
                    downloadReportFile(report, 'txt');
                    setExportMenuOpen(false);
                    onShowToast('Exported report as Text', 'success');
                  }}
                >
                  <Terminal size={14} color="#10b981" /> Download Text (.txt)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Search & Priority Filter for Test Suites */}
      {['positive', 'negative', 'edge'].includes(activeTab) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1.25rem',
            background: 'rgba(0,0,0,0.2)',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              id="test-search-input"
              className="form-input"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', background: 'transparent' }}
              placeholder="Search scenarios, IDs, expected behaviors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority:</span>
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`btn btn-sm ${priorityFilter === lvl ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                onClick={() => setPriorityFilter(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <nav className="tab-nav" id="dashboard-tab-nav" aria-label="Test Plan Sections">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          id="tab-btn-overview"
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'positive' ? 'active' : ''}`}
          id="tab-btn-positive"
          onClick={() => setActiveTab('positive')}
        >
          Positive Tests <span className="tab-count">{positiveTests.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'negative' ? 'active' : ''}`}
          id="tab-btn-negative"
          onClick={() => setActiveTab('negative')}
        >
          Negative Tests <span className="tab-count">{negativeTests.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'edge' ? 'active' : ''}`}
          id="tab-btn-edge"
          onClick={() => setActiveTab('edge')}
        >
          Edge Cases <span className="tab-count">{edgeCases.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
          id="tab-btn-validation"
          onClick={() => setActiveTab('validation')}
        >
          Validation <span className="tab-count">{validationChecks.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          id="tab-btn-security"
          onClick={() => setActiveTab('security')}
        >
          Security <span className="tab-count">{securityChecks.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'status-codes' ? 'active' : ''}`}
          id="tab-btn-status-codes"
          onClick={() => setActiveTab('status-codes')}
        >
          Status Codes <span className="tab-count">{statusCodes.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'test-data' ? 'active' : ''}`}
          id="tab-btn-test-data"
          onClick={() => setActiveTab('test-data')}
        >
          Test Data <span className="tab-count">{sampleData.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'reliability' ? 'active' : ''}`}
          id="tab-btn-reliability"
          onClick={() => setActiveTab('reliability')}
        >
          Reliability <span className="tab-count">{reliabilityRecommendations.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'risk-summary' ? 'active' : ''}`}
          id="tab-btn-risk-summary"
          onClick={() => setActiveTab('risk-summary')}
        >
          Risk Summary <span className="tab-count">{riskSummary.critical.length + riskSummary.high.length}</span>
        </button>
      </nav>

      {/* Tab Contents */}
      <div className="tab-content">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div id="tab-content-overview" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-title">Reliability Health Score</span>
                <div className="stat-value">
                  <span style={{ color: summary.reliabilityScore >= 90 ? '#10b981' : '#f59e0b' }}>
                    {summary.reliabilityScore}
                  </span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-title">Total Test Scenarios</span>
                <div className="stat-value">
                  {positiveTests.length + negativeTests.length + edgeCases.length + securityChecks.length}
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-title">Critical & High Risks</span>
                <div className="stat-value" style={{ color: '#ef4444' }}>
                  <Flame size={24} />
                  {riskSummary.critical.length + riskSummary.high.length}
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-title">Analyzed Engine</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.4rem', color: '#818cf8' }}>
                  {summary.engine}
                </div>
              </div>
            </div>

            {/* API Summary Card */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-input)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="#10b981" />
                API Profile Summary
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Endpoint</span>
                  <div style={{ wordBreak: 'break-all', fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {summary.endpoint}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>HTTP Method</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <span className={`method-pill method-${summary.method}`}>{summary.method}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Authentication Scheme</span>
                  <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{summary.authentication}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expected Content-Type</span>
                  <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{summary.contentType}</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detected Business Purpose</span>
                <p style={{ marginTop: '0.2rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{summary.purpose}</p>
              </div>
            </div>

            {/* Architectural Assumptions */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-input)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} color="#06b6d4" />
                Key Identified Assumptions
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {summary.assumptions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 2. POSITIVE TESTS TAB */}
        {activeTab === 'positive' && (
          <div id="tab-content-positive">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Test ID</th>
                    <th>Scenario</th>
                    <th style={{ width: '100px' }}>Priority</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th>Sample Request / Input</th>
                    <th>Expected Behaviour</th>
                  </tr>
                </thead>
                <tbody>
                  {filterTestCases(positiveTests).map((test) => (
                    <tr key={test.id}>
                      <td>
                        <span className="code-cell">{test.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{test.scenario}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(test.priority)}`}>
                          {test.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(test.expectedStatus)}`}>
                          {test.expectedStatus}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.75rem', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                          {test.input}
                        </code>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{test.expectedBehaviour}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. NEGATIVE TESTS TAB */}
        {activeTab === 'negative' && (
          <div id="tab-content-negative">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Test ID</th>
                    <th>Negative Scenario</th>
                    <th style={{ width: '100px' }}>Priority</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th>Fault Input / Invalid Condition</th>
                    <th>Expected System Behaviour</th>
                  </tr>
                </thead>
                <tbody>
                  {filterTestCases(negativeTests).map((test) => (
                    <tr key={test.id}>
                      <td>
                        <span className="code-cell">{test.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{test.scenario}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(test.priority)}`}>
                          {test.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(test.expectedStatus)}`}>
                          {test.expectedStatus}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.75rem', color: '#f87171', whiteSpace: 'pre-wrap' }}>
                          {test.input}
                        </code>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{test.expectedBehaviour}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. EDGE CASES TAB */}
        {activeTab === 'edge' && (
          <div id="tab-content-edge">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Test ID</th>
                    <th>Edge / Boundary Scenario</th>
                    <th style={{ width: '100px' }}>Priority</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th>Boundary Input / Stress Vector</th>
                    <th>Expected Behaviour</th>
                  </tr>
                </thead>
                <tbody>
                  {filterTestCases(edgeCases).map((test) => (
                    <tr key={test.id}>
                      <td>
                        <span className="code-cell">{test.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{test.scenario}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(test.priority)}`}>
                          {test.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(test.expectedStatus)}`}>
                          {test.expectedStatus}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.75rem', color: '#38bdf8', whiteSpace: 'pre-wrap' }}>
                          {test.input}
                        </code>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{test.expectedBehaviour}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. VALIDATION CHECKS TAB */}
        {activeTab === 'validation' && (
          <div id="tab-content-validation">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Check ID</th>
                    <th>Category</th>
                    <th>Target Field / Contract</th>
                    <th>Validation Rule</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Implementation Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {validationChecks.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <span className="code-cell">{v.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{v.category}</td>
                      <td>
                        <code style={{ color: '#38bdf8', fontSize: '0.8rem' }}>{v.field}</code>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{v.rule}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(v.expectedStatus)}`}>
                          {v.expectedStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(v.priority)}`}>
                          {v.priority}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{v.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. SECURITY CHECKS TAB */}
        {activeTab === 'security' && (
          <div id="tab-content-security">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>ID</th>
                    <th>Category</th>
                    <th>Defensive Test Scenario</th>
                    <th>Priority</th>
                    <th>Expected Status</th>
                    <th>Security Risk & Safe Remediation</th>
                  </tr>
                </thead>
                <tbody>
                  {securityChecks.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="code-cell">{s.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.category}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.scenario}</div>
                        {s.input && (
                          <div style={{ marginTop: '0.25rem' }}>
                            <code style={{ fontSize: '0.75rem', color: '#fbbf24' }}>{s.input}</code>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(s.priority)}`}>
                          {s.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(s.expectedStatus)}`}>
                          {s.expectedStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.825rem' }}>
                        <div style={{ color: '#ef4444', marginBottom: '0.25rem' }}>
                          <strong>Risk:</strong> {s.riskDescription}
                        </div>
                        <div style={{ color: '#10b981' }}>
                          <strong>Remediation:</strong> {s.remediation}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. STATUS CODES TAB */}
        {activeTab === 'status-codes' && (
          <div id="tab-content-status-codes" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Dedicated HTTP Status Code Expectations matrix strictly tailored to this endpoint and REST semantics.
            </p>
            <div className="table-responsive">
              <table className="data-table" id="status-code-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Status Code</th>
                    <th>Scenario</th>
                    <th>Category</th>
                    <th>HTTP RFC Explanation / Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {statusCodes.map((sc, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(sc.status)}`} style={{ fontSize: '0.85rem' }}>
                          HTTP {sc.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{sc.scenario}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background:
                              sc.category === 'Success'
                                ? 'rgba(16,185,129,0.1)'
                                : sc.category === 'Client Error'
                                ? 'rgba(245,158,11,0.1)'
                                : sc.category === 'Auth'
                                ? 'rgba(168,85,247,0.1)'
                                : 'rgba(244,63,94,0.1)',
                            color:
                              sc.category === 'Success'
                                ? '#34d399'
                                : sc.category === 'Client Error'
                                ? '#fbbf24'
                                : sc.category === 'Auth'
                                ? '#c084fc'
                                : '#f87171',
                          }}
                        >
                          {sc.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sc.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. SAMPLE TEST DATA TAB */}
        {activeTab === 'test-data' && (
          <div id="tab-content-test-data" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Executable cURL commands and JSON payloads for manual QA testing or automated pipelines.
            </p>
            {sampleData.map((s) => (
              <div key={s.id} className="code-snippet-box">
                <div className="snippet-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className="badge"
                      style={{
                        background:
                          s.type === 'valid'
                            ? 'rgba(16,185,129,0.15)'
                            : s.type === 'invalid'
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(56,189,248,0.15)',
                        color:
                          s.type === 'valid' ? '#34d399' : s.type === 'invalid' ? '#f87171' : '#38bdf8',
                      }}
                    >
                      {s.type.toUpperCase()}
                    </span>
                    <strong style={{ color: '#ffffff' }}>{s.title}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>— {s.description}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleCopySnippet(s.id, s.payload)}
                  >
                    {copiedSection === s.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    Copy
                  </button>
                </div>
                <div className="snippet-content">{s.payload}</div>
              </div>
            ))}
          </div>
        )}

        {/* 9. RELIABILITY RECOMMENDATIONS TAB */}
        {activeTab === 'reliability' && (
          <div id="tab-content-reliability" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {reliabilityRecommendations.map((r) => (
              <div
                key={r.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-input)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#06b6d4', fontWeight: 700 }}>
                    {r.area}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(r.severity)}`}>
                    {r.severity}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{r.recommendation}</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {r.guidance}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 10. RISK SUMMARY TAB */}
        {activeTab === 'risk-summary' && (
          <div id="tab-content-risk-summary" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
                <h4 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <ShieldAlert size={18} /> Critical Risks ({riskSummary.critical.length})
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {riskSummary.critical.length ? (
                    riskSummary.critical.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <li>No critical risks identified.</li>
                  )}
                </ul>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.2)' }}>
                <h4 style={{ color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={18} /> High Risks ({riskSummary.high.length})
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {riskSummary.high.length ? (
                    riskSummary.high.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <li>No high risks identified.</li>
                  )}
                </ul>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.2)' }}>
                <h4 style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={18} /> Medium Risks ({riskSummary.medium.length})
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {riskSummary.medium.length ? (
                    riskSummary.medium.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <li>No medium risks identified.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommended Next Actions */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-input)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="#10b981" />
                Recommended Next QA Actions & Engineering Roadblocks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {riskSummary.recommendedActions.map((action, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
