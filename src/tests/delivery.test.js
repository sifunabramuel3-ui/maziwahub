import request from 'supertest';
import { app } from '../../index.js';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

describe('MaziwaHub Deliveries API Lifecycle Integrity Validation Tests', () => {
  let validClerkToken;

  beforeAll(() => {
    // Manually forge an administrative token mock payload to establish testing validation access passes
    validClerkToken = jwt.sign(
      { id: 'CLERK01', role: 'clerk' },
      process.env.JWT_SECRET || 'test_secret_key',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Purge testing inserts from target schemas safely to restore baseline metrics
    await pool.query('DELETE FROM deliveries WHERE DeliveryID = ?', ['TEST-D99']);
    await pool.end();
  });

  // Test Profile A: Verification of successful processing path
  it('should create a delivery log successfully when valid parameters are passed alongside a clerk authorization token', async () => {
    const res = await request(app)
      .post('/api/deliveries')
      .set('Authorization', `Bearer ${validClerkToken}`)
      .send({
        deliveryId: 'TEST-D99',
        date: '2026-11-17',
        farmerNo: 'F012',
        centreId: 'C001',
        litres: 15.50,
        rate: 52.00
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
  });

  // Test Profile B: Empty input parameter capture rejection logic path
  it('should reject requests with a 400 Bad Request code if the litres parameters are completely omitted or set below zero limits', async () => {
    const res = await request(app)
      .post('/api/deliveries')
      .set('Authorization', `Bearer ${validClerkToken}`)
      .send({
        deliveryId: 'TEST-D100',
        date: '2026-11-17',
        farmerNo: 'F012',
        centreId: 'C001',
        litres: -5.00,
        rate: 52.00
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test Profile C: Verification of protection layers blocking access to unauthenticated requests
  it('should deny system write access returning 401 unauthorized status codes when authorization headers are completely omitted', async () => {
    const res = await request(app)
      .post('/api/deliveries')
      .send({
        deliveryId: 'TEST-D101',
        date: '2026-11-17',
        farmerNo: 'F012',
        centreId: 'C001',
        litres: 10.00,
        rate: 52.00
      });
    expect(res.statusCode).toBe(401);
  });

  // Test Profile D: Verification of relational schema reference checks
  it('should intercept execution pathways returning a 404 target not found error message when mapping delivery logs to non-existent farmer identity strings', async () => {
    const res = await request(app)
      .post('/api/deliveries')
      .set('Authorization', `Bearer ${validClerkToken}`)
      .send({
        deliveryId: 'TEST-D102',
        date: '2026-11-17',
        farmerNo: 'INVALID-F000',
        centreId: 'C001',
        litres: 20.00,
        rate: 52.00
      });
    expect(res.statusCode).toBe(404);
  });
});
