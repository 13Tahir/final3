// Görev 06: OAuth 2.0 PKCE İskeleti

const express = require('express');
const crypto = require('crypto');
const app = express();
const session = require('express-session');

app.use(session({ secret: 'rastgele-sir', resave: false, saveUninitialized: true }));

/**
 * -------------------------------------------
 * ADIM 1: GİRİŞ (Login) ve PKCE Challenge
 * -------------------------------------------
 */
app.get('/login', (req, res) => {
    // 1a. Code Verifier Oluştur (Rastgele string)
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    
    // Güvenlik için bunu session'a kaydediyoruz ki callback gelince karşılaştıralım.
    req.session.codeVerifier = codeVerifier;

    // 1b. Code Challenge Oluştur (Verifier'in SHA-256 hash'i)
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

    // GitHub/Google gibi OAuth sağlayıcılarına code_challenge'ımızı gönderiyoruz
    // (Burada sadece örnek URL bastırılmıştır)
    const authUrl = `https://oauth-provider.com/auth?response_type=code` +
                    `&client_id=BENIM_CLIENT_ID` +
                    `&redirect_uri=http://localhost:3000/callback` +
                    `&code_challenge=${codeChallenge}` +
                    `&code_challenge_method=S256`; // Şifreleme metodu

    res.redirect(authUrl);
});

/**
 * -------------------------------------------
 * ADIM 2: CALLBACK ve TOKEN EXCHANGE
 * -------------------------------------------
 */
app.get('/callback', async (req, res) => {
    // 2a. Oauth sağlayıcısından dönen geçici KOD
    const authCode = req.query.code;
    
    // 2b. Daha önce session'a kaydettiğimiz Verifier'ı alıyoruz
    const codeVerifier = req.session.codeVerifier;

    // 2c. Token Almak İçin İstek (Sağlayıcıya Code ve Verifier yollanır)
    const tokenRequestBody = {
        grant_type: 'authorization_code',
        client_id: 'BENIM_CLIENT_ID',
        code: authCode,
        redirect_uri: 'http://localhost:3000/callback',
        // GÜVENLİK: Artık Secret Key yollamıyoruz, onun yerine Verifier yolluyoruz.
        code_verifier: codeVerifier 
    };

    /**
     * DİKKAT: 
     * Sağlayıcı, daha önce verdiğimiz Challenge ile şimdi verdiğimiz Verifier'ı
     * karşılaştırır. Eşleşirse token verir. Böylece araya giren saldırganlar code'u çalsa bile 
     * Verifier onlarda olmadığı için token alamazlar.
     */
    
    res.send("İşlem başarılı. Token alındı.");
});
