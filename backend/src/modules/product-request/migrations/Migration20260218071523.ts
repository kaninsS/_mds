import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260218071523 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_request" ("id" text not null, "name" text not null, "description" text not null, "image_url" text null, "status" text check ("status" in ('pending', 'progress', 'success')) not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_request_deleted_at" ON "product_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_request" cascade;`);
  }

}
