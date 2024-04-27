import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWeatherTable1714116750596 implements MigrationInterface {
    name = 'CreateWeatherTable1714116750596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."weather_part_enum" AS ENUM('weather', 'forecast')`);
        await queryRunner.query(`CREATE TABLE "weather" ("id" SERIAL NOT NULL, "lat" integer NOT NULL, "lon" integer NOT NULL, "part" "public"."weather_part_enum" NOT NULL, "data" jsonb NOT NULL, CONSTRAINT "PK_af9937471586e6798a5e4865f2d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "weather"`);
        await queryRunner.query(`DROP TYPE "public"."weather_part_enum"`);
    }

}
