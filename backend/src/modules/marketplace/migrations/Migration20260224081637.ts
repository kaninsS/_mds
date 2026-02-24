import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260224081637 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "sales_channel_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "sales_channel_id";`);
  }

}
