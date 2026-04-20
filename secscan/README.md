# SecScan Security Scanner

**Hazırlayan:** Tahir Doğan
**Öğrenci No:** 24080410005

SecScan, modern web uygulamaları için geliştirilmiş kapsamlı bir güvenlik tarama aracıdır. Go'nun yüksek performanslı eşzamanlılık (concurrency) yetenekleri ve Next.js'in dinamik arayüz gücünü birleştirerek hızlı ve güvenilir güvenlik analizleri sunar.

![SecScan Dashboard Ekran Görüntüsü](frontend/public/screenshot.png) *(Örnek bir ekran görüntüsü buraya gelecektir)*

**Canlı Demo URL:** [https://secscan-demo.vercel.app](https://secscan-demo.vercel.app) *(Geçici bağlantı)*

## Proje Mimarisi

*   **Backend:** Go 1.22+ ve Gin Framework kullanılarak geliştirilmiştir. Goroutine pool ile yüksek hızlı taramalar yapar.
*   **Frontend:** Next.js 14 (App Router) ve TailwindCSS ile modern, responsive ve canlı veri akışlı (SSE) bir dashboard sunar.
*   **İletişim:** Bileşenler arası eşzamanlı ilerleme takibi için **Server-Sent Events (SSE)** teknolojisi kullanılmıştır.

## Desteklenen Güvenlik Modülleri

1.  **SSRF Koruması:** Özel IP bloklarına (10.0.0.0/8, 127.0.0.0/8 vb.) ve bulut sağlayıcı metadata servislerine yönelik istekleri engeller.
2.  **TCP Port Tarayıcı:** En yaygın 1000 portu Goroutine havuzu kullanarak eşzamanlı olarak tarar.
3.  **XSS Fuzzer:** Yansıtılmış (Reflected) XSS zafiyetlerini tespit etmek için özel payloadlar gönderir.
4.  **SQLi Fuzzer:** Boolean-based SQL Injection açıklarını tespit etmek için testler gerçekleştirir.
5.  **Security Headers Analizi:** Hedef sunucunun güvenlik başlıklarını (HSTS, CSP vb.) kontrol eder.
6.  **Gerçek Zamanlı Takip:** SSE protokolü ile tarama ilerlemesini anlık olarak görselleştirir.
7.  **Zafiyet Raporlama:** Tespit edilen olası açıkları log kayıtları ile detaylandırır.

## Kurulum ve Çalıştırma

Proje Docker Compose ile kolayca ayağa kaldırılabilir:

```bash
# Proje kök dizininde (Bu repoyu klonladıktan sonra)
git clone https://github.com/kullanici-adi/secscan.git
cd secscan

# Docker ile başlatın
docker-compose up --build
```

Uygulama ayağa kalktığında:
*   **Frontend:** `http://localhost:3000`
*   **Backend:** `http://localhost:8080`
adreslerinden erişilebilir.

---

### AI Kullanım Beyanı

Bu projenin geliştirme sürecinde, özellikle **Go eşzamanlılık (concurrency) modellerinin yapılandırılması**, **SSE (Server-Sent Events) istemci-sunucu mimarisinin kurulması** ve **Next.js TailwindCSS tasarım iskeletinin oluşturulması** konularında yapay zeka araçlarından (Claude/ChatGPT) teknik destek ve mimari tavsiye alınmıştır. Kodlamadaki mantıksal hataların ayıklanması ve en iyi güvenlik pratiklerinin entegre edilmesi süreçlerinde bu araçlar verimliliği artırmak amacıyla kullanılmıştır.
