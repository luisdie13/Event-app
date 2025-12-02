// tests/unit/eventQueries.unit.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { getFeaturedEvents, getEventsList, getEventBySlug } from '../../database/eventQueries.js';
import { setupTestDb, teardownTestDb, testPool, createTestEvent } from '../testDb.js';

describe('Event Queries Unit Tests', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await testPool.query('TRUNCATE TABLE tickets, images, events, categories, users, roles RESTART IDENTITY CASCADE');
  });

  beforeEach(async () => {
    // Clean database before each test
    await testPool.query('DELETE FROM tickets');
    await testPool.query('DELETE FROM images');
    await testPool.query('DELETE FROM events');
    await testPool.query('DELETE FROM users');
  });

  describe('getFeaturedEvents', () => {
    it('should return only featured events', async () => {
      await createTestEvent({ title: 'Featured 1', is_featured: true });
      await createTestEvent({ title: 'Not Featured', is_featured: false });
      await createTestEvent({ title: 'Featured 2', is_featured: true });

      const result = await getFeaturedEvents();

      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('pagination');
      expect(result.events).toBeInstanceOf(Array);
      expect(result.events.length).toBe(2);
      result.events.forEach(event => {
        expect(event.is_featured).toBe(true);
      });
    });

    it('should return empty array when no featured events', async () => {
      await createTestEvent({ title: 'Not Featured 1', is_featured: false });
      await createTestEvent({ title: 'Not Featured 2', is_featured: false });

      const result = await getFeaturedEvents();

      expect(result).toHaveProperty('events');
      expect(result.events).toEqual([]);
    });

    it('should include category information', async () => {
      await createTestEvent({ title: 'Featured Event', is_featured: true, category_id: 1 });

      const result = await getFeaturedEvents();

      expect(result.events[0]).toHaveProperty('category_name');
      expect(result.events[0].category_name).toBe('Música');
    });
  });

  describe('getEventsList', () => {
    it('should return all events when no category slug provided', async () => {
      await createTestEvent({ title: 'Event 1', category_id: 1 });
      await createTestEvent({ title: 'Event 2', category_id: 2 });
      await createTestEvent({ title: 'Event 3', category_id: 3 });

      const result = await getEventsList();

      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('pagination');
      expect(result.events).toBeInstanceOf(Array);
      expect(result.events.length).toBe(3);
    });

    it('should filter by category slug when provided', async () => {
      await createTestEvent({ title: 'Music Event', category_id: 1 });
      await createTestEvent({ title: 'Sports Event', category_id: 2 });

      const result = await getEventsList({ categorySlug: 'musica' });

      expect(result).toHaveProperty('events');
      expect(result.events).toBeInstanceOf(Array);
      expect(result.events.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array for non-existent category', async () => {
      await createTestEvent({ title: 'Event 1', category_id: 1 });

      const result = await getEventsList({ categorySlug: 'nonexistent-category' });

      expect(result).toHaveProperty('events');
      expect(result.events).toEqual([]);
    });

    it('should return events list with proper structure', async () => {
      await createTestEvent({ title: 'Event 1', category_id: 1 });

      const result = await getEventsList();

      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('pagination');
      expect(result.events).toBeInstanceOf(Array);
      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events[0]).toHaveProperty('id');
      expect(result.events[0]).toHaveProperty('title');
      expect(result.events[0]).toHaveProperty('date_time');
      expect(result.events[0]).toHaveProperty('location');
      expect(result.events[0]).toHaveProperty('price');
    });
  });

  describe('getEventBySlug', () => {
    it('should return event by slug', async () => {
      const testSlug = 'unique-test-slug-' + Date.now();
      await createTestEvent({ 
        title: 'Test Event', 
        slug: testSlug,
        description: 'Test Description'
      });

      const event = await getEventBySlug(testSlug);

      expect(event).toBeDefined();
      expect(event.slug).toBe(testSlug);
      expect(event.title).toBe('Test Event');
      expect(event.description).toBe('Test Description');
    });

    it('should return null for non-existent slug', async () => {
      const event = await getEventBySlug('non-existent-slug-12345');

      expect(event).toBeNull();
    });

    it('should include category information', async () => {
      const testSlug = 'event-with-category-' + Date.now();
      await createTestEvent({ 
        title: 'Event with Category', 
        slug: testSlug,
        category_id: 1
      });

      const event = await getEventBySlug(testSlug);

      expect(event).toHaveProperty('category_name');
      expect(event).toHaveProperty('category_slug');
      expect(event.category_name).toBe('Música');
      expect(event.category_slug).toBe('musica');
    });

    it('should include complete event structure', async () => {
      const testSlug = 'event-complete-structure-' + Date.now();
      await createTestEvent({ 
        title: 'Event Complete', 
        slug: testSlug
      });

      const event = await getEventBySlug(testSlug);

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('slug');
      expect(event).toHaveProperty('description');
    });

    it('should return complete event details', async () => {
      const testSlug = 'complete-event-' + Date.now();
      await createTestEvent({ 
        title: 'Complete Event', 
        slug: testSlug,
        description: 'Full Description',
        location: 'Test Location',
        price: 100.00,
        total_tickets: 500,
        available_tickets: 500
      });

      const event = await getEventBySlug(testSlug);

      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('location');
      expect(event).toHaveProperty('price');
      expect(event).toHaveProperty('total_tickets');
      expect(event).toHaveProperty('available_tickets');
      expect(event).toHaveProperty('date_time');
      expect(event.total_tickets).toBe(500);
    });
  });
});
