import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Person } from '../person/entities/person.entity';
import { TeamMember } from '../team/entities/team-member.entity';
import { Team } from '../team/entities/team.entity';
import { applyScope } from '../common/utils/scoped-query.util';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { EmployeeHistory } from './entities/employee-history.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>,
    @InjectRepository(Person) private readonly personRepo: Repository<Person>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(TeamMember) private readonly teamMemberRepo: Repository<TeamMember>,
    @InjectRepository(EmployeeHistory) private readonly employeeHistoryRepo: Repository<EmployeeHistory>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    if (dto.userId) {
      const exists = await this.repo.findOne({ where: { companyId: dto.companyId, userId: dto.userId } });
      if (exists) throw new ConflictException('Employee for this user already exists in this company.');
    }

    const person = await this.personRepo.findOne({ where: { id: dto.personId } });
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const entity = this.repo.create({...dto, name: person.name} as Partial<Employee>);
    const saved = await this.repo.save(entity);

    if (saved.teamId) {
      const team = await this.teamRepo.findOne({ where: { id: saved.teamId, companyId: saved.companyId } });
      if (!team) {
        throw new NotFoundException('Team not found for the given teamId');
      }

      const teamMember = this.teamMemberRepo.create({
        employeeId: saved.id,
        teamId: saved.teamId,
        companyId: saved.companyId,
        startDate: saved.hiringDate!,
        isLeader: false,
        parentTeamId: team.parentTeamId,
      });
      await this.teamMemberRepo.save(teamMember);
    }

    const employeeHistory = this.employeeHistoryRepo.create({
      ...dto,
      employeeId: saved.id,
      startDate: new Date().toISOString().split('T')[0],
    });
    await this.employeeHistoryRepo.save(employeeHistory);

    return saved;
  }

  async findAll(user: any, query: EmployeeQueryDto) {
    let where = applyScope(user, {}, { company: true, team: true, employee: true, department: false });
    
    if (user.role === 'gestor') {
      where = [
        { teamId: user.teamId },
        { team: { parentTeamId: user.teamId } },
      ];
      where['companyId'] = user.companyId;
    }

    if (query.name) {
      where['person'] = { name: ILike(`%${query.name}%`) };
    }
    if (query.teamId) {
      where['teamId'] = query.teamId;
    }
    if (query.departmentId) {
      where['departmentId'] = query.departmentId;
    }
    if (query.roleTypeId) {
      where['roleTypeId'] = query.roleTypeId;
    }
    if (query.roleId) {
      where['roleId'] = query.roleId;
    }
    if (query.branchId) {
      where['branchId'] = query.branchId;
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, relations: ['person', 'role', 'roleType', 'team', 'department', 'branch'], skip, take: limit });
    return { page, limit, total, data };
  }

  async findOne(companyId: string, id: string): Promise<Employee> {
    const emp = await this.repo.findOne({ where: { companyId, id } });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async findOneByPersonId(companyId: string, personId: string): Promise<Employee> {
    const emp = await this.repo.findOne({ where: { companyId, personId } });
    if (!emp) throw new NotFoundException('Employee not found for the given personId');
    return emp;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const emp = await this.findOne(companyId, id);

    if (dto.userId && dto.userId !== emp.userId) {
      const exists = await this.repo.findOne({ where: { companyId, userId: dto.userId } });
      if (exists) throw new ConflictException('Employee for this user already exists in this company.');
    }
    if (dto.teamId && dto.teamId !== emp.teamId) {
      let teamMember = await this.teamMemberRepo.findOne({ where: { employeeId: emp.id, companyId: emp.companyId, active: true } });
      if (teamMember) {
        teamMember.active = false;
        teamMember.endDate = new Date().toISOString().split('T')[0];
        await this.teamMemberRepo.save(teamMember);

        const team = await this.teamRepo.findOne({ where: { id: dto.teamId, companyId: emp.companyId } });
        if (!team) {
          throw new NotFoundException('Team not found for the given teamId');
        }

        const newTeamMember = this.teamMemberRepo.create({
          employeeId: emp.id,
          teamId: dto.teamId,
          companyId: emp.companyId,
          parentTeamId: team.parentTeamId,
          startDate: new Date().toISOString().split('T')[0],
          isLeader: false,
        });
        await this.teamMemberRepo.save(newTeamMember);
      }
    }
    const merged = this.repo.merge(emp, dto as any);
    const saved = await this.repo.save(merged);

    const lastHistory = await this.employeeHistoryRepo.findOne({ 
      where: { companyId, employeeId: saved.id },
      order: { startDate: 'DESC', updatedAt: 'DESC' },
    });
    if (lastHistory) {
      lastHistory.endDate = new Date().toISOString().split('T')[0];
      lastHistory.active = false;
      await this.employeeHistoryRepo.save(lastHistory);
    }

    const employeeHistory = this.employeeHistoryRepo.create({
      ...dto,
      companyId,
      employeeId: saved.id,
      startDate: new Date().toISOString().split('T')[0],
    });
    await this.employeeHistoryRepo.save(employeeHistory);

    return saved;
  }

  async remove(companyId: string, id: string): Promise<void> {
    const emp = await this.findOne(companyId, id);
    emp.active = false;
    await emp.save();
    await this.repo.softRemove(emp);

    const lastHistory = await this.employeeHistoryRepo.findOne({ 
      where: { companyId, employeeId: emp.id },
      order: { startDate: 'DESC', updatedAt: 'DESC' },
    });

    if (lastHistory) {
      lastHistory.endDate = new Date().toISOString().split('T')[0];
      lastHistory.active = false;
      await this.employeeHistoryRepo.save(lastHistory);
    }
  }
}