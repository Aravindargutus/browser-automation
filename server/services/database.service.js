const { PrismaClient } = require('@prisma/client');
const logger = require('../logger');

class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Log database errors
    this.prisma.$on('error', (e) => {
      logger.error('Database error', { error: e.message });
    });

    this.prisma.$on('warn', (e) => {
      logger.warn('Database warning', { message: e.message });
    });
  }

  // ==================== USER METHODS ====================

  async createUser(data) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      logger.error('Failed to create user', { error: error.message });
      throw error;
    }
  }

  async getUserById(id) {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      logger.error('Failed to get user', { id, error: error.message });
      throw error;
    }
  }

  async getUserByApiKey(apiKey) {
    try {
      return await this.prisma.user.findUnique({ where: { apiKey } });
    } catch (error) {
      logger.error('Failed to get user by API key', { error: error.message });
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      logger.error('Failed to get user by email', { email, error: error.message });
      throw error;
    }
  }

  // ==================== WORKFLOW METHODS ====================

  async createWorkflow(data) {
    try {
      logger.info('Creating workflow', { name: data.name });
      return await this.prisma.workflow.create({ data });
    } catch (error) {
      logger.error('Failed to create workflow', { error: error.message });
      throw error;
    }
  }

  async getWorkflows(filters = {}) {
    try {
      const { userId, isTemplate, isActive, tags, search } = filters;

      const where = {};
      if (userId) where.userId = userId;
      if (typeof isTemplate === 'boolean') where.isTemplate = isTemplate;
      if (typeof isActive === 'boolean') where.isActive = isActive;
      if (tags && tags.length > 0) where.tags = { hasSome: tags };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      return await this.prisma.workflow.findMany({
        where,
        include: {
          _count: {
            select: {
              executions: true,
              schedules: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Failed to get workflows', { error: error.message });
      throw error;
    }
  }

  async getWorkflowById(id) {
    try {
      return await this.prisma.workflow.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true } },
          executions: {
            take: 10,
            orderBy: { startTime: 'desc' },
            select: {
              id: true,
              status: true,
              startTime: true,
              endTime: true
            }
          },
          schedules: true,
          _count: {
            select: {
              executions: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get workflow', { id, error: error.message });
      throw error;
    }
  }

  async updateWorkflow(id, data) {
    try {
      logger.info('Updating workflow', { id });
      return await this.prisma.workflow.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Failed to update workflow', { id, error: error.message });
      throw error;
    }
  }

  async deleteWorkflow(id) {
    try {
      logger.info('Deleting workflow', { id });
      return await this.prisma.workflow.delete({ where: { id } });
    } catch (error) {
      logger.error('Failed to delete workflow', { id, error: error.message });
      throw error;
    }
  }

  // ==================== EXECUTION METHODS ====================

  async createExecution(data) {
    try {
      logger.info('Creating execution', {
        workflowId: data.workflowId,
        prompt: data.prompt?.substring(0, 50)
      });
      return await this.prisma.execution.create({ data });
    } catch (error) {
      logger.error('Failed to create execution', { error: error.message });
      throw error;
    }
  }

  async updateExecution(id, data) {
    try {
      return await this.prisma.execution.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Failed to update execution', { id, error: error.message });
      throw error;
    }
  }

  async getExecutionById(id) {
    try {
      return await this.prisma.execution.findUnique({
        where: { id },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get execution', { id, error: error.message });
      throw error;
    }
  }

  async getExecutions(filters = {}) {
    try {
      const { userId, workflowId, status, limit = 50, offset = 0 } = filters;

      const where = {};
      if (userId) where.userId = userId;
      if (workflowId) where.workflowId = workflowId;
      if (status) where.status = status;

      return await this.prisma.execution.findMany({
        where,
        include: {
          workflow: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      logger.error('Failed to get executions', { error: error.message });
      throw error;
    }
  }

  async getExecutionStats(userId) {
    try {
      const total = await this.prisma.execution.count({ where: { userId } });
      const successful = await this.prisma.execution.count({
        where: { userId, status: 'success' }
      });
      const failed = await this.prisma.execution.count({
        where: { userId, status: 'failed' }
      });
      const running = await this.prisma.execution.count({
        where: { userId, status: 'running' }
      });

      return {
        total,
        successful,
        failed,
        running,
        successRate: total > 0 ? (successful / total * 100).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Failed to get execution stats', { error: error.message });
      throw error;
    }
  }

  // ==================== SCHEDULE METHODS ====================

  async createSchedule(data) {
    try {
      logger.info('Creating schedule', {
        workflowId: data.workflowId,
        cronExpression: data.cronExpression
      });
      return await this.prisma.schedule.create({ data });
    } catch (error) {
      logger.error('Failed to create schedule', { error: error.message });
      throw error;
    }
  }

  async getSchedules(filters = {}) {
    try {
      const { workflowId, enabled } = filters;

      const where = {};
      if (workflowId) where.workflowId = workflowId;
      if (typeof enabled === 'boolean') where.enabled = enabled;

      return await this.prisma.schedule.findMany({
        where,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              userId: true
            }
          }
        },
        orderBy: { nextRun: 'asc' }
      });
    } catch (error) {
      logger.error('Failed to get schedules', { error: error.message });
      throw error;
    }
  }

  async getScheduleById(id) {
    try {
      return await this.prisma.schedule.findUnique({
        where: { id },
        include: {
          workflow: true
        }
      });
    } catch (error) {
      logger.error('Failed to get schedule', { id, error: error.message });
      throw error;
    }
  }

  async updateSchedule(id, data) {
    try {
      logger.info('Updating schedule', { id });
      return await this.prisma.schedule.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Failed to update schedule', { id, error: error.message });
      throw error;
    }
  }

  async deleteSchedule(id) {
    try {
      logger.info('Deleting schedule', { id });
      return await this.prisma.schedule.delete({ where: { id } });
    } catch (error) {
      logger.error('Failed to delete schedule', { id, error: error.message });
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  async disconnect() {
    await this.prisma.$disconnect();
    logger.info('Database connection closed');
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { healthy: true, message: 'Database connection is healthy' };
    } catch (error) {
      logger.error('Database health check failed', { error: error.message });
      return { healthy: false, message: error.message };
    }
  }
}

// Export singleton instance
module.exports = new DatabaseService();
