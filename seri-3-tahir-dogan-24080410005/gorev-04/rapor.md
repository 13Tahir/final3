# Görev 04: CSRF Koruma Sistemi

Oluşturduğum Express projesinde CSRF saldırılarının önüne geçebilmek için sisteme `csurf` middleware kütüphanesini dahil ettim.

Açtığım `/transfer` rotasında çalışma mantığı şu şekilde işliyor: Kullanıcı sayfayı `GET` isteğiyle yüklediğinde, sunucu bu kullanıcıya (ve oturumuna) özel rastgele bir gizli token üretiyor ve bu token'ı formun içerisine `hidden` input olarak gizliyor.

Kullanıcı formu doldurup `POST` işlemi yaptığında, sunucu arka planda formdan gelen token ile kendi kaydettiği token'ı eşleştiriyor. Eğer birisi (saldırgan), beni başka bir sayfaya yönlendirip benim haberim olmadan tarayıcım üzerinden bu adrese gizli bir istek attırmaya kalkarsa, o site token'ı bilemeyeceği için sunucu işlemi otomatik olarak reddediyor. Ekran görüntülerinde de görebileceğiniz gibi token olmadan yapılan geçersiz bir işlemde sunucum direkt **403 Forbidden** status kodu ve hatası döndürüyor.
