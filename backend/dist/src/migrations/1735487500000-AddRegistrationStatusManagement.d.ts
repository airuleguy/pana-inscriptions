import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddRegistrationStatusManagement1735487500000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
