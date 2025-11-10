// src/common/utils/scoped-query.util.ts
import { ForbiddenException } from '@nestjs/common';
import { FindOperator } from 'typeorm';

// Define a base interface para entidades com escopo
export interface ScopedEntity {
  companyId?: string;
  teamId?: string;
  employeeId?: string;
  departmentId?: string;
}

// Define as opções de escopo
interface ScopeOptions {
  company?: boolean;
  team?: boolean;
  employee?: boolean;
  department?: boolean;
}

/**
 * Aplica automaticamente o escopo de visibilidade baseado no papel do usuário.
 * Funciona com qualquer entidade TypeORM, inclusive quando usa FindOperators (Between, In, Like, etc.).
 */
export function applyScope<
  T extends Record<string, any> = Record<string, any>
>(
  user: any,
  baseWhere: Partial<T> = {},
  options: ScopeOptions = { company: true, team: true, employee: true, department: true },
  entity: string = '',
): Partial<T> {
  const where: Record<string, any> = { ...baseWhere };

  switch (user.role) {
    case 'superAdmin':
      return where as Partial<T>;

    case 'admin':
      if (options.company) where.companyId = user.companyId;
      break;

    case 'gestor':
      if (options.company) where.companyId = user.companyId;
      if (options.team) {
        if (entity === 'team') where.id = user.teamId;
        else where.teamId = user.teamId;
      }
      if (options.department){
        if (entity === 'department') where.id = user.departmentId;
        else where.departmentId = user.departmentId;
      }
      break;

    case 'usuario':
      if (options.company) where.companyId = user.companyId;
      if (options.employee) where.employeeId = user.employeeId;
      break;

    default:
      throw new ForbiddenException('Role não autorizada');
  }

  return where as Partial<T>;
}
