import request from 'supertest';
import { app, server } from './server'; // Assuming your server file exports the app and server objects

describe('Test API endpoints', () => {
  afterAll(done => {
    server.close(done); // Close the server after all tests are done
  });

  it('responds with status 200 for GET /api/users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
  });

  it('responds with status 200 for GET /api/posts', async () => {
    const response = await request(app).get('/api/posts');
    expect(response.status).toBe(200);
  });

  it('responds with status 200 for GET /api/messages', async () => {
    const response = await request(app).get('/api/messages');
    expect(response.status).toBe(200);
  });

  // Add more test cases for other endpoints as needed
});
