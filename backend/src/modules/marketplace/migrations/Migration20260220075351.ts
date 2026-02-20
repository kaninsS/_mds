import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260220075351 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "vendor_customer" ("id" text not null, "customer_id" text not null, "status" text check ("status" in ('active', 'invited', 'blocked')) not null default 'active', "invited_by" text null, "joined_at" timestamptz null, "vendor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_customer_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_customer_vendor_id" ON "vendor_customer" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_customer_deleted_at" ON "vendor_customer" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vendor_order_item" ("id" text not null, "vendor_id" text not null, "order_id" text not null, "line_item_id" text not null, "subtotal" numeric not null, "vendor_payout_status" text check ("vendor_payout_status" in ('pending', 'processing', 'paid')) not null default 'pending', "raw_subtotal" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_order_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_order_item_deleted_at" ON "vendor_order_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vendor_product_visibility" ("id" text not null, "vendor_id" text not null, "product_id" text not null, "rule_type" text check ("rule_type" in ('all', 'customer', 'none')) not null default 'all', "visibility" text check ("visibility" in ('visible', 'hidden')) not null default 'visible', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_product_visibility_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_product_visibility_deleted_at" ON "vendor_product_visibility" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vendor_product_visibility_customer" ("id" text not null, "customer_id" text not null, "visibility_rule_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_product_visibility_customer_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_product_visibility_customer_visibility_rule_id" ON "vendor_product_visibility_customer" ("visibility_rule_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_product_visibility_customer_deleted_at" ON "vendor_product_visibility_customer" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_customer" add constraint "vendor_customer_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);

    this.addSql(`alter table if exists "vendor_product_visibility_customer" add constraint "vendor_product_visibility_customer_visibility_rule_id_foreign" foreign key ("visibility_rule_id") references "vendor_product_visibility" ("id") on update cascade;`);

    this.addSql(`drop table if exists "vendor_request" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor_product_visibility_customer" drop constraint if exists "vendor_product_visibility_customer_visibility_rule_id_foreign";`);

    this.addSql(`create table if not exists "vendor_request" ("id" text not null, "title" text not null, "description" text null, "price" numeric not null, "vendor_email" text not null, "image_url" text null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "raw_price" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_request_deleted_at" ON "vendor_request" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "vendor_customer" cascade;`);

    this.addSql(`drop table if exists "vendor_order_item" cascade;`);

    this.addSql(`drop table if exists "vendor_product_visibility" cascade;`);

    this.addSql(`drop table if exists "vendor_product_visibility_customer" cascade;`);
  }

}
