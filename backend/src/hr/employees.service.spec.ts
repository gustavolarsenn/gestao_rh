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

  function createRepoMock(): jest.Mocked<Repository<any>> {
    return {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      create: jest.fn((e) => e),
      save: jest.fn((e) =>
        Promise.resolve({
          ...e,
          id: e.id || 'generated-id',
        }),
      ),
      merge: jest.fn((entity, dto) => ({ ...entity, ...dto })),
      softRemove: jest.fn(),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: createRepoMock() },
        { provide: getRepositoryToken(Person), useValue: createRepoMock() },
        { provide: getRepositoryToken(Team), useValue: createRepoMock() },
        { provide: getRepositoryToken(TeamMember), useValue: createRepoMock() },
        {
          provide: getRepositoryToken(EmployeeHistory),
          useValue: createRepoMock(),
        },
      ],
    }).compile();

    service = module.get(EmployeesService);
    repo = module.get(getRepositoryToken(Employee));
    personRepo = module.get(getRepositoryToken(Person));
    teamRepo = module.get(getRepositoryToken(Team));
    teamMemberRepo = module.get(getRepositoryToken(TeamMember));
    employeeHistoryRepo = module.get(getRepositoryToken(EmployeeHistory));
  });

  // ===========================================================================
  // CREATE
  // ===========================================================================
  it('deve criar um employee com sucesso (sem teamId)', async () => {
    // não existe employee para userId (não informado)
    repo.findOne.mockResolvedValue(null);
    // person existe
    personRepo.findOne.mockResolvedValue({ id: 'p1', name: 'John' } as any);

    const dto: any = {
      personId: 'p1',
      companyId: 'c1',
      hiringDate: '2023-01-01',
    };

    const result = await service.create(dto);

    expect(personRepo.findOne).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(employeeHistoryRepo.create).toHaveBeenCalled();
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
    // se dto.userId vem, o service checa duplicidade
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
    repo.findOne.mockResolvedValue(null); // não existe outro employee para o user
    personRepo.findOne.mockResolvedValue({ id: 'p1', name: 'John' } as any);
    teamRepo.findOne.mockResolvedValue({
      id: 't1',
      parentTeamId: 'root',
      companyId: 'c1',
    } as any);

    const dto: any = {
      personId: 'p1',
      companyId: 'c1',
      teamId: 't1',
      hiringDate: '2023-01-01',
    };

    const result = await service.create(dto);

    expect(teamRepo.findOne).toHaveBeenCalled();
    expect(teamMemberRepo.create).toHaveBeenCalled();
    expect(teamMemberRepo.save).toHaveBeenCalled();
    expect(employeeHistoryRepo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('deve lançar erro se teamId for enviado mas time não existir', async () => {
    repo.findOne.mockResolvedValue(null);
    personRepo.findOne.mockResolvedValue({ id: 'p1', name: 'John' } as any);
    teamRepo.findOne.mockResolvedValue(null);

    const dto: any = {
      personId: 'p1',
      companyId: 'c1',
      teamId: 't1',
      hiringDate: '2023-01-01',
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // ===========================================================================
  // FIND ALL
  // ===========================================================================
  it('findAll deve retornar lista paginada para admin', async () => {
    repo.findAndCount.mockResolvedValue([
      [
        {
          id: 'e1',
          personId: 'p1',
          hiringDate: '2023-01-01',
          companyId: 'c1',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ],
      1,
    ] as any);

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
    expect(repo.findAndCount).toHaveBeenCalled();
  });

  it('findAll deve montar where específico para gestor e aplicar filtros', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'e2' } as any], 1] as any);

    const result = await service.findAll(
      {
        role: 'gestor',
        companyId: 'c1',
        teamId: 't1',
      } as any,
      {
        page: 2,
        limit: 5,
        name: 'Jo',
        teamId: 't1',
        departmentId: 'd1',
        roleTypeId: 'rt1',
        roleId: 'r1',
        branchId: 'b1',
      } as any,
    );

    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(repo.findAndCount).toHaveBeenCalled();

    const callArgs = repo.findAndCount.mock.calls[0]![0] as any;
    expect(callArgs.relations).toBeDefined();
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
  // FIND ONE BY PERSON ID
  // ===========================================================================
  it('findOneByPersonId deve retornar employee', async () => {
    repo.findOne.mockResolvedValue({ id: 'e1', personId: 'p1' } as any);

    const result = await service.findOneByPersonId('c1', 'p1');

    expect(result.id).toBe('e1');
    expect(repo.findOne).toHaveBeenCalled();
  });

  it('findOneByPersonId deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      service.findOneByPersonId('c1', 'p404'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // ===========================================================================
  // UPDATE
  // ===========================================================================
  it('update deve atualizar employee sem trocar userId nem teamId', async () => {
    // Empregado atual
    repo.findOne.mockResolvedValue({
      id: 'e1',
      companyId: 'c1',
      userId: 'u1',
      teamId: 't1',
    } as any);

    // sem histórico anterior
    employeeHistoryRepo.findOne.mockResolvedValue(null);

    const result = await service.update('c1', 'e1', {
      wage: '5000',
    } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(employeeHistoryRepo.create).toHaveBeenCalled();
    expect(employeeHistoryRepo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('update deve lançar erro se trocar userId para um já existente', async () => {
    // employee atual
    repo.findOne.mockResolvedValueOnce({
      id: 'e1',
      companyId: 'c1',
      userId: 'u1',
    } as any);

    // consulta duplicidade
    repo.findOne.mockResolvedValueOnce({ id: 'other' } as any);

    await expect(
      service.update('c1', 'e1', { userId: 'u2' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update deve trocar time quando existir TeamMember ativo e time novo for válido', async () => {
    // employee atual
    repo.findOne.mockResolvedValue({
      id: 'e1',
      companyId: 'c1',
      userId: 'u1',
      teamId: 't1',
    } as any);

    // teamMember ativo atual
    teamMemberRepo.findOne.mockResolvedValue({
      id: 'tm1',
      employeeId: 'e1',
      companyId: 'c1',
      active: true,
    } as any);

    // novo time
    teamRepo.findOne.mockResolvedValue({
      id: 't2',
      companyId: 'c1',
      parentTeamId: 'root',
    } as any);

    // último histórico existe
    employeeHistoryRepo.findOne.mockResolvedValueOnce({
      id: 'h1',
      companyId: 'c1',
      employeeId: 'e1',
      active: true,
    } as any);

    const result = await service.update('c1', 'e1', {
      teamId: 't2',
    } as any);

    expect(teamMemberRepo.save).toHaveBeenCalledTimes(2); // desativa + novo
    expect(employeeHistoryRepo.save).toHaveBeenCalledTimes(2); // fecha último + novo
    expect(result).toHaveProperty('id');
  });

  it('update deve lançar erro se teamId for alterado mas time novo não existir', async () => {
    // employee atual
    repo.findOne.mockResolvedValue({
      id: 'e1',
      companyId: 'c1',
      userId: 'u1',
      teamId: 't1',
    } as any);

    // existe TeamMember ativo
    teamMemberRepo.findOne.mockResolvedValue({
      id: 'tm1',
      employeeId: 'e1',
      companyId: 'c1',
      active: true,
    } as any);

    // time novo não encontrado
    teamRepo.findOne.mockResolvedValue(null);

    await expect(
      service.update('c1', 'e1', { teamId: 'tX' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update deve criar histórico mesmo sem TeamMember ativo', async () => {
    repo.findOne.mockResolvedValue({
      id: 'e1',
      companyId: 'c1',
      userId: 'u1',
      teamId: 't1',
    } as any);

    // não existe teamMember ativo
    teamMemberRepo.findOne.mockResolvedValue(null);

    // último histórico existe
    employeeHistoryRepo.findOne.mockResolvedValueOnce({
      id: 'h1',
      companyId: 'c1',
      employeeId: 'e1',
      active: true,
    } as any);

    const result = await service.update('c1', 'e1', {
      wage: '6000',
    } as any);

    expect(employeeHistoryRepo.save).toHaveBeenCalledTimes(2);
    expect(result).toHaveProperty('id');
  });

  // ===========================================================================
  // REMOVE
  // ===========================================================================
  it('remove deve realizar soft delete e atualizar histórico', async () => {
    const empSaveMock = jest.fn().mockResolvedValue(undefined);

    // findOne interno do service
    repo.findOne.mockResolvedValue({
      id: 'e1',
      companyId: 'c1',
      active: true,
      save: empSaveMock,
    } as any);

    // último histórico existe
    employeeHistoryRepo.findOne.mockResolvedValue({
      id: 'h1',
      companyId: 'c1',
      employeeId: 'e1',
      active: true,
    } as any);

    await service.remove('c1', 'e1');

    expect(empSaveMock).toHaveBeenCalled();
    expect(repo.softRemove).toHaveBeenCalled();
    expect(employeeHistoryRepo.save).toHaveBeenCalled();
  });

  it('remove deve funcionar mesmo se não houver histórico anterior', async () => {
    const empSaveMock = jest.fn().mockResolvedValue(undefined);

    repo.findOne.mockResolvedValue({
      id: 'e1',
      companyId: 'c1',
      active: true,
      save: empSaveMock,
    } as any);

    employeeHistoryRepo.findOne.mockResolvedValue(null);

    await service.remove('c1', 'e1');

    expect(empSaveMock).toHaveBeenCalled();
    expect(repo.softRemove).toHaveBeenCalled();
    expect(employeeHistoryRepo.save).not.toHaveBeenCalled();
  });
});
