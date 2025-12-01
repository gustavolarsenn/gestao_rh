// src/org/entities/role.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Role } from './role.entity';

describe('Role Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "roles"', () => {
    const table = metadata.tables.find((t) => t.target === Role);

    expect(table).toBeDefined();
    expect(table!.name).toBe('roles');
  });

  it('deve mapear as colunas com tipos e nullability corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === Role);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name (obrigatório)
    expect(byProp['name']).toBeDefined();
    expect(byProp['name'].options.nullable).toBeUndefined();

    // departmentId (uuid obrigatório)
    expect(byProp['departmentId']).toBeDefined();
    expect(byProp['departmentId'].options.type).toBe('uuid');
    expect(byProp['departmentId'].options.nullable).toBeUndefined();

    // roleTypeId (uuid obrigatório)
    expect(byProp['roleTypeId']).toBeDefined();
    expect(byProp['roleTypeId'].options.type).toBe('uuid');
    expect(byProp['roleTypeId'].options.nullable).toBeUndefined();

    // defaultWage (numeric opcional)
    expect(byProp['defaultWage']).toBeDefined();
    expect(byProp['defaultWage'].options.type).toBe('numeric');
    expect(byProp['defaultWage'].options.nullable).toBe(true);
  });

  it('deve mapear as relações ManyToOne com RoleType, Department e Company corretamente', () => {
    const relations = metadata.relations.filter((r) => r.target === Role);
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === Role,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // roleType (SET NULL, roleTypeId)
    expect(relByProp['roleType']).toBeDefined();
    expect(relByProp['roleType'].relationType).toBe('many-to-one');
    expect(relByProp['roleType'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['roleType']).toBeDefined();
    expect(joinByProp['roleType'].name).toBe('roleTypeId');

    // department (SET NULL, departmentId)
    expect(relByProp['department']).toBeDefined();
    expect(relByProp['department'].relationType).toBe('many-to-one');
    expect(relByProp['department'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['department']).toBeDefined();
    expect(joinByProp['department'].name).toBe('departmentId');

    // company (RESTRICT, companyId – vem do TenantBaseEntity)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');
  });
});
