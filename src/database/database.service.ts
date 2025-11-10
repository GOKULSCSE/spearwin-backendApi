import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000; // 2 seconds

  constructor() {
    super({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      this.logger.error(
        'DATABASE_URL environment variable is not set. Please set it in your .env file.',
      );
      throw new Error(
        'DATABASE_URL environment variable is required. Please check your .env file.',
      );
    }

    // Attempt connection with retry logic
    await this.connectWithRetry();
  }

  private async connectWithRetry(retryCount = 0): Promise<void> {
    try {
      this.logger.log(
        `Attempting to connect to database... (Attempt ${retryCount + 1}/${this.maxRetries})`,
      );
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error: any) {
      if (retryCount < this.maxRetries - 1) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        this.logger.warn(
          `Database connection failed. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${this.maxRetries})`,
        );
        this.logger.debug(`Error: ${error.message}`);
        await this.sleep(delay);
        return this.connectWithRetry(retryCount + 1);
      } else {
        this.logger.error(
          `Failed to connect to database after ${this.maxRetries} attempts`,
        );
        this.logger.error(`Error: ${error.message}`);
        this.logger.error(
          'Please check:\n' +
            '  1. DATABASE_URL is correctly set in your .env file\n' +
            '  2. Database server is running and accessible\n' +
            '  3. Network/firewall allows connection to the database\n' +
            '  4. Database credentials are correct\n' +
            `  5. Database URL format: postgresql://user:password@host:port/database`,
        );
        throw error;
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
