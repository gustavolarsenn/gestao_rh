// src/career/entities/career-path.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { CareerPath } from './career-path.entity';

describe('CareerPath Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "career_paths"', () => {
    const table = metadata.tables.find((t) => t.target === CareerPath);

    expect(table).toBeDefined();
    expect(table!.name).toBe('career_paths');
  });

  it('deve ter a unique constraint "uq_career_path_edge" com as colunas corretas', () => {
    const unique = metadata.uniques.find(
      (u) => u.target === CareerPath && u.name === 'uq_career_path_edge',
    );

    expect(unique).toBeDefined();
    // As colunas são exatamente as que você passou no decorator @Unique
    expect(unique!.columns).toEqual([
      'companyId',
      'department',
      'currentRoleId',
      'nextRoleId',
    ]);
  });

  it('deve mapear as colunas com tipos e defaults corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === CareerPath);
    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name
    expect(byProp['name']).toBeDefined();
    expect(
    byProp['name'].options.type === String ||
    byProp['name'].options.type === 'varchar' ||
    byProp['name'].options.type === undefined
    ).toBe(true);

    // description
    expect(byProp['description']).toBeDefined();
    expect(byProp['description'].options.type).toBe('text');
    expect(byProp['description'].options.nullable).toBe(true);

    // currentRoleId
    expect(byProp['currentRoleId']).toBeDefined();
    expect(byProp['currentRoleId'].options.type).toBe('uuid');

    // nextRoleId
    expect(byProp['nextRoleId']).toBeDefined();
    expect(byProp['nextRoleId'].options.type).toBe('uuid');

    // sortOrder
    expect(byProp['sortOrder']).toBeDefined();
    expect(byProp['sortOrder'].options.type).toBe('int');
    expect(byProp['sortOrder'].options.default).toBe(0);

    // isEntryPoint
    expect(byProp['isEntryPoint']).toBeDefined();
    expect(byProp['isEntryPoint'].options.default).toBe(false);
  });

  it('deve mapear as relações ManyToOne com join columns e onDelete "RESTRICT"', () => {
    const relations = metadata.relations.filter(
      (r) => r.target === CareerPath,
    );
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === CareerPath,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // company
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');

    // department
    expect(relByProp['department']).toBeDefined();
    expect(relByProp['department'].relationType).toBe('many-to-one');
    expect(relByProp['department'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['department']).toBeDefined();
    expect(joinByProp['department'].name).toBe('departmentId');

    // currentRole
    expect(relByProp['currentRole']).toBeDefined();
    expect(relByProp['currentRole'].relationType).toBe('many-to-one');
    expect(relByProp['currentRole'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['currentRole']).toBeDefined();
    expect(joinByProp['currentRole'].name).toBe('currentRoleId');

    // nextRole
    expect(relByProp['nextRole']).toBeDefined();
    expect(relByProp['nextRole'].relationType).toBe('many-to-one');
    expect(relByProp['nextRole'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['nextRole']).toBeDefined();
    expect(joinByProp['nextRole'].name).toBe('nextRoleId');
  });
});
