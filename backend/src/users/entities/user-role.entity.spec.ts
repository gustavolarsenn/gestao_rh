// src/users/entities/user-role.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { UserRole } from './user-role.entity';

describe('UserRole Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "user_roles"', () => {
    const table = metadata.tables.find((t) => t.target === UserRole);

    expect(table).toBeDefined();
    expect(table!.name).toBe('user_roles');
  });

  it('deve mapear as colunas com nullability correta', () => {
    const columns = metadata.columns.filter((c) => c.target === UserRole);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // name (obrigatório)
    expect(byProp['name']).toBeDefined();
    expect(byProp['name'].options.nullable).toBeUndefined();

    // description (obrigatório)
    expect(byProp['description']).toBeDefined();
    expect(byProp['description'].options.nullable).toBeUndefined();

    // level (obrigatório, tipo numérico)
    expect(byProp['level']).toBeDefined();
    expect(byProp['level'].options.nullable).toBeUndefined();
  });

  it('deve mapear a relação OneToMany "users"', () => {
    const relations = metadata.relations.filter(
      (r) => r.target === UserRole,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    expect(relByProp['users']).toBeDefined();
    expect(relByProp['users'].relationType).toBe('one-to-many');
  });
});
