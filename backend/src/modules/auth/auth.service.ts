import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
    // Create new user
    const user = await this.usersService.create(registerDto);

    // Generate JWT token
    const payload: JwtPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Remove password from response
    const userObject = this.sanitizeUser(user);

    return {
      user: userObject,
      accessToken,
    };
  }

  async signIn(signInDto: SignInDto): Promise<{ user: User; accessToken: string }> {
    const { email, password } = signInDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (user.status !== 'active') {
      throw new UnauthorizedException(`Account is ${user.status}`);
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Remove password from response
    const userObject = this.sanitizeUser(user);

    return {
      user: userObject,
      accessToken,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.id);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    const userObject = this.sanitizeUser(user);
    return userObject;
  }

  private sanitizeUser(user: any) {
    if (!user) return user;
    const obj = typeof user.toObject === 'function' ? user.toObject() : JSON.parse(JSON.stringify(user));
    delete obj.password;
    return obj;
  }
}