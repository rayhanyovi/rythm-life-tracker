-- CreateEnum
CREATE TYPE "TaskKind" AS ENUM ('RECURRING', 'TODO', 'HABIT');

-- CreateEnum
CREATE TYPE "TaskCadence" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ONCE');

-- CreateEnum
CREATE TYPE "HabitMode" AS ENUM ('POSITIVE_ONLY', 'NEGATIVE_RESETS', 'SCORE_BASED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HabitSign" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateTable
CREATE TABLE "attributes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "attribute_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,
    "project_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "task_kind" "TaskKind" NOT NULL,
    "cadence" "TaskCadence",
    "due_date" TIMESTAMP(3),
    "habit_mode" "HabitMode",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_completions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "cadence" "TaskCadence" NOT NULL,
    "period_key" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "sign" "HabitSign" NOT NULL,
    "entry_date" TEXT NOT NULL,
    "marked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_attributes_user_sort" ON "attributes"("user_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_user_name_unique" ON "attributes"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_projects_user_status" ON "projects"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "project_user_name_unique" ON "projects"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_tasks_user_attribute" ON "tasks"("user_id", "attribute_id");

-- CreateIndex
CREATE INDEX "idx_tasks_user_kind_active" ON "tasks"("user_id", "task_kind", "is_active");

-- CreateIndex
CREATE INDEX "idx_tasks_user_project" ON "tasks"("user_id", "project_id");

-- CreateIndex
CREATE INDEX "idx_tasks_user_due_date" ON "tasks"("user_id", "due_date");

-- CreateIndex
CREATE INDEX "idx_completions_user_task_cadence_period" ON "task_completions"("user_id", "task_id", "cadence", "period_key");

-- CreateIndex
CREATE INDEX "idx_task_completions_user_completed_at" ON "task_completions"("user_id", "completed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "completion_user_task_cadence_period_unique" ON "task_completions"("user_id", "task_id", "cadence", "period_key");

-- CreateIndex
CREATE INDEX "idx_habit_entries_user_task_date" ON "habit_entries"("user_id", "task_id", "entry_date");

-- CreateIndex
CREATE INDEX "idx_habit_entries_user_date" ON "habit_entries"("user_id", "entry_date");

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_entries" ADD CONSTRAINT "habit_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_entries" ADD CONSTRAINT "habit_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
