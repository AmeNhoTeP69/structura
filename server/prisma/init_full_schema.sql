CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'EMPLOYEE', 'ADMIN');
CREATE TYPE "ProjectRequestStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'PENDING',
  'UNDER_REVIEW',
  'REFUSED',
  'WAITING_CLIENT_ACCEPTANCE',
  'APPROVED',
  'CANCELLED'
);
CREATE TYPE "ProjectStatus" AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED'
);
CREATE TYPE "RequestDocumentType" AS ENUM (
  'HOUSE_DESIGN',
  'BUILDING_PERMIT',
  'LAND_PLAN',
  'TECHNICAL_FILE',
  'BUDGET_FILE',
  'OTHER'
);
CREATE TYPE "ProjectDocumentType" AS ENUM (
  'REQUEST_COPY',
  'CONTRACT',
  'PLAN',
  'REPORT',
  'SITE_PHOTO',
  'INVOICE',
  'OTHER'
);
CREATE TYPE "ProjectDocumentVisibility" AS ENUM ('ALL', 'TEAM_ONLY');
CREATE TYPE "TimelineLogType" AS ENUM ('COMMENT', 'STATUS_UPDATE', 'PROGRESS_UPDATE', 'REQUEST', 'NOTE');
CREATE TYPE "TimelineLogVisibility" AS ENUM ('ALL', 'TEAM_ONLY');
CREATE TYPE "NotificationType" AS ENUM (
  'REQUEST_STATUS_CHANGED',
  'REQUEST_PROPOSAL_RECEIVED',
  'REQUEST_APPROVED',
  'REQUEST_REFUSED',
  'PROJECT_ASSIGNED',
  'PROJECT_STATUS_CHANGED',
  'NEW_TIMELINE_LOG',
  'DOCUMENT_ADDED'
);
CREATE TYPE "NotificationEntityType" AS ENUM ('PROJECT_REQUEST', 'PROJECT', 'DOCUMENT');
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "phone" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "employee_types" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "employee_profiles" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE,
  "employee_type_id" INTEGER NOT NULL,
  "speciality" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "service_categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "services" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "short_description" TEXT,
  "full_description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "service_category_items" (
  "id" SERIAL PRIMARY KEY,
  "service_id" INTEGER NOT NULL,
  "category_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "service_category_items_service_id_category_id_key" UNIQUE ("service_id", "category_id")
);

CREATE TABLE "project_requests" (
  "id" SERIAL PRIMARY KEY,
  "client_id" INTEGER NOT NULL,
  "reference_code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "requested_start_date" DATE,
  "requested_budget" DECIMAL(12,2),
  "admin_proposed_start_date" DATE,
  "admin_proposed_budget" DECIMAL(12,2),
  "status" "ProjectRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "admin_review_note" TEXT,
  "client_response_note" TEXT,
  "submitted_at" TIMESTAMP(3),
  "reviewed_at" TIMESTAMP(3),
  "client_responded_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "project_request_services" (
  "id" SERIAL PRIMARY KEY,
  "project_request_id" INTEGER NOT NULL,
  "service_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_request_services_project_request_id_service_id_key" UNIQUE ("project_request_id", "service_id")
);

CREATE TABLE "project_request_documents" (
  "id" SERIAL PRIMARY KEY,
  "project_request_id" INTEGER NOT NULL,
  "uploaded_by_user_id" INTEGER,
  "document_type" "RequestDocumentType" NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "mime_type" TEXT,
  "file_size" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "project_request_status_history" (
  "id" SERIAL PRIMARY KEY,
  "project_request_id" INTEGER NOT NULL,
  "old_status" "ProjectRequestStatus",
  "new_status" "ProjectRequestStatus" NOT NULL,
  "changed_by_user_id" INTEGER,
  "comment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "projects" (
  "id" SERIAL PRIMARY KEY,
  "project_request_id" INTEGER NOT NULL UNIQUE,
  "client_id" INTEGER NOT NULL,
  "reference_code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "start_date" DATE,
  "end_date" DATE,
  "budget" DECIMAL(12,2),
  "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "created_by_admin_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "projects_progress_check" CHECK ("progress" >= 0 AND "progress" <= 100)
);

CREATE TABLE "project_services" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL,
  "service_id" INTEGER NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_services_project_id_service_id_key" UNIQUE ("project_id", "service_id")
);

CREATE TABLE "project_assignments" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL,
  "employee_user_id" INTEGER NOT NULL,
  "assigned_by_admin_id" INTEGER,
  "assignment_role" TEXT,
  "is_lead" BOOLEAN NOT NULL DEFAULT false,
  "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_assignments_project_id_employee_user_id_key" UNIQUE ("project_id", "employee_user_id")
);

CREATE TABLE "project_documents" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL,
  "uploaded_by_user_id" INTEGER,
  "source_request_document_id" INTEGER,
  "document_type" "ProjectDocumentType" NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "mime_type" TEXT,
  "file_size" INTEGER,
  "visibility" "ProjectDocumentVisibility" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "project_timeline_logs" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL,
  "author_user_id" INTEGER NOT NULL,
  "log_type" "TimelineLogType" NOT NULL,
  "message" TEXT NOT NULL,
  "visibility" "TimelineLogVisibility" NOT NULL,
  "progress_value" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_timeline_logs_progress_value_check" CHECK ("progress_value" IS NULL OR ("progress_value" >= 0 AND "progress_value" <= 100))
);

