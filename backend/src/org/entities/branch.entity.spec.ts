// src/org/entities/branch.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Branch } from './branch.entity';

describe('Branch Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "branches"', () => {
    const table = metadata.tables.find((t) => t.target === Branch);

    expect(table).toBeDefined();
    expect(table!.name).toBe('branches');
  });

  it('deve mapear as colunas com nullability corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === Branch);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name (obrigatório)
    expect(byProp['name']).toBeDefined();
    expect(byProp['name'].options.nullable).toBeUndefined();

    // openingDate (date, opcional)
    expect(byProp['openingDate']).toBeDefined();
    expect(byProp['openingDate'].options.type).toBe('date');
    expect(byProp['openingDate'].options.nullable).toBe(true);

    // cnpj (obrigatório)
    expect(byProp['cnpj']).toBeDefined();
    expect(byProp['cnpj'].options.nullable).toBeUndefined();

    // address / addressNumber / zipCode (todas opcionais)
    ['address', 'addressNumber', 'zipCode'].forEach((prop) => {
      expect(byProp[prop]).toBeDefined();
      expect(byProp[prop].options.nullable).toBe(true);
    });
  });

  it('deve mapear as relações ManyToOne com join columns e opções corretas', () => {
    const relations = metadata.relations.filter((r) => r.target === Branch);
    const joinColumns = metadata.joinColumns.filter((j) => j.target === Branch);

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // company (RESTRICT, companyId)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');

    // city (nullable true, cityId)
    expect(relByProp['city']).toBeDefined();
    expect(relByProp['city'].relationType).toBe('many-to-one');
    expect(relByProp['city'].options?.nullable).toBe(true);

    expect(joinByProp['city']).toBeDefined();
    expect(joinByProp['city'].name).toBe('cityId');
  });
});
