import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { applyScope } from '../common/utils/scoped-query.util';

@Injectable()
export class TeamsService {
  constructor(@InjectRepository(Team) private readonly repo: Repository<Team>) {}

  async create(dto: CreateTeamDto): Promise<Team> {
    // exemplo de unicidade por nome dentro da company
    if (dto.name) {
      const exists = await this.repo.findOne({ where: { companyId: dto.companyId, name: dto.name } });
      if (exists) throw new ConflictException('Team name already exists in this company.');
    }
    const entity = this.repo.create(dto as Partial<Team>);
    return this.repo.save(entity);
  }

  async findAll(user: any): Promise<Team[]> {
    let where;
    if (user.role != 'gestor'){
      where = applyScope(user, {}, { company: true, team: true, employee: false, department: false });
    } 
    else {
      where = {parentTeamId: user.teamId, companyId: user.companyId}; 
    } 
    return this.repo.find({ where });
  }

  async findUpperTeamsRecursive(
    companyId: string,
    team: Team,
    collected: Team[] = [],
  ): Promise<Team[]> {
    if (!team.parentTeamId) {
      return collected;
    }

    const parent = await this.findOne(companyId, team.parentTeamId);

    if (parent) {
      collected.push(parent);
      return this.findUpperTeamsRecursive(companyId, parent, collected);
    }

    return collected;
  }


  async findOne(companyId: string, id: string): Promise<Team> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('Team not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateTeamDto): Promise<Team> {
    const row = await this.findOne(companyId, id);
    if (dto.name && dto.name !== row.name) {
      const exists = await this.repo.findOne({ where: { companyId, name: dto.name } });
      if (exists) throw new ConflictException('Team name already exists in this company.');
    }
    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}