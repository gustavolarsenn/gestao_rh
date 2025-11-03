/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AutoMigration1762131514425 {
    name = 'AutoMigration1762131514425'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."team_kpi_evolutions_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "team_kpi_evolutions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "teamId" uuid NOT NULL, "teamKpiId" uuid NOT NULL, "achievedValueEvolution" character varying, "status" "public"."team_kpi_evolutions_status_enum" NOT NULL DEFAULT 'DRAFT', "submittedBy" uuid NOT NULL, "submittedDate" date NOT NULL DEFAULT ('now'::text)::date, "approvedBy" uuid, "approvedDate" TIMESTAMP WITH TIME ZONE, "rejectionReason" text, CONSTRAINT "uq_team_kpi_ev_period" UNIQUE ("companyId", "teamId", "teamKpiId", "submittedDate"), CONSTRAINT "PK_c84b7ed1a44fa18a6765ece05b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."employee_kpi_evolutions_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "employee_kpi_evolutions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, "active" boolean NOT NULL DEFAULT true, "companyId" uuid NOT NULL, "employeeId" uuid NOT NULL, "employeeKpiId" uuid NOT NULL, "achievedValueEvolution" character varying, "raterEmployeeId" uuid, "status" "public"."employee_kpi_evolutions_status_enum" NOT NULL DEFAULT 'DRAFT', "submittedBy" uuid NOT NULL, "submittedDate" date NOT NULL DEFAULT ('now'::text)::date, "approvedBy" uuid, "approvedDate" TIMESTAMP WITH TIME ZONE, "rejectionReason" text, CONSTRAINT "uq_emp_kpi_ev_period" UNIQUE ("companyId", "employeeId", "employeeKpiId", "submittedDate"), CONSTRAINT "PK_b2b38c14233350501cbfb923f16" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD "teamId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_182242c17156b954d7fd6755841" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_665e98b76556e26b9a79aa7cf61" FOREIGN KEY ("teamKpiId") REFERENCES "team_kpis"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_723ffaeaac30c159de4fd061878" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_d89156fbfc4670fec180eb5bd40" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" ADD CONSTRAINT "FK_982f99cb62b86ded81bca005e9e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD CONSTRAINT "FK_f774d7e0645cf92af864a3600f4" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_693f299a2b3e38498a4e253c015" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_b2eff27be3f96646c97d0da0630" FOREIGN KEY ("employeeKpiId") REFERENCES "employee_kpis"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_3c620a0a8a3333c61dea3ede091" FOREIGN KEY ("raterEmployeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_31af5fdb1a69b8adb572b193240" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_71cb3bcb9ac79b7009c23ad0c9c" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" ADD CONSTRAINT "FK_70e09b3e25834d7d7ed44204400" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_70e09b3e25834d7d7ed44204400"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_71cb3bcb9ac79b7009c23ad0c9c"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_31af5fdb1a69b8adb572b193240"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_3c620a0a8a3333c61dea3ede091"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_b2eff27be3f96646c97d0da0630"`);
        await queryRunner.query(`ALTER TABLE "employee_kpi_evolutions" DROP CONSTRAINT "FK_693f299a2b3e38498a4e253c015"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP CONSTRAINT "FK_f774d7e0645cf92af864a3600f4"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_982f99cb62b86ded81bca005e9e"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_d89156fbfc4670fec180eb5bd40"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_723ffaeaac30c159de4fd061878"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_665e98b76556e26b9a79aa7cf61"`);
        await queryRunner.query(`ALTER TABLE "team_kpi_evolutions" DROP CONSTRAINT "FK_182242c17156b954d7fd6755841"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP COLUMN "teamId"`);
        await queryRunner.query(`DROP TABLE "employee_kpi_evolutions"`);
        await queryRunner.query(`DROP TYPE "public"."employee_kpi_evolutions_status_enum"`);
        await queryRunner.query(`DROP TABLE "team_kpi_evolutions"`);
        await queryRunner.query(`DROP TYPE "public"."team_kpi_evolutions_status_enum"`);
    }
}
