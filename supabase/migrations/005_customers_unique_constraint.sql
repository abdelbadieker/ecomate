-- Migration: Add unique constraint to customers_crm
-- Ensures upsert by (client_id, phone_number) works correctly

ALTER TABLE public.customers_crm
ADD CONSTRAINT unique_customer_per_client UNIQUE (client_id, phone_number);
