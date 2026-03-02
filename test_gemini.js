const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCDGRDJenjxO-TtD29AqZq-xBX7OdxA514");

async function testGemini() {
    try {
        console.log("🧪 Тестую Google Gemini 2.5 Flash API...\n");
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        console.log("📤 Надсилаю тестовий запит...");
        const result = await model.generateContent("Привіт! Скажи коротко, що ти вмієш робити?");
        
        console.log("📥 Отримана відповідь:\n");
        const text = result.response.text();
        console.log(text);
        
        console.log("\n✅ Gemini API працює коректно!");
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Помилка:", error.message);
        process.exit(1);
    }
}

testGemini();
