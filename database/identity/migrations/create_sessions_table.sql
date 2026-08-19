CREATE TABLE IF NOT EXISTS identity_sessions (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  ip VARCHAR(64),
  user_agent TEXT,
  device_id VARCHAR(128),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  last_seen_at TIMESTAMP NULL,
  INDEX idx_identity_sessions_tenant_user (tenant_id, user_id),
  INDEX idx_identity_sessions_token_hash (token_hash),
  INDEX idx_identity_sessions_status (status),
  INDEX idx_identity_sessions_expires_at (expires_at)
);