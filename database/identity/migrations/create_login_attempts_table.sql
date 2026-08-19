CREATE TABLE IF NOT EXISTS identity_login_attempts (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(128) NULL,
  email VARCHAR(255) NULL,
  ip VARCHAR(64) NOT NULL,
  user_agent TEXT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  risk_level VARCHAR(32) NOT NULL DEFAULT 'low',
  reason TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_identity_login_attempts_tenant (tenant_id),
  INDEX idx_identity_login_attempts_tenant_ip (tenant_id, ip),
  INDEX idx_identity_login_attempts_created_at (created_at),
  INDEX idx_identity_login_attempts_risk_level (risk_level)
);