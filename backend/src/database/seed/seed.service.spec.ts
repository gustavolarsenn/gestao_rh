import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { SeedService } from './seed.service';
import { UserRole } from '../../users/entities/user-role.entity';
import { State } from '../../geo/entities/state.entity';
import { City } from '../../geo/entities/city.entity';
import { Company } from '../../org/entities/company.entity';
import { Branch } from '../../org/entities/branch.entity';
import { Person } from '../../person/entities/person.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../team/entities/team.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('SeedService', () => {
  let service: SeedService;
  let dataSource: { transaction: jest.Mock };
  let manager: any;

  const consoleLogSpy = jest
    .spyOn(global.console, 'log')
    .mockImplementation(() => {});

  beforeEach(async () => {
    manager = {
      findOne: jest.fn().mockImplementation(async (entity: any, options: any) => {
        // padrão: nada existe, força criação de tudo
        return null;
      }),
      create: jest.fn((entity: any, data: any) => ({ ...data })),
      save: jest.fn(async (entityOrTarget: any, maybeEntity?: any) => {
        // TypeORM permite save(EntityClass, data) ou save(entity)
        if (maybeEntity) {
          return { id: `${maybeEntity.name || 'generated'}-id`, ...maybeEntity };
        }
        return { id: `${entityOrTarget.name || 'generated'}-id`, ...entityOrTarget };
      }),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => cb(manager)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = moduleRef.get(SeedService);
    (bcrypt.hash as jest.Mock).mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('deve executar seed inicial criando roles, estado, cidade, empresa, filial, time, pessoa e usuário', async () => {
    process.env.SUPER_ADMIN_INITIAL_PASSWORD = 'minha-senha-123';

    await service.onApplicationBootstrap();

    // garante que rodou dentro de transação
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);

    // Roles padrão devem ter sido salvas
    expect(manager.save).toHaveBeenCalledWith(
      UserRole,
      expect.objectContaining({ name: 'superAdmin' }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      UserRole,
      expect.objectContaining({ name: 'admin' }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      UserRole,
      expect.objectContaining({ name: 'gestor' }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      UserRole,
      expect.objectContaining({ name: 'usuario' }),
    );

    // Estado SP
    expect(manager.create).toHaveBeenCalledWith(State, {
      name: 'São Paulo',
      uf: 'SP',
    });

    // Cidade São Paulo
    expect(manager.create).toHaveBeenCalledWith(
      City,
      expect.objectContaining({
        name: 'São Paulo',
      }),
    );

    // Empresa padrão
    expect(manager.create).toHaveBeenCalledWith(
      Company,
      expect.objectContaining({
        name: 'Empresa Padrão',
        cnpj: '00.000.000/0001-00',
      }),
    );

    // Filial Matriz
    expect(manager.create).toHaveBeenCalledWith(
      Branch,
      expect.objectContaining({
        name: 'Matriz',
      }),
    );

    // Time padrão
    expect(manager.create).toHaveBeenCalledWith(
      Team,
      expect.objectContaining({
        name: 'Time Padrão',
      }),
    );

    // Pessoa super admin
    expect(manager.create).toHaveBeenCalledWith(
      Person,
      expect.objectContaining({
        name: 'Super Admin',
        email: 'super@admin.com',
      }),
    );

    // Usuário super admin
    expect(bcrypt.hash).toHaveBeenCalledWith('minha-senha-123', 10);
    expect(manager.create).toHaveBeenCalledWith(
      User,
      expect.objectContaining({
        name: 'Super Admin',
        email: 'super@admin.com',
      }),
    );
  });

  it('deve usar senha padrão 123456 se SUPER_ADMIN_INITIAL_PASSWORD não estiver definida', async () => {
    delete process.env.SUPER_ADMIN_INITIAL_PASSWORD;

    await service.onApplicationBootstrap();

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
  });
});
