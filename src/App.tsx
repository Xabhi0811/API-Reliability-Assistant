import { useState } from 'react';
import type { ApiFormData, TestPlanReport } from './types';
import { EXAMPLE_GET_API } from './data/sampleApis';
import { generateTestPlan, type AISettings } from './services/aiService';
import { Header } from './components/Header';
import { ApiInputForm } from './components/ApiInputForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, type ToastMessage } from './components/Toast';

export function App() {
  const [formData, setFormData] = useState<ApiFormData>(EXAMPLE_GET_API);
  const [report, setReport] = useState<TestPlanReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [engineMode, setEngineMode] = useState<'local' | 'ai'>('local');
  const [engineNotice, setEngineNotice] = useState<string | undefined>();
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [aiSettings, setAiSettings] = useState<AISettings>({
    provider: 'local',
    apiKey: '',
    model: 'gemini-1.5-flash',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = 'toast_' + Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate Endpoint
    if (!formData.endpoint || !formData.endpoint.trim()) {
      newErrors.endpoint = 'API Endpoint is required.';
    } else {
      const trimmed = formData.endpoint.trim();
      try {
        const url = new URL(trimmed);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          newErrors.endpoint = 'Endpoint must start with http:// or https://';
        }
      } catch {
        newErrors.endpoint = 'Please enter a valid HTTP or HTTPS URL.';
      }
    }

    // Validate Request Body for POST/PUT/PATCH if provided
    if (['POST', 'PUT', 'PATCH'].includes(formData.method) && formData.requestBody.trim()) {
      try {
        JSON.parse(formData.requestBody);
      } catch (e) {
        newErrors.requestBody = `Invalid JSON: ${e instanceof Error ? e.message : 'Syntax error'}`;
      }
    }

    // Validate Expected Behaviour
    if (!formData.expectedBehaviour || !formData.expectedBehaviour.trim()) {
      newErrors.expectedBehaviour = 'Please provide expected API behaviour or contract.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      showToast('Please fix the validation errors in the form before generating.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateTestPlan(formData, aiSettings);
      setReport(result.report);
      setEngineMode(result.mode);
      setEngineNotice(result.notice);
      showToast('Reliability Test Plan successfully generated!', 'success');

      setTimeout(() => {
        const resultsEl = document.getElementById('results-dashboard');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Generation error:', err);
      showToast('An error occurred while generating the plan. Please check inputs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        engineMode={engineMode}
        engineNotice={engineNotice}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Input Form */}
      <main>
        <ApiInputForm
          formData={formData}
          onChange={(newData) => {
            setFormData(newData);
            if (Object.keys(errors).length > 0) {
              setErrors({});
            }
          }}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          errors={errors}
        />

        {/* Results Dashboard */}
        {report && (
          <div style={{ marginTop: '1.5rem' }}>
            <ResultsDashboard report={report} onShowToast={showToast} />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={aiSettings}
        onSave={(newSettings) => {
          setAiSettings(newSettings);
          setEngineMode(newSettings.provider === 'local' ? 'local' : 'ai');
          showToast(`Engine configured: ${newSettings.provider.toUpperCase()}`, 'success');
        }}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
