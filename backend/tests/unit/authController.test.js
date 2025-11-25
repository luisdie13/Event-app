// tests/unit/authController.test.js
import { jest } from '@jest/globals';
import { registerUser, loginUser } from '../../controllers/authController.js';
import * as userQueries from '../../database/userQueries.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.unstable_mockModule('../../database/userQueries.js', () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn()
}));

describe('Auth Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role_id: 2
      };

      // Mock that user doesn't exist
      userQueries.findUserByEmail.mockResolvedValue(null);
      // Mock user creation
      userQueries.createUser.mockResolvedValue(mockUser);

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Registro exitoso.',
          token: expect.any(String),
          user: expect.objectContaining({
            id: 1,
            email: 'john@example.com'
          })
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        email: 'john@example.com'
        // missing name and password
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todos los campos son obligatorios.'
      });
    });

    it('should return 409 if email already exists', async () => {
      req.body = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      userQueries.findUserByEmail.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El email ya está registrado.'
      });
    });

    it('should handle database errors gracefully', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      userQueries.findUserByEmail.mockRejectedValue(new Error('Database error'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor durante el registro.'
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with valid credentials', async () => {
      req.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        role_id: 2
      };

      userQueries.findUserByEmail.mockResolvedValue(mockUser);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Inicio de sesión exitoso.',
          token: expect.any(String),
          user: expect.objectContaining({
            id: 1,
            email: 'john@example.com'
          })
        })
      );
      
      // Verify password is not included in response
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.user.password_hash).toBeUndefined();
    });

    it('should return 400 if email or password is missing', async () => {
      req.body = {
        email: 'john@example.com'
        // missing password
      };

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email y contraseña son obligatorios.'
      });
    });

    it('should return 401 if user does not exist', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      userQueries.findUserByEmail.mockResolvedValue(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciales inválidas.'
      });
    });

    it('should return 401 if password is incorrect', async () => {
      req.body = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        email: 'john@example.com',
        password_hash: await bcrypt.hash('correctpassword', 10),
        role_id: 2
      };

      userQueries.findUserByEmail.mockResolvedValue(mockUser);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciales inválidas.'
      });
    });

    it('should handle database errors gracefully', async () => {
      req.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      userQueries.findUserByEmail.mockRejectedValue(new Error('Database error'));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor durante el inicio de sesión.'
      });
    });
  });
});
