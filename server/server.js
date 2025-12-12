import express from "express";
import webpush from "web-push";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// تولید VAPID keys یکبار و ذخیره کن (یا از کلید ثابت استفاده کن)
const vapidKeys = webpush.generateVAPIDKeys();
console.log("VAPID PUBLIC KEY:", vapidKeys.publicKey);
console.log("VAPID PRIVATE KEY:", vapidKeys.privateKey);

webpush.setVapidDetails(
  'mailto:you@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// ذخیره subscriptionها
let subscriptions = [];

// ثبت subscription از frontend
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// دریافت داروها و زمان‌بندی ارسال نوتیفیکیشن
// فرض می‌کنیم داروها در اینجا ثابت هستند یا می‌توان از DB واکشی کرد
let medications = [
  { id: 1, name: "Insulin", daily: true, time: "08:00", dose: "10IU" },
  { id: 2, name: "Metformin", hourly: true, startDate: new Date(), hourlyInterval: 6, dose: "500mg" }
];

// cron job ساده با setInterval برای تست
setInterval(() => {
  const now = new Date();
  medications.forEach(med => {
    // داروی روزانه
    if(med.daily && med.time) {
      const [hour, minute] = med.time.split(":").map(Number);
      if(now.getHours() === hour && now.getMinutes() === minute) {
        subscriptions.forEach(sub => {
          webpush.sendNotification(sub, JSON.stringify({
            title: `یادآور داروی ${med.name}`,
            body: `زمان مصرف داروی ${med.name} است. دوز: ${med.dose}`
          })).catch(err => console.error(err));
        });
      }
    }

    // داروی ساعتی
    if(med.hourly && med.startDate && med.hourlyInterval) {
      const diffMs = now - new Date(med.startDate);
      const diffHours = Math.floor(diffMs / (1000*60*60));
      if(diffHours % med.hourly.hourlyInterval === 0 && now.getMinutes() === 0) {
        subscriptions.forEach(sub => {
          webpush.sendNotification(sub, JSON.stringify({
            title: `یادآور داروی ${med.name}`,
            body: `زمان مصرف داروی ${med.name} است. دوز: ${med.dose}`
          })).catch(err => console.error(err));
        });
      }
    }
  });
}, 60000); // چک هر ۱ دقیقه

app.listen(4000, () => console.log("Server running on port 4000"));
