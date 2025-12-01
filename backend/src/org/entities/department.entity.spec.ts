// src/org/entities/department.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Department } from './department.entity';

describe('Department Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "departments"', () => {
    const table = metadata.tables.find((t) => t.target === Department);

    expect(table).toBeDefined();
    expect(table!.name).toBe('departments');
  });

  it('deve mapear as colunas com nullability correta', () => {
    const columns = metadata.columns.filter((c) => c.target === Department);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name (obrigatório)
    expect(byProp['name']).toBeDefined();
    expect(byProp['name'].options.nullable).toBeUndefined();
  });

  it('deve mapear a relação ManyToOne com Company usando companyId e onDelete RESTRICT', () => {
    const relations = metadata.relations.filter((r) => r.target === Department);
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === Department,
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
  });
});
