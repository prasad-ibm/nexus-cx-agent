-- =============================================================================
-- TELCO MEDALLION — PostgreSQL DDL + SEED DATA  (US localization)
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS telco_medallion;

-- =============================================================================
-- CONSUMER DOMAIN
-- =============================================================================

CREATE TABLE IF NOT EXISTS telco_medallion.bronze_consumer_crm (
    customer_id      TEXT PRIMARY KEY,
    msisdn           TEXT,
    full_name        TEXT,
    id_number        TEXT,
    contract_type    TEXT,
    plan_name        TEXT,
    monthly_plan_fee NUMERIC(10,2),
    activation_date  DATE,
    device_model     TEXT,
    device_os        TEXT,
    state            TEXT,
    income_band      TEXT,
    language_pref    TEXT,
    time_zone        TEXT,
    sales_tax_pct    NUMERIC(5,4),
    loaded_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telco_medallion.silver_consumer_customer_profile (
    customer_id            TEXT PRIMARY KEY,
    msisdn                 TEXT,
    contract_type          TEXT,
    plan_name              TEXT,
    monthly_plan_fee       NUMERIC(10,2),
    tenure_months          INTEGER,
    state                  TEXT,
    income_band            TEXT,
    device_os              TEXT,
    is_5g_capable          BOOLEAN,
    avg_daily_data_mb      NUMERIC(10,2),
    avg_monthly_data_gb    NUMERIC(10,2),
    avg_call_mins_month    INTEGER,
    avg_sms_count_month    INTEGER,
    roaming_trips_90d      INTEGER,
    top_app_category       TEXT,
    streaming_hrs_month    NUMERIC(6,1),
    gaming_hrs_month       NUMERIC(6,1),
    fintech_sessions_month INTEGER,
    arpu                   NUMERIC(10,2),
    data_overage_flag      BOOLEAN,
    late_payment_count_6m  INTEGER,
    support_calls_90d      INTEGER,
    churn_risk_score       NUMERIC(4,2),
    nps_score              INTEGER,
    silver_updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telco_medallion.gold_consumer_micro_segment (
    customer_id             TEXT PRIMARY KEY,
    msisdn                  TEXT,
    segment_code            TEXT,
    segment_label           TEXT,
    segment_description     TEXT,
    clv_score               NUMERIC(6,2),
    churn_risk_score        NUMERIC(4,2),
    upsell_propensity       NUMERIC(4,2),
    data_upgrade_propensity NUMERIC(4,2),
    nba_action              TEXT,
    nba_offer               TEXT,
    nba_channel             TEXT,
    segment_version         TEXT,
    segment_date            DATE,
    gold_created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ENTERPRISE DOMAIN
-- =============================================================================

CREATE TABLE IF NOT EXISTS telco_medallion.bronze_enterprise_contract (
    contract_id       TEXT PRIMARY KEY,
    account_id        TEXT,
    account_name      TEXT,
    industry_code     TEXT,
    industry_label    TEXT,
    contract_type     TEXT,
    start_date        DATE,
    end_date          DATE,
    annual_value_usd  NUMERIC(12,2),
    account_manager   TEXT,
    billing_state     TEXT,
    time_zone         TEXT,
    sales_tax_pct     NUMERIC(5,4),
    employee_count    INTEGER,
    loaded_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telco_medallion.bronze_enterprise_product_catalog (
    product_id     TEXT PRIMARY KEY,
    product_family TEXT,
    product_name   TEXT,
    description    TEXT,
    unit_type      TEXT,
    list_price_usd NUMERIC(10,2),
    is_5g_product  BOOLEAN,
    min_order_qty  INTEGER,
    loaded_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telco_medallion.silver_enterprise_account_summary (
    account_id            TEXT PRIMARY KEY,
    account_name          TEXT,
    industry_code         TEXT,
    industry_label        TEXT,
    employee_count        INTEGER,
    contract_annual_value NUMERIC(12,2),
    months_to_renewal     INTEGER,
    has_5g_sims           BOOLEAN,
    has_network_slice     BOOLEAN,
    has_managed_security  BOOLEAN,
    has_sdwan             BOOLEAN,
    has_iot               BOOLEAN,
    active_sim_count      INTEGER,
    active_iot_sim_count  INTEGER,
    avg_monthly_data_gb   NUMERIC(10,2),
    data_growth_rate_pct  NUMERIC(5,1),
    sla_breach_count_6m   INTEGER,
    incident_rate_per_100 NUMERIC(5,2),
    avg_nps               NUMERIC(5,1),
    gap_5g_upgrade        BOOLEAN,
    gap_network_slice     BOOLEAN,
    gap_managed_security  BOOLEAN,
    gap_iot_platform      BOOLEAN,
    gap_sdwan             BOOLEAN,
    silver_updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telco_medallion.gold_enterprise_bundle_recommendation (
    account_id             TEXT PRIMARY KEY,
    account_name           TEXT,
    industry_label         TEXT,
    bundle_name            TEXT,
    bundle_rationale       TEXT,
    recommended_products   JSONB,
    sim_qty                INTEGER,
    iot_sim_qty            INTEGER,
    network_slice_type     TEXT,
    security_gateway_sites INTEGER,
    sdwan_sites            INTEGER,
    estimated_mrr_usd      NUMERIC(12,2),
    estimated_arr_usd      NUMERIC(12,2),
    uplift_vs_current_pct  NUMERIC(5,1),
    bundle_fit_score       NUMERIC(4,2),
    recommended_action     TEXT,
    urgency                TEXT,
    gold_created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telco_medallion.gold_finance_o2c_health (
    account_id                  TEXT PRIMARY KEY,
    account_name                TEXT,
    reporting_period            TEXT,
    orders_ytd                  INTEGER,
    order_value_ytd_usd         NUMERIC(12,2),
    orders_in_provisioning      INTEGER,
    provisioning_failure_count  INTEGER,
    invoices_issued_ytd         INTEGER,
    invoiced_value_ytd_usd      NUMERIC(12,2),
    invoices_overdue_count      INTEGER,
    overdue_value_usd           NUMERIC(12,2),
    collected_value_ytd_usd     NUMERIC(12,2),
    outstanding_ar_usd          NUMERIC(12,2),
    partial_payment_count       INTEGER,
    avg_o2c_cycle_days          NUMERIC(5,1),
    avg_provision_days          NUMERIC(5,1),
    avg_invoice_to_payment_days NUMERIC(5,1),
    dso_days                    NUMERIC(5,1),
    revenue_leakage_flag        BOOLEAN,
    credit_risk_flag            BOOLEAN,
    provisioning_risk_flag      BOOLEAN,
    expected_cash_30d_usd       NUMERIC(12,2),
    expected_cash_60d_usd       NUMERIC(12,2),
    o2c_health_score            NUMERIC(4,3),
    health_label                TEXT,
    gold_created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CALL CENTRE INTERACTION LOG (new)
-- =============================================================================

CREATE TABLE IF NOT EXISTS telco_medallion.cx_interaction_log (
    interaction_id       SERIAL PRIMARY KEY,
    customer_id          TEXT,
    account_id           TEXT,
    customer_type        TEXT NOT NULL,  -- CONSUMER | ENTERPRISE
    agent_id             TEXT NOT NULL,
    channel              TEXT NOT NULL,  -- INBOUND_CALL | OUTBOUND_CALL | CHAT | EMAIL
    nba_offer_presented  TEXT,
    nba_outcome          TEXT,           -- ACCEPTED | DEFERRED | REJECTED | ESCALATED
    call_script_used     BOOLEAN DEFAULT FALSE,
    notes                TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_consumer_crm_msisdn    ON telco_medallion.bronze_consumer_crm(msisdn);
CREATE INDEX IF NOT EXISTS idx_consumer_crm_name      ON telco_medallion.bronze_consumer_crm(full_name);
CREATE INDEX IF NOT EXISTS idx_silver_churn           ON telco_medallion.silver_consumer_customer_profile(churn_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_gold_segment_code      ON telco_medallion.gold_consumer_micro_segment(segment_code);
CREATE INDEX IF NOT EXISTS idx_enterprise_account     ON telco_medallion.bronze_enterprise_contract(account_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_name        ON telco_medallion.bronze_enterprise_contract(account_name);
CREATE INDEX IF NOT EXISTS idx_cx_log_customer        ON telco_medallion.cx_interaction_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_cx_log_account         ON telco_medallion.cx_interaction_log(account_id);
CREATE INDEX IF NOT EXISTS idx_cx_log_created         ON telco_medallion.cx_interaction_log(created_at DESC);

-- =============================================================================
-- SEED: PRODUCT CATALOG  (USD list prices, pre-tax)
-- =============================================================================

INSERT INTO telco_medallion.bronze_enterprise_product_catalog
(product_id,product_family,product_name,description,unit_type,list_price_usd,is_5g_product,min_order_qty) VALUES
('PROD-001','SIM',     'Business SIM (4G)',       'Standard 4G SIM for business devices',       'PER_SIM',        5.00, FALSE, 1),
('PROD-002','SIM',     'Business SIM (5G SA)',    '5G standalone SIM — high-throughput',        'PER_SIM',        9.00, TRUE,  1),
('PROD-003','SLICE',   '5G Low-Latency Slice',    'Network slice < 10ms RTT, 99.99% SLA',       'PER_MONTH',   1300.00, TRUE,  1),
('PROD-004','SLICE',   '5G High-Bandwidth Slice', 'Network slice 1Gbps guaranteed throughput',  'PER_MONTH',   1000.00, TRUE,  1),
('PROD-005','SECURITY','Managed Security Gateway','NGFW, IDS/IPS, SIEM — fully managed',        'PER_SITE',     625.00, FALSE, 1),
('PROD-006','SECURITY','Mobile Threat Defence',   'Per-device MDM + threat intelligence',       'PER_DEVICE',     7.00, FALSE,10),
('PROD-007','SD-WAN',  'Managed SD-WAN',          'Multi-site SD-WAN with 4G/5G failover',      'PER_SITE',     450.00, FALSE, 2),
('PROD-008','IOT',     'Fleet Telematics SIM',    'Low-power IoT SIM for vehicle tracking',     'PER_SIM',        3.00, FALSE,20),
('PROD-009','IOT',     'IoT Management Platform', 'Device lifecycle, OTA, analytics portal',    'PER_MONTH',    325.00, FALSE, 1),
('PROD-010','CLOUD',   'Private 5G Network Node', 'On-premise 5G small cell + core node',       'PER_SITE',    7000.00, TRUE,  1)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: CONSUMER CRM (15 customers, US)
-- =============================================================================

INSERT INTO telco_medallion.bronze_consumer_crm
(customer_id,msisdn,full_name,id_number,contract_type,plan_name,monthly_plan_fee,activation_date,device_model,device_os,state,income_band,language_pref,time_zone,sales_tax_pct) VALUES
('CUST-001','14155550001','Marcus Johnson',    '850-10-1089','CONTRACT','Mega 5G 100GB',  89.00,'2022-06-15','Samsung Galaxy S24',  'Android','NY','H','English', 'America/New_York',    0.0888),
('CUST-002','14155550002','Emma Williams',     '920-30-2087','CONTRACT','Mega 5G 200GB',  99.00,'2021-03-20','iPhone 15 Pro',        'iOS',    'CA','H','English', 'America/Los_Angeles', 0.0725),
('CUST-003','14155550003','Andre Robinson',    '000-70-7082','PREPAID', 'Flexi 2GB',      15.00,'2024-01-10','Samsung Galaxy A14',   'Android','FL','L','English', 'America/New_York',    0.0700),
('CUST-004','14155550004','Priya Patel',       '950-92-5080','CONTRACT','Gamer Unlimited',89.00,'2023-09-01','ASUS ROG Phone 7',     'Android','NY','H','English', 'America/New_York',    0.0888),
('CUST-005','14155550005','Robert Anderson',   '651-21-5086','PREPAID', 'Basic 500MB',     5.00,'2023-11-20','Nokia 3310 4G',        'Android','OH','L','English', 'America/New_York',    0.0725),
('CUST-006','14155550006','Tasha Carter',      '981-10-1684','CONTRACT','Smart 50GB',     55.00,'2023-02-14','Samsung Galaxy S23',   'Android','NY','H','English', 'America/New_York',    0.0888),
('CUST-007','14155550007','Tiffany Brooks',    '020-51-4683','PREPAID', 'Flexi 2GB',      15.00,'2024-03-01','Xiaomi Redmi 12',      'Android','MO','L','English', 'America/Chicago',     0.0823),
('CUST-008','14155550008','Fatima Hassan',     '880-82-8681','CONTRACT','Mega 5G 200GB',  99.00,'2020-09-10','iPhone 15 Pro Max',    'iOS',    'NY','H','English', 'America/New_York',    0.0888),
('CUST-009','14155550009','Ryan Fischer',      '910-42-5588','CONTRACT','Value 30GB',     35.00,'2022-11-05','Samsung Galaxy A55',   'Android','CA','M','English', 'America/Los_Angeles', 0.0725),
('CUST-010','14155550010','Tanya Davis',       '680-42-2685','PREPAID', 'Basic 500MB',     5.00,'2023-07-22','Motorola Moto G',      'Android','MO','L','English', 'America/Chicago',     0.0823),
('CUST-011','14155550011','Marcus Stevens',    '031-20-7682','PREPAID', 'Flexi 2GB',      15.00,'2024-02-20','Google Pixel 7a',      'Android','NY','L','Spanish', 'America/New_York',    0.0888),
('CUST-012','14155550012','Kavita Sharma',     '910-62-8587','CONTRACT','Smart 50GB',     55.00,'2022-04-18','Google Pixel 8',       'Android','FL','H','English', 'America/New_York',    0.0700),
('CUST-013','14155550013','Sean Mitchell',     '980-71-6583','CONTRACT','Gamer Unlimited',89.00,'2023-05-12','ASUS ROG Phone 6',     'Android','FL','H','English', 'America/New_York',    0.0700),
('CUST-014','14155550014','James Donovan',     '590-91-6586','PREPAID', 'Basic 500MB',     5.00,'2024-01-05','Nokia 105 4G',         'KaiOS',  'TX','L','Spanish', 'America/Chicago',     0.0825),
('CUST-015','14155550015','Naomi Sharpe',      '950-21-7584','CONTRACT','Smart 50GB',     55.00,'2022-08-30','Samsung Galaxy S22',   'Android','GA','H','English', 'America/New_York',    0.0800)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: SILVER CONSUMER PROFILES
-- =============================================================================

INSERT INTO telco_medallion.silver_consumer_customer_profile VALUES
('CUST-001','14155550001','CONTRACT','Mega 5G 100GB',  89.00,34,'NY','H','Android',TRUE,  280.5, 8.4,320, 45,1,'STREAMING', 28.5, 0.0, 0, 89.00,FALSE,0,1,0.08,72),
('CUST-002','14155550002','CONTRACT','Mega 5G 200GB',  99.00,48,'CA','H','iOS',    TRUE,  620.2,18.6,150, 10,4,'STREAMING', 55.2, 0.0, 4, 99.00,FALSE,0,0,0.04,85),
('CUST-003','14155550003','PREPAID', 'Flexi 2GB',      15.00, 3,'FL','L','Android',FALSE,  18.4, 0.6, 90,180,0,'SOCIAL',     0.0, 0.0, 0, 15.00,TRUE, 0,2,0.42,20),
('CUST-004','14155550004','CONTRACT','Gamer Unlimited',89.00,19,'NY','H','Android',TRUE,  980.0,29.4, 80, 20,0,'GAMING',     5.0,55.0, 1, 89.00,FALSE,1,0,0.12,65),
('CUST-005','14155550005','PREPAID', 'Basic 500MB',     5.00,17,'OH','L','Android',FALSE,   8.2, 0.2, 30, 90,0,'SOCIAL',     0.0, 0.0, 0,  5.00,TRUE, 2,4,0.68,10),
('CUST-006','14155550006','CONTRACT','Smart 50GB',     55.00,26,'NY','H','Android',TRUE,  195.0, 5.9,280, 30,0,'FINTECH',    2.0, 0.0,18, 55.00,FALSE,0,0,0.09,78),
('CUST-007','14155550007','PREPAID', 'Flexi 2GB',      15.00, 3,'MO','L','Android',FALSE,  22.0, 0.7,110,200,0,'SOCIAL',     0.0, 0.0, 0, 15.00,TRUE, 0,1,0.38,25),
('CUST-008','14155550008','CONTRACT','Mega 5G 200GB',  99.00,55,'NY','H','iOS',    TRUE,  540.0,16.2,420, 15,6,'STREAMING', 42.0, 0.0, 8, 99.00,FALSE,0,0,0.06,88),
('CUST-009','14155550009','CONTRACT','Value 30GB',     35.00,29,'CA','M','Android',TRUE,  140.0, 4.2,180, 60,0,'STREAMING', 12.0, 2.0, 2, 35.00,FALSE,0,1,0.24,58),
('CUST-010','14155550010','PREPAID', 'Basic 500MB',     5.00,21,'MO','L','Android',FALSE,   5.5, 0.2, 20, 60,0,'SOCIAL',     0.0, 0.0, 0,  5.00,TRUE, 3,5,0.72, 8),
('CUST-011','14155550011','PREPAID', 'Flexi 2GB',      15.00, 4,'NY','L','Android',FALSE,  28.0, 0.8,120,250,0,'SOCIAL',     0.0, 0.0, 0, 15.00,TRUE, 0,2,0.35,22),
('CUST-012','14155550012','CONTRACT','Smart 50GB',     55.00,36,'FL','H','Android',TRUE,  380.0,11.4,200, 25,0,'STREAMING', 18.0, 0.0, 5, 55.00,TRUE, 0,0,0.18,70),
('CUST-013','14155550013','CONTRACT','Gamer Unlimited',89.00,23,'FL','H','Android',TRUE,  880.0,26.4, 90, 15,0,'GAMING',     4.0,48.0, 1, 89.00,FALSE,0,0,0.15,68),
('CUST-014','14155550014','PREPAID', 'Basic 500MB',     5.00,15,'TX','L','KaiOS',  FALSE,   3.0, 0.1, 15, 40,0,'COMMS',      0.0, 0.0, 0,  5.00,TRUE, 2,3,0.61,12),
('CUST-015','14155550015','CONTRACT','Smart 50GB',     55.00,32,'GA','H','Android',TRUE,  210.0, 6.3,260, 20,0,'FINTECH',    3.0, 0.0,14, 55.00,FALSE,0,0,0.11,75)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: GOLD CONSUMER MICRO-SEGMENTS  (USD offers)
-- =============================================================================

INSERT INTO telco_medallion.gold_consumer_micro_segment VALUES
('CUST-001','14155550001','SEG-STREAM-5G',   'High-value 5G streamer',
 'Established contract customer, 5G-capable, heavy streaming, low churn risk.',
 88.50,0.08,0.72,0.65,'UPSELL',  'Upgrade to 150GB Streaming Bundle @ $99/month (pre-tax)',   'APP',  'v3.0','2025-04-01'),
('CUST-002','14155550002','SEG-PREMIUM-ROAM','Premium roaming professional',
 'Highest ARPU, frequent international travel, Apple ecosystem, near-zero churn.',
 97.20,0.04,0.45,0.30,'RETAIN',  'Global Roaming Pass — 3 months free on renewal',            'EMAIL','v3.0','2025-04-01'),
('CUST-003','14155550003','SEG-PREPAID-RISK','At-risk prepaid social user',
 'Low ARPU, consistent data overage, new customer, limited engagement beyond social apps.',
 22.10,0.42,0.38,0.60,'SAVE',    'Double your data for $19/month (pre-tax) — limited offer',  'SMS',  'v3.0','2025-04-01'),
('CUST-004','14155550004','SEG-GAMER-5G',   '5G mobile gamer',
 'High data volume, late-night gaming sessions, 5G-capable, moderate churn risk.',
 75.80,0.12,0.55,0.40,'UPSELL',  'Gamer Pro 5G — 50GB extra + priority network slice @ $119/month (pre-tax)','APP','v3.0','2025-04-01'),
('CUST-005','14155550005','SEG-CHURN-HIGH',  'High churn risk — basic prepaid',
 'Elderly device, very low usage, multiple late payments and support calls.',
 8.30, 0.68,0.10,0.15,'SAVE',    'Speak to a retention specialist — we will match any competitor offer','CALL','v3.0','2025-04-01'),
('CUST-006','14155550006','SEG-FINTECH-PRO','Fintech-savvy young professional',
 'High NPS, regular mobile banking usage, strong CLV, prime cross-sell candidate.',
 82.40,0.09,0.68,0.55,'CROSS_SELL','Add Chase data-free banking + insurance bundle @ $9/month (pre-tax)','APP','v3.0','2025-04-01'),
('CUST-007','14155550007','SEG-YOUTH-SOCIAL','Young at-risk prepaid — social-first',
 'Heavy WhatsApp and TikTok user, data overage every month, price-sensitive.',
 18.60,0.38,0.42,0.65,'SAVE',    'Social Data Bundle — 5GB social apps for $9/month (pre-tax)','SMS','v3.0','2025-04-01'),
('CUST-008','14155550008','SEG-BUSINESS-TRAVEL','High-ARPU business traveller',
 'Longest tenure, highest roaming usage, Apple ecosystem, extremely loyal.',
 98.10,0.06,0.40,0.25,'RETAIN',  'Dedicated business account manager + priority support lane','CALL','v3.0','2025-04-01'),
('CUST-009','14155550009','SEG-FAMILY-VALUE','Family value contract',
 'Multi-device household, moderate data, occasional streaming, low-medium churn.',
 55.30,0.24,0.58,0.48,'UPSELL',  'Family Share 100GB — add 3 SIMs for $29/month extra (pre-tax)','APP','v3.0','2025-04-01'),
('CUST-010','14155550010','SEG-CHURN-HIGH',  'High churn risk — basic prepaid',
 'Very low usage, multiple late payments, high support contacts, near-churning.',
 6.20, 0.72,0.08,0.12,'SAVE',    'Stay connected for $2/month (pre-tax) — basic rescue plan','CALL','v3.0','2025-04-01'),
('CUST-011','14155550011','SEG-YOUTH-SOCIAL','Young prepaid — social-first',
 'Heavy social app user, data overage monthly, price-sensitive student profile.',
 16.90,0.35,0.45,0.62,'SAVE',    'Social Data Bundle — 5GB social apps for $9/month (pre-tax)','SMS','v3.0','2025-04-01'),
('CUST-012','14155550012','SEG-DATA-HUNGRY','High-data contract — upgrade ready',
 'Consistently hits data cap, streaming-heavy, upgrade propensity very high.',
 72.50,0.18,0.82,0.88,'UPSELL',  'Move to Mega 5G 100GB @ $89/month (pre-tax) — save $5 on overage','APP','v3.0','2025-04-01'),
('CUST-013','14155550013','SEG-GAMER-5G',   '5G mobile gamer',
 'High gaming data volume, 5G capable, growing engagement, moderate churn.',
 71.20,0.15,0.60,0.45,'UPSELL',  'Gamer Pro 5G — 50GB extra + priority network slice @ $119/month (pre-tax)','APP','v3.0','2025-04-01'),
('CUST-014','14155550014','SEG-CHURN-HIGH',  'High churn risk — basic prepaid',
 'Near-zero digital engagement, feature phone, at serious risk of lapsing.',
 5.80, 0.61,0.05,0.10,'SAVE',    'Speak to a retention specialist — we will match any competitor offer','CALL','v3.0','2025-04-01'),
('CUST-015','14155550015','SEG-FINTECH-PRO','Fintech-savvy professional',
 'Regular financial app usage, high NPS, tenured contract — strong CLV profile.',
 79.60,0.11,0.64,0.52,'CROSS_SELL','Add data-free mobile banking + life cover bundle @ $9/month (pre-tax)','APP','v3.0','2025-04-01')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: ENTERPRISE CONTRACTS (8 US accounts)
-- =============================================================================

INSERT INTO telco_medallion.bronze_enterprise_contract
(contract_id,account_id,account_name,industry_code,industry_label,contract_type,start_date,end_date,annual_value_usd,account_manager,billing_state,time_zone,sales_tax_pct,employee_count) VALUES
('CON-E001','ACC-001','FastTrack Logistics USA',      '4213','Road freight transport',   'ENTERPRISE','2023-01-01','2026-12-31', 280000.00,'Kelly Stevens',  'NY','America/New_York',    0.0888,  320),
('CON-E002','ACC-002','Heartland Agri Processors',    '2048','Food manufacturing',       'STANDARD',  '2024-03-01','2027-02-28',  48000.00,'William Jordan', 'IA','America/Chicago',     0.0700,   85),
('CON-E003','ACC-003','Long Beach Port Terminals',    '4491','Cargo handling & ports',   'ENTERPRISE','2022-06-01','2025-12-31', 520000.00,'Nina Zhou',      'CA','America/Los_Angeles', 0.0975,  620),
('CON-E004','ACC-004','SunTech Renewable Energy',     '4911','Electric power generation','STANDARD',  '2024-09-01','2027-08-31',  72000.00,'Andrew Klein',   'TX','America/Chicago',     0.0825,  140),
('CON-E005','ACC-005','Retail Chain Holdings',        '5311','Department stores',        'ENTERPRISE','2021-07-01','2026-06-30', 360000.00,'Tracy Morgan',   'IL','America/Chicago',     0.1025, 1800),
('CON-E006','ACC-006','Mid-Atlantic Health Systems',  '8062','Hospitals & healthcare',   'ENTERPRISE','2023-04-01','2026-03-31', 120000.00,'Kelly Stevens',  'PA','America/New_York',    0.0600,  850),
('CON-E007','ACC-007','Rocky Mountain Mining Corp',   '1040','Gold & copper mining',     'ENTERPRISE','2022-01-01','2025-12-31', 480000.00,'Andrew Klein',   'NV','America/Los_Angeles', 0.0823, 2200),
('CON-E008','ACC-008','Atlantic Finserv Group',       '6020','Commercial banking',       'STANDARD',  '2023-10-01','2026-09-30', 210000.00,'Tracy Morgan',   'NY','America/New_York',    0.0888,  560)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: SILVER ENTERPRISE ACCOUNT SUMMARIES
-- =============================================================================

INSERT INTO telco_medallion.silver_enterprise_account_summary VALUES
('ACC-001','FastTrack Logistics USA',     '4213','Road freight transport',   320, 280000.00,20,FALSE,FALSE,FALSE,FALSE,TRUE, 120,200,  4800.0,12.5,0,1.67,42.0,TRUE, TRUE, TRUE, TRUE, FALSE),
('ACC-002','Heartland Agri Processors',   '2048','Food manufacturing',        85,  48000.00,34,FALSE,FALSE,FALSE,FALSE,FALSE, 60,  0,  1200.0, 5.0,0,1.67,55.0,TRUE, FALSE,TRUE, FALSE,FALSE),
('ACC-003','Long Beach Port Terminals',   '4491','Cargo handling & ports',   620, 520000.00, 8,FALSE,FALSE,TRUE, FALSE,FALSE,350,  0, 12000.0,18.2,1,1.43,38.0,TRUE, TRUE, FALSE,TRUE, TRUE),
('ACC-004','SunTech Renewable Energy',    '4911','Electric power generation',140,  72000.00,27,FALSE,FALSE,FALSE,FALSE,FALSE, 80,  0,  3200.0, 8.0,0,0.00,70.0,TRUE, TRUE, TRUE, TRUE, FALSE),
('ACC-005','Retail Chain Holdings',       '5311','Department stores',       1800, 360000.00,14,FALSE,FALSE,TRUE, TRUE, FALSE,800,  0, 32000.0,22.0,2,1.38,30.0,TRUE, TRUE, FALSE,TRUE, FALSE),
('ACC-006','Mid-Atlantic Health Systems', '8062','Hospitals & healthcare',   850, 120000.00,11,FALSE,FALSE,TRUE, FALSE,FALSE,420,  0,  8500.0,15.0,3,2.14,45.0,TRUE, TRUE, FALSE,TRUE, TRUE),
('ACC-007','Rocky Mountain Mining Corp',  '1040','Gold & copper mining',    2200, 480000.00, 7,FALSE,FALSE,FALSE,FALSE,TRUE,1100,800, 28000.0,25.0,4,1.82,32.0,TRUE, TRUE, TRUE, FALSE,TRUE),
('ACC-008','Atlantic Finserv Group',      '6020','Commercial banking',       560, 210000.00,17,TRUE, FALSE,TRUE, TRUE, FALSE,280,  0,  6200.0,10.0,0,0.36,72.0,FALSE,TRUE, FALSE,FALSE,FALSE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: GOLD ENTERPRISE BUNDLE RECOMMENDATIONS  (USD)
-- =============================================================================

INSERT INTO telco_medallion.gold_enterprise_bundle_recommendation VALUES
('ACC-001','FastTrack Logistics USA','Road freight transport','Connected Logistics Bundle',
 'Fleet of 200+ IoT SIMs already active. Low-latency slice enables real-time dispatch and route optimization. Managed security addresses interstate data risk. 5G upgrade improves depot operations.',
 '[{"product_id":"PROD-002","name":"Business SIM 5G SA","qty":120},{"product_id":"PROD-003","name":"5G Low-Latency Slice","qty":1},{"product_id":"PROD-005","name":"Managed Security Gateway","qty":2},{"product_id":"PROD-008","name":"Fleet Telematics SIM","qty":200},{"product_id":"PROD-009","name":"IoT Management Platform","qty":1}]',
 120,200,'LOW_LATENCY',2,0,  7280.00,  87360.00,68.5,0.91,'RENEWAL_UPSELL','HIGH'),
('ACC-002','Heartland Agri Processors','Food manufacturing','Secure Manufacturing Bundle',
 'Cold-chain and process monitoring drives IoT need. Security gateway critical for OT/IT convergence. 5G upgrade improves warehouse automation reliability.',
 '[{"product_id":"PROD-002","name":"Business SIM 5G SA","qty":60},{"product_id":"PROD-005","name":"Managed Security Gateway","qty":1},{"product_id":"PROD-008","name":"Fleet Telematics SIM","qty":30},{"product_id":"PROD-009","name":"IoT Management Platform","qty":1}]',
 60,30,'NONE',1,0,  1900.00,  22800.00,72.1,0.78,'EXPANSION','MEDIUM'),
('ACC-003','Long Beach Port Terminals','Cargo handling & ports','Port Operations Premium Bundle',
 'Highest-value account. Critical SLA breaches signal infrastructure stress. 5G upgrade and high-bandwidth slice enable crane automation. SD-WAN spans multi-terminal sites.',
 '[{"product_id":"PROD-002","name":"Business SIM 5G SA","qty":350},{"product_id":"PROD-004","name":"5G High-Bandwidth Slice","qty":2},{"product_id":"PROD-005","name":"Managed Security Gateway","qty":4},{"product_id":"PROD-007","name":"Managed SD-WAN","qty":6},{"product_id":"PROD-009","name":"IoT Management Platform","qty":1}]',
 350,0,'HIGH_BW',4,6, 10310.00, 123720.00,44.9,0.88,'RENEWAL_UPSELL','HIGH'),
('ACC-004','SunTech Renewable Energy','Electric power generation','Remote Assets Bundle',
 'Wind and solar sites in West Texas are remote — IoT monitoring and low-latency slice for SCADA control. No current security solution despite high OT exposure. Grid and severe-weather resilience is a compelling pitch point.',
 '[{"product_id":"PROD-002","name":"Business SIM 5G SA","qty":80},{"product_id":"PROD-003","name":"5G Low-Latency Slice","qty":1},{"product_id":"PROD-005","name":"Managed Security Gateway","qty":3},{"product_id":"PROD-008","name":"Fleet Telematics SIM","qty":50},{"product_id":"PROD-009","name":"IoT Management Platform","qty":1}]',
 80,50,'LOW_LATENCY',3,0,  5434.00,  65208.00,117.0,0.83,'NEW_ATTACH','MEDIUM'),
('ACC-005','Retail Chain Holdings','Department stores','Smart Retail Connectivity Bundle',
 'Largest SIM base with existing SD-WAN and security. Primary gap is 5G upgrade across 800 staff and POS devices plus IoT for inventory management and footfall analytics.',
 '[{"product_id":"PROD-002","name":"Business SIM 5G SA","qty":800},{"product_id":"PROD-004","name":"5G High-Bandwidth Slice","qty":1},{"product_id":"PROD-005","name":"Managed Security Gateway","qty":12},{"product_id":"PROD-007","name":"Managed SD-WAN","qty":15},{"product_id":"PROD-009","name":"IoT Management Platform","qty":1}]',
 800,0,'HIGH_BW',12,15, 24870.00, 298440.00,44.0,0.85,'RENEWAL_UPSELL','HIGH'),
('ACC-006','Mid-Atlantic Health Systems','Hospitals & healthcare','Connected Healthcare Bundle',
 'Patient monitoring and medical IoT is the primary gap. Low-latency slice critical for remote diagnostics. SD-WAN connects distributed clinics. Security essential for HIPAA compliance and patient data.',
 '[{"product_id":"PROD-002","name":"Business SIM 5G SA","qty":420},{"product_id":"PROD-003","name":"5G Low-Latency Slice","qty":1},{"product_id":"PROD-007","name":"Managed SD-WAN","qty":8},{"product_id":"PROD-008","name":"Fleet Telematics SIM","qty":120},{"product_id":"PROD-009","name":"IoT Management Platform","qty":1}]',
 420,120,'LOW_LATENCY',0,8,  6860.00,  82320.00,69.2,0.87,'RENEWAL_UPSELL','HIGH'),
('ACC-007','Rocky Mountain Mining Corp','Gold & copper mining','Connected Mine Bundle',
 'Largest workforce in portfolio. Underground and surface IoT already deployed. Critical gaps: 5G upgrade for autonomous vehicles, network slice for real-time safety monitoring, managed security for OT networks.',
 '[{"product_id":"PROD-002","name":"Business SIM 5G SA","qty":1100},{"product_id":"PROD-003","name":"5G Low-Latency Slice","qty":2},{"product_id":"PROD-005","name":"Managed Security Gateway","qty":6},{"product_id":"PROD-007","name":"Managed SD-WAN","qty":10},{"product_id":"PROD-009","name":"IoT Management Platform","qty":1}]',
 1100,800,'LOW_LATENCY',6,10, 19670.00, 236040.00,60.2,0.93,'RENEWAL_UPSELL','HIGH'),
('ACC-008','Atlantic Finserv Group','Commercial banking','Secure Banking Connectivity Bundle',
 'Already has 5G SIMs, SD-WAN and security. Primary gaps are network slice for trading floor low-latency requirements and IoT for ATM monitoring and branch surveillance. Strengthens CCPA / NYDFS Part 500 posture.',
 '[{"product_id":"PROD-003","name":"5G Low-Latency Slice","qty":1},{"product_id":"PROD-008","name":"Fleet Telematics SIM","qty":80},{"product_id":"PROD-009","name":"IoT Management Platform","qty":1},{"product_id":"PROD-006","name":"Mobile Threat Defence","qty":280}]',
 280,80,'LOW_LATENCY',0,0,  5068.00,  60816.00,32.8,0.79,'EXPANSION','MEDIUM')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: GOLD FINANCE O2C HEALTH  (USD)
-- =============================================================================

INSERT INTO telco_medallion.gold_finance_o2c_health VALUES
('ACC-001','FastTrack Logistics USA',     '2025-04',2,  2308.00,0,0,2,  2654.00,0,    0.00,  2654.00,    0.00,0,51.0,1.0,25.0, 0.0,FALSE,FALSE,FALSE,    0.00,    0.00,0.970,'HEALTHY'),
('ACC-002','Heartland Agri Processors',   '2025-04',1,   330.00,0,0,1,   380.00,0,    0.00,     0.00,  380.00,0,NULL,30.0,NULL,45.6,FALSE,FALSE,FALSE,  380.00,    0.00,0.820,'HEALTHY'),
('ACC-003','Long Beach Port Terminals',   '2025-04',3,  7250.00,0,0,3,  8338.00,1, 3910.00,  7820.00, 3910.00,0,44.0,3.0,28.0,21.4,TRUE, FALSE,TRUE,  3910.00,  450.00,0.740,'WATCH'),
('ACC-004','SunTech Renewable Energy',    '2025-04',1,   792.00,1,1,1,   911.00,0,    0.00,     0.00,  911.00,0,NULL,2.0, NULL,NULL,FALSE,FALSE,TRUE,   911.00,    0.00,0.650,'WATCH'),
('ACC-005','Retail Chain Holdings',       '2025-04',2, 19500.00,1,0,2, 11955.00,1, 4695.00,  6000.00, 4695.00,1,49.0,8.0,41.0,88.2,TRUE, TRUE, FALSE, 4695.00,10200.00,0.390,'AT_RISK'),
('ACC-006','Mid-Atlantic Health Systems', '2025-04',2,  4800.00,0,0,2,  5520.00,0,    0.00,  5520.00,    0.00,0,38.0,2.0,22.0, 0.0,FALSE,FALSE,FALSE,    0.00, 5520.00,0.880,'HEALTHY'),
('ACC-007','Rocky Mountain Mining Corp',  '2025-04',3, 18000.00,1,0,2, 20700.00,1, 6210.00, 12000.00, 6210.00,1,52.0,5.0,35.0,32.6,TRUE, FALSE,FALSE, 6210.00, 8000.00,0.680,'WATCH'),
('ACC-008','Atlantic Finserv Group',      '2025-04',2,  8400.00,0,0,2,  9660.00,0,    0.00,  9660.00,    0.00,0,42.0,3.0,28.0, 0.0,FALSE,FALSE,FALSE, 9660.00,    0.00,0.910,'HEALTHY')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED: SAMPLE INTERACTION LOG
-- =============================================================================

INSERT INTO telco_medallion.cx_interaction_log
(customer_id,account_id,customer_type,agent_id,channel,nba_offer_presented,nba_outcome,call_script_used,notes) VALUES
('CUST-001',NULL,'CONSUMER','agent.steve','INBOUND_CALL','Upgrade to 150GB Streaming Bundle @ $99/month (pre-tax)','DEFERRED',TRUE,'Customer wants to think about it, call back next week'),
('CUST-004',NULL,'CONSUMER','agent.zoe','OUTBOUND_CALL','Gamer Pro 5G — 50GB extra + priority network slice','ACCEPTED',TRUE,'Customer very excited, upgraded immediately'),
('CUST-005',NULL,'CONSUMER','agent.priya','INBOUND_CALL','Speak to a retention specialist — we will match any competitor offer','ESCALATED',FALSE,'Threatening to port to competitor, escalated to retentions team'),
(NULL,'ACC-003','ENTERPRISE','agent.tracy','OUTBOUND_CALL','Port Operations Premium Bundle','DEFERRED',TRUE,'Decision-maker on leave, follow up in 2 weeks'),
(NULL,'ACC-005','ENTERPRISE','agent.kelly','INBOUND_CALL','Smart Retail Connectivity Bundle','OBJECTION_RAISED',TRUE,'CFO concerned about upfront SIM replacement cost')
ON CONFLICT DO NOTHING;
