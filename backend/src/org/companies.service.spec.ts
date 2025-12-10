import { Test } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { Branch } from './entities/branch.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repo: jest.Mocked<Repository<Company>>;
  let branchRepo: jest.Mocked<Repository<Branch>>;

  function mockRepo() {
    return {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((e) => e),
      merge: jest.fn((a, b) => ({ ...a, ...b })),
      save: jest.fn((e) => Promise.resolve({ ...e, id: e.id ?? 'generated-id' })),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => {
        const qb: any = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([
            [{ id: 'c1' }], // data
            1,              // total
          ]),
        };
        return qb;
      }),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: getRepositoryToken(Company), useValue: mockRepo() },
        { provide: getRepositoryToken(Branch), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(CompaniesService);
    repo = module.get(getRepositoryToken(Company));
    branchRepo = module.get(getRepositoryToken(Branch));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar empresa e uma filial Matriz', async () => {
    repo.findOne.mockResolvedValueOnce(null); // empresa não existe

    const dto: any = {
      name: 'ZPORT',
      cnpj: '123',
      address: 'Rua A',
      cityId: 'city1',
      zipCode: '68000-000',
    };

    branchRepo.findOne.mockResolvedValue(null); // branch não existe

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(branchRepo.save).toHaveBeenCalled();
    expect(result.name).toBe('ZPORT');
  });

  it('create deve lançar erro se company name já existe', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'c1' } as any);

    await expect(
      service.create({ name: 'ZPORT' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create deve lançar erro se branch com cnpj já existe', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    branchRepo.findOne.mockResolvedValueOnce({ id: 'b1' } as any);

    const dto: any = { name: 'ZPORT', cnpj: '123' };

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  // FIND ALL
  it('findAll deve retornar paginação', async () => {
    // garante que usamos o mock do qb
    const qb = repo.createQueryBuilder();
    (qb.getManyAndCount as jest.Mock).mockResolvedValueOnce([[{ id: 'c1' }], 1]);

    const user: any = {
      id: 'u1',
      level: 4,          // > 3 → cai no branch qb.where('1=1')
      companyId: 'comp1',
    };

    const result = await service.findAll(user, { page: '1', limit: '10' } as any);

    expect(result).toMatchObject({
      data: [{ id: 'c1' }],
      total: 1,
      page: 1,
      limit: 10,
      pageCount: 1,
    });
  });

  // FIND ONE
  it('findOne deve retornar empresa', async () => {
    repo.findOne.mockResolvedValue({ id: 'c1' } as any);

    const result = await service.findOne('c1');

    expect(result).toEqual({ id: 'c1' });
  });

  it('findOne deve lançar erro se não encontrada', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar empresa', async () => {
    repo.findOne
      .mockResolvedValueOnce({ id: 'c1', name: 'Old', companyId: 'c1' } as any)
      .mockResolvedValueOnce(null); // nome não duplicado

    const result = await service.update('c1', { name: 'New' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('New');
  });

  it('update deve lançar erro se nome duplicado', async () => {
    repo.findOne
      .mockResolvedValueOnce({ id: 'c1', name: 'ZPORT' } as any)
      .mockResolvedValueOnce({ id: 'other' } as any);

    await expect(
      service.update('c1', { name: 'OutroNome' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // REMOVE
  it('remove deve deletar empresa', async () => {
    repo.findOne.mockResolvedValue({ id: 'c1' } as any);

    await service.remove('c1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
