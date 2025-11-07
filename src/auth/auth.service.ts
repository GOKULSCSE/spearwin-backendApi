import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CandidateRegisterDto } from './dto/candidate-register.dto';
import { CandidateSimpleRegisterDto } from './dto/candidate-simple-register.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { Enable2FaDto } from './dto/2fa-enable.dto';
import { Disable2FaDto } from './dto/2fa-disable.dto';
import { Verify2FaDto } from './dto/2fa-verify.dto';
import { GenerateBackupCodesDto } from './dto/backup-codes.dto';
import {
  LoginResponseDto,
  RefreshResponseDto,
  ForgotPasswordResponseDto,
  ResetPasswordResponseDto,
  LogoutResponseDto,
  AuthResponseDto,
  RegisterResponseDto,
} from './dto/auth-response.dto';
import { UserRole, UserStatus, OTPType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateCompanyUuid } from '../company/utils/company-uuid.util';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {

    this.logger.log(`🔑 Login attempt for email: ${loginDto.email}`);
    
    // Trim password to avoid whitespace issues
    const trimmedLoginPassword = loginDto.password?.trim() || '';
    this.logger.log(`🔑 Password length: ${trimmedLoginPassword.length}`);

    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        candidate: true,
        admin: true,
        superAdmin: true,
        company: true,
      },
    });

    if (!user) {
      this.logger.warn(`❌ User not found: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`🔑 User found: ${user.email}`);
    this.logger.log(`🔑 Stored password hash length: ${user.password?.length || 0}`);
    this.logger.log(`🔑 Stored password hash exists: ${!!user.password}`);
    
    if (!user.password) {
      this.logger.error(`❌ User has no password set: ${user.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    this.logger.log(`🔑 Hash starts with: ${user.password.substring(0, 10)}...`);
    this.logger.log(`🔑 Input password (first 3 chars): ${trimmedLoginPassword.substring(0, Math.min(3, trimmedLoginPassword.length))}***`);
    this.logger.log(`🔑 Input password length: ${trimmedLoginPassword.length}`);

    let isPasswordValid = await bcrypt.compare(
      trimmedLoginPassword,
      user.password,
    );
    
    this.logger.log(`🔑 Password comparison result (trimmed): ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isPasswordValid) {
      this.logger.warn(`❌ Invalid password for user: ${user.email}`);
      this.logger.warn(`   Input: ${trimmedLoginPassword.length} chars, Hash: ${user.password.length} chars`);
      // Try one more time with the original password (without trim) in case frontend sends it differently
      const isPasswordValidOriginal = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      this.logger.warn(`   Retry with original (untrimmed): ${isPasswordValidOriginal ? '✅ VALID' : '❌ INVALID'}`);
      if (isPasswordValidOriginal) {
        isPasswordValid = true; // Use the original password if it works
        this.logger.log(`✅ Password validated with original (untrimmed) version`);
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is suspended');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Account is inactive');
    }

    // if (user.status === UserStatus.PENDING_VERIFICATION) {
    //   throw new UnauthorizedException('Please verify your email before logging in');
    // }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate 2FA OTP
      const twoFactorCode = uuidv4();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiry

      await this.prisma.oTP.create({
        data: {
          userId: user.id,
          code: twoFactorCode,
          type: OTPType.TWO_FACTOR_AUTH,
          expiresAt,
        },
      });

      // TODO: Send 2FA code via SMS/Email
      // For now, return the code in response (remove in production)
      return {
        success: false,
        message: '2FA verification required',
        data: {
          requires2FA: true,
          userId: user.id,
          // Remove this in production - only for testing
          twoFactorCode: twoFactorCode,
        },
      };
    }

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create login session
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.loginSession.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
        isActive: true,
      },
    });

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        level: 'INFO',
        description: 'User logged in successfully',
        entity: 'User',
        entityId: user.id,
      },
    });

    const authResponse: AuthResponseDto = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profileCompleted: user.profileCompleted,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    };

    return {
      success: true,
      message: 'Login successful',
      data: authResponse,
    };
  }

  async logout(userId: string): Promise<LogoutResponseDto> {
    try {
      // Logout all sessions
      await this.prisma.loginSession.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          level: 'INFO',
          description: 'User logged out',
          entity: 'User',
          entityId: userId,
        },
      });

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      throw new BadRequestException('Failed to logout');
    }
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('Account is suspended');
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Generate new tokens
      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1d',
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message:
          'If an account with that email exists, a password reset OTP has been sent.',
      };
    }

    // Generate 6-digit OTP code for password reset
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generates 6-digit code
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiry

    // Create OTP for password reset
    await this.prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        type: OTPType.PASSWORD_RESET,
        expiresAt,
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        level: 'INFO',
        description: 'Password reset requested',
        entity: 'User',
        entityId: user.id,
      },
    });

    // Send password reset email with OTP code
    const emailSent = await this.emailService.sendPasswordResetEmail(
      user.email,
      otpCode,
      expiresAt,
    );

    // Log email sending result
    if (!emailSent) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}. Email transporter may not be configured.`,
      );
      // Still return success to user for security (don't reveal if email was sent)
      // But log the error for debugging
    } else {
      this.logger.log(
        `Password reset email sent successfully to ${user.email}`,
      );
    }

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
      data: {
        email: forgotPasswordDto.email,
        otpCode: otpCode,
        expiresAt: expiresAt,
      },
    };
  }

  async validateUserById(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidate: true,
        admin: true,
        superAdmin: true,
        company: true,
      },
    });

    if (!user) {
      return null;
    }

    // Don't return password in the result
    const { password: _, ...result } = user;
    return result;
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    // Find valid OTP
    const otp = await this.prisma.oTP.findFirst({
      where: {
        code: resetPasswordDto.token,
        type: OTPType.PASSWORD_RESET,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    this.logger.log(`🔐 Resetting password for user: ${otp.user.email}`);
    
    // Trim password to avoid whitespace issues
    const trimmedPassword = resetPasswordDto.newPassword.trim();
    this.logger.log(`🔐 New password length: ${trimmedPassword.length}`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    this.logger.log(`🔐 Password hashed successfully. Hash length: ${hashedPassword.length}`);

    // Update user password
    await this.prisma.user.update({
      where: { id: otp.userId },
      data: { password: hashedPassword },
    });
    
    this.logger.log(`🔐 Password updated for user: ${otp.user.email}`);
    this.logger.log(`🔐 Verifying password was saved correctly...`);
    
    // Fetch user fresh from database to verify password was saved
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: otp.userId },
      select: { id: true, email: true, password: true },
    });
    
    if (!updatedUser || !updatedUser.password) {
      this.logger.error(`❌ CRITICAL: User or password not found after update!`);
      throw new BadRequestException('Failed to update password');
    }
    
    this.logger.log(`🔐 Fetched user after update: ${updatedUser.email}`);
    this.logger.log(`🔐 Stored hash length: ${updatedUser.password.length}`);
    this.logger.log(`🔐 Hash starts with: ${updatedUser.password.substring(0, 10)}...`);
    
    // Verify the password was saved correctly by comparing
    const verifyPassword = await bcrypt.compare(trimmedPassword, updatedUser.password);
    this.logger.log(`🔐 Password verification after save: ${verifyPassword ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!verifyPassword) {
      this.logger.error(`❌ CRITICAL: Password verification failed immediately after saving!`);
      this.logger.error(`   Input password length: ${trimmedPassword.length}`);
      this.logger.error(`   Stored hash length: ${updatedUser.password.length}`);
      this.logger.error(`   This indicates a serious issue with password storage.`);
      throw new BadRequestException('Password was not saved correctly');
    }
    
    this.logger.log(`✅ Password reset successful for user: ${updatedUser.email}`);

    // Mark OTP as used
    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Invalidate all existing sessions
    await this.prisma.loginSession.updateMany({
      where: {
        userId: otp.userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        userId: otp.userId,
        action: 'UPDATE',
        level: 'INFO',
        description: 'Password reset successfully',
        entity: 'User',
        entityId: otp.userId,
      },
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async candidateRegister(
    candidateRegisterDto: CandidateRegisterDto,
  ): Promise<RegisterResponseDto> {
    try {

      console.log('candidateRegisterDto ', candidateRegisterDto);
      

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: candidateRegisterDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Check if phone number is provided and already exists
      if (candidateRegisterDto.phone) {
        const existingPhoneUser = await this.prisma.user.findUnique({
          where: { phone: candidateRegisterDto.phone },
        });

        if (existingPhoneUser) {
          throw new BadRequestException(
            'User with this phone number already exists',
          );
        }
      }

      // Validate cityId if provided
      if (candidateRegisterDto.cityId) {
        const city = await this.prisma.city.findUnique({
          where: { id: parseInt(candidateRegisterDto.cityId) },
        });

        if (!city) {
          throw new BadRequestException('Invalid city ID provided');
        }

        if (!city.isActive) {
          throw new BadRequestException('The selected city is not active');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        candidateRegisterDto.password,
        10,
      );

      // Create user and candidate in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: candidateRegisterDto.email,
            password: hashedPassword,
            phone: candidateRegisterDto.phone,
            role: UserRole.CANDIDATE,
            status: UserStatus.PENDING_VERIFICATION,
            emailVerified: false,
            phoneVerified: false,
            profileCompleted: false,
            twoFactorEnabled: false,
          },
        });

        // Create candidate profile
        const candidate = await prisma.candidate.create({
          data: {
            userId: user.id,
            firstName: candidateRegisterDto.firstName,
            lastName: candidateRegisterDto.lastName,
            dateOfBirth: candidateRegisterDto.dateOfBirth
              ? new Date(candidateRegisterDto.dateOfBirth)
              : null,
            gender: candidateRegisterDto.gender,
            bio: candidateRegisterDto.bio,
            currentTitle: candidateRegisterDto.currentTitle,
            address: candidateRegisterDto.address,
            linkedinUrl: candidateRegisterDto.linkedinUrl,
            githubUrl: candidateRegisterDto.githubUrl,
            portfolioUrl: candidateRegisterDto.portfolioUrl,
            cityId: candidateRegisterDto.cityId ? parseInt(candidateRegisterDto.cityId) : null,
            isAvailable: candidateRegisterDto.isAvailable ?? true,
          },
        });

        return { user, candidate };
      });

      // Generate email verification OTP
      const verificationCode = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      await this.prisma.oTP.create({
        data: {
          userId: result.user.id,
          code: verificationCode,
          type: OTPType.EMAIL_VERIFICATION,
          expiresAt,
        },
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: result.user.id,
          action: 'CREATE',
          level: 'INFO',
          description: 'Candidate registered successfully',
          entity: 'User',
          entityId: result.user.id,
        },
      });

      // TODO: Send verification email
      // In production, you would send an email with the verification code

      return {
        success: true,
        message:
          'Candidate registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            status: result.user.status,
            emailVerified: result.user.emailVerified,
            phoneVerified: result.user.phoneVerified,
            profileCompleted: result.user.profileCompleted,
            twoFactorEnabled: result.user.twoFactorEnabled,
            createdAt: result.user.createdAt,
          },
          candidate: {
            id: result.candidate.id,
            firstName: result.candidate.firstName,
            lastName: result.candidate.lastName,
            isAvailable: result.candidate.isAvailable,
            createdAt: result.candidate.createdAt,
          },
        },
      };
    } catch (error) {
      console.log('actual error', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to register candidate');
    }
  }

  async candidateSimpleRegister(
    candidateSimpleRegisterDto: CandidateSimpleRegisterDto,
  ): Promise<RegisterResponseDto> {
    try {
      console.log('candidateSimpleRegisterDto ', candidateSimpleRegisterDto);

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: candidateSimpleRegisterDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Split full name into first and last name
      const nameParts = candidateSimpleRegisterDto.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!firstName) {
        throw new BadRequestException('Full name must contain at least a first name');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        candidateSimpleRegisterDto.password,
        10,
      );

      // Create user and candidate in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: candidateSimpleRegisterDto.email,
            password: hashedPassword,
            role: UserRole.CANDIDATE,
            status: UserStatus.PENDING_VERIFICATION,
            emailVerified: false,
            phoneVerified: false,
            profileCompleted: false,
            twoFactorEnabled: false,
          },
        });

        // Create candidate profile with minimal data
        const candidate = await prisma.candidate.create({
          data: {
            userId: user.id,
            firstName: firstName,
            lastName: lastName,
            isAvailable: true,
          },
        });

        return { user, candidate };
      });

      // Generate email verification OTP
      const verificationCode = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      await this.prisma.oTP.create({
        data: {
          userId: result.user.id,
          code: verificationCode,
          type: OTPType.EMAIL_VERIFICATION,
          expiresAt,
        },
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: result.user.id,
          action: 'CREATE',
          level: 'INFO',
          description: 'Candidate registered successfully (simple registration)',
          entity: 'User',
          entityId: result.user.id,
        },
      });

      // TODO: Send verification email
      // In production, you would send an email with the verification code

      return {
        success: true,
        message:
          'Candidate registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            status: result.user.status,
            emailVerified: result.user.emailVerified,
            phoneVerified: result.user.phoneVerified,
            profileCompleted: result.user.profileCompleted,
            twoFactorEnabled: result.user.twoFactorEnabled,
            createdAt: result.user.createdAt,
          },
          candidate: {
            id: result.candidate.id,
            firstName: result.candidate.firstName,
            lastName: result.candidate.lastName,
            isAvailable: result.candidate.isAvailable,
            createdAt: result.candidate.createdAt,
          },
        },
      };
    } catch (error) {
      console.log('actual error', error);

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to register candidate');
    }
  }

  async companyRegister(
    companyRegisterDto: CompanyRegisterDto,
  ): Promise<RegisterResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: companyRegisterDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // No need to validate city since we're using string fields now

      // Hash password
      const hashedPassword = await bcrypt.hash(companyRegisterDto.password, 10);

      // Generate unique slug for company
      const slug =
        companyRegisterDto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now();

      // Generate UUID for company
      const existingCompanies = await this.prisma.company.findMany({
        select: { uuid: true },
      });
      const existingUuids = existingCompanies.map(c => c.uuid).filter((uuid): uuid is string => uuid !== null);
      const companyUuid = generateCompanyUuid(companyRegisterDto.name, existingUuids);

      // Create user and company in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: companyRegisterDto.email,
            password: hashedPassword,
            role: UserRole.COMPANY,
            status: UserStatus.PENDING_VERIFICATION,
            emailVerified: false,
            phoneVerified: false,
            profileCompleted: false,
            twoFactorEnabled: false,
          },
        });

        // Create company profile
        const company = await prisma.company.create({
          data: {
            userId: user.id,
            name: companyRegisterDto.name,
            slug: slug,
            uuid: companyUuid,
            description: companyRegisterDto.description,
            website: companyRegisterDto.website,
            industry: companyRegisterDto.industry,
            foundedYear: companyRegisterDto.foundedYear,
            employeeCount: companyRegisterDto.employeeCount,
            headquarters: companyRegisterDto.headquarters,
            address: companyRegisterDto.address,
            country: companyRegisterDto.country,
            state: companyRegisterDto.state,
            city: companyRegisterDto.city,
            linkedinUrl: companyRegisterDto.linkedinUrl,
            twitterUrl: companyRegisterDto.twitterUrl,
            facebookUrl: companyRegisterDto.facebookUrl,
            isVerified: companyRegisterDto.isVerified ?? false,
            isActive: companyRegisterDto.isActive ?? true,
          },
        });

        return { user, company };
      });

      // Generate email verification OTP
      const verificationCode = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      await this.prisma.oTP.create({
        data: {
          userId: result.user.id,
          code: verificationCode,
          type: OTPType.EMAIL_VERIFICATION,
          expiresAt,
        },
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: result.user.id,
          action: 'CREATE',
          level: 'INFO',
          description: 'Company registered successfully',
          entity: 'User',
          entityId: result.user.id,
        },
      });

      // TODO: Send verification email
      // In production, you would send an email with the verification code

      return {
        success: true,
        message:
          'Company registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            status: result.user.status,
            emailVerified: result.user.emailVerified,
            phoneVerified: result.user.phoneVerified,
            profileCompleted: result.user.profileCompleted,
            twoFactorEnabled: result.user.twoFactorEnabled,
            createdAt: result.user.createdAt,
          },
          company: {
            id: result.company.id,
            name: result.company.name,
            slug: result.company.slug,
            isVerified: result.company.isVerified,
            isActive: result.company.isActive,
            createdAt: result.company.createdAt,
          },
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to register company');
    }
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find valid OTP for email verification
      const otp = await this.prisma.oTP.findFirst({
        where: {
          userId: verifyEmailDto.userId,
          code: verifyEmailDto.code,
          type: OTPType.EMAIL_VERIFICATION,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otp) {
        throw new BadRequestException('Invalid or expired verification code');
      }

      // Update user email verification status
      await this.prisma.$transaction(async (prisma) => {
        // Mark OTP as used
        await prisma.oTP.update({
          where: { id: otp.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        });

        // Update user email verification status
        await prisma.user.update({
          where: { id: verifyEmailDto.userId },
          data: {
            emailVerified: true,
            emailVerifiedAt: new Date(),
            status: UserStatus.ACTIVE, // Activate user after email verification
          },
        });
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: verifyEmailDto.userId,
          action: 'UPDATE',
          level: 'INFO',
          description: 'Email verified successfully',
          entity: 'User',
          entityId: verifyEmailDto.userId,
        },
      });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify email');
    }
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ success: boolean; message: string; verified: boolean }> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: verifyOtpDto.email },
      });

      if (!user) {
        throw new BadRequestException('Invalid email address');
      }

      // Find valid OTP for password reset
      const otp = await this.prisma.oTP.findFirst({
        where: {
          userId: user.id,
          code: verifyOtpDto.otp,
          type: OTPType.PASSWORD_RESET,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otp) {
        throw new BadRequestException('Invalid or expired OTP code');
      }

      // OTP is valid - return success
      // We don't mark it as used here because the user still needs to reset the password
      // The OTP will be marked as used in resetPassword method

      return {
        success: true,
        verified: true,
        message: 'OTP verified successfully. You can now reset your password.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify OTP');
    }
  }

  async verifyPhone(
    verifyPhoneDto: VerifyPhoneDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find valid OTP for phone verification
      const otp = await this.prisma.oTP.findFirst({
        where: {
          userId: verifyPhoneDto.userId,
          code: verifyPhoneDto.code,
          type: OTPType.PHONE_VERIFICATION,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otp) {
        throw new BadRequestException('Invalid or expired verification code');
      }

      // Update user phone verification status
      await this.prisma.$transaction(async (prisma) => {
        // Mark OTP as used
        await prisma.oTP.update({
          where: { id: otp.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        });

        // Update user phone verification status
        await prisma.user.update({
          where: { id: verifyPhoneDto.userId },
          data: {
            phoneVerified: true,
            phoneVerifiedAt: new Date(),
          },
        });
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: verifyPhoneDto.userId,
          action: 'UPDATE',
          level: 'INFO',
          description: 'Phone verified successfully',
          entity: 'User',
          entityId: verifyPhoneDto.userId,
        },
      });

      return {
        success: true,
        message: 'Phone verified successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify phone');
    }
  }

  async resendOtp(
    resendOtpDto: ResendOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: resendOtpDto.email },
      });

      if (!user) {
        // Don't reveal if user exists for security
        return {
          success: true,
          message:
            'If an account with that email exists, a new verification code has been sent.',
        };
      }

      // Invalidate existing OTPs of the same type
      await this.prisma.oTP.updateMany({
        where: {
          userId: user.id,
          type: resendOtpDto.type,
          used: false,
        },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      // Generate OTP code based on type
      const expiresAt = new Date();
      let otpCode: string;
      
      if (resendOtpDto.type === OTPType.PASSWORD_RESET) {
        // Generate 6-digit OTP for password reset
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes for password reset
      } else {
        // Use UUID for other types (EMAIL_VERIFICATION, PHONE_VERIFICATION, etc.)
        otpCode = uuidv4();
        if (resendOtpDto.type === OTPType.EMAIL_VERIFICATION) {
          expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours for email
        } else if (resendOtpDto.type === OTPType.PHONE_VERIFICATION) {
          expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes for phone
        } else {
          expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes for 2FA
        }
      }

      // Create new OTP with the appropriate code type
      await this.prisma.oTP.create({
        data: {
          userId: user.id,
          code: otpCode, // Use the generated code (6-digit for PASSWORD_RESET, UUID for others)
          type: resendOtpDto.type,
          expiresAt,
        },
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          level: 'INFO',
          description: `OTP resent for ${resendOtpDto.type}`,
          entity: 'User',
          entityId: user.id,
        },
      });

      // Send OTP via email/SMS based on type
      if (resendOtpDto.type === OTPType.PASSWORD_RESET) {
        // Send password reset OTP email
        await this.emailService.sendPasswordResetEmail(
          user.email,
          otpCode,
          expiresAt,
        );
      } else if (resendOtpDto.type === OTPType.EMAIL_VERIFICATION) {
        // Send email verification OTP
        await this.emailService.sendVerificationEmail(
          user.email,
          otpCode,
          expiresAt,
        );
      }
      // TODO: Add SMS sending for PHONE_VERIFICATION

      return {
        success: true,
        message:
          'If an account with that email exists, a new verification code has been sent.',
      };
    } catch (error) {
      throw new BadRequestException('Failed to resend OTP');
    }
  }

  async enable2Fa(
    userId: string,
    enable2FaDto: Enable2FaDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: { secret: string; qrCode: string; backupCodes: string[] };
  }> {
    try {
      // Verify user password
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        enable2FaDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      if (user.twoFactorEnabled) {
        throw new BadRequestException('2FA is already enabled');
      }

      // Generate 2FA secret
      const secret = speakeasy.generateSecret({
        name: `SpearWin (${user.email})`,
        issuer: 'SpearWin',
        length: 32,
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Store 2FA secret and backup codes in user settings
      await this.prisma.$transaction(async (prisma) => {
        // Update user 2FA status
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: true },
        });

        // Store 2FA secret
        await prisma.userSetting.upsert({
          where: { userId_key: { userId, key: '2fa_secret' } },
          update: { value: secret.base32 },
          create: {
            userId,
            key: '2fa_secret',
            value: secret.base32,
            category: 'security',
          },
        });

        // Store backup codes
        await prisma.userSetting.upsert({
          where: { userId_key: { userId, key: '2fa_backup_codes' } },
          update: { value: JSON.stringify(backupCodes) },
          create: {
            userId,
            key: '2fa_backup_codes',
            value: JSON.stringify(backupCodes),
            category: 'security',
          },
        });
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'UPDATE',
          level: 'INFO',
          description: '2FA enabled successfully',
          entity: 'User',
          entityId: userId,
        },
      });

      return {
        success: true,
        message:
          '2FA enabled successfully. Please scan the QR code with your authenticator app.',
        data: {
          secret: secret.base32,
          qrCode,
          backupCodes,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to enable 2FA');
    }
  }

  async disable2Fa(
    userId: string,
    disable2FaDto: Disable2FaDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify user password
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        disable2FaDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      if (!user.twoFactorEnabled) {
        throw new BadRequestException('2FA is not enabled');
      }

      // Remove 2FA settings
      await this.prisma.$transaction(async (prisma) => {
        // Update user 2FA status
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: false },
        });

        // Remove 2FA settings
        await prisma.userSetting.deleteMany({
          where: {
            userId,
            key: { in: ['2fa_secret', '2fa_backup_codes'] },
          },
        });
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'UPDATE',
          level: 'INFO',
          description: '2FA disabled successfully',
          entity: 'User',
          entityId: userId,
        },
      });

      return {
        success: true,
        message: '2FA disabled successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to disable 2FA');
    }
  }

  async verify2Fa(
    verify2FaDto: Verify2FaDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get user and 2FA secret
      const user = await this.prisma.user.findUnique({
        where: { id: verify2FaDto.userId },
        include: {
          settings: {
            where: { key: '2fa_secret' },
          },
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!user.twoFactorEnabled) {
        throw new BadRequestException('2FA is not enabled');
      }

      const secretSetting = user.settings.find((s) => s.key === '2fa_secret');
      if (!secretSetting) {
        throw new BadRequestException('2FA secret not found');
      }

      // Verify the 2FA code
      const verified = speakeasy.totp.verify({
        secret: secretSetting.value,
        encoding: 'base32',
        token: verify2FaDto.code,
        window: 2, // Allow 2 time steps (60 seconds) tolerance
      });

      if (!verified) {
        // Check if it's a backup code
        const backupCodesSetting = await this.prisma.userSetting.findUnique({
          where: {
            userId_key: {
              userId: verify2FaDto.userId,
              key: '2fa_backup_codes',
            },
          },
        });

        if (backupCodesSetting) {
          const backupCodes = JSON.parse(backupCodesSetting.value);
          const codeIndex = backupCodes.indexOf(verify2FaDto.code);

          if (codeIndex !== -1) {
            // Remove used backup code
            backupCodes.splice(codeIndex, 1);
            await this.prisma.userSetting.update({
              where: {
                userId_key: {
                  userId: verify2FaDto.userId,
                  key: '2fa_backup_codes',
                },
              },
              data: { value: JSON.stringify(backupCodes) },
            });

            // Log backup code usage
            await this.prisma.activityLog.create({
              data: {
                userId: verify2FaDto.userId,
                action: 'UPDATE',
                level: 'WARNING',
                description: '2FA backup code used',
                entity: 'User',
                entityId: verify2FaDto.userId,
              },
            });

            return {
              success: true,
              message: '2FA verified successfully (backup code used)',
            };
          }
        }

        throw new BadRequestException('Invalid 2FA code');
      }

      // Log successful verification
      await this.prisma.activityLog.create({
        data: {
          userId: verify2FaDto.userId,
          action: 'VIEW',
          level: 'INFO',
          description: '2FA verified successfully',
          entity: 'User',
          entityId: verify2FaDto.userId,
        },
      });

      return {
        success: true,
        message: '2FA verified successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify 2FA');
    }
  }

  async generateBackupCodes(
    generateBackupCodesDto: GenerateBackupCodesDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: { backupCodes: string[] };
  }> {
    try {
      // Verify user password
      const user = await this.prisma.user.findUnique({
        where: { id: generateBackupCodesDto.userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        generateBackupCodesDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      if (!user.twoFactorEnabled) {
        throw new BadRequestException('2FA is not enabled');
      }

      // Generate new backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      // Update backup codes
      await this.prisma.userSetting.upsert({
        where: {
          userId_key: {
            userId: generateBackupCodesDto.userId,
            key: '2fa_backup_codes',
          },
        },
        update: { value: JSON.stringify(backupCodes) },
        create: {
          userId: generateBackupCodesDto.userId,
          key: '2fa_backup_codes',
          value: JSON.stringify(backupCodes),
          category: 'security',
        },
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: generateBackupCodesDto.userId,
          action: 'UPDATE',
          level: 'INFO',
          description: '2FA backup codes regenerated',
          entity: 'User',
          entityId: generateBackupCodesDto.userId,
        },
      });

      return {
        success: true,
        message: 'Backup codes generated successfully',
        data: {
          backupCodes,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to generate backup codes');
    }
  }

  async googleAuth(googleAuthDto: GoogleAuthDto): Promise<LoginResponseDto> {
    try {
      this.logger.log(`🔐 Google OAuth attempt for email: ${googleAuthDto.email}`);

      // Check if user already exists
      let user = await this.prisma.user.findUnique({
        where: { email: googleAuthDto.email },
        include: {
          candidate: true,
          admin: true,
          superAdmin: true,
          company: true,
        },
      });

      // Split name into first and last name
      const nameParts = googleAuthDto.name.trim().split(' ');
      const firstName = nameParts[0] || googleAuthDto.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!user) {
        // User doesn't exist - create new user and candidate profile
        this.logger.log(`📝 Creating new user for Google OAuth: ${googleAuthDto.email}`);

        // Generate a random password (won't be used for Google OAuth users, but required by schema)
        const randomPassword = await bcrypt.hash(uuidv4(), 10);

        const result = await this.prisma.$transaction(async (prisma) => {
          // Create user
          const newUser = await prisma.user.create({
            data: {
              email: googleAuthDto.email,
              password: randomPassword, // Random password since Google OAuth users don't need it
              role: UserRole.CANDIDATE,
              status: UserStatus.ACTIVE, // Auto-activate Google OAuth users
              emailVerified: true, // Google emails are verified
              phoneVerified: false,
              profileCompleted: false,
              twoFactorEnabled: false,
            },
          });

          // Create candidate profile
          const candidate = await prisma.candidate.create({
            data: {
              userId: newUser.id,
              firstName: firstName,
              lastName: lastName,
              profilePicture: googleAuthDto.picture || null,
              isAvailable: true,
            },
          });

          // Store Google ID in user settings for future reference
          await prisma.userSetting.create({
            data: {
              userId: newUser.id,
              key: 'googleId',
              value: googleAuthDto.googleId,
              category: 'oauth',
            },
          });

          return { user: newUser, candidate };
        });

        user = await this.prisma.user.findUnique({
          where: { id: result.user.id },
          include: {
            candidate: true,
            admin: true,
            superAdmin: true,
            company: true,
          },
        });

        if (!user) {
          throw new BadRequestException('Failed to create user');
        }

        // Log activity
        await this.prisma.activityLog.create({
          data: {
            userId: user.id,
            action: 'CREATE',
            level: 'INFO',
            description: 'User registered via Google OAuth',
            entity: 'User',
            entityId: user.id,
          },
        });
      } else {
        // User exists - update Google ID if not already set
        this.logger.log(`✅ User exists, logging in via Google OAuth: ${googleAuthDto.email}`);

        // Check if Google ID is already stored
        const existingGoogleId = await this.prisma.userSetting.findUnique({
          where: {
            userId_key: {
              userId: user.id,
              key: 'googleId',
            },
          },
        });

        if (!existingGoogleId) {
          // Store Google ID
          await this.prisma.userSetting.create({
            data: {
              userId: user.id,
              key: 'googleId',
              value: googleAuthDto.googleId,
              category: 'oauth',
            },
          });
        }

        // Update profile picture if provided and candidate exists
        if (googleAuthDto.picture && user.candidate) {
          await this.prisma.candidate.update({
            where: { id: user.candidate.id },
            data: { profilePicture: googleAuthDto.picture },
          });
        }

        // Check account status
        if (user.status === UserStatus.SUSPENDED) {
          throw new UnauthorizedException('Account is suspended');
        }

        if (user.status === UserStatus.INACTIVE) {
          // Auto-activate inactive accounts on Google OAuth login
          await this.prisma.user.update({
            where: { id: user.id },
            data: { status: UserStatus.ACTIVE },
          });
          user.status = UserStatus.ACTIVE;
        }
      }

      // Ensure user is set before proceeding
      if (!user) {
        throw new BadRequestException('User not found after authentication');
      }

      // Update last login time
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Create login session
      const sessionToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await this.prisma.loginSession.create({
        data: {
          userId: user.id,
          sessionToken,
          expiresAt,
          isActive: true,
        },
      });

      // Generate tokens
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          level: 'INFO',
          description: 'User logged in via Google OAuth',
          entity: 'User',
          entityId: user.id,
        },
      });

      const authResponse: AuthResponseDto = {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          profileCompleted: user.profileCompleted,
          twoFactorEnabled: user.twoFactorEnabled,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        },
      };

      return {
        success: true,
        message: 'Google authentication successful',
        data: authResponse,
      };
    } catch (error) {
      this.logger.error(`❌ Google OAuth error: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to authenticate with Google');
    }
  }
}
