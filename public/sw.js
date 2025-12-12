// sw.js

let reminderInterval = null;
let storedMedications = [];
let lastSentNotifications = {}; // برای ذخیره آخرین زمان ارسال

// --- تابع اصلی: بررسی و ارسال نوتیفیکیشن ---
function checkAndSendNotifications() {
    // console.log(`SW check: ${new Date().toLocaleTimeString()}`); // برای عیب یابی: می توانید این خط را موقتاً فعال کنید
    const now = new Date();
    const today = now.toDateString();
    
    if (storedMedications.length === 0) return;

    storedMedications.forEach(med => {
        // --- منطق داروی روزانه (Daily) ---
        if (med.daily && med.time) {
            const [hour, minute] = med.time.split(":").map(Number);
            const keyDaily = `daily-${med.id}-${today}`; 

            if (now.getHours() === hour && now.getMinutes() === minute) {
                if (lastSentNotifications[keyDaily] !== true) {
                    
                    self.registration.showNotification(`یادآور داروی ${med.name}`, { 
                        body: `زمان مصرف داروی ${med.name} است. دوز: ${med.dose}`, 
                        tag: keyDaily, 
                        icon: "/favicon.ico" 
                    });
                    
                    lastSentNotifications[keyDaily] = true;
                    // console.log(`SW: Daily notification sent for ${med.name}`);
                }
            }
        }
        
        // --- منطق داروی ساعتی (Hourly) ---
        if (med.hourly && med.startDate && med.hourlyInterval) {
            const start = new Date(med.startDate);
            const diffMs = now.getTime() - start.getTime(); 
            const totalHoursElapsed = Math.floor(diffMs / (1000 * 60 * 60)); 
            const intervalHours = Number(med.hourlyInterval);

            if (totalHoursElapsed > 0 && intervalHours > 0 && 
                totalHoursElapsed % intervalHours === 0 && 
                now.getMinutes() === 0) {
                
                const keyHourly = `hourly-${med.id}`;
                
                if (lastSentNotifications[keyHourly] !== totalHoursElapsed) {
                    
                    self.registration.showNotification(`یادآور داروی ${med.name}`, { 
                        body: `زمان مصرف داروی ${med.name} است. دوز: ${med.dose}`, 
                        tag: keyHourly, 
                        icon: "/favicon.ico" 
                    });
                    
                    lastSentNotifications[keyHourly] = totalHoursElapsed;
                    // console.log(`SW: Hourly notification sent for ${med.name}`);
                }
            }
        }
    });
}

// --- شنونده رویداد: دریافت پیام از برنامه اصلی ---
self.addEventListener("message", (event) => {
    const data = event.data;
    
    if (data.command === 'START_REMINDER') {
        // console.log("SW received START_REMINDER command. Medications count:", data.medications.length);
        storedMedications = data.medications; 
        
        // اگر قبلاً در حال اجراست، فقط لیست داروها را آپدیت کند.
        if (reminderInterval) {
             // console.log("SW interval already running. Medications updated.");
             return;
        }

        // شروع Loop زمان‌بندی
        if (storedMedications.length > 0) {
            // console.log("SW starting new interval.");
            checkAndSendNotifications(); 
            reminderInterval = setInterval(checkAndSendNotifications, 60000); 
        }
    }
});

// --- مدیریت چرخه حیات SW ---
self.addEventListener('install', (event) => {
    // skipWaiting تضمین می‌کند که SW جدید بلافاصله شروع به کار کند
    self.skipWaiting(); 
    console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
    // clients.claim تضمین می‌کند که SW کنترل تمام تب‌های موجود را در دست بگیرد
    event.waitUntil(self.clients.claim()); 
    console.log('Service Worker activated and claimed clients.');
});