# Görev 08: GitHub Actions ile SAST Pipeline (Semgrep) Kurulumu

Projemi doğrudan canlıya almadan veya repoma gönderilen kodları kabul etmeden önce, arka planda kod okuması yapıp zafiyet bulacak bir SAST aracı olan **Semgrep**'i GitHub Actions'a entegre ettim. Bu sayede otomatize edilmiş bir güvenlik duvarı kurmuş oldum.

## Adım Adım Pipeline Entegrasyonu
GitHub repomun kök dizininde gizli bir `.github` klasörü, onun içine `workflows` ve onun da içine `semgrep.yml` adında bir YAML dosyası açarak adım adım kuralımı tanımladım. 

`semgrep.yml` İçeriği:
```yaml
name: Semgrep SAST 

on:
  push:
    branches: [ "main" ] # Projeye her kod pushlandığında çalışır
  pull_request:
    branches: [ "main" ] # Başkası PR attığında da onu kontrol eder

jobs:
  semgrep-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Kodu İndir
        uses: actions/checkout@v3

      - name: Semgrep Resmi Aracını Çalıştır
        uses: returntocorp/semgrep-action@v1
        with:
          config: "p/default" # Semgrep'in varsayılan güvenlik kural setini kullanır
          generateSarif: "1"  # Bulguları GitHub Security sekmesine basması için SARIF çıktısı alır
```

## Örnek Zafiyet Tespiti ve Çözümü
Ben kendi repoma bilerek tehlikeli bir komut olan `eval()` barındıran bir kod koydum. Bilindiği gibi eval içine dışarıdan gelen metni Javascript koduymuş gibi çalıştırır (Code Injection).

### Yakalanan Hatalı Kod:
```javascript
const express = require('express');
const app = express();

app.get('/hesapla', (req, res) => {
    const islem = req.query.islem; // Kullanıcı "2+2" yerine "process.exit()" bile yazabilir
    // Semgrep BURAYI yakaladı: [security] "eval() calls with user-input"
    const sonuc = eval(islem); 
    res.send("Sonuç: " + sonuc);
});
```

Pipeline bu kodu gördüğünde bana CI/CD sürecinde e-posta atıp "Güvenlik açığı buldum, bu kodu main branch'e birleştiremezsin" tarzında bir GitHub Workflow hatası (fail) verdi. 

### Güvenli Hale Getirilmiş Çözüm:
Bu hatayı çözmek için matematiğe dayalı işlemleri bir kod yürütücüsüyle değil, güvenli JSON parçalayıcıları (veya sadece o işe ayrılmış güvenli math kütüphaneleri) ile parse edip yapmalıyız. Ben en kolayı olarak `parseInt` gibi spesifik dönüştürücüler kullanılarak yapılan haline güncelledim:

```javascript
app.get('/topla', (req, res) => {
    // eval kullanmak yerine açıkça ne beklediğimizi belirtiyoruz
    const sayi1 = parseInt(req.query.s1, 10);
    const sayi2 = parseInt(req.query.s2, 10);

    if (isNaN(sayi1) || isNaN(sayi2)) {
        return res.status(400).send("Geçersiz sayı girdisi.");
    }
    
    res.send("Sonuç: " + (sayi1 + sayi2));
});
```
Semgrep dosyayı tekrar okuduğunda tehlikeli bir `eval()` bulamadığı için bana (Pass) onayı verdi ve kodum başarıyla projeye eklendi.
