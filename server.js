const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 💾 قاعدة بيانات طلاب وحش الفيزياء (أدخل أرقام الكروت الحقيقية هنا)
const studentsDatabase = [
    { cardId: "0001234567", name: "أحمد محمد علي", group: "الصف الثالث الثانوي - مجموعة أ", parentPhone: "201000000001" },
    { cardId: "0009876543", name: "سارة عبد الله", group: "الصف الثاني الثانوي - مجموعة ب", parentPhone: "201000000002" }
];

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('امسح الـ QR للربط بواتساب المنصة:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ نظام وحش الفيزياء جاهز تماماً لإرسال الرسائل أول بأول!');
});

app.post('/scan-card', async (req, res) => {
    const { cardId } = req.body;
    const student = studentsDatabase.find(s => s.cardId === cardId);

    if (!student) {
        return res.status(404).json({ message: 'هذا الكارت غير مسجل في مجاميع الفيزياء!' });
    }

    try {
        const whatsappNumber = `${student.parentPhone}@c.us`;
        const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        
        // 📝 نص الرسالة الرسمي باسم المستر ومادته
        const message = `ولي الأمر المحترم،\nنحيطكم علماً بأن ابنكم/ابنتكم: *${student.name}*\nقد وصل الآن بأمان لحضور محاضرة الفيزياء مع *الأستاذ محمود بكر (وحش الفيزياء)*.\n\n⏱️ وقت تسجيل الدخول: *${currentTime}*\n📍 المجموعة: *${student.group}*\n\nنتمنى لأولادنا دائماً التفوق والدرجات النهائية بالفيزياء.`;

        await client.sendMessage(whatsappNumber, message);
        console.log(`✉️ تم إرسال إشعار حضور فيزياء لولي أمر: ${student.name}`);

        res.json({ studentName: student.name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ بشبكة الواتساب أثناء الإرسال.' });
    }
});

app.listen(3000, () => console.log('🚀 سيرفر وحش الفيزياء يعمل على منفذ 3000'));
client.initialize();
