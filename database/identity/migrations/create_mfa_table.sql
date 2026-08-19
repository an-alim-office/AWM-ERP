CREATE TABLE IF NOT EXISTS identity_mfa (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  method VARCHAR(32) NOT NULL,
  secret TEXT NULL,
  backup_codes_hash JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL,
  disabled_at TIMESTAMP NULL,
  UNIQUE KEY uniq_identity_mfa_tenant_user (tenant_id, user_id),
  INDEX idx_identity_mfa_enabled (enabled)
);