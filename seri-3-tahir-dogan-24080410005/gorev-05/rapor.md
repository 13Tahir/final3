# Görev 05: JWT Güvenliği Denetimi (Audit)

Geliştirdiğim projede JWT (JSON Web Token) kullanırken güvenlik açıklarına meyil vermemek için 5 kritik kuralı şu şekilde uyguladım:

### 1- Güçlü (256-bit Random) Secret Key Kullanımı ve `.env` İçinde Saklama (Kural 2)
Token'ların imzalanması ve başkaları tarafından sahtesinin üretilememesi için tahmin edilemez uzun bir anahtar üretip bunu kodun içerisine yazmak yerine gizli `.env` dosyama koydum.
```javascript
// .env dosyası
// JWT_SECRET=3a0c... (64 karakterli hex veya base64 string)

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Koda hardcode edilmez, çevreden alınır
```

### 3- Kısa Süreli Geçerlilik Süresi (Exp Claim)
Token'ın sızması durumunda saldırganın süresiz hesabımı kullanmasını engellemek için token geçerlilik süresini (`expiresIn`) genellikle 15-30 dakika aralığında tutuyorum. Kullanıcı deneyimi için arka planda Refresh Token mekanizması kullanıyorum.
```javascript
const token = jwt.sign(
    { userId: user._id }, 
    secretKey, 
    { expiresIn: '30m' } // Maksimum 30 dakika
);
```

### 4- `alg: none` Zafiyetinin Reddedilmesi
Eski JWT kütüphanelerinde algoritma "none" olarak gelirse imza kontrolünün bypass edilmesi durumu yaşanabiliyordu. Yeni kütüphanelerde bu genellikle varsayılan olarak engelli ama ben işimi sağlama almak için `algorithms` kısmını `['HS256']` olarak kısıtlıyorum.
```javascript
jwt.verify(token, secretKey, { algorithms: ['HS256'] }, (err, decoded) => {
    // Sadece alg: HS256 olan tokenları kabul eder
});
```

### 5- Token'ın localStorage Yerine HttpOnly Cookie'de Saklanması
Frontend tarafında token'ı `localStorage` içerisine atarsam XSS zafiyeti anında JavaScript ile (document.cookie/localStorage) çalınabilirdi. Bunu önlemek için giriş yapıldığı an token'ı `HttpOnly` cookie ile gönderdim. Bu sayede tarayıcıdaki JS dosyaları tokeni okuyamıyor.
```javascript
// Backend (Express) tarafında başarılı giriş sonrası token set etme
res.cookie('token', token, {
    httpOnly: true,  // JavaScript üzerinden okunmasını engeller (XSS defansı)
    secure: true,    // Sadece HTTPS üzerinden gönderilir
    sameSite: 'strict', // CSRF saldırılarına karşı önlem
    maxAge: 30 * 60 * 1000 // 30 Dakika geçerlilik
});
```
