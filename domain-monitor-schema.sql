-- Similar domains table
CREATE TABLE IF NOT EXISTS similar_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  domain_name TEXT NOT NULL,
  similarity_score FLOAT,
  registration_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domain activities table
CREATE TABLE IF NOT EXISTS domain_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id UUID REFERENCES similar_domains(id),
  activity_type TEXT, -- e.g., 'DNS Change', 'Mail Server Setup', 'Phishing Page Detected', 'SSL Certificate Issued'
  description TEXT,
  severity TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
  is_suspicious BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample data for CyberTech Industries
INSERT INTO similar_domains (id, organization_id, domain_name, similarity_score, registration_date, status)
VALUES 
  ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'cybertech-support.com', 0.85, '2024-01-15', 'active'),
  ('d2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'cybertech-login.net', 0.92, '2024-02-10', 'active'),
  ('d3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'cybertach.com', 0.78, '2023-11-20', 'parked');

INSERT INTO domain_activities (domain_id, activity_type, description, severity, is_suspicious, detected_at)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'DNS Update', 'Updated MX records to point to suspicious mail server (mx.malicious-host.su).', 'medium', TRUE, NOW() - interval '2 days'),
  ('d1111111-1111-1111-1111-111111111111', 'SSL Issued', 'Let''s Encrypt certificate issued for domain.', 'low', FALSE, NOW() - interval '5 days'),
  ('d2222222-2222-2222-2222-222222222222', 'Cloning Detected', 'Webpage content matches 95% of cybertech.example.com login page.', 'high', TRUE, NOW() - interval '1 day'),
  ('d2222222-2222-2222-2222-222222222222', 'Traffic Spike', 'Sudden increase in traffic from social media referrals (Facebook/WhatsApp).', 'medium', TRUE, NOW() - interval '12 hours'),
  ('d3333333-3333-3333-3333-333333333333', 'Domain Parked', 'Standard parking page detected with advertising links.', 'low', FALSE, NOW() - interval '30 days');

-- Example Query for Global Activity Logs
-- SELECT da.*, sd.domain_name 
-- FROM domain_activities da
-- JOIN similar_domains sd ON da.domain_id = sd.id
-- ORDER BY da.detected_at DESC
-- LIMIT 20;
