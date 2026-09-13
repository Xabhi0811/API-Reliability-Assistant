import type { ApiFormData } from '../types';

export const EXAMPLE_GET_API: ApiFormData = {
  endpoint: 'https://jsonplaceholder.typicode.com/users/1',
  method: 'GET',
  headers: [
    { id: 'h1', key: 'Accept', value: 'application/json', enabled: true },
    { id: 'h2', key: 'User-Agent', value: 'ApiReliabilityAssistant/1.0', enabled: true },
  ],
  queryParams: [
    { id: 'q1', key: '_fields', value: 'id,name,username,email', enabled: false },
  ],
  auth: {
    type: 'None',
  },
  requestBody: '',
  expectedBehaviour:
    'The API should return the user with ID 1 when the user exists. If the requested user does not exist, the API should return an appropriate not-found response.',
};

export const EXAMPLE_POST_API: ApiFormData = {
  endpoint: 'https://jsonplaceholder.typicode.com/posts',
  method: 'POST',
  headers: [
    { id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: 'h2', key: 'Accept', value: 'application/json', enabled: true },
  ],
  queryParams: [],
  auth: {
    type: 'None',
  },
  requestBody: JSON.stringify(
    {
      title: 'API Reliability Testing',
      body: 'Testing API reliability and validation',
      userId: 1,
    },
    null,
    2
  ),
  expectedBehaviour:
    'A valid request should create a new post and return the created resource.',
};

export const DEFAULT_EMPTY_FORM: ApiFormData = {
  endpoint: '',
  method: 'GET',
  headers: [
    { id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: 'h2', key: 'Accept', value: 'application/json', enabled: true },
  ],
  queryParams: [],
  auth: {
    type: 'None',
  },
  requestBody: '',
  expectedBehaviour: '',
};
