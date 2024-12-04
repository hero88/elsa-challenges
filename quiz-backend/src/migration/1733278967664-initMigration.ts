import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1733278967664 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "quiz" (
              "quiz_id" SERIAL NOT NULL,
              "name" character varying NOT NULL,
              "created_at" TIMESTAMP NULL DEFAULT now(),
              "updated_at" TIMESTAMP NULL DEFAULT now(),
              CONSTRAINT "PK_quiz" PRIMARY KEY ("quiz_id")
            )
          `);
        await queryRunner.query(`
            CREATE TABLE "question" (
              "question_id" SERIAL NOT NULL,
              "question_text" text NOT NULL,
              "correct_answer" character varying NOT NULL,
              "quiz_id" integer,
              "created_at" TIMESTAMP NULL DEFAULT now(),
              "updated_at" TIMESTAMP NULL DEFAULT now(),
              CONSTRAINT "PK_question" PRIMARY KEY ("question_id")
            )
          `);
        await queryRunner.query(`
            CREATE TABLE "user" (
              "user_id" SERIAL NOT NULL,
              "username" character varying NOT NULL,
              "created_at" TIMESTAMP NULL DEFAULT now(),
              "updated_at" TIMESTAMP NULL DEFAULT now(),
              CONSTRAINT "PK_user" PRIMARY KEY ("user_id")
            )
          `);
        await queryRunner.query(`
            CREATE TABLE "leaderboard" (
              "leaderboard_id" SERIAL NOT NULL,
              "score" integer NOT NULL DEFAULT 0,
              "created_at" TIMESTAMP NULL DEFAULT now(),
              "updated_at" TIMESTAMP NULL DEFAULT now(),
              "quiz_id" integer,
              "user_id" integer,
              CONSTRAINT "PK_leaderboard" PRIMARY KEY ("leaderboard_id")
            )
          `);
        await queryRunner.query(`
            ALTER TABLE "question" ADD CONSTRAINT "FK_question_quiz" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("quiz_id") ON DELETE CASCADE
          `);
        await queryRunner.query(`
            ALTER TABLE "leaderboard" ADD CONSTRAINT "FK_leaderboard_quiz" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("quiz_id") ON DELETE CASCADE
          `);
        await queryRunner.query(`
            ALTER TABLE "leaderboard" ADD CONSTRAINT "FK_leaderboard_user" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard" DROP CONSTRAINT "FK_leaderboard_user"`);
        await queryRunner.query(`ALTER TABLE "leaderboard" DROP CONSTRAINT "FK_leaderboard_quiz"`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_question_quiz"`);
        await queryRunner.query(`DROP TABLE "leaderboard"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "quiz"`);
    }

}
