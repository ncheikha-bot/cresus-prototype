-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'admin', 'bank', 'accountant');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "password_hash" TEXT,
    "profile" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "name" TEXT NOT NULL,
    "legal_form" TEXT,
    "status" TEXT NOT NULL,
    "current_step" INTEGER,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_processes" (
    "company_id" TEXT NOT NULL,
    "owner_id" TEXT,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_processes_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "company_id" TEXT,
    "status" TEXT,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_requests" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "company_id" TEXT,
    "bank_id" TEXT,
    "status" TEXT,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifications" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "company_id" TEXT,
    "status" TEXT,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domiciliations" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "company_id" TEXT,
    "status" TEXT,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domiciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branding_orders" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "status" TEXT,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branding_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "companies_owner_id_idx" ON "companies"("owner_id");

-- CreateIndex
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- CreateIndex
CREATE INDEX "company_processes_owner_id_idx" ON "company_processes"("owner_id");

-- CreateIndex
CREATE INDEX "drafts_owner_id_idx" ON "drafts"("owner_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_idx" ON "notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "appointments_owner_id_idx" ON "appointments"("owner_id");

-- CreateIndex
CREATE INDEX "bank_requests_owner_id_idx" ON "bank_requests"("owner_id");

-- CreateIndex
CREATE INDEX "bank_requests_bank_id_idx" ON "bank_requests"("bank_id");

-- CreateIndex
CREATE INDEX "modifications_owner_id_idx" ON "modifications"("owner_id");

-- CreateIndex
CREATE INDEX "domiciliations_owner_id_idx" ON "domiciliations"("owner_id");

-- CreateIndex
CREATE INDEX "branding_orders_owner_id_idx" ON "branding_orders"("owner_id");
