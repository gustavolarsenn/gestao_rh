// src/team/entities/team-member.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { TeamMember } from './team-member.entity';

describe('TeamMember Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "team_members"', () => {
    const table = metadata.tables.find((t) => t.target === TeamMember);

    expect(table).toBeDefined();
    expect(table!.name).toBe('team_members');
  });

  it('deve ter unique constraint "uq_team_member_period" em [teamId, employeeId, startDate]', () => {
    const uniques = metadata.uniques.filter((u) => u.target === TeamMember);

    expect(uniques.length).toBeGreaterThan(0);

    const unique = uniques.find((u) => u.name === 'uq_team_member_period');
    expect(unique).toBeDefined();
    expect(unique!.columns).toEqual(
      expect.arrayContaining(['teamId', 'employeeId', 'startDate']),
    );
    expect(unique!.columns!.length).toBe(3);
  });

  it('deve mapear as colunas com tipos, defaults e nullability corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === TeamMember);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // teamId (uuid obrigatório)
    expect(byProp['teamId']).toBeDefined();
    expect(byProp['teamId'].options.type).toBe('uuid');
    expect(byProp['teamId'].options.nullable).toBeUndefined();

    // employeeId (uuid obrigatório)
    expect(byProp['employeeId']).toBeDefined();
    expect(byProp['employeeId'].options.type).toBe('uuid');
    expect(byProp['employeeId'].options.nullable).toBeUndefined();

    // parentTeamId (uuid opcional)
    expect(byProp['parentTeamId']).toBeDefined();
    expect(byProp['parentTeamId'].options.type).toBe('uuid');
    expect(byProp['parentTeamId'].options.nullable).toBe(true);

    // isLeader (boolean com default false)
    expect(byProp['isLeader']).toBeDefined();
    expect(byProp['isLeader'].options.default).toBe(false);

    // startDate (date obrigatório)
    expect(byProp['startDate']).toBeDefined();
    expect(byProp['startDate'].options.type).toBe('date');
    expect(byProp['startDate'].options.nullable).toBeUndefined();

    // endDate (date opcional)
    expect(byProp['endDate']).toBeDefined();
    expect(byProp['endDate'].options.type).toBe('date');
    expect(byProp['endDate'].options.nullable).toBe(true);

    // isHierarchyEdge (boolean com default false)
    expect(byProp['isHierarchyEdge']).toBeDefined();
    expect(byProp['isHierarchyEdge'].options.type).toBe('boolean');
    expect(byProp['isHierarchyEdge'].options.default).toBe(false);
  });

  it('deve mapear as relações ManyToOne com Team, Employee, parentTeam e Company corretamente', () => {
    const relations = metadata.relations.filter(
      (r) => r.target === TeamMember,
    );
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === TeamMember,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // team (CASCADE, teamId)
    expect(relByProp['team']).toBeDefined();
    expect(relByProp['team'].relationType).toBe('many-to-one');
    expect(relByProp['team'].options?.onDelete).toBe('CASCADE');

    expect(joinByProp['team']).toBeDefined();
    expect(joinByProp['team'].name).toBe('teamId');

    // employee (CASCADE, employeeId)
    expect(relByProp['employee']).toBeDefined();
    expect(relByProp['employee'].relationType).toBe('many-to-one');
    expect(relByProp['employee'].options?.onDelete).toBe('CASCADE');

    expect(joinByProp['employee']).toBeDefined();
    expect(joinByProp['employee'].name).toBe('employeeId');

    // parentTeam (SET NULL, parentTeamId)
    expect(relByProp['parentTeam']).toBeDefined();
    expect(relByProp['parentTeam'].relationType).toBe('many-to-one');
    expect(relByProp['parentTeam'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['parentTeam']).toBeDefined();
    expect(joinByProp['parentTeam'].name).toBe('parentTeamId');

    // company (RESTRICT, companyId – vem do TenantBaseEntity)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');
  });
});
