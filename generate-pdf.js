const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    console.log('Iniciando generación de PDF...');
    
    const htmlPath = path.join(__dirname, 'database-relationships.html');
    const pdfPath = path.join(__dirname, 'Documentacion-Base-de-Datos-Event-Platform.pdf');
    
    // Verificar que el archivo HTML existe
    if (!fs.existsSync(htmlPath)) {
        console.error('Error: No se encontró el archivo HTML');
        process.exit(1);
    }
    
    let browser;
    try {
        console.log('Lanzando navegador...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        console.log('Cargando HTML...');
        await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
            waitUntil: 'networkidle0'
        });
        
        console.log('Generando PDF...');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            },
            preferCSSPageSize: true
        });
        
        console.log(`✅ PDF generado exitosamente: ${pdfPath}`);
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

generatePDF();
