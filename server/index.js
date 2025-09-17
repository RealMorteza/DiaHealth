// server/index.js
import express from "express";
import bodyParser from "body-parser";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import cron from "node-cron";

const app = express();
app.use(bodyParser.json());

// --- اتصال به Supabase ---
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // حتماً service_role key استفاده کن (نه anon)
);

// --- کلیدهای VAPID ---
const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;
webpush.setVapidDetails("mailto:your@email.com",
    VAPID_PUBLIC, VAPID_PRIVATE
);

// --- ثبت subscription ---
app.post("/api/subscribe", async (req, res) => {
    const { subscription, patient_id } = req.body;
    if (!subscription || !patient_id) return res.status(400).json({ error: "Invalid request" });

    const { data, error } = await supabase
        .from("push_subscriptions")
        .insert([{ patient_id, subscription }]);

    if (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: "DB insert error" });
    }

    res.json({ ok: true });
});

// --- حذف subscription ---
app.post("/api/unsubscribe", async (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: "No endpoint" });

    const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .contains("subscription", { endpoint });

    if (error) console.error("Unsub error:", error);

    res.json({ ok: true });
});

// --- ارسال نوتیف ---
async function sendNotification(subscription, payload) {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err) {
        console.error("push error", err);
        if (err.statusCode === 410 || err.statusCode === 404) {
            // subscription منقضی شده → حذف
            await supabase.from("push_subscriptions").delete().contains("subscription", { endpoint: subscription.endpoint });
        }
    }
}

// --- Cron job: هر دقیقه چک کن ---
cron.schedule("* * * * *", async () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hh}:${mm}`;

    // گرفتن همه داروها
    const { data: meds, error: medErr } = await supabase.from("medication").select("*");
    if (medErr) return console.error("Error fetching meds:", medErr);

    // پیدا کردن داروهایی که الان موعدشونه
    const dueDaily = meds.filter(m => m.daily && m.time === currentTime);

    const dueHourly = meds.filter(m => {
        if (!m.hourly) return false;
        const intervalMs = m.hourly * 60 * 60 * 1000;
        const sinceMidnight = now - new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return (sinceMidnight % intervalMs) < 60 * 1000;
    });

    const due = [...dueDaily, ...dueHourly];
    if (due.length === 0) return;

    for (const med of due) {
        // گرفتن subscriptionهای بیمار
        const { data: subs, error: subErr } = await supabase
            .from("push_subscriptions")
            .select("subscription")
            .eq("patient_id", med.patient_id);

        if (subErr) {
            console.error("Error fetching subs:", subErr);
            continue;
        }

        const payload = {
            title: "یادآوری دارو",
            body: `${med.name} - ${med.dose} ${med.daily ? "هر روز " + med.time : med.hourly ? "هر " + med.hourly + " ساعت" : ""}`,
            icon: "/pill.png"
        };

        for (const { subscription } of subs) {
            await sendNotification(subscription, payload);
        }
    }
});
        
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
