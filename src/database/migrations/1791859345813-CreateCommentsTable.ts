import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1791859345813 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL PRIMARY KEY,
        "body" text NOT NULL,
        "author_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_comments_author" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_comments_article" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_comments_article_id" ON "comments" ("article_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
