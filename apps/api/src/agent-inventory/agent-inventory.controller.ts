import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AgentInventoryService } from './agent-inventory.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('inventory')
@UseGuards(AuthGuard, RolesGuard)
export class AgentInventoryController {
  constructor(private inventory: AgentInventoryService) {}

  @Get('agents')
  @Roles('admin', 'approver', 'viewer')
  async listAgents(@Request() req: any) {
    return this.inventory.listAgents(req.auth.projectId);
  }

  @Post('agents')
  @Roles('admin')
  async createAgent(@Request() req: any, @Body() body: any) {
    return this.inventory.createAgent(req.auth.projectId, body);
  }

  @Patch('agents/:id/suspend')
  @Roles('admin', 'approver')
  async suspendAgent(@Request() req: any, @Param('id') id: string) {
    return this.inventory.updateStatus(id, 'SUSPENDED', req.auth.projectId);
  }

  @Patch('agents/:id/activate')
  @Roles('admin', 'approver')
  async activateAgent(@Request() req: any, @Param('id') id: string) {
    return this.inventory.updateStatus(id, 'ACTIVE', req.auth.projectId);
  }

  @Get('roles')
  @Roles('admin', 'approver', 'viewer')
  async listRoles(@Request() req: any) {
    return this.inventory.listRoles(req.auth.projectId);
  }
}
