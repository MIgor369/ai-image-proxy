// api/generate.js (Vercel-safe, CommonJS)
const Replicate = require('replicate');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const { prompt = 'a cat in space', width = 768, height = 768 } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Поле "prompt" обязательно' });
  }

  try {
    const output = await replicate.run(
  'playgroundai/playground-v2:34b14f449fa3873925049f465bb114e9b5b211b934304077099892e1234e793f',
  {
    input: {
      prompt: prompt.trim(),
      width: parseInt(width),
      height: parseInt(height),
      num_inference_steps: 30,
    },
  }
);

    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      throw new Error('Изображение не сгенерировано');
    }

    res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error('Ошибка генерации:', err);
    res.status(500).json({
      error: 'Не удалось сгенерировать изображение',
      details: err.message
    });
  }
};

// Для Vercel
module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
