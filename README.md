
```
AWM-ERP
├─ .npmrc
├─ ai
│  ├─ analytics
│  │  ├─ attendance-analytics.py
│  │  ├─ dashboard-insights.py
│  │  ├─ employee-analytics.py
│  │  └─ payroll-analytics.py
│  ├─ face-recognition
│  │  ├─ detect-face.py
│  │  ├─ face-attendance.py
│  │  ├─ train-model.py
│  │  └─ verify-face.py
│  ├─ prediction-engine
│  │  ├─ analytics-prediction.py
│  │  ├─ attendance-prediction.py
│  │  ├─ overtime-prediction.py
│  │  └─ salary-prediction.py
│  └─ smart-search
│     ├─ ai-search.py
│     ├─ search-engine.py
│     ├─ smart-suggestions.py
│     └─ voice-search.py
├─ ai-suggestions.ts
├─ analytics-prediction.py
├─ app
│  ├─ actions
│  │  └─ payrollActions.ts
│  ├─ ai
│  │  ├─ analytics
│  │  │  └─ page.tsx
│  │  ├─ assistant
│  │  │  └─ page.tsx
│  │  ├─ attendance
│  │  │  └─ page.tsx
│  │  ├─ chat
│  │  │  └─ page.tsx
│  │  ├─ cost-management
│  │  │  └─ page.tsx
│  │  ├─ driven-medical-imaging-intelligence
│  │  │  └─ page.tsx
│  │  ├─ ePrescription
│  │  │  └─ page.tsx
│  │  ├─ multi-language
│  │  │  └─ page.tsx
│  │  ├─ payroll
│  │  │  └─ page.tsx
│  │  ├─ pharmacy
│  │  │  └─ smart-hub
│  │  │     └─ page.tsx
│  │  ├─ prediction
│  │  │  └─ page.tsx
│  │  ├─ report-generator
│  │  │  └─ page.tsx
│  │  ├─ restaurant
│  │  │  └─ page.tsx
│  │  ├─ revenue-orchestrator
│  │  │  └─ page.tsx
│  │  ├─ search
│  │  │  └─ page.tsx
│  │  └─ voice-command
│  │     └─ page.tsx
│  ├─ ai-search
│  │  ├─ global
│  │  │  └─ page.tsx
│  │  ├─ history
│  │  │  └─ page.tsx
│  │  ├─ results
│  │  │  └─ page.tsx
│  │  ├─ suggestions
│  │  │  └─ page.tsx
│  │  └─ voice
│  │     └─ page.tsx
│  ├─ api
│  │  ├─ ai
│  │  │  └─ attendance
│  │  │     └─ route.ts
│  │  ├─ ai-search-service
│  │  │  ├─ ai-suggestions.ts
│  │  │  ├─ smart-search.ts
│  │  │  └─ voice-search.ts
│  │  ├─ attendance-service
│  │  │  ├─ attendance-history
│  │  │  │  └─ route.ts
│  │  │  ├─ check-in-out
│  │  │  │  └─ route.ts
│  │  │  ├─ face-verification
│  │  │  │  └─ route.ts
│  │  │  ├─ gps-checkin
│  │  │  │  └─ route.ts
│  │  │  ├─ offline-sync
│  │  │  │  └─ route.ts
│  │  │  ├─ qr-attendance
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  └─ verify-token
│  │  │     └─ route.ts
│  │  ├─ auth-service
│  │  │  ├─ forgot-password
│  │  │  │  └─ route.ts
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  ├─ logout
│  │  │  │  └─ route.ts
│  │  │  ├─ register
│  │  │  │  └─ route.ts
│  │  │  ├─ reset-password
│  │  │  │  └─ route.ts
│  │  │  ├─ send-otp
│  │  │  │  └─ route.ts
│  │  │  ├─ verify-bio
│  │  │  │  └─ route.ts
│  │  │  ├─ verify-bio-face-fingerprint.ts
│  │  │  └─ verify-otp
│  │  │     └─ route.ts
│  │  ├─ chat
│  │  │  └─ route.ts
│  │  ├─ E-Commerce
│  │  │  └─ route.ts
│  │  ├─ employee
│  │  │  ├─ get-employees.ts
│  │  │  ├─ route.ts
│  │  │  └─ update-employee.ts
│  │  ├─ employees
│  │  │  ├─ get-employees.ts
│  │  │  └─ route.ts
│  │  ├─ excel
│  │  │  └─ sheets
│  │  │     └─ route.ts
│  │  ├─ face-attendance
│  │  │  └─ route.ts
│  │  ├─ fish-supply
│  │  │  └─ route.ts
│  │  ├─ identity
│  │  │  ├─ devices
│  │  │  │  ├─ revoke
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ mfa
│  │  │  │  ├─ backup-codes
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ disable
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ enroll
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ verify
│  │  │  │     └─ route.ts
│  │  │  ├─ password
│  │  │  │  ├─ change
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ policy
│  │  │  │     └─ route.ts
│  │  │  ├─ security
│  │  │  │  ├─ login-attempts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ risk-check
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ security-status
│  │  │  │     └─ route.ts
│  │  │  └─ sessions
│  │  │     ├─ revoke
│  │  │     │  └─ route.ts
│  │  │     └─ route.ts
│  │  ├─ mfs
│  │  │  └─ [...slug]
│  │  │     └─ route.ts
│  │  ├─ multi-language-ai
│  │  │  └─ route.ts
│  │  ├─ next-gen
│  │  │  └─ ai-voice-erp
│  │  │     └─ route.ts
│  │  ├─ payroll-service
│  │  │  ├─ deductions.ts
│  │  │  ├─ overtime.ts
│  │  │  ├─ payroll-report.ts
│  │  │  ├─ route.ts
│  │  │  ├─ salary-sheet
│  │  │  │  └─ route.ts
│  │  │  ├─ salary-sheet.ts
│  │  │  └─ time-sheet
│  │  │     └─ route.ts
│  │  ├─ reports-service
│  │  │  ├─ attendance-report.ts
│  │  │  ├─ export-excel.ts
│  │  │  ├─ export-pdf.ts
│  │  │  ├─ route.ts
│  │  │  └─ salary-report.ts
│  │  ├─ route.ts
│  │  ├─ staff-advance-sheet
│  │  │  └─ route.ts
│  │  ├─ staff-advancement-logs
│  │  │  └─ route.ts
│  │  ├─ tenant
│  │  │  ├─ create
│  │  │  │  └─ route.ts
│  │  │  ├─ health
│  │  │  │  └─ route.ts
│  │  │  ├─ info
│  │  │  │  └─ route.ts
│  │  │  ├─ resolve
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ switch
│  │  │     └─ route.ts
│  │  ├─ user
│  │  │  └─ avatar
│  │  │     └─ route.ts
│  │  ├─ workers
│  │  │  └─ route.ts
│  │  └─ zakat-management
│  │     ├─ route.ts
│  │     └─ [id]
│  │        └─ route.ts
│  ├─ attendance
│  │  ├─ face
│  │  │  └─ page.tsx
│  │  ├─ fingerprint
│  │  │  └─ page.tsx
│  │  ├─ gps
│  │  │  └─ page.tsx
│  │  ├─ history
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ qr
│  │  │  └─ page.tsx
│  │  └─ shifts
│  │     └─ page.tsx
│  ├─ auth
│  │  ├─ forgot-password
│  │  │  └─ page.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  ├─ otp-verification
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ register
│  │     └─ page.tsx
│  ├─ communication
│  │  └─ awm-sms
│  │     └─ page.tsx
│  ├─ community
│  │  └─ awm-social
│  │     └─ page.tsx
│  ├─ dashboard
│  │  ├─ activity-timeline
│  │  │  └─ page.tsx
│  │  ├─ admin
│  │  │  └─ page.tsx
│  │  ├─ ai-analytics
│  │  │  └─ page.tsx
│  │  ├─ branch-overview
│  │  │  └─ page.tsx
│  │  ├─ calendar
│  │  │  └─ page.tsx
│  │  ├─ live-attendance
│  │  │  └─ page.tsx
│  │  ├─ live-kpi
│  │  │  └─ page.tsx
│  │  ├─ notifications
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ payroll-overview
│  │  │  └─ page.tsx
│  │  └─ real-time-monitoring
│  │     └─ page.tsx
│  ├─ E-Commerce
│  │  └─ page.tsx
│  ├─ face
│  │  └─ fingerprint
│  │     └─ page.tsx
│  ├─ face-attendance
│  │  └─ page.tsx
│  ├─ fish-supply
│  │  ├─ auction-bidding
│  │  │  └─ page.tsx
│  │  ├─ cold-chain-logistics
│  │  │  └─ page.tsx
│  │  ├─ cold-storage
│  │  │  └─ page.tsx
│  │  ├─ collection-points
│  │  │  └─ page.tsx
│  │  ├─ export-compliance
│  │  │  └─ page.tsx
│  │  ├─ farmer-ledger
│  │  │  └─ page.tsx
│  │  ├─ ice-stock
│  │  │  └─ page.tsx
│  │  ├─ intake-register
│  │  │  └─ page.tsx
│  │  ├─ market-price-tracking
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ processing-packaging
│  │  │  └─ page.tsx
│  │  ├─ procurement
│  │  │  └─ page.tsx
│  │  ├─ quality-inspection
│  │  │  └─ page.tsx
│  │  ├─ seasonal-planning
│  │  │  └─ page.tsx
│  │  ├─ species-batch-tracking
│  │  │  └─ page.tsx
│  │  ├─ traceability
│  │  │  └─ page.tsx
│  │  ├─ vendor-network
│  │  │  └─ page.tsx
│  │  ├─ wastage-tracking
│  │  │  └─ page.tsx
│  │  └─ weighing-grading
│  │     └─ page.tsx
│  ├─ globals.css
│  ├─ hr
│  │  ├─ attendance
│  │  │  └─ page.tsx
│  │  ├─ contracts
│  │  │  └─ page.tsx
│  │  ├─ disciplinary-actions
│  │  │  └─ page.tsx
│  │  ├─ employee-profile
│  │  │  └─ page.tsx
│  │  ├─ employees
│  │  │  └─ page.tsx
│  │  ├─ id-card-generator
│  │  │  └─ page.tsx
│  │  ├─ leave-management
│  │  │  └─ page.tsx
│  │  ├─ performance
│  │  │  └─ page.tsx
│  │  ├─ promotions
│  │  │  └─ page.tsx
│  │  └─ scanner
│  │     └─ page.tsx
│  ├─ inventory
│  │  ├─ delivery-tracking
│  │  │  └─ page.tsx
│  │  ├─ live-stock-tracking
│  │  │  └─ page.tsx
│  │  ├─ logistics
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ purchase-orders
│  │  │  └─ page.tsx
│  │  ├─ qr-barcode-scanner
│  │  │  └─ page.tsx
│  │  ├─ suppliers
│  │  │  └─ page.tsx
│  │  └─ warehouse
│  │     └─ page.tsx
│  ├─ layout.tsx
│  ├─ mfs
│  │  ├─ agent-dashboard
│  │  │  └─ page.tsx
│  │  ├─ agent-onboarding
│  │  │  └─ page.tsx
│  │  ├─ bb-compliance
│  │  │  └─ page.tsx
│  │  ├─ bkash
│  │  │  └─ page.tsx
│  │  ├─ cash-in-out
│  │  │  └─ page.tsx
│  │  ├─ commission
│  │  │  └─ page.tsx
│  │  ├─ float-balance
│  │  │  └─ page.tsx
│  │  ├─ fraud-aml-monitoring
│  │  │  └─ page.tsx
│  │  ├─ merchant-payment
│  │  │  └─ page.tsx
│  │  ├─ nagad
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ reconciliation
│  │  │  └─ page.tsx
│  │  ├─ rocket
│  │  │  └─ page.tsx
│  │  ├─ send-money
│  │  │  └─ page.tsx
│  │  ├─ settlement
│  │  │  └─ page.tsx
│  │  ├─ surecash
│  │  │  └─ page.tsx
│  │  ├─ transaction-limits
│  │  │  └─ page.tsx
│  │  ├─ transaction-reports
│  │  │  └─ page.tsx
│  │  └─ upay
│  │     └─ page.tsx
│  ├─ multi-language-ai
│  │  └─ page.tsx
│  ├─ next-gen
│  │  ├─ ai-document-understanding
│  │  │  └─ page.tsx
│  │  ├─ ai-voice-erp
│  │  │  └─ page.tsx
│  │  ├─ ai-workflow-automation
│  │  │  └─ page.tsx
│  │  ├─ ar-vr-dashboard
│  │  │  └─ page.tsx
│  │  ├─ auto-decision-engine
│  │  │  └─ page.tsx
│  │  ├─ autonomous-ai-agent
│  │  │  └─ page.tsx
│  │  ├─ live-iot-devices
│  │  │  └─ page.tsx
│  │  ├─ predictive-analytics
│  │  │  └─ page.tsx
│  │  └─ remote-factory-control
│  │     └─ page.tsx
│  ├─ page.tsx
│  ├─ payroll
│  │  ├─ advance
│  │  │  └─ page.tsx
│  │  ├─ ai-salary-prediction
│  │  │  └─ page.tsx
│  │  ├─ auto-calculation
│  │  │  └─ page.tsx
│  │  ├─ banking
│  │  │  └─ page.tsx
│  │  ├─ deductions
│  │  │  └─ page.tsx
│  │  ├─ driver-attendance
│  │  │  └─ page.tsx
│  │  ├─ expenses
│  │  │  └─ page.tsx
│  │  ├─ financial-reports
│  │  │  └─ page.tsx
│  │  ├─ hourly
│  │  │  └─ page.tsx
│  │  ├─ monthly
│  │  │  └─ page.tsx
│  │  ├─ multi-currency
│  │  │  └─ page.tsx
│  │  ├─ overtime
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profit-loss
│  │  │  └─ page.tsx
│  │  ├─ revenue
│  │  │  └─ page.tsx
│  │  ├─ Salary-Sheet
│  │  │  └─ page.tsx
│  │  ├─ tax-management
│  │  │  └─ page.tsx
│  │  └─ time-sheet
│  │     └─ page.tsx
│  ├─ production
│  │  ├─ equipment-status
│  │  │  └─ page.tsx
│  │  ├─ kpi
│  │  │  └─ page.tsx
│  │  ├─ line-management
│  │  │  └─ page.tsx
│  │  ├─ machine-monitoring
│  │  │  └─ page.tsx
│  │  ├─ maintenance
│  │  │  └─ page.tsx
│  │  ├─ planning
│  │  │  └─ page.tsx
│  │  ├─ raw-materials
│  │  │  └─ page.tsx
│  │  └─ waste-analysis
│  │     └─ page.tsx
│  ├─ reports
│  │  ├─ ai-insights
│  │  │  └─ page.tsx
│  │  ├─ attendance
│  │  │  └─ page.tsx
│  │  ├─ charts
│  │  │  └─ page.tsx
│  │  ├─ data-visualization
│  │  │  └─ page.tsx
│  │  ├─ employees
│  │  │  └─ page.tsx
│  │  ├─ excel
│  │  │  └─ page.tsx
│  │  ├─ export
│  │  │  └─ page.tsx
│  │  ├─ forecasting
│  │  │  └─ page.tsx
│  │  ├─ overtime
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ pdf
│  │  │  └─ page.tsx
│  │  ├─ print-center
│  │  │  └─ page.tsx
│  │  ├─ salary
│  │  │  └─ page.tsx
│  │  └─ smart-reports
│  │     └─ page.tsx
│  ├─ salary-sheet
│  │  ├─ construction-payroll
│  │  │  └─ page.tsx
│  │  ├─ manpower-payroll
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ sales
│  │  ├─ ai-assistant
│  │  │  └─ page.tsx
│  │  ├─ analytics
│  │  │  └─ page.tsx
│  │  ├─ client-chat
│  │  │  └─ page.tsx
│  │  ├─ crm
│  │  │  └─ page.tsx
│  │  ├─ customers
│  │  │  └─ page.tsx
│  │  ├─ invoices
│  │  │  └─ page.tsx
│  │  ├─ leads
│  │  │  └─ page.tsx
│  │  └─ marketing
│  │     └─ page.tsx
│  ├─ security
│  │  ├─ access-control
│  │  │  └─ page.tsx
│  │  ├─ alerts
│  │  │  └─ page.tsx
│  │  ├─ api-keys
│  │  │  └─ page.tsx
│  │  ├─ audit-logs
│  │  │  └─ page.tsx
│  │  ├─ biometric
│  │  │  └─ page.tsx
│  │  ├─ ip-restrictions
│  │  │  └─ page.tsx
│  │  ├─ threat-detection
│  │  │  └─ page.tsx
│  │  └─ user-roles
│  │     └─ page.tsx
│  ├─ settings
│  │  ├─ api-integration
│  │  │  └─ page.tsx
│  │  ├─ attendance-rules
│  │  │  └─ page.tsx
│  │  ├─ cloud-backup
│  │  │  └─ page.tsx
│  │  ├─ company
│  │  │  └─ page.tsx
│  │  ├─ currency
│  │  │  └─ page.tsx
│  │  ├─ dark-mode
│  │  │  └─ page.tsx
│  │  ├─ erp-connectors
│  │  │  └─ page.tsx
│  │  ├─ holidays
│  │  │  └─ page.tsx
│  │  ├─ language
│  │  │  └─ page.tsx
│  │  ├─ mobile-sync
│  │  │  └─ page.tsx
│  │  ├─ ot-rules
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ payroll-rules
│  │  │  └─ page.tsx
│  │  ├─ quality-control
│  │  │  └─ page.tsx
│  │  └─ theme
│  │     └─ page.tsx
│  ├─ staff-advance-sheet
│  │  └─ page.tsx
│  ├─ staff-advancement
│  │  ├─ count
│  │  │  └─ page.tsx
│  │  └─ logs
│  │     └─ page.tsx
│  ├─ staff-advancement-logs
│  │  └─ page.tsx
│  ├─ support
│  │  ├─ activity-logs
│  │  │  └─ page.tsx
│  │  ├─ contact
│  │  │  └─ page.tsx
│  │  ├─ help-center
│  │  │  └─ page.tsx
│  │  └─ notifications
│  │     └─ page.tsx
│  └─ zakat-management
│     └─ page.tsx
├─ attendance-analytics.py
├─ attendance-history.ts
├─ attendance-prediction.py
├─ attendance-report.ts
├─ components
│  ├─ AuthGuard.tsx
│  ├─ EnterpriseOperations.tsx
│  ├─ layout
│  │  ├─ footer.tsx
│  │  ├─ header.tsx
│  │  ├─ navbar.tsx
│  │  └─ sidebar.tsx
│  ├─ Loader.tsx
│  ├─ ReportPage.tsx
│  ├─ ResizableTable.tsx
│  ├─ templates
│  │  ├─ biometric-template.tsx
│  │  ├─ dashboard-template.tsx
│  │  ├─ id-card-template.tsx
│  │  ├─ login-template.tsx
│  │  └─ payroll-template.tsx
│  ├─ Toast.tsx
│  └─ ui
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ loader.tsx
│     ├─ modal.tsx
│     ├─ search-bar.tsx
│     ├─ table.tsx
│     └─ tabs.tsx
├─ config.json
├─ context
│  ├─ AuthContext.tsx
│  ├─ IdentityContext.tsx
│  └─ TenantContext.tsx
├─ core
│  └─ auth.ts
├─ dashboard-insights.py
├─ database
│  ├─ er-diagram
│  │  └─ database-schema.pdf
│  ├─ identity
│  │  ├─ DeviceRepository.ts
│  │  ├─ IdentityRepository.ts
│  │  ├─ LoginAttemptRepository.ts
│  │  ├─ MfaRepository.ts
│  │  ├─ migrations
│  │  │  ├─ create_devices_table.sql
│  │  │  ├─ create_login_attempts_table.sql
│  │  │  ├─ create_mfa_table.sql
│  │  │  └─ create_sessions_table.sql
│  │  └─ SessionRepository.ts
│  ├─ migrations
│  │  ├─ create_attendance_table.sql
│  │  ├─ create_employees_table.sql
│  │  ├─ create_payroll_table.sql
│  │  └─ create_users_table.sql
│  ├─ models
│  │  ├─ Attendance.ts
│  │  ├─ Employee.ts
│  │  ├─ Payroll.ts
│  │  └─ User.ts
│  ├─ seeders
│  │  ├─ admin_seeder.sql
│  │  ├─ employee_seeder.sql
│  │  └─ payroll_seeder.sql
│  └─ tenants
│     ├─ ConnectionPool.ts
│     ├─ DatabaseFactory.ts
│     ├─ drivers
│     │  ├─ MongoRegistryDriver.ts
│     │  └─ PostgresRegistryDriver.ts
│     ├─ MasterRegistry.ts
│     ├─ TenantDatabase.ts
│     ├─ TenantMigration.ts
│     └─ TenantSeeder.ts
├─ declarations.d.ts
├─ deductions.ts
├─ detect-face.py
├─ docker
│  ├─ laravel
│  │  ├─ Dockerfile
│  │  └─ php.ini
│  ├─ mysql
│  │  ├─ Dockerfile
│  │  └─ my.cnf
│  ├─ nginx
│  │  ├─ default.conf
│  │  └─ Dockerfile
│  └─ redis
│     └─ redis.conf
├─ docker-compose.yml
├─ Dockerfile
├─ dockerignore
├─ employee-analytics.py
├─ export-excel.ts
├─ export-pdf.ts
├─ face-attendance.py
├─ hooks
│  └─ useAuth.ts
├─ lib
│  ├─ auth-client.ts
│  ├─ db
│  │  └─ registryDriver.ts
│  ├─ email.ts
│  ├─ identity
│  │  ├─ DeviceManager.ts
│  │  ├─ IdentityCache.ts
│  │  ├─ IdentityContext.ts
│  │  ├─ IdentityManager.ts
│  │  ├─ IdentityValidator.ts
│  │  ├─ LoginAttemptManager.ts
│  │  ├─ MfaManager.ts
│  │  ├─ PasswordManager.ts
│  │  ├─ RiskEngine.ts
│  │  ├─ SecurityPolicy.ts
│  │  ├─ SessionManager.ts
│  │  └─ types.ts
│  ├─ mongodb.ts
│  ├─ otp.ts
│  ├─ provisioning
│  │  ├─ AdminProvisioning.ts
│  │  ├─ CompanyProvisioning.ts
│  │  ├─ DatabaseProvisioning.ts
│  │  ├─ drivers
│  │  │  ├─ databaseProvisionerDriver.ts
│  │  │  ├─ MongoDatabaseProvisioner.ts
│  │  │  └─ PostgresDatabaseProvisioner.ts
│  │  ├─ ProvisioningService.ts
│  │  ├─ SeederProvisioning.ts
│  │  └─ utils.ts
│  ├─ security
│  │  ├─ Encryption.ts
│  │  ├─ Hashing.ts
│  │  ├─ SecureCookie.ts
│  │  ├─ SecurityConstants.ts
│  │  ├─ TokenManager.ts
│  │  └─ TokenRotation.ts
│  ├─ tenant
│  │  ├─ TenantCache.ts
│  │  ├─ TenantConfig.ts
│  │  ├─ TenantConnection.ts
│  │  ├─ TenantContext.ts
│  │  ├─ TenantFactory.ts
│  │  ├─ TenantManager.ts
│  │  ├─ TenantRegistry.ts
│  │  ├─ TenantResolver.ts
│  │  ├─ TenantValidator.ts
│  │  └─ types.ts
│  └─ zakat-store.ts
├─ middleware.ts
├─ next-env.d.ts
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ logo
│  │  ├─ favicon.ico
│  │  └─ logo.png
│  ├─ manifest.json
│  └─ models
│     ├─ tiny_face_detector_model-shard1
│     └─ tiny_face_detector_model-weights_manifest.json
├─ README.md
├─ route.ts
├─ search-engine.py
├─ styles
│  ├─ animations.css
│  ├─ biometric.css
│  ├─ dashboard.css
│  ├─ globals.css
│  ├─ mobile.css
│  └─ payroll.css
├─ tailwind.config.js
├─ tsconfig.json
├─ tsconfig.tsbuildinfo
└─ types
   └─ identity.ts

```