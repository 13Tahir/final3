# Görev 06: OAuth 2.0 PKCE Entegrasyonu

Geliştirdiğim projede OAuth 2.0 giriş (Google vb.) akışını kurarken güvenliği üst düzeye taşımak için standart Authorization Code yerine **PKCE (Proof Key for Code Exchange)** mekanizmasını entegre ettim.

## PKCE Akışı ve Yazdığım Kodun Mantığı
Normalde `Client Secret` denilen bir gizli anahtarımız olur ve token alırken bunu OAuth sunucusuna yollarız. Ancak React Native veya frontend ağırlıklı uygulamalarda bu secret kodun içinde sızabileceği için PKCE kullanırız.

Yazdığım `/login` rotasında:
1. `code_verifier` adında rastgele uzun bir string oluşturuyorum ve bunu kendi tarafımda saklıyorum.
2. Bu verifier'ı SHA-256 ile şifreleyerek karmaşık bir hale getiriyor ve adını `code_challenge` yapıyorum.
3. OAuth giriş linkine bu şifrelenmiş challenge'ı ekliyorum. Yani Google'a "Benim şifreli kanıtım budur" diyorum.

Yazdığım `/callback` rotasında:
Kullanıcı giriş yapıp bize geçici bir "code" ile döndüğünde, gerçek veriye ulaşmak (Token almak) için Google'a geri istek atıyorum. Bu sefer Google'a şifrelenmemiş asıl `code_verifier`'ı yolluyorum. Google başındaki şifreli haliyle bunu kıyaslıyor ve eşleşirse araya kimsenin girmediğini anlayıp token'ı bana teslim ediyor. Eğer bir saldırgan callback kodumu ortadaki adam (MITM) yöntemiyle çalsa bile, verifier (kanıt) elinde olmadığı için token alamaz.

### ⚠️ GitHub Uyarısı ve `.env`
OAuth sağlayıcılarından aldığımız (özellikle backend üzerinden çalışıyorsak) `CLIENT_ID` ve `CLIENT_SECRET` gibi değerleri asla kodun içine (hardcoded) yazmamamız gerekir. Eğer bunu doğrudan kodun içine yazıp GitHub'a commitlersek, kodlarımız çalındığında yetkilendirme hesaplarımızı ele geçirebilirler. 

**Nasıl Yapılmalı?** 
Bu tip değerleri daima projenin kök dizinindeki `.env` adlı dosyaya değişken olarak ekliyoruz (örn. `GOOGLE_SECRET=asdasd`). Ardından GitHub'a bu dosyanın `git push` ile yollanmasını engellemek için `.gitignore` dosyasının içine sadece `.env` yazıyoruz. Böylece kodumuz internete gizli anahtarlarımız hariç gitmiş oluyor.
