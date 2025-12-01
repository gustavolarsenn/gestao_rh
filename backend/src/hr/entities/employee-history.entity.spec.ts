// src/employee/entities/employee-history.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { EmployeeHistory } from './employee-history.entity';

describe('EmployeeHistory Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "employee_histories"', () => {
    const table = metadata.tables.find((t) => t.target === EmployeeHistory);

    expect(table).toBeDefined();
    expect(table!.name).toBe('employee_histories');
  });

  it('deve mapear as colunas com tipos e nullability corretos', () => {
    const columns = metadata.columns.filter((c) => c.target === EmployeeHistory);

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // employeeId
    expect(byProp['employeeId']).toBeDefined();
    expect(byProp['employeeId'].options.type).toBe('uuid');
    expect(byProp['employeeId'].options.nullable).toBeUndefined(); // not nullable

    // roleId / roleTypeId / teamId / departmentId / branchId
    ['roleId', 'roleTypeId', 'teamId', 'departmentId', 'branchId'].forEach(
      (prop) => {
        expect(byProp[prop]).toBeDefined();
        expect(byProp[prop].options.type).toBe('uuid');
        expect(byProp[prop].options.nullable).toBe(true);
      },
    );

    // wage
    expect(byProp['wage']).toBeDefined();
    expect(byProp['wage'].options.type).toBe('numeric');
    expect(byProp['wage'].options.nullable).toBe(true);

    // hiringDate
    expect(byProp['hiringDate']).toBeDefined();
    expect(byProp['hiringDate'].options.type).toBe('date');
    expect(byProp['hiringDate'].options.nullable).toBeUndefined();

    // departureDate
    expect(byProp['departureDate']).toBeDefined();
    expect(byProp['departureDate'].options.type).toBe('date');
    expect(byProp['departureDate'].options.nullable).toBe(true);

    // startDate
    expect(byProp['startDate']).toBeDefined();
    expect(byProp['startDate'].options.type).toBe('date');
    expect(byProp['startDate'].options.nullable).toBeUndefined();

    // endDate
    expect(byProp['endDate']).toBeDefined();
    expect(byProp['endDate'].options.type).toBe('date');
    expect(byProp['endDate'].options.nullable).toBe(true);
  });

  it('deve mapear as relações ManyToOne com join columns e onDelete corretos', () => {
    const relations = metadata.relations.filter(
      (r) => r.target === EmployeeHistory,
    );
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === EmployeeHistory,
    );

    const relByProp: Record<string, (typeof relations)[number]> = {};
    relations.forEach((r) => {
      relByProp[r.propertyName] = r;
    });

    const joinByProp: Record<string, (typeof joinColumns)[number]> = {};
    joinColumns.forEach((j) => {
      joinByProp[j.propertyName] = j;
    });

    // employee (CASCADE, employeeId)
    expect(relByProp['employee']).toBeDefined();
    expect(relByProp['employee'].relationType).toBe('many-to-one');
    expect(relByProp['employee'].options?.onDelete).toBe('CASCADE');

    expect(joinByProp['employee']).toBeDefined();
    expect(joinByProp['employee'].name).toBe('employeeId');

    // role (SET NULL, roleId)
    expect(relByProp['role']).toBeDefined();
    expect(relByProp['role'].relationType).toBe('many-to-one');
    expect(relByProp['role'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['role']).toBeDefined();
    expect(joinByProp['role'].name).toBe('roleId');

    // roleType (SET NULL, roleTypeId)
    expect(relByProp['roleType']).toBeDefined();
    expect(relByProp['roleType'].relationType).toBe('many-to-one');
    expect(relByProp['roleType'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['roleType']).toBeDefined();
    expect(joinByProp['roleType'].name).toBe('roleTypeId');

    // team (SET NULL, teamId)
    expect(relByProp['team']).toBeDefined();
    expect(relByProp['team'].relationType).toBe('many-to-one');
    expect(relByProp['team'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['team']).toBeDefined();
    expect(joinByProp['team'].name).toBe('teamId');

    // department (SET NULL, departmentId)
    expect(relByProp['department']).toBeDefined();
    expect(relByProp['department'].relationType).toBe('many-to-one');
    expect(relByProp['department'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['department']).toBeDefined();
    expect(joinByProp['department'].name).toBe('departmentId');

    // branch (SET NULL, branchId)
    expect(relByProp['branch']).toBeDefined();
    expect(relByProp['branch'].relationType).toBe('many-to-one');
    expect(relByProp['branch'].options?.onDelete).toBe('SET NULL');

    expect(joinByProp['branch']).toBeDefined();
    expect(joinByProp['branch'].name).toBe('branchId');

    // company (RESTRICT, companyId - vem do TenantBaseEntity)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');
  });
});
