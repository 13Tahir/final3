# Görev 07: OWASP ZAP Dinamik Taraması (DAST) ve Bulgu Analizi

Kendi lokalimde geliştirdiğim web projesini `localhost:3000` üzerinden OWASP ZAP (Baseline Scan) ile taradığımda, karşıma **Medium/High** seviyeli yaygın bir güvenlik uyarısı çıktı.

## ⚠️ ZAP Taraması Bulgusu: "Cookie No HttpOnly Flag" (Eksik Bayrak)
Uygulamam giriş yapan kullanıcılara oturum bilgisi (Session ID veya JWT) içeren bir çerez gönderiyordu. Ancak bu çerezin sadece HTTP paketleri üzerinden iletilebileceğini belirten belirli bir bayrak eksikti.

### OWASP Top 10 Karşılığı
Bu bulgu, OWASP Top 10 listesinde doğrudan **A07:2021 Identification and Authentication Failures** (veya yansımasına göre A01: Broken Access Control / A05: Security Misconfiguration) kategorisine girmektedir. Çerezler güvence altında olmadığı için oturum çalınmaya müsaittir.

### Neden Tehlikeli?
Eğer cookie'nin üzerinde `HttpOnly` bayrağı olmazsa, o web sitesinde var olabilecek ufacık bir XSS (Cross-Site Scripting) zafiyetinde saldırgan, tarayıcının konsoluna gönderdiği tehlikeli bir JavaScript komutuyla (`document.cookie`) kurbanın oturum anahtarını direkt kendi sunucusuna çekebilir. İlgili bayrak bu JS iletişimini kestiği için hayat kurtarır.

## Çözüm: Node.js (Express) İçin Düzeltme Kodu
Uygulamama geri dönerek çerez (cookie) gönderdiğim kısmı aşağıdaki gibi `httpOnly: true` (ve diğer güvenlik pratikleri) ile güncelleyip ZAP uyarısını kapattım.

```javascript
app.post('/login', (req, res) => {
    // ... Parola kontrolü vs. ...
    const sessionId = "örnek_oturum_anahtarı_123";

    // ZAP Bulgusunu Düzelten Kısım
    res.cookie('session_id', sessionId, {
        httpOnly: true,  // <-- ASIL ÇÖZÜM BU: JavaScript erişimini engeller
        secure: true,    // Sadece HTTPS kullanımında iletilmesini sağlar
        sameSite: 'strict', // CSRF korumasına destek verir
        maxAge: 3600000  // 1 saat sonra otomatik geçersiz olur
    });

    res.send("Giriş başarılı!");
});
```
