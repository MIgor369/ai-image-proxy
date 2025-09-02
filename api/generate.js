// api/generate.js
const express = require('express');
const Replicate = require('replicate');

const app = express();

// Парсим JSON
app.use(express.json());

// Получаем порт от Railway
const PORT = process.env.PORT || 3000;

// Получаем токен из переменных окружения
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('❌ Ошибка: Не задан REPLICATE_API_TOKEN');
  process.exit(1);
}

// Создаём клиент Replicate
const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

// Главный эндпоинт генерации
app.post('/generate', async (req, res) => {
  const { prompt = "a beautiful landscape", width = 768, height = 768 } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Поле "prompt" обязательно и должно быть строкой' });
  }

  try {
    console.log('Генерация:', { prompt, width, height });

    const output = await replicate.run(
      "stability-ai/sdxl:da72866234888c00e2048809c4e65877e85ba5f3a49f1a5529b38758430d2823",
      {
        input: {
          prompt: prompt.trim(),
          width: parseInt(width),
          height: parseInt(height),
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      throw new Error('Изображение не сгенерировано');
    }

    res.json({ url: imageUrl });
  } catch (err) {
    console.error('Ошибка при генерации:', err);
    res.status(500).json({
      error: 'Не удалось сгенерировать изображение',
      details: err.message
    });
  }
});

// Проверка работоспособности
app.get('/', (req, res) => {
  res.json({
    status: 'Прокси работает!',
    message: 'Отправляйте POST запрос на /generate',
    docs: 'https://github.com/MIgor369/ai-image-proxy'
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🔗 Replicate model: stability-ai/sdxl`);
});

// Не нужно для Railway
// module.exports = app;
