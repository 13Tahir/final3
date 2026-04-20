# Görev 02: SQL Injection Savunması

Bu görev kapsamında, zafiyetli ve güvenli kod arasındaki farkları görmek için basit bir Express uygulaması yazdım. 

Öncelikle yazdığım **"Before"** kısmında, dışarıdan gelen kullanıcı verilerini (email vs.) hiçbir süzgeçten geçirmeden doğrudan string birleştirmeyle SQL sorgusunun içine koydum. Bu yapı, veriyle kodu birbirine karıştırdığı için saldırganın sorgu yapısını bozarak sisteme sızmasına (SQL Injection) sebep oluyor.

Bunu çözmek için yazdığım **"After"** kısmında ise Prisma ORM'den faydalandım. Prisma arka planda verileri **Parameterized Query** mantığıyla işliyor. Yani sisteme "Bu gelen ifade bir SQL komutu değil, sadece basit bir metin verisidir" garantisini vermiş oluyorum. Böylece birisi tek tırnak ( ' ) veya farklı karakterler yollasa dahi veritabanı bunu zararsız bir string olarak görüyor ve enjeksiyon işlemi engellenmiş oluyor.
