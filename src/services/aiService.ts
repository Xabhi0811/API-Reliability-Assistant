import type { ApiFormData, TestPlanReport } from '../types';
import { generateDeterministicTestPlan } from './deterministicEngine';

export interface AISettings {
  provider: 'local' | 'gemini' | 'openai';
  apiKey: string;
  model: string;
}

export const AI_SYSTEM_PROMPT = `You are an AI API Reliability Assistant and expert API QA engineer.
When provided with an API endpoint, HTTP method, request headers, authentication requirements, query parameters, request body, and expected behaviour, analyze the API and generate a comprehensive but practical reliability test plan.
Generate the following sections:
API Summary
Positive Test Cases
Negative Test Cases
Edge and Boundary Cases
Validation Checks
Authentication and Security Checks
HTTP Status Code Expectations
Sample Test Data
Reliability Recommendations
Final Risk Summary

IMPORTANT RULES:
Never invent undocumented API requirements.
Clearly identify assumptions.
Do not claim that an endpoint actually behaves in a certain way unless that behaviour is provided or verified.
Keep tests practical and executable.
Use clear tables.
Assign every test case a priority.
Separate positive, negative, edge, validation and security tests.
Make the output suitable for manual QA or future automation.`;

export async function generateTestPlan(
  formData: ApiFormData,
  settings?: AISettings
): Promise<{ report: TestPlanReport; mode: 'local' | 'ai'; notice?: string }> {
  const envKey = import.meta.env.VITE_AI_API_KEY || '';
  const effectiveKey = (settings?.apiKey || envKey).trim();
  const provider = settings?.provider || (effectiveKey ? 'gemini' : 'local');

  // If set to local or no key provided, generate deterministically
  if (provider === 'local' || !effectiveKey) {
    // Simulate brief realistic analysis time (350ms) for polished UI UX
    await new Promise((r) => setTimeout(r, 350));
    const report = generateDeterministicTestPlan(formData);
    report.summary.engine = 'Local Deterministic Engine';
    return {
      report,
      mode: 'local',
      notice: 'Demo / Local Analysis (Built-in Rule Engine — 100% Free & Offline)',
    };
  }

  try {
    if (provider === 'gemini') {
      const model = settings?.model || 'gemini-1.5-flash';
      const promptText = `
Endpoint: ${formData.endpoint}
HTTP Method: ${formData.method}
Headers: ${JSON.stringify(formData.headers.filter((h) => h.enabled))}
Auth: ${formData.auth.type}
Query Parameters: ${JSON.stringify(formData.queryParams.filter((q) => q.enabled))}
Request Body: ${formData.requestBody || 'None'}
Expected Behaviour: ${formData.expectedBehaviour}

Analyze this API and generate the full reliability test plan report adhering to the system prompt.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${AI_SYSTEM_PROMPT}\n\n${promptText}` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`AI Provider returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from AI service');

      const parsed = JSON.parse(rawText);
      // Ensure merged with complete structure if anything is missing
      const baseReport = generateDeterministicTestPlan(formData);
      const mergedReport: TestPlanReport = {
        ...baseReport,
        ...parsed,
        summary: {
          ...baseReport.summary,
          ...(parsed.summary || {}),
          engine: 'AI Enhanced (Gemini/OpenAI)',
        },
      };
      return {
        report: mergedReport,
        mode: 'ai',
        notice: `AI-Powered Analysis via ${model}`,
      };
    }

    // Default fallback
    const report = generateDeterministicTestPlan(formData);
    return { report, mode: 'local' };
  } catch (error) {
    console.warn('AI Generation failed, smoothly falling back to deterministic engine:', error);
    const report = generateDeterministicTestPlan(formData);
    report.summary.engine = 'Local Deterministic Engine';
    return {
      report,
      mode: 'local',
      notice: `Fallback to Local Engine: ${error instanceof Error ? error.message : 'AI unreachable'}`,
    };
  }
}
