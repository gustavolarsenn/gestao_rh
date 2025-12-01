// src/employee/entities/employee.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Employee } from './employee.entity';

describe('Employee Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "employees"', () => {
    const table = metadata.tables.find((t) => t.target === Employee);

    expect(table).toBeDefined();
    expect(table!.name).toBe('employees');
  });

  it('deve mapear as colunas com tipos e nullability corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === Employee);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // personId
    expect(byProp['personId']).toBeDefined();
    expect(
    byProp['personId'].options.type === String ||
    byProp['personId'].options.type === 'varchar' ||
    byProp['personId'].options.type === undefined
    ).toBe(true);
    expect(byProp['personId'].options.nullable).toBeUndefined();

    // UUID opcionais
    ['roleId', 'roleTypeId', 'teamId', 'userId', 'departmentId', 'branchId'].forEach(
      (prop) => {
        expect(byProp[prop]).toBeDefined();
        expect(byProp[prop].options.type).toBe('uuid');
        expect(byProp[prop].options.nullable).toBe(true);
      },
    );

    // wage
    expect(byProp['wage']).toBeDefined();
    expect(byProp['wage'].options.type).toBe('numeric');
    expect(byProp['wage'].options.nullable).toBe(true);

    // hiringDate (obrigatório)
    expect(byProp['hiringDate']).toBeDefined();
    expect(byProp['hiringDate'].options.type).toBe('date');
    expect(byProp['hiringDate'].options.nullable).toBeUndefined();

    // departureDate (opcional)
    expect(byProp['departureDate']).toBeDefined();
    expect(byProp['departureDate'].options.type).toBe('date');
    expect(byProp['departureDate'].options.nullable).toBe(true);
  });

  it('deve mapear as relações ManyToOne com join columns e onDelete corretos', () => {
    const relations = metadata.relations.filter(
      (r) => r.target === Employee,
    );
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === Employee,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // person (RESTRICT, personId)
    expect(relByProp['person']).toBeDefined();
    expect(relByProp['person'].relationType).toBe('many-to-one');
    expect(relByProp['person'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['person']).toBeDefined();
    expect(joinByProp['person'].name).toBe('personId');

    // role (SET NULL, roleId)
    expect(relByProp['role']).toBeDefined();
    expect(relByProp['role'].relationType).toBe('many-to-one');
    expect(relByProp['role'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['role']).toBeDefined();
    expect(joinByProp['role'].name).toBe('roleId');

    // roleType (SET NULL, roleTypeId)
    expect(relByProp['roleType']).toBeDefined();
    expect(relByProp['roleType'].relationType).toBe('many-to-one');
    expect(relByProp['roleType'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['roleType']).toBeDefined();
    expect(joinByProp['roleType'].name).toBe('roleTypeId');

    // team (SET NULL, teamId)
    expect(relByProp['team']).toBeDefined();
    expect(relByProp['team'].relationType).toBe('many-to-one');
    expect(relByProp['team'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['team']).toBeDefined();
    expect(joinByProp['team'].name).toBe('teamId');

    // user (SET NULL, userId)
    expect(relByProp['user']).toBeDefined();
    expect(relByProp['user'].relationType).toBe('many-to-one');
    expect(relByProp['user'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['user']).toBeDefined();
    expect(joinByProp['user'].name).toBe('userId');

    // department (SET NULL, departmentId)
    expect(relByProp['department']).toBeDefined();
    expect(relByProp['department'].relationType).toBe('many-to-one');
    expect(relByProp['department'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['department']).toBeDefined();
    expect(joinByProp['department'].name).toBe('departmentId');

    // branch (SET NULL, branchId)
    expect(relByProp['branch']).toBeDefined();
    expect(relByProp['branch'].relationType).toBe('many-to-one');
    expect(relByProp['branch'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['branch']).toBeDefined();
    expect(joinByProp['branch'].name).toBe('branchId');

    // company (RESTRICT, companyId - herança de TenantBaseEntity)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');
  });
});
