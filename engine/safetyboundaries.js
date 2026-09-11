// Centralized safety boundaries for TONY.
// This file is the single source of truth for the former policy.js and profile-boundary.js behavior.

export const PROTECTED_OPERATION_PATTERN = /captcha|recaptcha|hcaptcha|two[- ]factor|2fa|multi[- ]factor|mfa|password|passcode|ssn|bank|bank account|card number|credit card|payment|wire transfer|credential|authentication|secret|private[- ]key/i;

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
    ? 'Security, credential, or financial boundary detected'
    : null;
}

export function allowedAnswer(question, profile={}, research={}) {
  if (containsProtectedOperation(question)) {
    return {allowed:false, reason:'sensitive-profile-data'};
  }
  return {allowed:true, profile, research};
}

export function policyCheck({plan={}, pageModel={}, cfg={}}={}) {
  const reasons=[];
  const blob=JSON.stringify({plan,pageModel});
  if (containsProtectedOperation(blob)) reasons.push('Security, credential, or financial boundary detected');
  if (!cfg.autoSubmit) reasons.push('AUTO_SUBMIT is disabled');
  if ((plan.confidence ?? 0) < (cfg.confidenceThreshold ?? EXECUTION_BOUNDARY.defaultConfidence)) {
    reasons.push(`Confidence ${plan.confidence} below threshold ${cfg.confidenceThreshold ?? EXECUTION_BOUNDARY.defaultConfidence}`);
  }
  if (plan.requiresHuman) reasons.push('Planner explicitly requires human review');
  return {allowed:reasons.length===0, reasons};
}

export function navigationAllowed(url, cfg={}) {
  if (cfg.allowExternalNavigation) return true;
  if (!cfg.dashboardUrl) return false;
  return String(url).startsWith(String(cfg.dashboardUrl));
}

export function boundarySummary() {
  return {
    protectedOperations:true,
    browserNavigation:true,
    humanReview:true,
    confidenceGate:true,
    autoSubmitGate:true
  };
}
