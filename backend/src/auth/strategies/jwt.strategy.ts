import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { EmployeesService } from '../../hr/employees.service';

export type JwtPayload = { sub: string; companyId: string; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    cfg: ConfigService,
    private usersService: UsersService,
    private employeesService: EmployeesService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET', 'dev'),
    });
  }

  async validate(payload: any) {
      // payload vem do que você colocou no token em auth.service.ts
      const user = await this.usersService.findOne(payload.companyId, payload.sub);
      let employee;
      try {
        employee = await this.employeesService.findOneByPersonId(user.companyId, user.person.id);
      } catch {
        employee = null;
      }

      return {
        id: user.id,
        teamId: employee ? employee.teamId : null,
        employeeId: employee ? employee.id : null,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        role: user.role?.name ?? null,
        level: user.role?.level ?? null
      };
    } 
}
