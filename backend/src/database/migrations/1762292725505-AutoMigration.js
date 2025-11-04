/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AutoMigration1762292725505 {
    name = 'AutoMigration1762292725505'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "name" character varying NOT NULL, "uf" character varying(2) NOT NULL, CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "openingDate" date, "cnpj" character varying NOT NULL, "address" character varying, "addressNumber" character varying, "zipCode" character varying, "cityId" uuid, CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "name" character varying NOT NULL, "stateId" uuid NOT NULL, CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "name" character varying NOT NULL, "cnpj" character varying NOT NULL, "address" character varying, "addressNumber" character varying, "zipCode" character varying, "cityId" uuid, CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "name" character varying NOT NULL, "description" character varying NOT NULL, "level" integer NOT NULL, CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "persons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "birthDate" date, "phone" character varying, "address" character varying, "addressNumber" character varying, "zipCode" character varying, "cpf" character varying NOT NULL, "cityId" uuid, CONSTRAINT "PK_74278d8812a049233ce41440ac7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying, "passwordHash" character varying NOT NULL, "personId" uuid NOT NULL, "userRoleId" uuid, CONSTRAINT "REL_ddd0d20e45dbd0d1536dc08203" UNIQUE ("personId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "parentTeamId" uuid, CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "departmentId" uuid NOT NULL, CONSTRAINT "PK_31e81d4897da311d67372a5c077" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "departmentId" uuid NOT NULL, "roleTypeId" uuid NOT NULL, "defaultWage" numeric, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "personId" uuid NOT NULL, "roleId" uuid, "roleTypeId" uuid, "teamId" uuid, "userId" uuid, "departmentId" uuid, "branchId" uuid, "wage" numeric, "hiringDate" date, "departureDate" date, CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "teamId" uuid NOT NULL, "employeeId" uuid NOT NULL, "parentTeamId" uuid, "isLeader" boolean NOT NULL DEFAULT false, "startDate" date NOT NULL, "endDate" date, "isHierarchyEdge" boolean NOT NULL DEFAULT false, CONSTRAINT "uq_team_member_period" UNIQUE ("teamId", "employeeId", "startDate"), CONSTRAINT "PK_ca3eae89dcf20c9fd95bf7460aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9157d8ccc682db5751a91845f5" ON "team_members" ("isHierarchyEdge") `);
        await queryRunner.query(`CREATE TABLE "performance_reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "employeeId" uuid NOT NULL, "leaderId" uuid NOT NULL, "observation" text, "date" date NOT NULL, CONSTRAINT "PK_46f39f620497eb3de4fe6dafdef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4bfaffaee92d18d9b53034dbf8" ON "performance_reviews" ("companyId", "employeeId", "date") `);
        await queryRunner.query(`CREATE TYPE "public"."evaluation_types_code_enum" AS ENUM('HIGHER_BETTER', 'LOWER_BETTER', 'BINARY')`);
        await queryRunner.query(`CREATE TABLE "evaluation_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "code" "public"."evaluation_types_code_enum" NOT NULL, "description" text, "departmentId" uuid, CONSTRAINT "UQ_9bba38583cedd4eaf79966f59df" UNIQUE ("name"), CONSTRAINT "PK_22a720bee86c674ca2be66de232" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "kpis" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "description" text, "departmentId" uuid, "evaluationTypeId" uuid NOT NULL, "unit" character varying, CONSTRAINT "PK_96cc541107cdc102a50e2b0ac90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."team_kpis_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "team_kpis" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "teamId" uuid NOT NULL, "kpiId" uuid NOT NULL, "evaluationTypeId" uuid NOT NULL, "periodStart" date NOT NULL, "periodEnd" date NOT NULL, "goal" numeric, "achievedValue" numeric, "status" "public"."team_kpis_status_enum" NOT NULL DEFAULT 'DRAFT', "submittedBy" uuid NOT NULL, "submittedDate" TIMESTAMP WITH TIME ZONE NOT NULL, "approvedBy" uuid, "approvedDate" TIMESTAMP WITH TIME ZONE, "rejectionReason" text, CONSTRAINT "uq_team_kpi_period" UNIQUE ("companyId", "teamId", "kpiId", "periodStart", "periodEnd"), CONSTRAINT "PK_812f2d97cc4523355fa1d502043" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_65d9f85a281bd4c9bea995da4b" ON "team_kpis" ("periodStart") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd9f02f387b7343be6ff842b41" ON "team_kpis" ("periodEnd") `);
        await queryRunner.query(`CREATE TYPE "public"."employee_kpis_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "employee_kpis" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "employeeId" uuid NOT NULL, "teamId" uuid NOT NULL, "kpiId" uuid NOT NULL, "evaluationTypeId" uuid NOT NULL, "periodStart" date NOT NULL, "periodEnd" date NOT NULL, "goal" numeric, "achievedValue" numeric, "raterEmployeeId" uuid, "status" "public"."employee_kpis_status_enum" NOT NULL DEFAULT 'DRAFT', "submittedBy" uuid NOT NULL, "submittedDate" TIMESTAMP WITH TIME ZONE NOT NULL, "approvedBy" uuid, "approvedDate" TIMESTAMP WITH TIME ZONE, "rejectionReason" text, CONSTRAINT "uq_emp_kpi_period" UNIQUE ("companyId", "employeeId", "kpiId", "periodStart", "periodEnd"), CONSTRAINT "PK_2992520e9a06ddc7e8482ab8e94" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f3bdf322a12ef28a865a8d3f40" ON "employee_kpis" ("periodStart") `);
        await queryRunner.query(`CREATE INDEX "IDX_deda20bf08fa8456c5fe6ef5b8" ON "employee_kpis" ("periodEnd") `);
        await queryRunner.query(`CREATE TYPE "public"."employee_kpi_evolutions_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "employee_kpi_evolutions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "employeeId" uuid NOT NULL, "employeeKpiId" uuid NOT NULL, "achievedValueEvolution" character varying, "raterEmployeeId" uuid, "status" "public"."employee_kpi_evolutions_status_enum" NOT NULL DEFAULT 'DRAFT', "submittedBy" uuid NOT NULL, "submittedDate" date NOT NULL DEFAULT ('now'::text)::date, "approvedBy" uuid, "approvedDate" TIMESTAMP WITH TIME ZONE, "rejectionReason" text, CONSTRAINT "uq_emp_kpi_ev_period" UNIQUE ("companyId", "employeeId", "employeeKpiId", "submittedDate"), CONSTRAINT "PK_b2b38c14233350501cbfb923f16" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."team_kpi_evolutions_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "team_kpi_evolutions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "teamId" uuid NOT NULL, "teamKpiId" uuid NOT NULL, "achievedValueEvolution" character varying, "status" "public"."team_kpi_evolutions_status_enum" NOT NULL DEFAULT 'DRAFT', "submittedBy" uuid NOT NULL, "submittedDate" date NOT NULL DEFAULT ('now'::text)::date, "approvedBy" uuid, "approvedDate" TIMESTAMP WITH TIME ZONE, "rejectionReason" text, CONSTRAINT "uq_team_kpi_ev_period" UNIQUE ("companyId", "teamId", "teamKpiId", "submittedDate"), CONSTRAINT "PK_c84b7ed1a44fa18a6765ece05b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "career_paths" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "name" character varying NOT NULL, "description" text, CONSTRAINT "PK_2051ef7b447c3939c5177a10f3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "employeeId" uuid NOT NULL, "roleId" uuid, "roleTypeId" uuid, "teamId" uuid, "departmentId" uuid, "branchId" uuid, "wage" numeric, "startDate" date NOT NULL, "endDate" date, CONSTRAINT "PK_d2f861b631a7fddef2c9b9338ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_a35729a94e7280cbebaaa541a20" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_3d3edc7bbc6f133907163ff9cdc" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_ded8a17cd090922d5bac8a2361f" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "FK_f65f659158469fe0809cf26cd8d" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "persons" ADD CONSTRAINT "FK_6579eb8e1cd7b7086d8d5edb4b0" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "persons" ADD CONSTRAINT "FK_5ad09ac3722346233a879464d6e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_ddd0d20e45dbd0d1536dc082039" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_6f9395c9037632a31107c8a9e58" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a52455e2cef06f0a3faf30f96a3" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_fc2a980dcd97019349b17b3921e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_d8edd5f44c26d7451d7986c5235" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_types" ADD CONSTRAINT "FK_f70baab70c640f341bb0332b363" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_types" ADD CONSTRAINT "FK_70e63986df5457061f051ff3e76" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_c48f0ddd18c7f12f0b390f76dc2" FOREIGN KEY ("roleTypeId") REFERENCES "role_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_87a8fbdcf803fd33e98a07095e0" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_5ff67a53e3777f7ab6186db44ba" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_bab87971fda584562c509c647e2" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_24d98872eb52c3edb30ce96c1e9" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_04743505af5e9ecda43cf3eeb12" FOREIGN KEY ("roleTypeId") REFERENCES "role_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_66f8bf74042e2f42ded42fecf70" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_737991e10350d9626f592894cef" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_4edfe103ebf2fcb98dbb582554b" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_0ee1fa8d2cfe91f9dac54f9e2ff" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_c7b030a4514a003d9d8d31a812b" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_e3de3324f28dbc6fc320efdeac6" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_38cb12d289626e8c394c93f90e5" FOREIGN KEY ("parentTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_a191cce2bbe49e41474666a9b19" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "performance_reviews" ADD CONSTRAINT "FK_89c1585d31979b8f709928bd2bf" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "performance_reviews" ADD CONSTRAINT "FK_3e4e6862bd2e10906ed146cd9ee" FOREIGN KEY ("leaderId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "performance_reviews" ADD CONSTRAINT "FK_ea67f090cde33d2e4ab167f97cc" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_types" ADD CONSTRAINT "FK_2e275e2251e0db496b85e0e2460" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_types" ADD CONSTRAINT "FK_c0c86bd8bb5d5bda4c45324b4b5" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kpis" ADD CONSTRAINT "FK_b31d44de9d4c81fac2c700ab56e" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kpis" ADD CONSTRAINT "FK_0d0781661dcaa7310aef05c39d4" FOREIGN KEY ("evaluationTypeId") REFERENCES "evaluation_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kpis" ADD CONSTRAINT "FK_09ac0b867346a3ed63e9568c91c" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpis" ADD CONSTRAINT "FK_4fa68e3349a0270f8860595c58d" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpis" ADD CONSTRAINT "FK_1c351d5e8cc5a9a845ea51521e4" FOREIGN KEY ("kpiId") REFERENCES "kpis"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpis" ADD CONSTRAINT "FK_844dfc29cf0baa97450c5bfff36" FOREIGN KEY ("evaluationTypeId") REFERENCES "evaluation_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpis" ADD CONSTRAINT "FK_cc979dbb40ae5da67996c8466a3" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpis" ADD CONSTRAINT "FK_bdd500138a8b7119f484f976641" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpis" ADD CONSTRAINT "FK_b984e622ab717c8782f053549f9" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_23b6f3fd6a327381fac8ef28463" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_f774d7e0645cf92af864a3600f4" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_ba3462fe7d8a69a2cc09fe5cf79" FOREIGN KEY ("kpiId") REFERENCES "kpis"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_441156610100860328dad2fac80" FOREIGN KEY ("evaluationTypeId") REFERENCES "evaluation_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_4bb72df3b08e0074ae70d9596a9" FOREIGN KEY ("raterEmployeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_fa7a9e1947d3924e8e731dd21be" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_fe7380ac98af2a9e5350a8fb2f6" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_426fa507732d48a5b7bc14b4112" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_693f299a2b3e38498a4e253c015" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_b2eff27be3f96646c97d0da0630" FOREIGN KEY ("employeeKpiId") REFERENCES "employee_kpis"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_3c620a0a8a3333c61dea3ede091" FOREIGN KEY ("raterEmployeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_31af5fdb1a69b8adb572b193240" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_71cb3bcb9ac79b7009c23ad0c9c" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_70e09b3e25834d7d7ed44204400" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_182242c17156b954d7fd6755841" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_665e98b76556e26b9a79aa7cf61" FOREIGN KEY ("teamKpiId") REFERENCES "team_kpis"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_723ffaeaac30c159de4fd061878" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_d89156fbfc4670fec180eb5bd40" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_982f99cb62b86ded81bca005e9e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "career_paths" ADD CONSTRAINT "FK_c986e0ca1df7c521ebb96004862" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_histories" ADD CONSTRAINT "FK_eb5f1f9a26bde9b71faa22f4cfa" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_histories" ADD CONSTRAINT "FK_924357356edff7306899472b600" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_histories" ADD CONSTRAINT "FK_e06b8aa624decf03cfc3eadded0" FOREIGN KEY ("roleTypeId") REFERENCES "role_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_histories" ADD CONSTRAINT "FK_3b38e0d440a5526d6d83fa9731c" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_histories" ADD CONSTRAINT "FK_ebde0c539d6827cf70b9dda4b1a" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_histories" ADD CONSTRAINT "FK_75f4160be34c2a74606391d25cb" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_histories" ADD CONSTRAINT "FK_6a4d9befa26b20da1008c874e28" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "employee_histories" DROP CONSTRAINT "FK_6a4d9befa26b20da1008c874e28"`);
        await queryRunner.query(`ALTER TABLE "employee_histories" DROP CONSTRAINT "FK_75f4160be34c2a74606391d25cb"`);
        await queryRunner.query(`ALTER TABLE "employee_histories" DROP CONSTRAINT "FK_ebde0c539d6827cf70b9dda4b1a"`);
        await queryRunner.query(`ALTER TABLE "employee_histories" DROP CONSTRAINT "FK_3b38e0d440a5526d6d83fa9731c"`);
        await queryRunner.query(`ALTER TABLE "employee_histories" DROP CONSTRAINT "FK_e06b8aa624decf03cfc3eadded0"`);
        await queryRunner.query(`ALTER TABLE "employee_histories" DROP CONSTRAINT "FK_924357356edff7306899472b600"`);
        await queryRunner.query(`ALTER TABLE "employee_histories" DROP CONSTRAINT "FK_eb5f1f9a26bde9b71faa22f4cfa"`);
        await queryRunner.query(`ALTER TABLE "career_paths" DROP CONSTRAINT "FK_c986e0ca1df7c521ebb96004862"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_982f99cb62b86ded81bca005e9e"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_d89156fbfc4670fec180eb5bd40"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_723ffaeaac30c159de4fd061878"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_665e98b76556e26b9a79aa7cf61"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_182242c17156b954d7fd6755841"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_70e09b3e25834d7d7ed44204400"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_71cb3bcb9ac79b7009c23ad0c9c"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_31af5fdb1a69b8adb572b193240"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_3c620a0a8a3333c61dea3ede091"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_b2eff27be3f96646c97d0da0630"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_693f299a2b3e38498a4e253c015"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_426fa507732d48a5b7bc14b4112"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_fe7380ac98af2a9e5350a8fb2f6"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_fa7a9e1947d3924e8e731dd21be"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_4bb72df3b08e0074ae70d9596a9"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_441156610100860328dad2fac80"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_ba3462fe7d8a69a2cc09fe5cf79"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_f774d7e0645cf92af864a3600f4"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_23b6f3fd6a327381fac8ef28463"`);
        await queryRunner.query(`ALTER TABLE "team_kpis" DROP CONSTRAINT "FK_b984e622ab717c8782f053549f9"`);
        await queryRunner.query(`ALTER TABLE "team_kpis" DROP CONSTRAINT "FK_bdd500138a8b7119f484f976641"`);
        await queryRunner.query(`ALTER TABLE "team_kpis" DROP CONSTRAINT "FK_cc979dbb40ae5da67996c8466a3"`);
        await queryRunner.query(`ALTER TABLE "team_kpis" DROP CONSTRAINT "FK_844dfc29cf0baa97450c5bfff36"`);
        await queryRunner.query(`ALTER TABLE "team_kpis" DROP CONSTRAINT "FK_1c351d5e8cc5a9a845ea51521e4"`);
        await queryRunner.query(`ALTER TABLE "team_kpis" DROP CONSTRAINT "FK_4fa68e3349a0270f8860595c58d"`);
        await queryRunner.query(`ALTER TABLE "kpis" DROP CONSTRAINT "FK_09ac0b867346a3ed63e9568c91c"`);
        await queryRunner.query(`ALTER TABLE "kpis" DROP CONSTRAINT "FK_0d0781661dcaa7310aef05c39d4"`);
        await queryRunner.query(`ALTER TABLE "kpis" DROP CONSTRAINT "FK_b31d44de9d4c81fac2c700ab56e"`);
        await queryRunner.query(`ALTER TABLE "evaluation_types" DROP CONSTRAINT "FK_c0c86bd8bb5d5bda4c45324b4b5"`);
        await queryRunner.query(`ALTER TABLE "evaluation_types" DROP CONSTRAINT "FK_2e275e2251e0db496b85e0e2460"`);
        await queryRunner.query(`ALTER TABLE "performance_reviews" DROP CONSTRAINT "FK_ea67f090cde33d2e4ab167f97cc"`);
        await queryRunner.query(`ALTER TABLE "performance_reviews" DROP CONSTRAINT "FK_3e4e6862bd2e10906ed146cd9ee"`);
        await queryRunner.query(`ALTER TABLE "performance_reviews" DROP CONSTRAINT "FK_89c1585d31979b8f709928bd2bf"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_a191cce2bbe49e41474666a9b19"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_38cb12d289626e8c394c93f90e5"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_e3de3324f28dbc6fc320efdeac6"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_c7b030a4514a003d9d8d31a812b"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_0ee1fa8d2cfe91f9dac54f9e2ff"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_4edfe103ebf2fcb98dbb582554b"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_737991e10350d9626f592894cef"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_66f8bf74042e2f42ded42fecf70"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_04743505af5e9ecda43cf3eeb12"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_24d98872eb52c3edb30ce96c1e9"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_bab87971fda584562c509c647e2"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_5ff67a53e3777f7ab6186db44ba"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_87a8fbdcf803fd33e98a07095e0"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_c48f0ddd18c7f12f0b390f76dc2"`);
        await queryRunner.query(`ALTER TABLE "role_types" DROP CONSTRAINT "FK_70e63986df5457061f051ff3e76"`);
        await queryRunner.query(`ALTER TABLE "role_types" DROP CONSTRAINT "FK_f70baab70c640f341bb0332b363"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_d8edd5f44c26d7451d7986c5235"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_fc2a980dcd97019349b17b3921e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a52455e2cef06f0a3faf30f96a3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_6f9395c9037632a31107c8a9e58"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_ddd0d20e45dbd0d1536dc082039"`);
        await queryRunner.query(`ALTER TABLE "persons" DROP CONSTRAINT "FK_5ad09ac3722346233a879464d6e"`);
        await queryRunner.query(`ALTER TABLE "persons" DROP CONSTRAINT "FK_6579eb8e1cd7b7086d8d5edb4b0"`);
        await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_f65f659158469fe0809cf26cd8d"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_ded8a17cd090922d5bac8a2361f"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_3d3edc7bbc6f133907163ff9cdc"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_a35729a94e7280cbebaaa541a20"`);
        await queryRunner.query(`DROP TABLE "employee_histories"`);
        await queryRunner.query(`DROP TABLE "career_paths"`);
        await queryRunner.query(`DROP TABLE "team_kpi_evolutions"`);
        await queryRunner.query(`DROP TYPE "public"."team_kpi_evolutions_status_enum"`);
        await queryRunner.query(`DROP TABLE "employee_kpi_evolutions"`);
        await queryRunner.query(`DROP TYPE "public"."employee_kpi_evolutions_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_deda20bf08fa8456c5fe6ef5b8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3bdf322a12ef28a865a8d3f40"`);
        await queryRunner.query(`DROP TABLE "employee_kpis"`);
        await queryRunner.query(`DROP TYPE "public"."employee_kpis_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cd9f02f387b7343be6ff842b41"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65d9f85a281bd4c9bea995da4b"`);
        await queryRunner.query(`DROP TABLE "team_kpis"`);
        await queryRunner.query(`DROP TYPE "public"."team_kpis_status_enum"`);
        await queryRunner.query(`DROP TABLE "kpis"`);
        await queryRunner.query(`DROP TABLE "evaluation_types"`);
        await queryRunner.query(`DROP TYPE "public"."evaluation_types_code_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4bfaffaee92d18d9b53034dbf8"`);
        await queryRunner.query(`DROP TABLE "performance_reviews"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9157d8ccc682db5751a91845f5"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "role_types"`);
        await queryRunner.query(`DROP TABLE "departments"`);
        await queryRunner.query(`DROP TABLE "teams"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "persons"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "cities"`);
        await queryRunner.query(`DROP TABLE "branches"`);
        await queryRunner.query(`DROP TABLE "states"`);
    }
}
