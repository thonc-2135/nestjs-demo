import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollowsTable1791257980677 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "follows" (
        "follower_id" uuid NOT NULL,
        "following_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_follows" PRIMARY KEY ("follower_id", "following_id"),
        CONSTRAINT "fk_follows_follower" FOREIGN KEY ("follower_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_follows_following" FOREIGN KEY ("following_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "ck_follows_no_self_follow" CHECK ("follower_id" <> "following_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "follows"`);
  }
}
