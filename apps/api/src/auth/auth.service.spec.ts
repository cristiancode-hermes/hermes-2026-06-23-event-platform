import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockJwtService: any;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    avatarUrl: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue(mockToken),
    };
    authService = new AuthService(mockUserRepo, mockJwtService);
  });

  describe('register', () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should register a new user and return token + sanitized user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await authService.register(registerDto);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id });
      expect(result.token).toBe(mockToken);
      expect(result.user).toBeDefined();
      expect((result.user as any).password).toBeUndefined();
      expect(result.user.name).toBe('Test User');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'Password123' };

    it('should login successfully and return token', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await authService.login(loginDto);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result.token).toBe(mockToken);
      expect(result.user.name).toBe('Test User');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return sanitized user', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await authService.getProfile(1);

      expect(result.name).toBe('Test User');
      expect((result as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(authService.getProfile(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateProfile', () => {
    const updateDto = { name: 'Updated Name', bio: 'New bio text' };

    it('should update and return sanitized user', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await authService.updateProfile(1, updateDto);

      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
      expect((result as any).password).toBeUndefined();
    });
  });
});
