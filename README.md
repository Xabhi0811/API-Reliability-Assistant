# AI API Reliability Assistant
> **Analyze APIs. Find failures. Improve reliability.**

An AI-powered API testing and reliability assessment assistant that generates structured, executable API reliability test plans. It analyzes API endpoints, HTTP methods, headers, authentication mechanisms, parameters, request payloads, and expected behavior contracts to produce a comprehensive quality assurance test plan.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Zero-Cost / Offline Fallback Mode](#zero-cost--offline-fallback-mode)
- [Installation & Setup](#installation--setup)
- [How to Run Locally](#how-to-run-locally)
- [User Workflow & How to Use](#user-workflow--how-to-use)
- [Preconfigured Demo APIs](#preconfigured-demo-apis)
- [Generated Test Plan Sections](#generated-test-plan-sections)
- [Assessment Requirements Checklist](#assessment-requirements-checklist)
- [Recommended Screenshots for Assessment Submission](#recommended-screenshots-for-assessment-submission)

---

## 🎯 Project Overview
In modern web architectures, API reliability is paramount. The **AI API Reliability Assistant** empowers developers and QA engineers to quickly discover edge cases, input validation gaps, authentication bypass vectors, HTTP status code discrepancies, and resilience weaknesses before deploying APIs into production.

The application functions **100% locally and free out-of-the-box** using a sophisticated deterministic reliability analysis engine that parses REST semantics, route path parameters, and payload schemas with zero paid subscriptions or external API requirements.

---

## ✨ Key Features
- **Prominent Executive Dashboard**: High-end cyber/SaaS dark interface with glassmorphism, responsive data tables, and intuitive tab navigation.
- **Complete Test Matrix**:
  - **Positive Test Cases**: Valid scenarios that must succeed with exact status codes and expected responses.
  - **Negative Test Cases**: Missing required keys, malformed JSON, invalid data types, nulls, wrong HTTP methods, negative IDs.
  - **Edge & Boundary Cases**: Maximum integer bounds ($2^{53}-1$), buffer overflow strings (10,000+ chars), zero-values, unicode & emojis, special characters, rapid sequential bursts, race conditions.
  - **Validation Checks**: Schema conformance, data type constraints, string lengths, Content-Type enforcement, response header verification, consistent error envelopes (RFC 7807).
  - **Authentication & Security Checks**: Missing auth, forged tokens, IDOR / broken object-level authorization, SQL/NoSQL injection canaries, data exposure, rate limiting, defensive security headers (HSTS, CSP), and CORS origin security.
  - **Dedicated HTTP Status Code Expectations**: Tailored table mapping scenarios to HTTP codes (200, 201, 400, 401, 403, 404, 405, 409, 422, 429, 500, 504).
  - **Sample Test Data**: Ready-to-execute cURL commands and JSON payloads with 1-click clipboard copy.
  - **Reliability & Resilience Recommendations**: Timeouts, exponential retry backoff with jitter, idempotency keys, rate limits, concurrent locking, circuit breakers.
  - **Final Risk Summary**: Categorized Critical, High, Medium, and Low risks with prioritized engineering action steps.
- **One-Click Preloaded Demos**:
  - **Example 1 (GET)**: `https://jsonplaceholder.typicode.com/users/1`
  - **Example 2 (POST)**: `https://jsonplaceholder.typicode.com/posts`
- **Dynamic Parameter & Header Editors**: Add, toggle, or remove custom Query Parameters and Request Headers with quick presets.
- **Masked Credentials**: Protected fields for Bearer tokens, API keys, and Basic auth so credentials are never logged or exposed.
- **Export & Clipboard Features**:
  - **Copy Test Plan**: Copies complete structured markdown plan to clipboard.
  - **Export Report**: Download full report as `.json`, `.md`, or `.txt`.
- **Search & Priority Filtering**: Real-time filtering across test scenarios by priority badge (Critical, High, Medium, Low) or search terms.

---

## 🛠️ Technology Stack
- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: Modern Vanilla CSS design system with CSS custom properties, glassmorphism, fluid responsive grid, and accessible color tokens.
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: Native browser Fetch API

---

## 🛡️ Zero-Cost / Offline Fallback Mode
- **No Paid Services Required**: The application does **NOT** require any paid API subscription or credit card.
- **Built-in Deterministic QA Engine**: Generates complete, highly granular test plans locally using REST semantic parsing and contract inspection.
- **Graceful Optional AI**: If an optional free Google Gemini key or OpenAI key is configured, the application enhances the test plan with model-generated synthesis. If unreachable, it immediately falls back to the local deterministic engine without interrupting the user.
- **Badge Indicator**: Results clearly display `Demo / Local Analysis` or `AI-Powered Analysis`.

---

## 📦 Installation & Setup

1. **Clone or Navigate to the Workspace**:
   ```bash
   cd c:/Users/chabh/OneDrive/Desktop/quickAi
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **(Optional) Environment Variables**:
   Copy `.env.example` to `.env` if you wish to configure an optional AI key:
   ```bash
   cp .env.example .env
   ```
   *(Leave blank to use the built-in free deterministic engine)*

---

## 🚀 How to Run Locally

Start the Vite development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

To build for production:
```bash
npm run build
npm run preview
```

---

## 🧭 User Workflow & How to Use
1. **Load a Demo or Enter Endpoint**:
   - Click **Load Example 1 (GET)** or **Load Example 2 (POST)**, or type your custom API endpoint URL.
2. **Select HTTP Method**: Choose from `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
3. **Configure Parameters & Headers**:
   - Add Query Parameters (`page=1`, `limit=10`).
   - Add Request Headers (`Content-Type`, `Accept`).
4. **Choose Authentication**:
   - Select `None`, `Bearer Token`, `API Key`, or `Basic Auth`.
5. **Provide Request Body & Expected Behaviour**:
   - Enter JSON payload (click **Prettify JSON** to auto-format).
   - Enter your natural language contract in the Expected Behaviour field.
6. **Generate Test Plan**:
   - Click the prominent **Generate Test Plan** button.
7. **Review, Filter, and Export**:
   - Explore the 10 categorized tabs in the results dashboard.
   - Use the priority filters and search bar.
   - Click **Copy Test Plan** or **Export Report** (.json, .md, .txt).

---

## 🧪 Preconfigured Demo APIs

### Test API 1 — GET (User by ID)
- **Endpoint**: `https://jsonplaceholder.typicode.com/users/1`
- **Method**: `GET`
- **Authentication**: `None`
- **Expected Behaviour**:
  > The API should return the user with ID 1 when the user exists. If the requested user does not exist, the API should return an appropriate not-found response.
- **Trigger**: Click `Load Example 1 (User by ID)`

### Test API 2 — POST (Create Post)
- **Endpoint**: `https://jsonplaceholder.typicode.com/posts`
- **Method**: `POST`
- **Authentication**: `None`
- **Request Body**:
  ```json
  {
    "title": "API Reliability Testing",
    "body": "Testing API reliability and validation",
    "userId": 1
  }
  ```
- **Expected Behaviour**:
  > A valid request should create a new post and return the created resource.
- **Trigger**: Click `Load Example 2 (Create Post)`

---

## 📑 Generated Test Plan Sections
1. **API Summary**: Endpoint, Method, Purpose, Content-Type, Authentication, and Key Assumptions.
2. **Positive Test Cases**: Success scenarios, valid payloads, idempotency verification.
3. **Negative Test Cases**: Missing keys, wrong types, nulls, malformed JSON, 404 non-existent IDs, invalid methods (405).
4. **Edge & Boundary Cases**: $2^{53}-1$ numbers, 10,000-char string floods, zero-values, emojis/unicode, payload limits (5MB), concurrency/race conditions.
5. **Validation Checks**: Schema conformance, path integer constraints, string bounds, header consistency, RFC 7807 error format.
6. **Authentication & Security Checks**: Auth bypass, forged tokens, IDOR vulnerabilities, SQL/NoSQL injection canaries, sensitive data leaks, rate limit defense, security headers (HSTS/CSP), CORS origin controls.
7. **HTTP Status Code Expectations**: Dedicated matrix for 200, 201, 204, 400, 401, 403, 404, 405, 409, 422, 429, 500, 504.
8. **Sample Test Data**: Ready-to-run cURL commands and JSON payloads with one-click copy.
9. **Reliability Recommendations**: Timeouts, exponential retries, idempotency tokens, rate limits, concurrent locks, circuit breakers.
10. **Final Risk Summary**: Categorized Critical/High/Medium/Low risks and recommended engineering action steps.

---

## ✅ Assessment Requirements Checklist
- [x] **Application Name & Subtitle**: Prominently displays "AI API Reliability Assistant" & "Analyze APIs. Find failures. Improve reliability."
- [x] **Technology**: React 19, Vite 8, TypeScript, custom Vanilla CSS design system.
- [x] **No Paid Services Required**: 100% local deterministic engine with zero paid dependencies.
- [x] **Graceful Fallback**: Clearly labeled `Demo / Local Analysis` badge with `.env.example` provided.
- [x] **Main User Flow**: Endpoint, Method, Headers, Auth, Query Params, Request Body, Expected Behaviour, Generate Test Plan.
- [x] **Input Form Validation**: Validates HTTP/HTTPS URLs, method selection, JSON payload syntax, and required fields.
- [x] **Positive Test Cases**: Generated with Test ID, Scenario, Sample Data, Expected Status, Behaviour, Priority.
- [x] **Negative Test Cases**: Missing fields, invalid types, malformed JSON, invalid IDs, HTTP method mismatch.
- [x] **Edge & Boundary Cases**: Min/max, long strings, unicode, empty objects/arrays, large payloads, concurrent requests.
- [x] **Validation Checks**: Schema, data types, string length, number ranges, formats, headers, error consistency.
- [x] **Authentication & Security Checks**: Safe defensive testing for missing auth, invalid tokens, IDOR, injection canaries, rate limits, CORS.
- [x] **HTTP Status Code Expectations**: Dedicated matrix for relevant REST status codes.
- [x] **Sample Test Data**: Executable cURL commands and valid/invalid JSON payloads with individual copy buttons.
- [x] **Reliability Recommendations**: Timeout handling, retry behavior, idempotency, rate limiting, concurrency, failure recovery.
- [x] **Risk Summary**: Critical, High, Medium, Low risks, and prioritized next actions.
- [x] **Dedicated Results UI**: 10 clean tabs, visual priority badges, health score, and scenario count.
- [x] **Two Ready-to-Use Demos**:
  - `Load Example 1 (GET)`: `https://jsonplaceholder.typicode.com/users/1`
  - `Load Example 2 (POST)`: `https://jsonplaceholder.typicode.com/posts`
- [x] **Copy Function**: "Copy Test Plan" copies full report markdown to clipboard. Individual snippet copy buttons included.
- [x] **Export Function**: "Export Report" downloads clean `.json`, `.md`, or `.txt` reports.
- [x] **Clear / Reset**: "Clear Form" resets all inputs cleanly.
- [x] **Responsive Design**: Works across Desktop, Tablet, and Mobile.
- [x] **Security Best Practices**: Masked auth credentials, `.env` in `.gitignore`, no sensitive credential logging.
- [x] **Documentation**: Full `README.md` with instructions, architecture, and verification steps.

---

## 📸 Recommended Screenshots for Assessment Submission
When submitting your project, capture screenshots of the following views:
1. **Screen 1: Main Application Header & Input Form with Example 1 Loaded**:
   - Shows the prominent title, subtitle, engine badge (`Demo / Local Analysis`), and pre-populated GET endpoint `https://jsonplaceholder.typicode.com/users/1`.
2. **Screen 2: Generated Results Dashboard — Overview Tab**:
   - Shows the Reliability Health Score (e.g. 88/100), Total Scenarios count, Risk metrics, API Profile Summary, and Assumptions.
3. **Screen 3: Positive & Negative Tests Tabs**:
   - Demonstrates the structured test table with Test IDs, priority badges (`Critical`, `High`), status badges (`HTTP 200`, `HTTP 404`, `HTTP 400`), and inputs.
4. **Screen 4: Status Code Expectations Matrix & Sample Test Data**:
   - Highlights the dedicated HTTP status codes table and the ready-to-run cURL commands with one-click copy buttons.
5. **Screen 5: Example 2 (POST) Analysis with Request Body & Validation Checks**:
   - Shows the POST request body editor with JSON payload, along with generated edge cases and schema validation rules.
6. **Screen 6: Risk Summary & Export Menu**:
   - Shows the Critical/High risks cards, recommended engineering next actions, and the Export dropdown menu (`Download JSON`, `Download Markdown`, `Download Text`).
