export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type AuthType = 'None' | 'Bearer Token' | 'API Key' | 'Basic Auth';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: AuthType;
  token?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyLocation?: 'header' | 'query';
  username?: string;
  password?: string;
}

export interface ApiFormData {
  endpoint: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  auth: AuthConfig;
  requestBody: string;
  expectedBehaviour: string;
}

export interface TestCase {
  id: string;
  scenario: string;
  input: string;
  expectedStatus: number | string;
  expectedBehaviour: string;
  priority: PriorityLevel;
  category?: string;
}

export interface ValidationCheck {
  id: string;
  field: string;
  rule: string;
  expectedStatus: number | string;
  priority: PriorityLevel;
  category: string;
  recommendation: string;
}

export interface SecurityCheck {
  id: string;
  category: string;
  scenario: string;
  input?: string;
  expectedStatus: number | string;
  riskDescription: string;
  priority: PriorityLevel;
  remediation: string;
}

export interface StatusCodeExpectation {
  scenario: string;
  status: number;
  reason: string;
  category: 'Success' | 'Client Error' | 'Server Error' | 'Auth';
}

export interface SampleTestData {
  id: string;
  title: string;
  description: string;
  type: 'valid' | 'invalid' | 'edge';
  format: 'json' | 'curl' | 'raw';
  payload: string;
}

export interface ReliabilityRecommendation {
  id: string;
  area:
    | 'Timeout Handling'
    | 'Retry Behaviour'
    | 'Idempotency'
    | 'Rate Limiting'
    | 'Duplicate Requests'
    | 'Concurrent Requests'
    | 'Error Handling'
    | 'Response Consistency'
    | 'Failure Recovery';
  recommendation: string;
  guidance: string;
  severity: PriorityLevel;
}

export interface RiskSummary {
  critical: string[];
  high: string[];
  medium: string[];
  low: string[];
  recommendedActions: string[];
}

export interface ApiSummary {
  endpoint: string;
  method: HttpMethod;
  purpose: string;
  authentication: string;
  contentType: string;
  assumptions: string[];
  analyzedAt: string;
  engine: 'Local Deterministic Engine' | 'AI Enhanced (Gemini/OpenAI)';
  reliabilityScore: number; // 0 - 100
}

export interface TestPlanReport {
  summary: ApiSummary;
  positiveTests: TestCase[];
  negativeTests: TestCase[];
  edgeCases: TestCase[];
  validationChecks: ValidationCheck[];
  securityChecks: SecurityCheck[];
  statusCodes: StatusCodeExpectation[];
  sampleData: SampleTestData[];
  reliabilityRecommendations: ReliabilityRecommendation[];
  riskSummary: RiskSummary;
}

export type TabId =
  | 'overview'
  | 'positive'
  | 'negative'
  | 'edge'
  | 'validation'
  | 'security'
  | 'status-codes'
  | 'test-data'
  | 'reliability'
  | 'risk-summary';
