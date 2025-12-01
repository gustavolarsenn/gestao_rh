// src/users/entities/user.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { User } from './user.entity';

describe('User Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "users"', () => {
    const table = metadata.tables.find((t) => t.target === User);

    expect(table).toBeDefined();
    expect(table!.name).toBe('users');
  });

  it('deve mapear as colunas com nullability correta', () => {
    const columns = metadata.columns.filter((c) => c.target === User);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name (obrigatório)
    expect(byProp['name']).toBeDefined();
    expect(byProp['name'].options.nullable).toBeUndefined();

    // email (opcional)
    expect(byProp['email']).toBeDefined();
    expect(byProp['email'].options.nullable).toBe(true);

    // passwordHash (obrigatório)
    expect(byProp['passwordHash']).toBeDefined();
    expect(byProp['passwordHash'].options.nullable).toBeUndefined();

    // personId (obrigatório)
    expect(byProp['personId']).toBeDefined();
    expect(byProp['personId'].options.nullable).toBeUndefined();

    // userRoleId (opcional)
    expect(byProp['userRoleId']).toBeDefined();
    expect(byProp['userRoleId'].options.nullable).toBe(true);
  });

  it('deve mapear as relações com Person, Company e UserRole corretamente', () => {
    const relations = metadata.relations.filter((r) => r.target === User);
    const joinColumns = metadata.joinColumns.filter((j) => j.target === User);

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // person (OneToOne, RESTRICT, personId)
    expect(relByProp['person']).toBeDefined();
    expect(relByProp['person'].relationType).toBe('one-to-one');
    expect(relByProp['person'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['person']).toBeDefined();
    expect(joinByProp['person'].name).toBe('personId');

    // company (ManyToOne, RESTRICT, companyId)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');

    // role (ManyToOne, nullable, eager, userRoleId)
    expect(relByProp['role']).toBeDefined();
    expect(relByProp['role'].relationType).toBe('many-to-one');
    expect(relByProp['role'].options?.nullable).toBe(true);
    expect(relByProp['role'].options?.eager).toBe(true);

    expect(joinByProp['role']).toBeDefined();
    expect(joinByProp['role'].name).toBe('userRoleId');
  });
});
