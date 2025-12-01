// src/org/entities/role-type.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { RoleType } from './role-type.entity';

describe('RoleType Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "role_types"', () => {
    const table = metadata.tables.find((t) => t.target === RoleType);

    expect(table).toBeDefined();
    expect(table!.name).toBe('role_types');
  });

  it('deve mapear as colunas com nullability correta', () => {
    const columns = metadata.columns.filter((c) => c.target === RoleType);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name (obrigatório)
    expect(byProp['name']).toBeDefined();
    expect(byProp['name'].options.nullable).toBeUndefined();

    // departmentId (obrigatório)
    expect(byProp['departmentId']).toBeDefined();
    expect(byProp['departmentId'].options.nullable).toBeUndefined();
  });

  it('deve mapear as relações ManyToOne com Department e Company corretamente', () => {
    const relations = metadata.relations.filter((r) => r.target === RoleType);
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === RoleType,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // department (RESTRICT, departmentId)
    expect(relByProp['department']).toBeDefined();
    expect(relByProp['department'].relationType).toBe('many-to-one');
    expect(relByProp['department'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['department']).toBeDefined();
    expect(joinByProp['department'].name).toBe('departmentId');

    // company (RESTRICT, companyId – vem do TenantBaseEntity como FK)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');
  });
});
