// src/performance/entities/performance-review.entity.spec.ts
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { PerformanceReview } from './performance-review.entity';

describe('PerformanceReview Entity mapping', () => {
  const metadata = getMetadataArgsStorage();

  it('deve estar mapeada para a tabela "performance_reviews"', () => {
    const table = metadata.tables.find((t) => t.target === PerformanceReview);

    expect(table).toBeDefined();
    expect(table!.name).toBe('performance_reviews');
  });

  it('deve mapear as colunas com tipos e nullability corretos', () => {
    const columns = metadata.columns.filter(
      (c) => c.target === PerformanceReview,
    );

    const byProp: Record<string, (typeof columns)[number]> = {};
    columns.forEach((c) => {
      byProp[c.propertyName] = c;
    });

    // employeeId (uuid obrigatório)
    expect(byProp['employeeId']).toBeDefined();
    expect(byProp['employeeId'].options.type).toBe('uuid');
    expect(byProp['employeeId'].options.nullable).toBeUndefined();

    // leaderId (uuid obrigatório)
    expect(byProp['leaderId']).toBeDefined();
    expect(byProp['leaderId'].options.type).toBe('uuid');
    expect(byProp['leaderId'].options.nullable).toBeUndefined();

    // observation (texto opcional)
    expect(byProp['observation']).toBeDefined();
    expect(byProp['observation'].options.type).toBe('text');
    expect(byProp['observation'].options.nullable).toBe(true);

    // date (date obrigatório)
    expect(byProp['date']).toBeDefined();
    expect(byProp['date'].options.type).toBe('date');
    expect(byProp['date'].options.nullable).toBeUndefined();

    // employeeToLeader (boolean opcional)
    expect(byProp['employeeToLeader']).toBeDefined();
    expect(byProp['employeeToLeader'].options.nullable).toBe(true);
  });

  it('deve mapear as relações ManyToOne com Employee (employee, leader) e Company corretamente', () => {
    const relations = metadata.relations.filter(
      (r) => r.target === PerformanceReview,
    );
    const joinColumns = metadata.joinColumns.filter(
      (j) => j.target === PerformanceReview,
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

    // leader (RESTRICT, leaderId)
    expect(relByProp['leader']).toBeDefined();
    expect(relByProp['leader'].relationType).toBe('many-to-one');
    expect(relByProp['leader'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['leader']).toBeDefined();
    expect(joinByProp['leader'].name).toBe('leaderId');

    // company (RESTRICT, companyId – herdada de TenantBaseEntity)
    expect(relByProp['company']).toBeDefined();
    expect(relByProp['company'].relationType).toBe('many-to-one');
    expect(relByProp['company'].options?.onDelete).toBe('RESTRICT');

    expect(joinByProp['company']).toBeDefined();
    expect(joinByProp['company'].name).toBe('companyId');
  });
});
