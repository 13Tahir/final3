/**
 * G2: SQL Injection Lab - Before & After Örneği
 * 
 * Bu dosya bir Juice Shop senaryosunu simüle eder.
 * 1. "Before" kodu: String birleştirme (concatenation) kullanarak zafiyetli sorgu.
 * 2. "After" kodu: Prisma ORM ve Parameterized Query kullanarak güvenli sorgu.
 */

const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- BEFORE (Zafiyetli Kod) ---
// Bu kodda kullanıcı girişi doğrudan sorguya eklenir. ' OR 1=1 -- gibi bir girdi tüm kullanıcıları listeler.
app.get('/vulnerable-login', async (req, res) => {
    const { email, password } = req.query;
    
    // TEHLİKELİ: String birleştirme ile SQL sorgusu oluşturma
    // Örnek saldırı: email=admin@juice-sh.op'--
    const query = `SELECT * FROM Users WHERE email = '${email}' AND password = '${password}'`;
    
    console.log("Çalışan Sorgu:", query);
    
    // Not: Bu kısım sadece mantığı göstermek içindir.
    res.send({ message: "Zafiyetli sorgu oluşturuldu", query });
});

// --- AFTER (Güvenli Kod - Prisma ORM) ---
// Modern ORM'ler (Prisma, TypeORM vb.) otomatik olarak parametreli sorgular kullanır.
app.get('/secure-login-orm', async (req, res) => {
    const { email, password } = req.query;

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email, // Prisma bunu otomatik olarak sanitize eder (parameterization)
                password: password
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).send("Bir hata oluştu");
    }
});

// --- AFTER (Güvenli Kod - Parameterized Query - pg-promise/mysql2 örneği) ---
// Eğer ham SQL kullanılması gerekiyorsa, değişkenler sorgu metnine gömülmez, placeholder (?) kullanılır.
app.get('/secure-login-raw', async (req, res) => {
    const { email, password } = req.query;

    // GÜVENLİ: Değişkenler sorgudan ayrı olarak gönderilir
    const query = "SELECT * FROM Users WHERE email = $1 AND password = $2";
    const values = [email, password];

    console.log("Güvenli sorgu (Parametreli) hazır.");
    res.send({ message: "Parametreli sorgu yapısı kullanıldı", query, values });
});

/**
 * TEKNİK AÇIKLAMA (Rapor için):
 * 
 * "Before" kodunda, kullanıcıdan alınan veriler doğrudan SQL cümlesinin içine yerleştirilir. Bu, saldırganın 
 * SQL sintaksını değiştirmesine (örneğin sorguyu erken bitirip kendi komutlarını eklemesine) olanak tanır.
 * 
 * "After" kodunda ise iki yaklaşım vardır:
 * 1. ORM Kullanımı: Prisma gibi araçlar, veriyi sorgudan ayırarak veritabanı sürücüsüne iletir.
 * 2. Parameterized Queries: SQL motoruna "sorgu yapısı budur, veriler ise şunlardır" şeklinde bilgi verilir. 
 * Veritabanı, kullanıcı girişini 'kod' olarak değil, sadece 'veri' (string) olarak işler, böylece SQL enjeksiyonu engellenir.
 */

const PORT = 3000;
app.listen(PORT, () => console.log(`G2 Lab sunucusu http://localhost:${PORT} üzerinde çalışıyor.`));
