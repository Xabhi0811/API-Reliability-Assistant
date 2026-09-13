import type {
  ApiFormData,
  TestPlanReport,
  TestCase,
  ValidationCheck,
  SecurityCheck,
  StatusCodeExpectation,
  SampleTestData,
  ReliabilityRecommendation,
  RiskSummary,
  ApiSummary,
} from '../types';

interface ParsedUrlInfo {
  isValid: boolean;
  protocol: string;
  host: string;
  pathname: string;
  segments: string[];
  lastSegment: string;
  hasIdParam: boolean;
  resourceName: string;
  resourceId?: string;
}

function parseEndpointUrl(urlStr: string): ParsedUrlInfo {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return {
        isValid: false,
        protocol: '',
        host: '',
        pathname: '',
        segments: [],
        lastSegment: '',
        hasIdParam: false,
        resourceName: 'resource',
      };
    }

    const url = new URL(trimmed);
    const segments = url.pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    const hasIdParam = segments.length > 0 && /^\d+$/.test(lastSegment);
    const resourceName = hasIdParam && segments.length >= 2 ? segments[segments.length - 2] : lastSegment || 'resource';
    const resourceId = hasIdParam ? lastSegment : undefined;

    return {
      isValid: true,
      protocol: url.protocol.replace(':', ''),
      host: url.host,
      pathname: url.pathname,
      segments,
      lastSegment,
      hasIdParam,
      resourceName,
      resourceId,
    };
  } catch {
    return {
      isValid: false,
      protocol: '',
      host: '',
      pathname: '',
      segments: [],
      lastSegment: '',
      hasIdParam: false,
      resourceName: 'resource',
    };
  }
}

