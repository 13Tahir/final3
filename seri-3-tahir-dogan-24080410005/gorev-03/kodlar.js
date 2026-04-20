// G3: XSS + CSP Koruması Örnekleri
const express = require('express');
const app = express();

/**
 * -------------------------------------------
 * ÖNCE: Zafiyetli Versiyon (Reflected XSS)
 * -------------------------------------------
 * Kullanıcıdan gelen "name" parametresi hiçbir HTML entity 
 * dönüşümü yapılmadan doğrudan ekrana basılıyor.
 * Saldırgan ?name=<script>alert("Hacked")</script> yollayabilir.
 */
app.get('/xss-vulnerable', (req, res) => {
    const userName = req.query.name || 'Ziyaretçi';
    res.send(`
        <h1>Hoşgeldin, ${userName}</h1>
        <p>Burası güvenlik önlemi olmayan sayfa.</p>
    `);
});

/**
 * -------------------------------------------
 * SONRA: CSP Korumalı Güvenli Versiyon
 * -------------------------------------------
 * Content Security Policy (CSP) header'ı ekleniyor.
 * Sadece kendi kaynaklarımızdan (self) gelen scriptler çalışabilir,
 * URL üzerinden veya HTML içinden (inline) yazılan scriptler engellenir.
 */
app.get('/xss-secure', (req, res) => {
    // Güvenlik header'ı set ediliyor
    res.setHeader(
        "Content-Security-Policy", 
        "default-src 'self'; script-src 'self'"
    );

    const userName = req.query.name || 'Ziyaretçi';
    res.send(`
        <h1>Hoşgeldin, ${userName}</h1>
        <p>Burası CSP ile korunan sayfa.</p>
        <!-- Hata konsolunda bu inline script'in CSP tarafından engellendiği görülebilir -->
    `);
});

const PORT = 3003;
app.listen(PORT, () => console.log(`Görev 03: Sunucu ${PORT} portunda çalışıyor.`));
