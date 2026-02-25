const tsConfigPaths = require("tsconfig-paths");
const path = require("path");
const tsConfig = require("./tsconfig.json");

tsConfigPaths.register({
    baseUrl: path.join(__dirname, "."),
    paths: tsConfig.compilerOptions.paths,
});

const { initialize } = require("@medusajs/framework/utils");
const { Modules } = require("@medusajs/framework/utils");

async function fixApiKey() {
    const express = require("express");
    const loaders = require("@medusajs/medusa/dist/loaders").default;

    // Note: For Medusa framework v2, we can just initialize the modules directly.
    const { initDb } = require("@medusajs/framework/config");
    // The simplest way to run a one-off in v2 is just booting picking up the container.

    console.log("To properly execute this directly via JS Admin SDK locally, you can use the Medusa client.");
}

fixApiKey();
