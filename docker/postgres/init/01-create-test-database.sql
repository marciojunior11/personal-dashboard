-- A separate database for the integration and e2e tests, so they never
-- touch development data. Runs once, when the volume is first created.
CREATE DATABASE personal_dashboard_test;
