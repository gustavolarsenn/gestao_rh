// src/org/entities/company.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Company } from './company.entity';

describe('Company Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "companies"', () => {
    const table = metadata.tables.find((t) => t.target === Company);

    expect(table).toBeDefined();
    expect(table!.name).toBe('companies');
  });

  it('deve mapear as colunas com nullability corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === Company);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name (obrigatório)
    expect(byProp['name']).toBeDefined();
    expect(byProp['name'].options.nullable).toBeUndefined();

    // cnpj (obrigatório)
    expect(byProp['cnpj']).toBeDefined();
    expect(byProp['cnpj'].options.nullable).toBeUndefined();

    // address / addressNumber / zipCode (todas opcionais)
    ['address', 'addressNumber', 'zipCode'].forEach((prop) => {
      expect(byProp[prop]).toBeDefined();
      expect(byProp[prop].options.nullable).toBe(true);
    });

    // cityId (opcional, FK)
    expect(byProp['cityId']).toBeDefined();
    expect(byProp['cityId'].options.nullable).toBe(true);
  });

  it('deve mapear a relação ManyToOne com City usando a coluna cityId', () => {
    const relations = metadata.relations.filter((r) => r.target === Company);
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === Company,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // city (nullable, cityId)
    expect(relByProp['city']).toBeDefined();
    expect(relByProp['city'].relationType).toBe('many-to-one');
    expect(relByProp['city'].options?.nullable).toBe(true);

    expect(joinByProp['city']).toBeDefined();
    expect(joinByProp['city'].name).toBe('cityId');
  });
});
