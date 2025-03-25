const fs = require("fs");
const path = require("path");

const { exec } = require("child_process");

const express = require("express");

const runCommand = (cmd, cwd) =>
    new Promise((resolve, reject) => {
        exec(cmd, { cwd }, (err, stdout, stderr) => {
            if (err) return reject(err);
            console.log(stdout);
            resolve();
        });
    });

const registerTemplates = async (app, package, buildCommand = "npm run build") => {
    const templatesPath = path.join(package.dir, "templates");
    const buildPath = path.join(templatesPath, "build");
    const buildMarker = path.join(templatesPath, ".build-done");

    if (!fs.existsSync(templatesPath)) {
        return;
    }

    if (!fs.existsSync(path.join(templatesPath, "package.json"))) {
        console.error(`❌ package.json não encontrado em ${templatesPath}`);
        return;
    }

    if (!package.folder || typeof package.folder !== "string" || /[^a-zA-Z0-9-_]/.test(package.folder)) {
        console.error(`❌ Nome de pasta inválido para ${package.name}`);
        return;
    }

    console.log(`🛠️  Construindo template para ${package.name}...`);

    try {
        if (!fs.existsSync(buildPath) || !fs.existsSync(buildMarker)) {
            await runCommand("npm install", templatesPath);
            await runCommand(buildCommand, templatesPath);
            fs.writeFileSync(buildMarker, "Build completed at " + new Date().toISOString());
            console.log(`✅ Template de ${package.name} foi compilado com sucesso.`);
        } else {
            console.log(`ℹ️  Usando build existente para ${package.name}`);
        }
    } catch (err) {
        console.error(`❌ Erro ao compilar o template de ${package.name}:`, err.message);
        return;
    }

    if (!fs.existsSync(buildPath)) {
        console.error(`❌ O build do template ${package.name} falhou.`);
        return;
    }

    app.use(`/${package.folder}`, express.static(buildPath));
    console.log(`🚀 Template de ${package.name} disponível em /${package.folder}`);
};

module.exports = {
    registerTemplates
};