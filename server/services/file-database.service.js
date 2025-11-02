const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const logger = require('../logger');

/**
 * Simple file-based database for testing
 * Stores data in JSON files when Prisma is not available
 */
class FileDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data');
    this.files = {
      users: path.join(this.dbPath, 'users.json'),
      workflows: path.join(this.dbPath, 'workflows.json'),
      executions: path.join(this.dbPath, 'executions.json'),
      schedules: path.join(this.dbPath, 'schedules.json')
    };
    this.initDatabase();
  }

  initDatabase() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }

    // Initialize files if they don't exist
    Object.values(this.files).forEach(file => {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([], null, 2));
      }
    });

    logger.info('File-based database initialized', { path: this.dbPath });
  }

  readFile(type) {
    try {
      const data = fs.readFileSync(this.files[type], 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Failed to read ${type}`, { error: error.message });
      return [];
    }
  }

  writeFile(type, data) {
    try {
      fs.writeFileSync(this.files[type], JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error(`Failed to write ${type}`, { error: error.message });
      throw error;
    }
  }

  // ==================== USER METHODS ====================

  async createUser(data) {
    const users = this.readFile('users');
    const user = {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(user);
    this.writeFile('users', users);
    return user;
  }

  async getUserById(id) {
    const users = this.readFile('users');
    return users.find(u => u.id === id) || null;
  }

  async getUserByApiKey(apiKey) {
    const users = this.readFile('users');
    return users.find(u => u.apiKey === apiKey) || null;
  }

  async getUserByEmail(email) {
    const users = this.readFile('users');
    return users.find(u => u.email === email) || null;
  }

  // ==================== WORKFLOW METHODS ====================

  async createWorkflow(data) {
    const workflows = this.readFile('workflows');
    const workflow = {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    workflows.push(workflow);
    this.writeFile('workflows', workflows);
    logger.info('Workflow created', { id: workflow.id, name: workflow.name });
    return workflow;
  }

  async getWorkflows(filters = {}) {
    let workflows = this.readFile('workflows');
    const { userId, isTemplate, isActive, tags, search } = filters;

    if (userId) {
      workflows = workflows.filter(w => w.userId === userId);
    }
    if (typeof isTemplate === 'boolean') {
      workflows = workflows.filter(w => w.isTemplate === isTemplate);
    }
    if (typeof isActive === 'boolean') {
      workflows = workflows.filter(w => w.isActive === isActive);
    }
    if (tags && tags.length > 0) {
      workflows = workflows.filter(w =>
        w.tags && tags.some(tag => w.tags.includes(tag))
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      workflows = workflows.filter(w =>
        (w.name && w.name.toLowerCase().includes(searchLower)) ||
        (w.description && w.description.toLowerCase().includes(searchLower))
      );
    }

    // Add execution count
    const executions = this.readFile('executions');
    return workflows.map(w => ({
      ...w,
      _count: {
        executions: executions.filter(e => e.workflowId === w.id).length,
        schedules: 0
      }
    }));
  }

  async getWorkflowById(id) {
    const workflows = this.readFile('workflows');
    const workflow = workflows.find(w => w.id === id);

    if (!workflow) return null;

    const executions = this.readFile('executions');
    const workflowExecutions = executions
      .filter(e => e.workflowId === id)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 10)
      .map(e => ({
        id: e.id,
        status: e.status,
        startTime: e.startTime,
        endTime: e.endTime
      }));

    return {
      ...workflow,
      executions: workflowExecutions,
      schedules: [],
      _count: {
        executions: executions.filter(e => e.workflowId === id).length
      }
    };
  }

  async updateWorkflow(id, data) {
    const workflows = this.readFile('workflows');
    const index = workflows.findIndex(w => w.id === id);

    if (index === -1) {
      throw new Error('Workflow not found');
    }

    workflows[index] = {
      ...workflows[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.writeFile('workflows', workflows);
    logger.info('Workflow updated', { id });
    return workflows[index];
  }

  async deleteWorkflow(id) {
    const workflows = this.readFile('workflows');
    const filtered = workflows.filter(w => w.id !== id);

    if (filtered.length === workflows.length) {
      throw new Error('Workflow not found');
    }

    this.writeFile('workflows', filtered);
    logger.info('Workflow deleted', { id });
    return { id };
  }

  // ==================== EXECUTION METHODS ====================

  async createExecution(data) {
    const executions = this.readFile('executions');
    const execution = {
      id: randomUUID(),
      ...data,
      startTime: new Date().toISOString()
    };
    executions.push(execution);
    this.writeFile('executions', executions);
    logger.info('Execution created', { id: execution.id });
    return execution;
  }

  async updateExecution(id, data) {
    const executions = this.readFile('executions');
    const index = executions.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error('Execution not found');
    }

    executions[index] = {
      ...executions[index],
      ...data
    };

    this.writeFile('executions', executions);
    return executions[index];
  }

  async getExecutionById(id) {
    const executions = this.readFile('executions');
    const execution = executions.find(e => e.id === id);

    if (!execution) return null;

    // Add workflow info if exists
    if (execution.workflowId) {
      const workflows = this.readFile('workflows');
      const workflow = workflows.find(w => w.id === execution.workflowId);
      if (workflow) {
        execution.workflow = {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description
        };
      }
    }

    return execution;
  }

  async getExecutions(filters = {}) {
    let executions = this.readFile('executions');
    const { userId, workflowId, status, limit = 50, offset = 0 } = filters;

    if (userId) {
      executions = executions.filter(e => e.userId === userId);
    }
    if (workflowId) {
      executions = executions.filter(e => e.workflowId === workflowId);
    }
    if (status) {
      executions = executions.filter(e => e.status === status);
    }

    // Sort by startTime descending
    executions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    // Apply pagination
    executions = executions.slice(offset, offset + limit);

    // Add workflow info
    const workflows = this.readFile('workflows');
    return executions.map(e => {
      const result = { ...e };
      if (e.workflowId) {
        const workflow = workflows.find(w => w.id === e.workflowId);
        if (workflow) {
          result.workflow = {
            id: workflow.id,
            name: workflow.name
          };
        }
      }
      return result;
    });
  }

  async getExecutionStats(userId) {
    const executions = this.readFile('executions').filter(e => e.userId === userId);

    const total = executions.length;
    const successful = executions.filter(e => e.status === 'success').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const running = executions.filter(e => e.status === 'running').length;

    return {
      total,
      successful,
      failed,
      running,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : '0.00'
    };
  }

  // ==================== SCHEDULE METHODS ====================

  async createSchedule(data) {
    const schedules = this.readFile('schedules');
    const schedule = {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    schedules.push(schedule);
    this.writeFile('schedules', schedules);
    return schedule;
  }

  async getSchedules(filters = {}) {
    let schedules = this.readFile('schedules');
    const { workflowId, enabled } = filters;

    if (workflowId) {
      schedules = schedules.filter(s => s.workflowId === workflowId);
    }
    if (typeof enabled === 'boolean') {
      schedules = schedules.filter(s => s.enabled === enabled);
    }

    return schedules;
  }

  async getScheduleById(id) {
    const schedules = this.readFile('schedules');
    return schedules.find(s => s.id === id) || null;
  }

  async updateSchedule(id, data) {
    const schedules = this.readFile('schedules');
    const index = schedules.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error('Schedule not found');
    }

    schedules[index] = {
      ...schedules[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.writeFile('schedules', schedules);
    return schedules[index];
  }

  async deleteSchedule(id) {
    const schedules = this.readFile('schedules');
    const filtered = schedules.filter(s => s.id !== id);

    if (filtered.length === schedules.length) {
      throw new Error('Schedule not found');
    }

    this.writeFile('schedules', filtered);
    return { id };
  }

  // ==================== UTILITY METHODS ====================

  async disconnect() {
    logger.info('File database connection closed');
  }

  async healthCheck() {
    try {
      // Test read/write
      const testFile = path.join(this.dbPath, '.health');
      fs.writeFileSync(testFile, 'ok');
      fs.readFileSync(testFile);
      fs.unlinkSync(testFile);

      return { healthy: true, message: 'File database is healthy' };
    } catch (error) {
      logger.error('Database health check failed', { error: error.message });
      return { healthy: false, message: error.message };
    }
  }
}

// Export singleton instance
module.exports = new FileDatabase();
