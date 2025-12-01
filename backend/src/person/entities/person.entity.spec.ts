// src/person/entities/person.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Person } from './person.entity';

describe('Person Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "persons"', () => {
    const table = metadata.tables.find((t) => t.target === Person);

    expect(table).toBeDefined();
    expect(table!.name).toBe('persons');
  });

  it('deve mapear as colunas com tipos e nullability corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === Person);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name (obrigatório)
    expect(byProp['name']).toBeDefined();
    expect(byProp['name'].options.nullable).toBeUndefined();

    // email (obrigatório)
    expect(byProp['email']).toBeDefined();
    expect(byProp['email'].options.nullable).toBeUndefined();

    // birthDate (date, opcional)
    expect(byProp['birthDate']).toBeDefined();
    expect(byProp['birthDate'].options.type).toBe('date');
    expect(byProp['birthDate'].options.nullable).toBe(true);

    // phone / address / addressNumber / zipCode (todas opcionais)
    ['phone', 'address', 'addressNumber', 'zipCode'].forEach((prop) => {
      expect(byProp[prop]).toBeDefined();
      expect(byProp[prop].options.nullable).toBe(true);
    });

    // cpf (obrigatório)
    expect(byProp['cpf']).toBeDefined();
    expect(byProp['cpf'].options.nullable).toBeUndefined();

    // cityId (uuid opcional)
    expect(byProp['cityId']).toBeDefined();
    expect(byProp['cityId'].options.type).toBe('uuid');
    expect(byProp['cityId'].options.nullable).toBe(true);
  });

  it('deve mapear as relações ManyToOne com City e Company corretamente', () => {
    const relations = metadata.relations.filter((r) => r.target === Person);
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === Person,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // city (SET NULL, cityId)
    expect(relByProp['city']).toBeDefined();
    expect(relByProp['city'].relationType).toBe('many-to-one');
    expect(relByProp['city'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['city']).toBeDefined();
    expect(joinByProp['city'].name).toBe('cityId');

    // company (RESTRICT, companyId – vem do TenantBaseEntity)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');
  });
});
