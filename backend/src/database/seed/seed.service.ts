import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserRole } from '../../users/entities/user-role.entity';
import { Company } from '../../org/entities/company.entity';
import { Branch } from '../../org/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { State } from '../../geo/entities/state.entity';
import { City } from '../../geo/entities/city.entity';
import { Person } from '../../person/entities/person.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    console.log('🚀 Executando seed inicial...');
    const initialPassword = process.env.SUPER_ADMIN_INITIAL_PASSWORD || '123456';

    await this.dataSource.transaction(async (manager) => {
      // ============================================================
      // 1️⃣ ROLES PADRÃO
      // ============================================================
      const roles = [
        { name: 'superAdmin', description: 'Acesso total ao sistema', level: 4 },
        { name: 'admin', description: 'Gerencia filiais e usuários da empresa', level: 3 },
        { name: 'gestor', description: 'Acompanha performance e relatórios', level: 2 },
        { name: 'usuario', description: 'Usuário comum', level: 1 },
      ];

      for (const role of roles) {
        const exists = await manager.findOne(UserRole, { where: { name: role.name } });
        if (!exists) {
          await manager.save(UserRole, role);
          console.log(`✅ Role "${role.name}" criada.`);
        }
      }

      // ============================================================
      // 2️⃣ ESTADO PADRÃO - São Paulo
      // ============================================================
      let state = await manager.findOne(State, { where: { uf: 'SP' } });

      if (!state) {
        state = manager.create(State, {
          name: 'São Paulo',
          uf: 'SP',
        });
        await manager.save(state);
        console.log('✅ Estado padrão "São Paulo (SP)" criado.');
      }

      // ============================================================
      // 3️⃣ CIDADE PADRÃO - São Paulo
      // ============================================================
      let city = await manager.findOne(City, { where: { name: 'São Paulo', state: { id: state.id } }, relations: ['state'] });

      if (!city) {
        city = manager.create(City, {
          name: 'São Paulo',
          state,
        });
        await manager.save(city);
        console.log('✅ Cidade padrão "São Paulo" criada.');
      }

      // ============================================================
      // 4️⃣ EMPRESA PADRÃO
      // ============================================================
      let company = await manager.findOne(Company, { where: { cnpj: '00.000.000/0001-00' } });

      if (!company) {
        company = manager.create(Company, {
          name: 'Empresa Padrão',
          cnpj: '00.000.000/0001-00',
          zipCode: '01000-000',
          address: 'Av. Paulista',
          addressNumber: '1000',
          cityId: city.id, // 👈 agora é UUID real da cidade criada
        });
        await manager.save(company);
        console.log('✅ Empresa padrão criada.');
      }

      // ============================================================
      // 5️⃣ FILIAL MATRIZ
      // ============================================================
      let branch = await manager.findOne(Branch, {
        where: { name: 'Matriz', company: { id: company.id } },
        relations: ['company'],
      });

      if (!branch) {
        branch = manager.create(Branch, {
          name: 'Matriz',
          cnpj: company.cnpj,
          zipCode: company.zipCode,
          address: company.address,
          addressNumber: company.addressNumber,
          city: { id: city.id },
          company,
        });
        await manager.save(branch);
        console.log('✅ Filial "Matriz" criada.');
      }


      // ============================================================
      // 6️⃣ PESSOA SUPERADMIN INICIAL
      // ============================================================
      let person = await manager.findOne(Person, {
        where: { cpf: '000.000.000-00', company: { id: company.id } },
        relations: ['company'],
      });

      if (!person) {
        person = manager.create(Person, {
          name: 'Super Admin',
          email: 'super@admin.com',
          cpf: '000.000.000-00',
          company,
        });
        await manager.save(person);
        console.log('✅ Pessoa superAdmin criada:');
        console.log('   E-mail: super@admin.com');
      }
      // ============================================================
      // 7️⃣ USUÁRIO SUPERADMIN INICIAL
      // ============================================================
      const existingUser = await manager.findOne(User, {
        where: { email: 'super@admin.com' },
      });

      if (!existingUser) {
        const superRole = await manager.findOne(UserRole, { where: { name: 'superAdmin' } });
        const passwordHash = await bcrypt.hash(initialPassword, 10);

        const user = manager.create(User, {
          name: 'Super Admin',
          email: 'super@admin.com',
          passwordHash: passwordHash,
          role: superRole!,
          // personId: person!.id,
          person,
          company,
          branch,
        });

        await manager.save(user);

        console.log('✅ Usuário superAdmin criado:');
        console.log('   E-mail: super@admin.com');
      }
    });

    console.log('🎯 Seed concluído com sucesso!');
  }
}
