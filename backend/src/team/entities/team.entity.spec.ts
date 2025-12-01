// src/team/entities/team.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Team } from './team.entity';

describe('Team Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "teams"', () => {
    const table = metadata.tables.find((t) => t.target === Team);

    expect(table).toBeDefined();
    expect(table!.name).toBe('teams');
  });

  it('deve mapear as colunas com tipos e nullability corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === Team);

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

    // parentTeamId (uuid opcional)
    expect(byProp['parentTeamId']).toBeDefined();
    expect(byProp['parentTeamId'].options.type).toBe('uuid');
    expect(byProp['parentTeamId'].options.nullable).toBe(true);
  });

  it('deve mapear a relação ManyToOne com Company usando companyId e onDelete RESTRICT', () => {
    const relations = metadata.relations.filter((r) => r.target === Team);
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === Team,
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
