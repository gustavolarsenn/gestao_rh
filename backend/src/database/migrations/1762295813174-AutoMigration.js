/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AutoMigration1762295813174 {
    name = 'AutoMigration1762295813174'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP COLUMN "goal"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD "goal" character varying`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP COLUMN "achievedValue"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD "achievedValue" character varying`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP COLUMN "achievedValue"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD "achievedValue" numeric`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" DROP COLUMN "goal"`);
        await queryRunner.query(`ALTER TABLE "employee_kpis" ADD "goal" numeric`);
    }
}
