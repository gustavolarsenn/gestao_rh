import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Employee } from './entities/employee.entity';
import { Person } from '../person/entities/person.entity';
import { Team } from '../team/entities/team.entity';
import { TeamMember } from '../team/entities/team-member.entity';
import { EmployeeHistory } from './entities/employee-history.entity';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repo: jest.Mocked<Repository<Employee>>;
  let personRepo: jest.Mocked<Repository<Person>>;
  let teamRepo: jest.Mocked<Repository<Team>>;
  let teamMemberRepo: jest.Mocked<Repository<TeamMember>>;
  let employeeHistoryRepo: jest.Mocked<Repository<EmployeeHistory>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: createRepoMock() },
        { provide: getRepositoryToken(Person), useValue: createRepoMock() },
        { provide: getRepositoryToken(Team), useValue: createRepoMock() },
        { provide: getRepositoryToken(TeamMember), useValue: createRepoMock() },
        { provide: getRepositoryToken(EmployeeHistory), useValue: createRepoMock() },
      ],
    }).compile();

    service = module.get(EmployeesService);
    repo = module.get(getRepositoryToken(Employee));
    personRepo = module.get(getRepositoryToken(Person));
    teamRepo = module.get(getRepositoryToken(Team));
    teamMemberRepo = module.get(getRepositoryToken(TeamMember));
    employeeHistoryRepo = module.get(getRepositoryToken(EmployeeHistory));
  });

  function createRepoMock(): jest.Mocked<Repository<any>> {
    return {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((e) => e),
      save: jest.fn((e) => Promise.resolve({ ...e, id: e.id || 'generated-id' })),
      merge: jest.fn((entity, dto) => ({ ...entity, ...dto })), // ← AQUI
      softRemove: jest.fn(),
    } as any;
  }

  // ===========================================================================
  // CREATE
  // ===========================================================================

  it('deve criar um employee com sucesso', async () => {
    personRepo.findOne.mockResolvedValue({ id: 'p1', name: 'John' } as any);

    const dto: any = {
      personId: 'p1',
      companyId: 'c1',
      hiringDate: '2023-01-01',
    };

    const result = await service.create(dto);

    expect(personRepo.findOne).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(employeeHistoryRepo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('deve lançar erro caso personId não exista', async () => {
    personRepo.findOne.mockResolvedValue(null);

    await expect(
      service.create({ personId: 'p404', companyId: 'c1' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve lançar erro caso user já exista na empresa', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' } as any);

    await expect(
      service.create({
        companyId: 'c1',
        userId: 'u1',
        personId: 'p1',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve criar TeamMember se teamId for enviado', async () => {
    personRepo.findOne.mockResolvedValue({ id: 'p1', name: 'John' } as any);
    teamRepo.findOne.mockResolvedValue({ id: 't1', parentTeamId: 'root' } as any);

    const dto: any = {
      personId: 'p1',
      companyId: 'c1',
      teamId: 't1',
      hiringDate: '2023-01-01',
    };

    const result = await service.create(dto);

    expect(teamMemberRepo.save).toHaveBeenCalled();
    expect(employeeHistoryRepo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  // ===========================================================================
  // FIND ALL
  // ===========================================================================

  it('findAll deve retornar lista paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'e1', personId: 'p1', hiringDate: '2023-01-01', companyId: 'c1', createdAt: new Date(), updatedAt: new Date() } as any], 1] as any);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'e1' }],
    });
  });

  // ===========================================================================
  // FIND ONE
  // ===========================================================================

  it('findOne deve retornar employee', async () => {
    repo.findOne.mockResolvedValue({ id: 'e1' } as any);

    const result = await service.findOne('c1', 'e1');

    expect(result).toEqual({ id: 'e1' });
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  it('update deve atualizar employee', async () => {
    repo.findOne.mockResolvedValue({ id: 'e1', companyId: 'c1' } as any);
    employeeHistoryRepo.findOne.mockResolvedValue(null);

    const result = await service.update('c1', 'e1', { name: 'Updated' } as any);

    expect(repo.save).toHaveBeenCalled();
    expect(employeeHistoryRepo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('update deve lançar erro se trocar userId duplicado', async () => {
    repo.findOne
      .mockResolvedValueOnce({ id: 'e1', companyId: 'c1', userId: 'u1' } as any)
      .mockResolvedValueOnce({ id: 'e2' } as any);

    await expect(
      service.update('c1', 'e1', { userId: 'u2' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ===========================================================================
  // REMOVE
  // ===========================================================================

  it('remove deve realizar soft delete com sucesso', async () => {
    repo.findOne.mockResolvedValue({ id: 'e1', companyId: 'c1', save: jest.fn() } as any);
    employeeHistoryRepo.findOne.mockResolvedValue(null);

    await service.remove('c1', 'e1');

    expect(repo.softRemove).toHaveBeenCalled();
  });
});
