-- The plan catalog: reference data the API needs to start (LIMITED is every
-- new organization's plan), so it ships with the schema instead of a seed.
-- Prices are placeholders until the commercial values are decided; change
-- them in a new migration, which never affects existing subscriptions.
INSERT INTO "plans" ("code", "max_active_students", "pricing") VALUES
  ('LIMITED', 3, '{"type": "FREE"}'),
  ('ON_DEMAND', NULL, '{"type": "TIERED", "tiers": [{"upTo": 10, "priceCents": 2900}, {"upTo": 25, "priceCents": 4900}, {"upTo": null, "priceCents": 7900}]}'),
  ('UNLIMITED', NULL, '{"type": "FLAT", "priceCents": 9900}');
