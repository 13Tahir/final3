# Görev 01: OWASP Top 10 Haritalama (Supabase Örneği)

Bu görevde, açık kaynaklı popüler bir BaaS (Backend as a Service) projesi olan **Supabase** mimarisini inceleyerek OWASP Top 10 risklerine karşı aldıkları güncel tedbirleri haritalandırdım. Supabase, PostgreSQL tabanlı olduğu için özellikle veri erişimi ve yetkilendirme konularında ciddi güvenlik önlemleri almaktadır.

## Supabase Güvenlik Haritası (5 Kategori)

| OWASP Kategorisi | Supabase Üzerindeki Tedbir / Önlem |
| :--- | :--- |
| **A01: Broken Access Control** | RLS (Row Level Security) kullanarak veritabanı satırları bazında erişim kısıtlamaları uygulanır. Kimlik doğrulamadan geçen kullanıcının sadece kendi verisini görebilmesi sağlanır. |
| **A02: Cryptographic Failures** | Tüm API haberleşmesi zorunlu SSL/TLS sertifikaları üzerinden şifreli (HTTPS) akar. Şifreler veritabanında düz metin olarak değil bcrypt veya modern şifreleme algoritmalarıyla hashlenerek tutulur. |
| **A03: Injection** | PostgREST mimarisi kullanılarak kullanıcıdan gelen tüm istekler hazır ve parametreli sorgulara (parameterized queries) dönüştürülür. Bu sayede SQL Injection ataklarının önüne geçilir. |
| **A04: Insecure Design** | Güvenli tasarım ilkeleri benimsenerek, tüm tablolar default olarak "erişime kapalı" (secure by default) şekilde oluşturulur. İzinleri geliştirici manuel olarak vermelidir. |
| **A07: Identification and Auth Failures**| Gotrue auth servisi sayesinde kaba kuvvet (Brute-force) saldırılarına karşı rate limiting (istek sınırlama) devrededir ve MFA (Multi-Factor Authentication) desteği sunulur. |

## Olası Bir Zafiyet Senaryosu ve Teknik Açıklama

Supabase her ne kadar SQL Injection'a karşı korunaklı olsa da, Supabase kullanan bir geliştiricinin Frontend veya Backend tarafında dikkatsizce yazdığı **Server-Side Request Forgery (SSRF)** tipinde bir zafiyet ortaya çıkabilir. (A10:2021 Server-Side Request Forgery).

Örneğin, uygulamanın kullanıcıdan bir profil fotoğrafı URL'i alıp bunu sunucu tarafında indirdiği bir senaryo düşünelim:

```javascript
// [ZAFİYETLİ KOD ÖRNEĞİ]
const express = require('express');
const axios = require('axios');
const app = express();

// Kullanıcı bir URL gönderdiğinde sunucu bu URL'e istek atıyor
app.post('/fetch-avatar', async (req, res) => {
    const userProvidedUrl = req.body.avatar_url; 
    
    try {
        // Geliştirici burada kullanıcının girdiği URL'yi doğrulamadan doğrudan sunucuya fetchetiyor.
        // Saldırgan buraya "http://169.254.169.254/latest/meta-data/" (AWS Metadata) girebilir!
        const response = await axios.get(userProvidedUrl);
        res.send(response.data);
    } catch (error) {
        res.status(500).send("Görsel alınamadı");
    }
});
```

**Nasıl Çözülür?** 
Geliştiricinin URL üzerinden sunucuya istek attırdığı yerlerde; hedefin özel (private) bir IP olup olmadığını kontrol eden bir SSRF koruma filtresi (whitelist/blacklist) yazması veya isteği sadece belirli alan adlarıyla (örn: `s3.amazonaws.com`) sınırlandırması gerekmektedir.