CREATE TABLE "project_status_history" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL,
  "old_status" "ProjectStatus",
  "new_status" "ProjectStatus" NOT NULL,
  "changed_by_user_id" INTEGER,
  "comment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "related_entity_type" "NotificationEntityType",
  "related_entity_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "contact_messages" (
  "id" SERIAL PRIMARY KEY,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "employee_profiles_employee_type_id_idx" ON "employee_profiles"("employee_type_id");
CREATE INDEX "service_category_items_category_id_idx" ON "service_category_items"("category_id");
CREATE INDEX "project_requests_client_id_idx" ON "project_requests"("client_id");
CREATE INDEX "project_requests_status_idx" ON "project_requests"("status");
CREATE INDEX "project_request_services_service_id_idx" ON "project_request_services"("service_id");
CREATE INDEX "project_request_documents_project_request_id_idx" ON "project_request_documents"("project_request_id");
CREATE INDEX "project_request_documents_uploaded_by_user_id_idx" ON "project_request_documents"("uploaded_by_user_id");
CREATE INDEX "project_request_status_history_project_request_id_idx" ON "project_request_status_history"("project_request_id");
CREATE INDEX "project_request_status_history_changed_by_user_id_idx" ON "project_request_status_history"("changed_by_user_id");
CREATE INDEX "projects_client_id_idx" ON "projects"("client_id");
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE INDEX "projects_created_by_admin_id_idx" ON "projects"("created_by_admin_id");
CREATE INDEX "project_services_service_id_idx" ON "project_services"("service_id");
CREATE INDEX "project_assignments_employee_user_id_idx" ON "project_assignments"("employee_user_id");
CREATE INDEX "project_assignments_assigned_by_admin_id_idx" ON "project_assignments"("assigned_by_admin_id");
CREATE INDEX "project_documents_project_id_idx" ON "project_documents"("project_id");
CREATE INDEX "project_documents_uploaded_by_user_id_idx" ON "project_documents"("uploaded_by_user_id");
CREATE INDEX "project_documents_source_request_document_id_idx" ON "project_documents"("source_request_document_id");
CREATE INDEX "project_timeline_logs_project_id_idx" ON "project_timeline_logs"("project_id");
CREATE INDEX "project_timeline_logs_author_user_id_idx" ON "project_timeline_logs"("author_user_id");
CREATE INDEX "project_status_history_project_id_idx" ON "project_status_history"("project_id");
CREATE INDEX "project_status_history_changed_by_user_id_idx" ON "project_status_history"("changed_by_user_id");
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

ALTER TABLE "employee_profiles"
  ADD CONSTRAINT "employee_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employee_profiles"
  ADD CONSTRAINT "employee_profiles_employee_type_id_fkey"
  FOREIGN KEY ("employee_type_id") REFERENCES "employee_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_category_items"
  ADD CONSTRAINT "service_category_items_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_category_items"
  ADD CONSTRAINT "service_category_items_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_requests"
  ADD CONSTRAINT "project_requests_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project_request_services"
  ADD CONSTRAINT "project_request_services_project_request_id_fkey"
  FOREIGN KEY ("project_request_id") REFERENCES "project_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_request_services"
  ADD CONSTRAINT "project_request_services_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project_request_documents"
  ADD CONSTRAINT "project_request_documents_project_request_id_fkey"
  FOREIGN KEY ("project_request_id") REFERENCES "project_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_request_documents"
  ADD CONSTRAINT "project_request_documents_uploaded_by_user_id_fkey"
  FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_request_status_history"
  ADD CONSTRAINT "project_request_status_history_project_request_id_fkey"
  FOREIGN KEY ("project_request_id") REFERENCES "project_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_request_status_history"
  ADD CONSTRAINT "project_request_status_history_changed_by_user_id_fkey"
  FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "projects"
  ADD CONSTRAINT "projects_project_request_id_fkey"
  FOREIGN KEY ("project_request_id") REFERENCES "project_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects"
  ADD CONSTRAINT "projects_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects"
  ADD CONSTRAINT "projects_created_by_admin_id_fkey"
  FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_services"
  ADD CONSTRAINT "project_services_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_services"
  ADD CONSTRAINT "project_services_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project_assignments"
  ADD CONSTRAINT "project_assignments_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_assignments"
  ADD CONSTRAINT "project_assignments_employee_user_id_fkey"
  FOREIGN KEY ("employee_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project_assignments"
  ADD CONSTRAINT "project_assignments_assigned_by_admin_id_fkey"
  FOREIGN KEY ("assigned_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_documents"
  ADD CONSTRAINT "project_documents_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_documents"
  ADD CONSTRAINT "project_documents_uploaded_by_user_id_fkey"
  FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_documents"
  ADD CONSTRAINT "project_documents_source_request_document_id_fkey"
  FOREIGN KEY ("source_request_document_id") REFERENCES "project_request_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_timeline_logs"
  ADD CONSTRAINT "project_timeline_logs_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_timeline_logs"
  ADD CONSTRAINT "project_timeline_logs_author_user_id_fkey"
  FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project_status_history"
  ADD CONSTRAINT "project_status_history_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_status_history"
  ADD CONSTRAINT "project_status_history_changed_by_user_id_fkey"
  FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
