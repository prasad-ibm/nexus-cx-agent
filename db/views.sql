-- =============================================================================
-- TELCO MEDALLION — PostgreSQL VIEWS  (US localization)
-- =============================================================================

CREATE OR REPLACE VIEW telco_medallion.v_consumer_360 AS
SELECT
    c.customer_id,
    c.msisdn,
    c.full_name,
    c.contract_type,
    c.plan_name,
    c.monthly_plan_fee,
    c.activation_date,
    c.device_model,
    c.device_os,
    c.state,
    c.income_band,
    c.language_pref,
    c.time_zone,
    c.sales_tax_pct,
    p.tenure_months,
    p.is_5g_capable,
    p.avg_daily_data_mb,
    p.avg_monthly_data_gb,
    p.avg_call_mins_month,
    p.avg_sms_count_month,
    p.roaming_trips_90d,
    p.top_app_category,
    p.streaming_hrs_month,
    p.gaming_hrs_month,
    p.fintech_sessions_month,
    p.arpu,
    p.data_overage_flag,
    p.late_payment_count_6m,
    p.support_calls_90d,
    p.churn_risk_score,
    p.nps_score,
    g.segment_code,
    g.segment_label,
    g.segment_description,
    g.clv_score,
    g.upsell_propensity,
    g.data_upgrade_propensity,
    g.nba_action,
    g.nba_offer,
    g.nba_channel,
    g.segment_version,
    g.segment_date
FROM telco_medallion.bronze_consumer_crm c
LEFT JOIN telco_medallion.silver_consumer_customer_profile p USING (customer_id)
LEFT JOIN telco_medallion.gold_consumer_micro_segment g USING (customer_id);


CREATE OR REPLACE VIEW telco_medallion.v_enterprise_360 AS
SELECT
    s.account_id,
    s.account_name,
    s.industry_code,
    s.industry_label,
    s.employee_count,
    s.contract_annual_value,
    s.months_to_renewal,
    s.has_5g_sims,
    s.has_network_slice,
    s.has_managed_security,
    s.has_sdwan,
    s.has_iot,
    s.active_sim_count,
    s.active_iot_sim_count,
    s.avg_monthly_data_gb,
    s.data_growth_rate_pct,
    s.sla_breach_count_6m,
    s.incident_rate_per_100,
    s.avg_nps,
    s.gap_5g_upgrade,
    s.gap_network_slice,
    s.gap_managed_security,
    s.gap_iot_platform,
    s.gap_sdwan,
    b.bundle_name,
    b.bundle_rationale,
    b.recommended_products,
    b.sim_qty,
    b.iot_sim_qty,
    b.network_slice_type,
    b.security_gateway_sites,
    b.sdwan_sites,
    b.estimated_mrr_usd,
    b.estimated_arr_usd,
    b.uplift_vs_current_pct,
    b.bundle_fit_score,
    b.recommended_action,
    b.urgency,
    h.o2c_health_score,
    h.health_label,
    h.dso_days,
    h.revenue_leakage_flag,
    h.credit_risk_flag,
    h.provisioning_risk_flag,
    h.overdue_value_usd,
    h.outstanding_ar_usd,
    h.expected_cash_30d_usd,
    h.expected_cash_60d_usd,
    c.start_date         AS contract_start,
    c.end_date           AS contract_end,
    c.account_manager,
    c.billing_state,
    c.time_zone,
    c.sales_tax_pct
FROM telco_medallion.silver_enterprise_account_summary s
LEFT JOIN telco_medallion.gold_enterprise_bundle_recommendation b USING (account_id)
LEFT JOIN telco_medallion.gold_finance_o2c_health h USING (account_id)
LEFT JOIN telco_medallion.bronze_enterprise_contract c ON c.account_id = s.account_id;


CREATE OR REPLACE VIEW telco_medallion.gold_account_360 AS
SELECT
    b.account_id,
    b.account_name,
    b.bundle_name,
    b.bundle_fit_score,
    b.estimated_arr_usd   AS bundle_arr_potential,
    h.o2c_health_score,
    h.health_label,
    h.dso_days,
    h.revenue_leakage_flag,
    h.credit_risk_flag,
    b.urgency             AS bundle_urgency,
    b.recommended_action
FROM telco_medallion.gold_enterprise_bundle_recommendation b
LEFT JOIN telco_medallion.gold_finance_o2c_health h ON b.account_id = h.account_id;
