import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachmentsTable1791257981073 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "attachable_type" varchar NOT NULL,
        "attachable_id" uuid NOT NULL,
        "url" varchar NOT NULL,
        "file_name" varchar NOT NULL,
        "file_type" varchar NOT NULL,
        "file_size" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_attachments_attachable"
      ON "attachments" ("attachable_type", "attachable_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "attachments"`);
  }
}
