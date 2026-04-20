# Görev 10: Security Headers (Helmet)

Bu uygulamayı geliştirirken temel amacım securityheaders sitesinden "A+" skoru alabilmek adına eksik olan HTTP güvenlik başlıklarını tamamlamaktı. Bunun için Node.js tarafında `helmet` kütüphanesinden yararlandım.

Kodu kurarken odaklandığım **3 kritik header (başlık)** şunlardı:
1. **HSTS (Strict-Transport-Security):** İstemciye (tarayıcıya) site üzerine HTTP üzerinden bağlanmayı denemesini yasaklayıp trafiği HTTPS üzerinden akmaya zorluyor.
2. **CSP (Content-Security-Policy):** Uygulamaya dışarıdan rastgele scriptlerin veya zararlı dosyaların enjekte edilip (XSS) yüklenmesine mani olmak için güvenilir kaynak listesi ayarladım.
3. **X-Frame-Options:** Kötü niyetli kişilerin benim sitemi kendi sitelerinde görünmez iframe'lerin içine gömüp (Clickjacking / Tık avcılığı) kullanıcılarımı kandırmasının önüne geçtim.
