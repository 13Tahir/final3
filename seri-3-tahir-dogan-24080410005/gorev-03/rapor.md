# Görev 03: XSS + CSP Koruması

## Ne Yaptım?
Yazdığım örnek kodda ilk başta `req.query.name` parametresini alıp hiçbir güvenlik önlemi olmadan (HTML karakterlerini escape etmeden) doğrudan sayfaya yazdırdım. Bu klasik bir **Reflected XSS** (Yansıtılmış XSS) açığı oluşturuyor. Saldırgan eğer linke `?name=<script>alert("hacklendi")</script>` yazarak bir kurbana gönderirse, o script kurbanın tarayıcısında çalışır.

## Nasıl Engelledim? (CSP)
Bu açığı kapatmak için HTTP yanıtlarıma **Content Security Policy (CSP)** başlıkları (header) ekledim. 
`Content-Security-Policy: default-src 'self'; script-src 'self'` kuralı sayesinde tarayıcıya şu emri vermiş oluyorum: 
> "Bu sayfada sadece benim kendi alan adımdan bizzat yüklediğim JS dosyalarını çalıştır. Dışarıdan (`<script src="saldırgan.com">`) veya adres çubuğundan HTML'in içine enjekte edilen inline (`<script>alert(1)</script>`) scriptlerin çalışmasını tamamen durdur."

Bu headera sahip olan sayfada saldırgan `<script>` etiketi enjekte etse bile tarayıcı (Chrome/Firefox vb.) bu scripti okur okumaz engeller ve console üzerinde "CSP ihlali oldu" hatası basar. Kullanıcım güvende kalır.