function parseJsonBody(bodyStr: string): Record<string, unknown> | null {
  if (!bodyStr || !bodyStr.trim()) {
    return null;
  }
  try {
    const val = JSON.parse(bodyStr);
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      return val as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export function generateDeterministicTestPlan(formData: ApiFormData): TestPlanReport {
  const { endpoint, method, headers, queryParams, auth, requestBody, expectedBehaviour } = formData;
  const urlInfo = parseEndpointUrl(endpoint);
  const parsedBody = parseJsonBody(requestBody);

  const singularResource = urlInfo.resourceName.endsWith('s') ? urlInfo.resourceName.slice(0, -1) : urlInfo.resourceName;
  const targetId = urlInfo.resourceId || '1';

  const hasAuth = auth.type !== 'None';
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  const activeHeaders = headers.filter((h) => h.enabled && h.key.trim());
  const activeQueryParams = queryParams.filter((q) => q.enabled && q.key.trim());

  // 1. API SUMMARY
  const assumptions: string[] = [
    `Endpoint follows standard RESTful conventions for HTTP ${method}.`,
    hasAuth
      ? `Authentication scheme is '${auth.type}' and must be validated before granting access.`
      : `Endpoint appears to be publicly accessible (Authentication: None). Any sensitive operation should be verified against inadvertent open access.`,
    hasBody
      ? `The server expects and consumes 'application/json' payload encoded in UTF-8.`
      : `No request body is expected or processed for ${method} operations.`,
    urlInfo.hasIdParam
      ? `Path contains an explicit numeric resource ID (${urlInfo.resourceId}); tests verify existing, non-existing, and boundary IDs.`
      : `Path targets a collection or base service path without explicit path parameter IDs.`,
    activeHeaders.length > 0
      ? `Client configures ${activeHeaders.length} custom header(s): ${activeHeaders.map((h) => h.key).join(', ')}.`
      : `Standard HTTP request headers applied by default.`,
    expectedBehaviour
      ? `Verified against stated requirement: "${expectedBehaviour.slice(0, 120)}${expectedBehaviour.length > 120 ? '...' : ''}"`
      : `Verified against standard HTTP specifications (RFC 9110).`,
  ];

  const summary: ApiSummary = {
    endpoint: endpoint.trim(),
    method,
    purpose:
      method === 'GET'
        ? `Retrieve ${urlInfo.hasIdParam ? `single ${singularResource} details by identifier` : `collection of ${urlInfo.resourceName}`}`
        : method === 'POST'
        ? `Create a new ${singularResource} record in the system`
        : method === 'PUT'
        ? `Idempotently replace or create ${singularResource} record`
        : method === 'PATCH'
        ? `Partially update existing ${singularResource} attributes`
        : method === 'DELETE'
        ? `Remove ${singularResource} with ID ${targetId} from the database`
        : `Execute ${method} operation against ${urlInfo.resourceName}`,
    authentication: auth.type,
    contentType: hasBody ? 'application/json' : 'Not required / None',
    assumptions,
    analyzedAt: new Date().toISOString(),
    engine: 'Local Deterministic Engine',
    reliabilityScore: hasAuth ? 94 : 88,
  };

  // 2. POSITIVE TEST CASES
  const positiveTests: TestCase[] = [];
  let testCounter = 1;
  const pad = (n: number) => `POS-${String(n).padStart(3, '0')}`;

  if (method === 'GET') {
    if (urlInfo.hasIdParam) {
      positiveTests.push({
        id: pad(testCounter++),
        scenario: `Fetch existing ${singularResource} by valid ID (${targetId})`,
        input: `GET ${endpoint} with Accept: application/json`,
        expectedStatus: 200,
        expectedBehaviour: `HTTP 200 OK. Returns JSON representation of ${singularResource} containing id: ${targetId} matching requested schema.`,
        priority: 'Critical',
      });
      positiveTests.push({
        id: pad(testCounter++),
        scenario: `Fetch existing ${singularResource} with standard headers`,
        input: `Include headers: Accept: application/json, User-Agent: ApiReliabilityAssistant`,
        expectedStatus: 200,
        expectedBehaviour: `HTTP 200 OK with correct Content-Type: application/json; charset=utf-8.`,
        priority: 'High',
      });
      positiveTests.push({
        id: pad(testCounter++),
        scenario: `Verify response payload integrity and required fields`,
        input: `Inspect returned JSON schema for id: ${targetId}`,
        expectedStatus: 200,
        expectedBehaviour: `Payload includes all expected top-level fields without extraneous leaks, matching API contract.`,
        priority: 'High',
      });
    } else {
      positiveTests.push({
        id: pad(testCounter++),
        scenario: `Fetch full ${urlInfo.resourceName} list with default pagination`,
        input: `GET ${endpoint}`,
        expectedStatus: 200,
        expectedBehaviour: `HTTP 200 OK. Returns an array of ${urlInfo.resourceName} items within expected limit.`,
        priority: 'Critical',
      });
      positiveTests.push({
        id: pad(testCounter++),
        scenario: `Fetch ${urlInfo.resourceName} with explicit pagination query parameters`,
        input: activeQueryParams.length > 0
          ? `GET ${endpoint}?${activeQueryParams.map((q) => `${q.key}=${q.value}`).join('&')}`
          : `GET ${endpoint}?page=1&limit=10`,
        expectedStatus: 200,
        expectedBehaviour: `HTTP 200 OK. Returns up to 10 records with pagination metadata (totalCount, page, hasNext).`,
        priority: 'High',
      });
    }
  } else if (method === 'POST') {
    positiveTests.push({
      id: pad(testCounter++),
      scenario: `Create ${singularResource} with complete valid payload`,
      input: parsedBody ? JSON.stringify(parsedBody, null, 2) : `{"name": "Test ${singularResource}", "status": "active"}`,
      expectedStatus: 201,
      expectedBehaviour: `HTTP 201 Created. Response returns created resource with server-assigned ID and Location header.`,
      priority: 'Critical',
    });
    if (parsedBody && Object.keys(parsedBody).length > 1) {
      const firstKey = Object.keys(parsedBody)[0];
      positiveTests.push({
        id: pad(testCounter++),
        scenario: `Create ${singularResource} with only strictly required fields`,
        input: JSON.stringify({ [firstKey]: parsedBody[firstKey] }, null, 2),
        expectedStatus: 201,
        expectedBehaviour: `HTTP 201 Created. Missing optional fields should adopt sensible database defaults.`,
        priority: 'High',
      });
    }
    positiveTests.push({
      id: pad(testCounter++),
      scenario: `Idempotency verification: Send unique request with client request ID`,
      input: `Headers: X-Request-ID: req_${Date.now()} / Idempotency-Key: idemp_${Date.now()}`,
      expectedStatus: 201,
      expectedBehaviour: `HTTP 201 Created. Resource created smoothly with trace ID logged.`,
      priority: 'Medium',
    });
  } else if (method === 'PUT') {
    positiveTests.push({
      id: pad(testCounter++),
      scenario: `Full update of ${singularResource} with complete valid schema`,
      input: parsedBody ? JSON.stringify(parsedBody, null, 2) : `{"id": ${targetId}, "status": "updated"}`,
      expectedStatus: 200,
      expectedBehaviour: `HTTP 200 OK or 204 No Content. Resource is completely updated to match input state.`,
      priority: 'Critical',
    });
  } else if (method === 'PATCH') {
    positiveTests.push({
      id: pad(testCounter++),
      scenario: `Partial update of a single attribute on ${singularResource}`,
      input: `{"title": "Updated Title via PATCH"}`,
      expectedStatus: 200,
      expectedBehaviour: `HTTP 200 OK. Only specified fields are updated; remaining fields remain unchanged.`,
      priority: 'Critical',
    });
  } else if (method === 'DELETE') {
    positiveTests.push({
      id: pad(testCounter++),
      scenario: `Delete existing ${singularResource} by valid ID (${targetId})`,
      input: `DELETE ${endpoint}`,
      expectedStatus: 200,
      expectedBehaviour: `HTTP 200 OK or 204 No Content. Resource is deleted or marked inactive.`,
      priority: 'Critical',
    });
  } else {
    positiveTests.push({
      id: pad(testCounter++),
      scenario: `Execute standard ${method} request`,
      input: `${method} ${endpoint}`,
      expectedStatus: 200,
      expectedBehaviour: `HTTP 200 OK with expected response headers and status.`,
      priority: 'High',
    });
  }

  // 3. NEGATIVE TEST CASES
  const negativeTests: TestCase[] = [];
  let negCounter = 1;
  const negPad = (n: number) => `NEG-${String(n).padStart(3, '0')}`;

  if (urlInfo.hasIdParam) {
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Request non-existent resource ID (e.g. 99999999)`,
      input: `${method} ${endpoint.replace(new RegExp(`/${targetId}$`), '/99999999')}`,
      expectedStatus: 404,
      expectedBehaviour: `HTTP 404 Not Found. Returns structured error object indicating resource was not found.`,
      priority: 'Critical',
    });
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Invalid data type in resource ID path parameter (alphanumeric string instead of numeric ID)`,
      input: `${method} ${endpoint.replace(new RegExp(`/${targetId}$`), '/abc_invalid_id')}`,
      expectedStatus: 400,
      expectedBehaviour: `HTTP 400 Bad Request or 404 Not Found. Server rejects non-numeric resource identifier.`,
      priority: 'High',
    });
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Negative resource ID (-1, -999)`,
      input: `${method} ${endpoint.replace(new RegExp(`/${targetId}$`), '/-1')}`,
      expectedStatus: 400,
      expectedBehaviour: `HTTP 400 Bad Request or 404 Not Found. Negative IDs must fail validation cleanly.`,
      priority: 'Medium',
    });
  }

  if (hasBody) {
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Malformed JSON syntax (unclosed curly brace or missing quotes)`,
      input: `{"title": "Unterminated JSON string,`,
      expectedStatus: 400,
      expectedBehaviour: `HTTP 400 Bad Request. Returns JSON parsing error without leaking internal stack trace.`,
      priority: 'Critical',
    });
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Empty request body when payload is expected`,
      input: `"" (0 bytes content)`,
      expectedStatus: 400,
      expectedBehaviour: `HTTP 400 Bad Request. Informs client that body is required for ${method}.`,
      priority: 'High',
    });
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Invalid data types in body (e.g. string for numeric field, array for string)`,
      input: parsedBody
        ? JSON.stringify(
            Object.fromEntries(
              Object.entries(parsedBody).map(([k, v]) => [
                k,
                typeof v === 'number' ? 'string_instead_of_number' : 123456,
              ])
            ),
            null,
            2
          )
        : `{"userId": "not-a-number"}`,
      expectedStatus: 422,
      expectedBehaviour: `HTTP 422 Unprocessable Entity or 400 Bad Request with field-level schema validation errors.`,
      priority: 'High',
    });
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Missing mandatory required fields in payload`,
      input: `{ "unrelatedField": "dummy" }`,
      expectedStatus: 422,
      expectedBehaviour: `HTTP 422 Unprocessable Entity specifying which required fields are missing.`,
      priority: 'High',
    });
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Null values supplied for non-nullable fields`,
      input: parsedBody
        ? JSON.stringify(Object.fromEntries(Object.keys(parsedBody).map((k) => [k, null])), null, 2)
        : `{"title": null, "body": null}`,
      expectedStatus: 422,
      expectedBehaviour: `HTTP 422 Unprocessable Entity or 400 Bad Request. Null values rejected.`,
      priority: 'Medium',
    });
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Unknown or extra fields injected (Mass Assignment test)`,
      input: parsedBody
        ? JSON.stringify({ ...parsedBody, __isAdmin: true, role: 'superuser', internalBudget: 99999 }, null, 2)
        : `{"title": "Test", "role": "admin", "isSuperuser": true}`,
      expectedStatus: 400,
      expectedBehaviour: `HTTP 400 Bad Request (if strict schema) or HTTP 201/200 ignoring/stripping unknown keys without persisting them.`,
      priority: 'High',
    });
    negativeTests.push({
      id: negPad(negCounter++),
      scenario: `Unsupported Content-Type header (e.g. text/plain or application/xml)`,
      input: `Headers: Content-Type: text/plain, Body: Hello plain text`,
      expectedStatus: 415,
      expectedBehaviour: `HTTP 415 Unsupported Media Type. Server rejects non-JSON payload types.`,
      priority: 'Medium',
    });
  }

  // Method mismatch
  const unsupportedMethod = method === 'GET' ? 'POST' : 'PUT';
  negativeTests.push({
    id: negPad(negCounter++),
    scenario: `Unsupported or invalid HTTP method (${unsupportedMethod} on ${method} route)`,
    input: `${unsupportedMethod} ${endpoint}`,
    expectedStatus: 405,
    expectedBehaviour: `HTTP 405 Method Not Allowed. Response should include 'Allow: ${method}' header.`,
    priority: 'Medium',
  });

  // Query params negative test
  negativeTests.push({
    id: negPad(negCounter++),
    scenario: `Invalid query parameter values (negative limit, out-of-range pagination)`,
    input: `GET ${endpoint}?page=-5&limit=999999`,
    expectedStatus: 400,
    expectedBehaviour: `HTTP 400 Bad Request or clamped to default max page size with warning.`,
    priority: 'Low',
  });

  // 4. EDGE AND BOUNDARY CASES
  const edgeCases: TestCase[] = [];
  let edgeCounter = 1;
  const edgePad = (n: number) => `EDG-${String(n).padStart(3, '0')}`;

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Maximum integer boundary test (2^53 - 1 or 9007199254740991)`,
    input: urlInfo.hasIdParam
      ? `ID = 9007199254740991`
      : parsedBody
      ? `Numeric keys set to 9007199254740991`
      : `param=9007199254740991`,
    expectedStatus: 404,
    expectedBehaviour: `No integer overflow, 64-bit precision maintained without 500 internal server error.`,
    priority: 'High',
  });

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Very long string input (10,000+ characters / Buffer overflow canary)`,
    input: `String fields populated with 'A'.repeat(10000)`,
    expectedStatus: 400,
    expectedBehaviour: `HTTP 400 / 413 Payload Too Large or 422 String exceeds maximum allowed length (e.g. 255 chars).`,
    priority: 'High',
  });

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Zero and minimum boundary inputs (0, empty string "")`,
    input: `Numeric fields = 0, String fields = ""`,
    expectedStatus: 422,
    expectedBehaviour: `Evaluated correctly according to zero-value rules; 0 should not be mistakenly treated as null or missing.`,
    priority: 'Medium',
  });

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Special characters and SQL/HTML injection characters safe handling`,
    input: `Value: \`!@#$%^&*()_+-=[]{}|;':",./<>?~\\\` and \`<script>alert(1)</script>\``,
    expectedStatus: 200,
    expectedBehaviour: `Data sanitized, escaped, or safely stored/queried without executing code or causing syntax error.`,
    priority: 'High',
  });

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Unicode, multi-byte characters, and Emoji encoding support`,
    input: `Value: "Test 🚀⚡️ 汉字 العربية Привет 🎉"`,
    expectedStatus: hasBody ? 201 : 200,
    expectedBehaviour: `UTF-8 encoding handled cleanly without corruption or database truncation.`,
    priority: 'Medium',
  });

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Empty JSON containers (Empty array [] and empty object {})`,
    input: `Payload: {} or []`,
    expectedStatus: 400,
    expectedBehaviour: `Server cleanly handles empty objects without unhandled TypeError or null pointer exceptions.`,
    priority: 'Medium',
  });

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Large payload boundary test (5MB JSON payload)`,
    input: `Payload with large arrays exceeding 5MB`,
    expectedStatus: 413,
    expectedBehaviour: `HTTP 413 Payload Too Large. Web server / reverse proxy cuts off stream gracefully before exhausting memory.`,
    priority: 'High',
  });

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Rapid repeated requests (5 identical requests in <100ms)`,
    input: `5 sequential/concurrent identical requests`,
    expectedStatus: 200,
    expectedBehaviour: `If GET: Idempotent and cached if configured. If POST: Rate-limited or creates unique items without race condition.`,
    priority: 'High',
  });

  edgeCases.push({
    id: edgePad(edgeCounter++),
    scenario: `Concurrent requests with conflicting state / race conditions`,
    input: `Two parallel updates to the same resource ID`,
    expectedStatus: 409,
    expectedBehaviour: `Second request yields HTTP 409 Conflict or handles atomic transaction with optimistic locking.`,
    priority: 'Medium',
  });

  // 5. VALIDATION CHECKS
  const validationChecks: ValidationCheck[] = [
    {
      id: 'VAL-001',
      category: 'Request Schema',
      field: hasBody ? 'Request Body' : 'Path & Query Parameters',
      rule: 'Must conform strictly to OpenAPI / JSON Schema definition',
      expectedStatus: 422,
      priority: 'Critical',
      recommendation: 'Reject unknown or malformed schemas with detailed RFC 7807 problem details.',
    },
    {
      id: 'VAL-002',
      category: 'Data Types',
      field: urlInfo.hasIdParam ? 'id (Path parameter)' : 'Primary identifiers',
      rule: 'Numeric integer >= 1 (or valid UUIDv4 format)',
      expectedStatus: 400,
      priority: 'High',
      recommendation: 'Use regex or strict integer parsing at the routing middleware layer.',
    },
    {
      id: 'VAL-003',
      category: 'String Length',
      field: 'Text fields (title, name, description, body)',
      rule: 'Min length: 1 char, Max length: 255 chars (or 5000 for bodies)',
      expectedStatus: 422,
      priority: 'Medium',
      recommendation: 'Enforce database column lengths at the application validation boundary.',
    },
    {
      id: 'VAL-004',
      category: 'Content-Type',
      field: 'Request Header: Content-Type',
      rule: hasBody ? 'Must be application/json or application/json; charset=utf-8' : 'N/A for GET',
      expectedStatus: 415,
      priority: 'Medium',
      recommendation: 'Return 415 Unsupported Media Type if client specifies text/html or xml.',
    },
    {
      id: 'VAL-005',
      category: 'Response Headers',
      field: 'Response Header: Content-Type & Security Headers',
      rule: 'Must include Content-Type: application/json; charset=utf-8',
      expectedStatus: 200,
      priority: 'High',
      recommendation: 'Ensure all successful and error responses declare charset and MIME type.',
    },
    {
      id: 'VAL-006',
      category: 'Error Consistency',
      field: 'All Error Responses (4xx, 5xx)',
      rule: 'Structured JSON error envelope: { error: { code, message, timestamp, details } }',
      expectedStatus: '4xx/5xx',
      priority: 'High',
      recommendation: 'Never output raw HTML error pages or stack traces to API consumers.',
    },
    {
      id: 'VAL-007',
      category: 'Unexpected Fields',
      field: 'Additional properties in payload',
      rule: 'Strip or reject unrecognized keys to prevent mass assignment',
      expectedStatus: 400,
      priority: 'Medium',
      recommendation: 'Configure JSON schema validators with additionalProperties: false.',
    },
  ];

  // 6. AUTHENTICATION AND SECURITY CHECKS
  const securityChecks: SecurityCheck[] = [
    {
      id: 'SEC-001',
      category: 'Authentication',
      scenario: 'Missing authentication credentials on protected routes',
      input: 'Send request with Authorization header completely omitted',
      expectedStatus: hasAuth ? 401 : '200 (if public)',
      riskDescription: hasAuth
        ? 'Unauthenticated users could access protected resources if auth middleware is bypassed.'
        : 'If this endpoint handles private user data without auth, it violates least-privilege principles.',
      priority: 'Critical',
      remediation: 'Apply authentication guard middleware prior to any controller execution.',
    },
    {
      id: 'SEC-002',
      category: 'Authentication',
      scenario: 'Malformed or tampered authentication token',
      input: 'Authorization: Bearer eyJhbGciOi...invalid_signature',
      expectedStatus: 401,
      riskDescription: 'Forged tokens might gain unauthorized access if cryptographic signatures are unchecked.',
      priority: 'Critical',
      remediation: 'Enforce asymmetric signature verification (RS256) and reject expired/invalid claims.',
    },
    {
      id: 'SEC-003',
      category: 'Authorization & IDOR',
      scenario: 'Insecure Direct Object Reference (IDOR) - Accessing another tenant resource',
      input: `${method} ${endpoint.replace(new RegExp(`/${targetId}$`), '/2')} with User 1 credentials`,
      expectedStatus: 403,
      riskDescription: 'User 1 might inspect or mutate User 2 private records by simply changing the path ID.',
      priority: 'Critical',
      remediation: 'Perform tenant and user ownership checks at the database query level (WHERE id = ? AND owner_id = ?).',
    },
    {
      id: 'SEC-004',
      category: 'Injection Defense',
      scenario: 'SQL / NoSQL / Command Injection safe verification',
      input: urlInfo.hasIdParam ? `${endpoint}'+OR+1=1--` : `{"id": {"$gt": ""}, "search": "' OR '1'='1"}`,
      expectedStatus: 400,
      riskDescription: 'Improperly concatenated inputs can lead to full database exfiltration.',
      priority: 'Critical',
      remediation: 'Use parameterized queries / ORM prepared statements universally.',
    },
    {
      id: 'SEC-005',
      category: 'Information Disclosure',
      scenario: 'Sensitive data exposure & excessive data return',
      input: `Analyze response keys for hashed passwords, private emails, internal tokens, or database columns`,
      expectedStatus: 200,
      riskDescription: 'Leaking internal identifiers or credentials facilitates lateral privilege escalation.',
      priority: 'High',
      remediation: 'Implement DTO projection to sanitize outbound response schemas.',
    },
    {
      id: 'SEC-006',
      category: 'Rate Limiting & DoS',
      scenario: 'Burst traffic: 100 requests in 2 seconds from single IP / token',
      input: 'Rapid automated bursts without pauses',
      expectedStatus: 429,
      riskDescription: 'Unprotected endpoints can be flooded, causing server denial-of-service.',
      priority: 'High',
      remediation: 'Enforce token bucket / sliding window rate limits and return 429 Too Many Requests with Retry-After.',
    },
    {
      id: 'SEC-007',
      category: 'Security Headers',
      scenario: 'Verify presence of defensive HTTP response headers',
      input: 'Inspect response headers on all requests',
      expectedStatus: 200,
      riskDescription: 'Missing headers allow clickjacking, MIME sniffing, and insecure transport.',
      priority: 'Medium',
      remediation: 'Configure Helmet/Gateway headers: Strict-Transport-Security, X-Content-Type-Options: nosniff, X-Frame-Options: DENY.',
    },
    {
      id: 'SEC-008',
      category: 'CORS Configuration',
      scenario: 'Cross-Origin Resource Sharing (CORS) preflight validation',
      input: 'OPTIONS request with Origin: https://evil-attacker.example.com',
      expectedStatus: 204,
      riskDescription: 'Wildcard Access-Control-Allow-Origin with credentials exposes private data to hostile web clients.',
      priority: 'Medium',
      remediation: 'Never use Access-Control-Allow-Origin: * when credentials are supported; whitelist explicit origins.',
    },
  ];

  // 7. HTTP STATUS CODE EXPECTATIONS
  const statusCodes: StatusCodeExpectation[] = [
    {
      scenario: method === 'POST' ? 'Resource successfully created' : 'Request succeeded and resource returned',
      status: method === 'POST' ? 201 : 200,
      reason: method === 'POST' ? '201 Created: Server instantiated new record and returned representation.' : '200 OK: Request succeeded; payload matches requested format.',
      category: 'Success',
    },
    ...(method === 'DELETE'
      ? [
          {
            scenario: 'Resource successfully removed with no body returned',
            status: 204,
            reason: '204 No Content: Deletion completed successfully.',
            category: 'Success' as const,
          },
        ]
      : []),
    {
      scenario: 'Invalid client syntax, malformed JSON, or bad parameter format',
      status: 400,
      reason: '400 Bad Request: Client submitted invalid syntax or unparseable input.',
      category: 'Client Error',
    },
    {
      scenario: 'Missing or expired authentication token',
      status: 401,
      reason: '401 Unauthorized: The request requires user authentication credentials.',
      category: 'Auth',
    },
    {
      scenario: 'Valid authentication but insufficient role/permissions for this resource',
      status: 403,
      reason: '403 Forbidden: Server understood identity but refuses access authorization.',
      category: 'Auth',
    },
    {
      scenario: 'Requested resource ID or route does not exist',
      status: 404,
      reason: '404 Not Found: Origin server did not find a current representation for target.',
      category: 'Client Error',
    },
    {
      scenario: 'Attempted HTTP method is not permitted for this endpoint',
      status: 405,
      reason: '405 Method Not Allowed: Target resource does not support method.',
      category: 'Client Error',
    },
    ...(method === 'POST' || method === 'PUT'
      ? [
          {
            scenario: 'Resource already exists or state conflict occurs',
            status: 409,
            reason: '409 Conflict: Unique constraint violation (e.g. email or slug already taken).',
            category: 'Client Error' as const,
          },
        ]
      : []),
    {
      scenario: 'Payload is syntactically valid JSON but fails business validation rules',
      status: 422,
      reason: '422 Unprocessable Entity: Server understands content type, but instructions are invalid.',
      category: 'Client Error',
    },
    {
      scenario: 'Client exceeds API quota or rate limits',
      status: 429,
      reason: '429 Too Many Requests: Rate limit exceeded. Includes Retry-After header.',
      category: 'Client Error',
    },
    {
      scenario: 'Unexpected server exception or unhandled runtime failure',
      status: 500,
      reason: '500 Internal Server Error: The server encountered an unexpected condition.',
      category: 'Server Error',
    },
    {
      scenario: 'Upstream microservice or database timeout during request processing',
      status: 504,
      reason: '504 Gateway Timeout: Upstream server failed to respond within time window.',
      category: 'Server Error',
    },
  ];

  // 8. SAMPLE TEST DATA
  const sampleData: SampleTestData[] = [];

  // Valid cURL
  let curlValid = `curl -X ${method} "${endpoint}" \\\n  -H "Accept: application/json"`;
  if (hasBody && requestBody.trim()) {
    curlValid += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/'/g, "\\'")}'`;
  }
  if (hasAuth && auth.type === 'Bearer Token') {
    curlValid += ` \\\n  -H "Authorization: Bearer YOUR_VALID_TOKEN"`;
  }

  sampleData.push({
    id: 'SMP-001',
    title: 'Valid Request (cURL command)',
    description: 'Ready-to-run terminal command to execute a happy-path request against this endpoint.',
    type: 'valid',
    format: 'curl',
    payload: curlValid,
  });

  if (hasBody && parsedBody) {
    sampleData.push({
      id: 'SMP-002',
      title: 'Valid JSON Payload Example',
      description: 'Standard conforming request body structure satisfying all schema constraints.',
      type: 'valid',
      format: 'json',
      payload: JSON.stringify(parsedBody, null, 2),
    });

    sampleData.push({
      id: 'SMP-003',
      title: 'Invalid Types Payload Example (Fails Validation)',
      description: 'Payload containing incorrect data types designed to test 422/400 validation handlers.',
      type: 'invalid',
      format: 'json',
      payload: JSON.stringify(
        {
          ...parsedBody,
          [Object.keys(parsedBody)[0]]: 999999999, // Intentional type swap
          unauthorized_extra_field: true,
          nested_overflow: 'X'.repeat(500),
        },
        null,
        2
      ),
    });
  } else if (urlInfo.hasIdParam) {
    sampleData.push({
      id: 'SMP-002',
      title: 'Non-Existent Resource Test (cURL command)',
      description: 'Request targeting a non-existent ID (9999999) to verify 404 response structure.',
      type: 'invalid',
      format: 'curl',
      payload: `curl -X GET "${endpoint.replace(new RegExp(`/${targetId}$`), '/9999999')}" \\\n  -H "Accept: application/json"`,
    });
  }

  sampleData.push({
    id: 'SMP-004',
    title: 'Boundary / Unicode Edge Payload',
    description: 'Payload with emoji, multi-byte unicode, and edge delimiters.',
    type: 'edge',
    format: 'json',
    payload: JSON.stringify(
      {
        testScenario: 'Boundary test',
        unicodeChars: '🚀⚡️ 汉字 العربية Привет',
        zeroValue: 0,
        emptyArray: [],
        specialChars: '<script>alert("test")</script>',
        boundaryDate: '2099-12-31T23:59:59.999Z',
      },
      null,
      2
    ),
  });

  // 9. RELIABILITY RECOMMENDATIONS
  const reliabilityRecommendations: ReliabilityRecommendation[] = [
    {
      id: 'REL-001',
      area: 'Timeout Handling',
      recommendation: 'Configure client and gateway timeouts between 3,000ms and 5,000ms.',
      guidance: 'Ensure downstream databases and services timeout before client connections close. Fail fast instead of tying up server worker threads.',
      severity: 'Critical',
    },
    {
      id: 'REL-002',
      area: 'Retry Behaviour',
      recommendation: 'Implement exponential backoff with randomized jitter on transient 5xx & 429 errors.',
      guidance: 'Do NOT retry on 4xx client errors (400, 401, 403, 404, 422). Cap maximum retries to 3 attempts with initial delay of 250ms.',
      severity: 'High',
    },
    {
      id: 'REL-003',
      area: 'Idempotency',
      recommendation: method === 'POST' ? 'Require an Idempotency-Key header on all state-creating mutations.' : `${method} requests should be naturally idempotent.`,
      guidance: method === 'POST' ? 'Store Idempotency-Key in Redis cache for 24 hours to return cached 201 responses if network drops mid-flight.' : 'Verify that repeated requests yield identical resource states without side effects.',
      severity: 'Critical',
    },
    {
      id: 'REL-004',
      area: 'Rate Limiting',
      recommendation: 'Enforce tiered rate limiting per API consumer token and client IP.',
      guidance: 'Return standard headers: X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset. Include a Retry-After header on 429 status.',
      severity: 'High',
    },
    {
      id: 'REL-005',
      area: 'Duplicate Requests',
      recommendation: 'Prevent double-submission of requests with client debounce and server-side request locks.',
      guidance: 'Short-lived distributed mutex on (userId + resourceId) prevents duplicate database row creation during burst clicks.',
      severity: 'High',
    },
    {
      id: 'REL-006',
      area: 'Concurrent Requests',
      recommendation: 'Use optimistic concurrency control via ETag and If-Match HTTP headers.',
      guidance: 'When updating records, clients supply the last seen ETag. If another worker updated the record first, reject with 412 Precondition Failed.',
      severity: 'Medium',
    },
    {
      id: 'REL-007',
      area: 'Error Handling',
      recommendation: 'Standardize error payloads using RFC 7807 (Problem Details for HTTP APIs).',
      guidance: 'Include: type URI, title, status code, detail message, and instance request ID for observability.',
      severity: 'Medium',
    },
    {
      id: 'REL-008',
      area: 'Response Consistency',
      recommendation: 'Enforce strict schema validation on all outbound responses in CI/CD.',
      guidance: 'Ensure null fields are treated consistently across endpoints and pagination structure remains identical.',
      severity: 'Medium',
    },
    {
      id: 'REL-009',
      area: 'Failure Recovery',
      recommendation: 'Implement Circuit Breakers (e.g. Netflix Hystrix pattern / opossum).',
      guidance: 'Trip circuit when error rates cross 50% threshold over 10 seconds to allow downstream database self-healing.',
      severity: 'High',
    },
  ];

  // 10. FINAL RISK SUMMARY
  const criticalRisks: string[] = [];
  const highRisks: string[] = [];
  const mediumRisks: string[] = [];
  const lowRisks: string[] = [];

  if (!hasAuth) {
    criticalRisks.push('Missing API Authentication: Unrestricted access allows unauthorized consumers to query or manipulate resources.');
  }
  if (method === 'POST' || method === 'PUT') {
    criticalRisks.push('Mass Assignment Vulnerability: Server may bind unvalidated client fields directly to internal models.');
  }
  if (urlInfo.hasIdParam) {
    highRisks.push(`IDOR Vulnerability on /${urlInfo.resourceName}/:id: Without tenant checks, users can access foreign tenant data.`);
  }
  highRisks.push('Absence of Rate Limiting: Endpoint vulnerable to resource exhaustion / scraping attacks.');
  if (hasBody) {
    highRisks.push('Payload Size Denial of Service: Unbounded JSON request bodies can consume excess server memory.');
  }
  mediumRisks.push('Inconsistent Error Schemas: Failure to use RFC 7807 format complicates client error handling.');
  mediumRisks.push('Missing Cache-Control Headers: Responses may be cached inadvertently by intermediate proxies.');
  lowRisks.push('Verbose Stack Traces: Verify that production deployment hides stack traces on 500 errors.');
  lowRisks.push('Query Parameter Injection: Validate numeric ranges on pagination queries.');

  const recommendedActions = [
    '1. Implement automated CI/CD API contract tests running positive and negative suites against every pull request.',
    '2. Enforce strict JSON schema validation middleware with additionalProperties: false.',
    '3. Configure Token-Bucket rate limiting on reverse proxy / API gateway layer.',
    '4. Verify IDOR authorization checks on all ID-driven paths before deploying to production.',
    '5. Apply standard defensive security headers (HSTS, CSP, X-Content-Type-Options: nosniff).',
    '6. Set up monitoring and alerting on 4xx/5xx spike anomalies and latency percentiles (p95, p99).',
  ];

  const riskSummary: RiskSummary = {
    critical: criticalRisks,
    high: highRisks,
    medium: mediumRisks,
    low: lowRisks,
    recommendedActions,
  };

  return {
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
  };
}
