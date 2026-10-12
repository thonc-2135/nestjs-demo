import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticlesSchema1791516430789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        CONSTRAINT "uq_tags_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "slug" varchar NOT NULL,
        "title" varchar NOT NULL,
        "description" varchar NOT NULL,
        "body" text NOT NULL,
        "author_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_articles_slug" UNIQUE ("slug"),
        CONSTRAINT "fk_articles_author" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_articles_author_id" ON "articles" ("author_id")`);

    await queryRunner.query(`
      CREATE TABLE "article_tags" (
        "article_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "pk_article_tags" PRIMARY KEY ("article_id", "tag_id"),
        CONSTRAINT "fk_article_tags_article" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_article_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_favorites" PRIMARY KEY ("user_id", "article_id"),
        CONSTRAINT "fk_favorites_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_favorites_article" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "article_tags"`);
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(`DROP TABLE "tags"`);
  }
}
