import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { applyScope } from '../common/utils/scoped-query.util';

export type TeamMemberFilters = {
  teamId?: string;
  employeeId?: string;
  parentTeamId?: string;
  active?: boolean;
};

@Injectable()
export class TeamMembersService {
  constructor(@InjectRepository(TeamMember) private readonly repo: Repository<TeamMember>) {}

  async create(dto: CreateTeamMemberDto): Promise<TeamMember> {
    // exemplo de unicidade básica (mesma pessoa no mesmo time, ativo)
    const exists = await this.repo.findOne({
      where: { companyId: dto.companyId, teamId: dto.teamId, employeeId: dto.employeeId, active: true },
    });
    if (exists) throw new ConflictException('Member already active in this team.');
    const entity = this.repo.create(dto as Partial<TeamMember>);
    return this.repo.save(entity);
  }
  
  async findAll(user: any, filters: TeamMemberFilters = {}): Promise<TeamMember[]> {
    const where = applyScope(user, {}, { company: true, team: true, employee: false, department: false });

    if (filters.teamId) where.teamId = filters.teamId;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.parentTeamId) where.parentTeamId = filters.parentTeamId;
    if (typeof filters.active === 'boolean') where.active = filters.active;

    return this.repo.find({ where, relations: ['employee', 'team', 'parentTeam', 'employee.person'] });
  }

  async findOne(companyId: string, id: string): Promise<TeamMember> {
    const row = await this.repo.findOne({ where: { companyId, id }, relations: ['employee', 'team', 'parentTeam', 'employee.person'] });
    if (!row) throw new NotFoundException('Team member not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const row = await this.findOne(companyId, id);
    // se trocar para um par (teamId, employeeId) que conflita com um ativo
    if ((dto.teamId && dto.teamId !== row.teamId) || (dto.employeeId && dto.employeeId !== row.employeeId)) {
      const exists = await this.repo.findOne({
        where: {
          companyId,
          teamId: dto.teamId ?? row.teamId,
          employeeId: dto.employeeId ?? row.employeeId,
          active: true,
        },
      });
      if (exists) throw new ConflictException('Member already active in this team.');
    }
    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}