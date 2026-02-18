import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260217100638 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "vendor_request" ("id" text not null, "title" text not null, "description" text null, "price" numeric not null, "vendor_email" text not null, "image_url" text null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "raw_price" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_request_deleted_at" ON "vendor_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor_request" cascade;`);
  }

}
