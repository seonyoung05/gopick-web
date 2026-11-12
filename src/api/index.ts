// src/api/index.ts
export { api, ApiError } from './client';
export type { ApiErrorBody, Query } from './client';
export { ERROR_CODE } from './errors';
export { authApi } from './auth';
export type { Credentials, AccountResponse } from './auth';
export { profilesApi } from './profiles';
export type { ProfileRequest, ProfileDetailResponse } from './profiles';