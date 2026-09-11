// Centralized policy boundaries for TONY.
// Enforcement modules import this file so boundary behavior has one source of truth.

export const PROTECTED_OPERATION_PATTERN = /credential|authentication|payment|financial|secret|private[- ]key/i;

export const BROWSER_NAVIGATION_BOUNDARY = Object.freeze({
  allowExternalNavigationEnv: 'ALLOW_EXTERNAL_NAVIGATION',
  dashboardUrlEnv: 'DASHBOARD_URL',
  message: 'Navigation blocked by domain policy'
});

export const EXECUTION_BOUNDARY = Object.freeze({
  autoSubmitEnv: 'AUTO_SUBMIT',
  defaultAutoSubmit: false,
  confidenceEnv: 'CONFIDENCE_THRESHOLD',
  defaultConfidence: 0.86
});

export const HUMAN_REVIEW_BOUNDARY = Object.freeze({
  message: 'Human review required for a protected or uncertain operation'
});

export function containsProtectedOperation(value='') {
  return PROTECTED_OPERATION_PATTERN.test(String(value));
}

export function boundaryReason(value='') {
  return containsProtectedOperation(value)
    ? 'Protected operation boundary detected'
    : null;
}

export function navigationAllowed(url, cfg={}) {
  if (cfg.allowExternalNavigation) return true;
  if (!cfg.dashboardUrl) return false;
  return String(url).startsWith(String(cfg.dashboardUrl));
}

export function boundarySummary() {
  return {
    protectedOperations: true,
    browserNavigation: true,
    humanReview: true,
    confidenceGate: true,
    autoSubmitGate: true
  };
}
