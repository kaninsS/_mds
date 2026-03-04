import { initialize as initializeOms } from "@medusajs/order";
import { MedusaApp } from "@medusajs/modules-sdk";
import { resolve } from "path";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const { query } = await MedusaApp({
    sharedResourcesConfig: {
      database: {
        clientUrl: "postgres://postgres:postgres@localhost:5432/medusa-test",
      },
    },
    modulesConfig: {
      order: {
        resolve: "@medusajs/order",
      },
      marketplace: {
        resolve: resolve(__dirname, "src/modules/marketplace"),
      }
    }
  });

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "total", "subtotal", "tax_total", "items.id", "items.unit_price", "items.quantity"],
    filters: {},
  });
  
  console.log(JSON.stringify(orders.slice(0, 5), null, 2));
}
run();
