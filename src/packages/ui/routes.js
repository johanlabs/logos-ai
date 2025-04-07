const fs = require('fs');
const path = require('path');
const svelteCompiler = require('svelte/compiler');

module.exports = [
    {
        method: 'get',
        router: 'page/:filename',
        call: [ async (req, res) => {
            const filename = req.params.filename;
            const filePath = path.join(__dirname, 'pages', `${filename}.svelte`);

            // Verifica se o arquivo existe
            fs.readFile(filePath, 'utf8', (err, svelteCode) => {
                if (err) {
                    return res.status(404).send('Svelte not found.');
                }

                try {
                    // Compilação do código Svelte
                    const { js, css } = svelteCompiler.compile(svelteCode, {
                        generate: 'dom', // Gera o código necessário para o navegador
                        hydratable: true, // Se você pretende usar SSR (Server-Side Rendering)
                    });

                    // Retorna o HTML com o código JS e CSS compilados
                    res.setHeader('Content-Type', 'text/html');

                    res.send(`
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <!-- Inclui o Svelte diretamente no HTML -->
                                <script src="https://cdn.jsdelivr.net/npm/svelte@latest"></script>
                                <style>${css.code}</style>
                            </head>
                            <body>
                                <div id="app"></div>
                                <script type="module">
                                    // Código Svelte compilado diretamente no HTML
                                    ${js.code}

                                    // Inicia o Svelte com o código compilado
                                    const app = new App({
                                        target: document.getElementById('app'),
                                    });
                                </script>
                            </body>
                        </html>
                    `);
                } catch (compilationError) {
                    res.status(500).send('Erro ao compilar o arquivo Svelte!');
                }
            });
        }]
    }
];
