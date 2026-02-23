import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260223065928 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor_storefront" drop constraint if exists "vendor_storefront_vendor_id_unique";`);
    this.addSql(`alter table if exists "vendor_storefront" drop constraint if exists "vendor_storefront_storefront_code_unique";`);
    this.addSql(`create table if not exists "vendor_storefront" ("id" text not null, "storefront_code" text not null, "welcome_message" text null, "is_active" boolean not null default true, "vendor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_storefront_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_storefront_storefront_code_unique" ON "vendor_storefront" ("storefront_code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_storefront_vendor_id_unique" ON "vendor_storefront" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_storefront_deleted_at" ON "vendor_storefront" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_storefront" add constraint "vendor_storefront_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor_storefront" cascade;`);
  }

}
