-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'MAIN');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "quest_type" "QuestType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_completions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "period_type" "QuestType" NOT NULL,
    "period_key" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "idx_session_user_id" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "idx_account_user_id" ON "account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_account_unique" ON "account"("provider_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_key" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "idx_categories_user_sort" ON "categories"("user_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "category_user_name_unique" ON "categories"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_quests_user_category" ON "quests"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "idx_quests_user_type_active" ON "quests"("user_id", "quest_type", "is_active");

-- CreateIndex
CREATE INDEX "idx_completions_user_quest_period" ON "quest_completions"("user_id", "quest_id", "period_type", "period_key");

-- CreateIndex
CREATE INDEX "idx_completions_user_completed_at" ON "quest_completions"("user_id", "completed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "completion_user_quest_period_unique" ON "quest_completions"("user_id", "quest_id", "period_type", "period_key");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateFunction
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CreateTrigger
CREATE TRIGGER "trg_quests_set_updated_at"
BEFORE UPDATE ON "quests"
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
