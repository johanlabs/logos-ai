const fs = require('fs');
const path = require('path');
const glob = require('glob');

const { log } = require('../../src/utils/log');

const parsePrismaSchema = (content, source) => {
    const models = {};
    const modelRegex = /model\s+(\w+)\s+\{([\s\S]*?)\}/g;
    let match;
    while ((match = modelRegex.exec(content)) !== null) {
        const modelName = match[1];
        const fieldsContent = match[2].trim();
        const fields = fieldsContent.split('\n')
            .map((line) => line.trim()).filter(Boolean);
        models[modelName] = { fields, source };
    }
    return models;
};

const mergeSchemas = (baseSchema, newSchema) => {
    for (const [modelName, { fields: newFields, source }] of Object.entries(newSchema)) {
        if (!baseSchema[modelName]) {
            baseSchema[modelName] = { fields: newFields, source };
        } else {
            const { fields: existingFields, source: existingSource } = baseSchema[modelName];
            const fieldMap = {};
            existingFields.forEach((field) => {
                const [fieldName, fieldType] = field.split(/\s+/);
                fieldMap[fieldName] = fieldType;
            });
            newFields.forEach((newField) => {
                const [newFieldName, newFieldType] = newField.split(/\s+/);
                if (!fieldMap[newFieldName]) {
                    existingFields.push(newField);
                } else if (fieldMap[newFieldName] === newFieldType) {
                    log(`"${newFieldName}" already exists in "${modelName}"`, 'gray');
                } else {
                    log(`"${newFieldName}" has type conflict with "${modelName}"`, 'error');
                    log(
                        `"${modelName}" has type as "${fieldMap[newFieldName]}" prevented from changing to "${newFieldType}"`,
                        'yellow',
                        { level: 3 }
                    );
                }
            });

            baseSchema[modelName].source = `${existingSource}, ${source}`;
        }
    }
    return baseSchema;
};

const schemaToString = (schema) => {
    return Object.entries(schema)
        .map(([modelName, { fields, source }]) => {
            const comment = `// @: ${source}`;
            return `${comment}\nmodel ${modelName} {\n  ${fields.join('\n  ')}\n}`;
        })
        .join('\n\n');
};

const createSchemas = () => {
    const fragmentsDir = path.join(__dirname, '..', '..', 'prisma', 'fragments');
    const targetDir = path.join(__dirname, '..', '..', 'prisma');
    const sourceDir = path.join(__dirname, '..', '..', 'src', 'packages');
    try {
        if (!fs.existsSync(fragmentsDir)) {
            throw new Error('Directory "fragments" not found.');
        }
        const fragmentFiles = glob.sync(path.join(fragmentsDir, '*.prisma'));
        if (fragmentFiles.length === 0) {
            throw new Error('No .prisma files found in the "fragments" directory.');
        }
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }
        let finalSchema = {};

        fragmentFiles.forEach((fragmentFile) => {
            const fileContent = fs.readFileSync(fragmentFile, 'utf-8');
            const fileName = path.basename(fragmentFile, '.prisma');
            const parsedSchema = parsePrismaSchema(fileContent, fileName);
            finalSchema = mergeSchemas(finalSchema, parsedSchema);
        });

        const schemaFiles = glob.sync(path.join(sourceDir, '*', 'schema.prisma'));
        if (schemaFiles.length === 0) {
            throw new Error('No schema.prisma files found in "src/packages/*".');
        }
        schemaFiles.forEach((schemaFile) => {
            const schemaContent = fs.readFileSync(schemaFile, 'utf-8');
            const folderName = path.basename(path.dirname(schemaFile));
            const parsedSchema = parsePrismaSchema(schemaContent, folderName); 
            finalSchema = mergeSchemas(finalSchema, parsedSchema);
        });

        let finalSchemaContent = schemaToString(finalSchema);
        const baseSchemaPath = path.join(fragmentsDir, 'schema.prisma');
        if (fs.existsSync(baseSchemaPath)) {
            const baseSchemaContent = fs.readFileSync(baseSchemaPath, 'utf-8');
            finalSchemaContent = `${baseSchemaContent}\n${finalSchemaContent}`;
        }
        const finalSchemaPath = path.join(targetDir, 'schema.prisma');
        fs.writeFileSync(finalSchemaPath, finalSchemaContent, 'utf-8');
        
        log('All .prisma files have been successfully merged into schema.prisma.\n');
    } catch (error) {
        log(`Error processing .prisma files: ${error.message}\n`, 'error');
    }
};

createSchemas();