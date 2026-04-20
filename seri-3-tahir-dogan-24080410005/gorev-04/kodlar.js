/**
 * G4: CSRF Token Sistemi ve Koruma Mekanizması
 * 
 * Bu uygulama, Express.js üzerinde csurf middleware'i kullanarak
 * CSRF (Cross-Site Request Forgery) saldırılarına karşı nasıl önlem alınacağını gösterir.
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bodyParser = require('body-parser');

const app = express();

// CSRF için cookie-parser gereklidir
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// CSRF Middleware yapılandırması (Cookie tabanlı)
const csrfProtection = csrf({ cookie: true });

// Dummy Veritabanı
let userBalance = 1000;

app.get('/', (req, res) => {
    res.send('CSRF Lab Ana Sayfası. /transfer adresine gidin.');
});

// GET /transfer - Formu sunar ve bir CSRF Token üretir
app.get('/transfer', csrfProtection, (req, res) => {
    // req.csrfToken() her istekte yeni bir token üretir (veya mevcut olanı doğrular)
    const token = req.csrfToken();
    
    res.send(`
        <h1>Para Transferi</h1>
        <p>Mevcut Bakiye: ${userBalance} TL</p>
        <form action="/transfer" method="POST">
            <!-- GÜVENLİK: Gizli CSRF Token inputu -->
            <input type="hidden" name="_csrf" value="${token}">
            
            Alıcı: <input type="text" name="to" required><br>
            Miktar: <input type="number" name="amount" required><br>
            <button type="submit">Gönder</button>
        </form>
        <p>Token: <code>${token}</code></p>
    `);
});

// POST /transfer - Transfer işlemini gerçekleştirir
// csurf middleware'i otomatik olarak gövdedeki veya header'daki token'ı kontrol eder.
app.get('/transfer', csrfProtection, (req, res) => {
    const { to, amount } = req.body;
    
    userBalance -= parseInt(amount);
    res.send(`Başarılı! ${to} kişisine ${amount} TL gönderildi. Yeni bakiye: ${userBalance} TL`);
});

// HATA YAKALAMA: CSRF Token geçersizse 403 Forbidden döner
app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);

    // CSRF saldırısı simülasyonu yakalandığında
    res.status(403);
    res.json({
        error: "403 Forbidden",
        message: "Geçersiz veya eksik CSRF token! Bu istek engellendi (CSRF Koruması).",
        technical_note: "Saldırgan, başka bir site üzerinden bu POST isteğini tetiklemeye çalıştı ancak token bilgisine sahip olmadığı için başarısız oldu."
    });
});

/**
 * SENARYO AÇIKLAMASI (Rapor için):
 * 
 * 1. Kullanıcı /transfer formunu açtığında, sunucu bir '_csrf' token'ı üretir ve forma gömer.
 * 2. Kullanıcı formu gönderdiğinde, tarayıcı bu token'ı POST gövdesinde sunucuya iletir.
 * 3. Sunucu, gelen token'ın cookie'deki değerle eşleşip eşleşmediğini kontrol eder.
 * 4. SİMÜLASYON: Eğer bir saldırgan, kullanıcıyı kendi hazırladığı sahte bir siteye çekip
 *    formu otomatik JS ile (token olmadan) bu adrese POST ettirirse, sunucu token'ı
 *    bulamayacağı için isteği reddeder ve 'EBADCSRFTOKEN' hatası (403) fırlatır.
 */

const PORT = 3001;
app.listen(PORT, () => console.log(`G4 CSRF Lab sunucusu http://localhost:${PORT} portunda aktif.`));
