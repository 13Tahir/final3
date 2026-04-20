/**
 * G10: Security Headers (Helmet) Yapılandırması
 * 
 * Bu uygulama, 'helmet' kütüphanesini kullanarak bir Express uygulamasını
 * temel web saldırılarına karşı nasıl zırhlandıracağımızı gösterir.
 * Hedef: securityheaders.com üzerinde A+ skoru almak.
 */

const express = require('express');
const helmet = require('helmet');

const app = express();

// --- HELMET YAPILANDIRMASI ---
app.use(helmet({
    // Content Security Policy (CSP): Tarayıcının hangi kaynaklardan içerik yükleyebileceğini sınırlar.
    // XSS saldırılarını büyük ölçüde engeller.
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "trusted-scripts.com"],
            styleSrc: ["'self'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [], // HTTP'den HTTPS'e otomatik geçiş
        },
    },
    // HTTP Strict Transport Security (HSTS): Tarayıcıya siteye sadece HTTPS ile bağlanmasını zorunlu kılar.
    // MITM (Man-in-the-Middle) ve Downgrade saldırılarını önler.
    strictTransportSecurity: {
        maxAge: 31536000, // 1 Yıl
        includeSubDomains: true,
        preload: true
    },
    // X-Frame-Options: Sayfanın bir <frame>, <iframe> veya <object> içinde gösterilmesini engeller.
    // Clickjacking saldırılarını önler.
    frameguard: {
        action: 'deny'
    },
    // X-Content-Type-Options: Tarayıcının MIME tipini tahmin etmesini (sniffing) engeller.
    noSniff: true,
    // Referrer-Policy: Sayfadan çıkış yapıldığında referrer bilgisinin ne kadarının gönderileceğini belirler.
    referrerPolicy: { policy: 'no-referrer' },
}));

app.get('/', (req, res) => {
    res.send(`
        <h1>Security Headers Aktif!</h1>
        <p>A+ skoru için gerekli tüm header'lar (HSTS, CSP, X-Frame-Options vb.) helmet tarafından eklendi.</p>
        <ul>
            <li><b>CSP:</b> Inline scriptleri ve tanınmayan kaynakları engeller.</li>
            <li><b>HSTS:</b> Bağlantıyı HTTPS'e zorlar.</li>
            <li><b>X-Frame-Options:</b> Sitenizin başka bir sitede iframe içinde gösterilmesini engeller (Clickjacking koruması).</li>
        </ul>
    `);
});

/**
 * ÖZET (Rapor için):
 * 
 * 1. HSTS (Strict-Transport-Security): "Sadece HTTPS kullan" emridir. Güvenli olmayan kanallardan veri sızmasını önler.
 * 2. CSP (Content-Security-Policy): "Sadece bu adreslerden JS/CSS yükle" talimatıdır. En güçlü XSS savunmasıdır.
 * 3. X-Frame-Options / Frameguard: Sitemizin üzerine şeffaf bir katman konularak kullanıcının kandırılmasını (Clickjacking) önler.
 * 4. X-Content-Type-Options: Dosya yükleme özelliklerinde, bir .jpg dosyasının .js gibi çalıştırılmasını engeller.
 */

const PORT = 3002;
app.listen(PORT, () => console.log(`G10 Security Lab sunucusu http://localhost:${PORT} portunda çalışıyor.`));
