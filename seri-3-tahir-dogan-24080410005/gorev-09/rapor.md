# Görev 09: SBOM Üretimi ve Trivy Zafiyet Taraması (CVE)

Modern projelerde biz geliştiricilerin kendi yazdığımız kodlar kadar (Görev 8 SAST), dışarıdan `npm install` diyerek indirdiğimiz kütüphanelerin de zafiyet içerme riski (SCA) vardır. Bunu çözmek için SBOM ve Trivy ikilisini bir senaryoda uyguladım.

## Kullanılan Komutlar Ne İşe Yarıyor?
1. `syft dir:. -o cyclonedx-json=sbom.json`: Bu komutu proje ana dizinimde çalıştırdım. **Syft**, projeyi boydan boya tarıyor ve kullandığım tüm kütüphanelerin (Express, Mongoose vb.) ve alt bağımlılıklarının bir röntgenini çeker. Bunu standartlaştırılmış `cyclonedx-json` formatında `sbom.json` adı altında kaydeder. Yani artık "Benim projem hangi paketlerin hangi sürümlerinden oluşuyor?" sorusunun faturası (BOM) ortaya çıkar.
2. `trivy fs --severity CRITICAL,HIGH .`: **Trivy** ise güncel global CVE (Ortak Zafiyet Veritabanı) listesini bilgisayarıma çeker ve projemdeki dosyalar veya az önce çıkan SBOM listesi ile karşılaştırır. Ben sonuna `--severity CRITICAL,HIGH` ekleyerek sadece "Sistemi çökertebilecek kırmızı alarm" niteliğindeki en riskli uyarıları vermesini istedim.

## Örnek Bir "Kritik" Zafiyet Analizi (CVE Senaryosu)
Trivy taramasını yaptığımda projemde epey eski kalmış bir JSON web token paketine ait zafiyet yakaladığımı varsayalım:

| CVE Kimliği (ID) | Paket Adı (Package) | Ciddiyet Seviyesi (Severity) | Çözüm / Yama Sürümü (Fix Version) |
| :--- | :--- | :--- | :--- |
| **CVE-2022-23622** | `jsonwebtoken` | **CRITICAL** | `v9.0.0` |

*(Açıklama: Eski jsonwebtoken kütüphanesinde imza doğrulaması yapılırken asimetrik şifrelemelerde sunucunun kilitlenmesine neden olan bir açık bulunmuştur)*

### Nasıl Yamalayacağım?
Bu kritik açığı gördükten sonra yapmam gereken şey kodlarımı değil, dışa bağımlılığımı güncellemekti. `package.json` dosyasında uygulamanın `jsonwebtoken@8.5.1` kullandığını gördüm. Terminalimi açıp eski sorunlu kütüphaneyi güncel yamanmış (Fix version) kütüphane ile şu şekilde değiştirdim:

```bash
# Sürümü Trivy'nin önerdiği güvenli (yamalanmış) sürüme zorunlu güncelledim
npm install jsonwebtoken@9.0.0
```
Tekrar Trivy taraması yaptığımda veri tabanındaki sorunlu sürümlerle eşleşmediği için sıfır kritik bulgu (0 Critical) raporu verdi.
