import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    // Conectar Prisma
    await this.$connect();
    this.logger.log('🔗 Prisma Database connected');

    // Crear pool de PostgreSQL
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.pool.on('connect', () =>
      this.logger.log('🔗 PostgreSQL pool connected'),
    );

    this.pool.on('error', (err) => {
      this.logger.error('❌ Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('👋 Database disconnected');
  }

  async query<T>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;
    this.logger.log(
      `Raw SQL Query: { duration: ${duration}ms, rows: ${res.rowCount} }`,
    );
    return res.rows;
  }

  async transaction<T>(fn: (prisma: PrismaService) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      const txService = Object.create(this);
      Object.setPrototypeOf(txService, PrismaService.prototype);
      Object.assign(txService, tx);
      return fn(txService);
    });
  }

  handlePrismaError(error: any): never {
    if (error.code === 'P2002') {
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      throw new Error(`${field} already exists`);
    } else if (error.code === 'P2025') {
      // Record not found
      throw new Error('Record not found');
    } else if (error.code === 'P2003') {
      // Foreign key constraint violation
      throw new Error('Related record not found');
    }

    this.logger.error(`Prisma error: ${error.message}`, error);
    throw error;
  }
}