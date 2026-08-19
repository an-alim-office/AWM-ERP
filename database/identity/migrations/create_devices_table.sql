CREATE TABLE IF NOT EXISTS identity_devices (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  fingerprint VARCHAR(255) NOT NULL,
  trust_level VARCHAR(32) NOT NULL DEFAULT 'untrusted',
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  ip VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,
  last_seen_at TIMESTAMP NULL,
  UNIQUE KEY uniq_identity_devices_tenant_user_fingerprint (tenant_id, user_id, fingerprint),
  INDEX idx_identity_devices_tenant_user (tenant_id, user_id),
  INDEX idx_identity_devices_status (status)
);