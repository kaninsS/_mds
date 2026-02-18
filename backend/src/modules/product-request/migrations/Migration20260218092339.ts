import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260218092339 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_request" add column if not exists "vendor_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_request" drop column if exists "vendor_id";`);
  }

}
