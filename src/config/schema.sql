CREATE DATABASE IF NOT EXISTS maziwahub_db;
USE maziwahub_db;

-- 1. Farmers Register Entity Configuration
CREATE TABLE IF NOT EXISTS farmers (
    FarmerNo VARCHAR(10) PRIMARY KEY,
    FarmerName VARCHAR(100) NOT NULL,
    Phone VARCHAR(15) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) DEFAULT 'farmer'
);

-- 2. Collection Centres Infrastructure Blueprint
CREATE TABLE IF NOT EXISTS centres (
    CentreID VARCHAR(10) PRIMARY KEY,
    CentreName VARCHAR(50) NOT NULL
);

-- 3. Core Deliveries Logs Ledger with Multi-Relational Foreign Keys
CREATE TABLE IF NOT EXISTS deliveries (
    DeliveryID VARCHAR(10) PRIMARY KEY,
    Date DATE NOT NULL,
    FarmerNo VARCHAR(10) NOT NULL,
    CentreID VARCHAR(10) NOT NULL,
    Litres DECIMAL(10, 2) NOT NULL,
    Rate DECIMAL(10, 2) NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (FarmerNo) REFERENCES farmers(FarmerNo) ON DELETE CASCADE,
    FOREIGN KEY (CentreID) REFERENCES centres(CentreID) ON DELETE CASCADE,
    -- Database engine validation constraint guaranteeing physical data integrity
    CONSTRAINT check_litres_positive CHECK (Litres > 0.00)
);

-- Purge pre-existing seeds to establish a fresh baseline
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE deliveries;
TRUNCATE TABLE centres;
TRUNCATE TABLE farmers;
SET FOREIGN_KEY_CHECKS = 1;

-- Seed records satisfying normalization test profiles
-- Default unhashed testing passwords matching their IDs will be safely hashed by auth controller during actual registrations
INSERT INTO farmers (FarmerNo, FarmerName, Phone, Password, Role) VALUES
('F012', 'Wafula Simiyu', '0700000111', '$2b$10$7WwM8kE2L0620pQ8H4u.eeB7P1SclXhCsmvQWb37T5fG7S3lVfHeC', 'farmer'),
('F047', 'Naliaka Wekesa', '0700000222', '$2b$10$7WwM8kE2L0620pQ8H4u.eeB7P1SclXhCsmvQWb37T5fG7S3lVfHeC', 'farmer'),
('F088', 'Makokha Juma', '0700000333', '$2b$10$7WwM8kE2L0620pQ8H4u.eeB7P1SclXhCsmvQWb37T5fG7S3lVfHeC', 'farmer'),
-- Seed administrative test profiles
('CLERK01', 'Clerk Main', '0711111111', '$2b$10$7WwM8kE2L0620pQ8H4u.eeB7P1SclXhCsmvQWb37T5fG7S3lVfHeC', 'clerk'),
('MGR01', 'Manager Main', '0722222222', '$2b$10$7WwM8kE2L0620pQ8H4u.eeB7P1SclXhCsmvQWb37T5fG7S3lVfHeC', 'manager');

INSERT INTO centres (CentreID, CentreName) VALUES
('C001', 'Kimilili'),
('C002', 'Chwele');

INSERT INTO deliveries (DeliveryID, Date, FarmerNo, CentreID, Litres, Rate, Amount) VALUES
('D001', '2026-10-01', 'F012', 'C001', 25.00, 52.00, 1300.00),
('D002', '2026-10-01', 'F047', 'C001', 18.00, 52.00, 936.00),
('D003', '2026-10-01', 'F012', 'C002', 10.00, 50.00, 500.00),
('D004', '2026-10-02', 'F012', 'C001', 22.00, 52.00, 1144.00),
('D005', '2026-10-02', 'F088', 'C002', 30.00, 50.00, 1500.00);
