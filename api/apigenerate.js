// api/generate.js
const { Replicate } = require("replicate");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const { prompt, width = 768, height = 768, model = 'sdxl' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Требуется prompt' });
  }

  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'Сервер не настроен: нет API-токена' });
  }

  try {
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

    let version;
    if (model === 'playground') {
      version = '44eee6779b858b2f7023f38718f48e738730e97742e03952dc88172d6556881d'; // Playground v2
    } else {
      version = 'da72866234888c00e2048809c4e65877e85ba5f3a49f1a5529b38758430d2823'; // SDXL
    }

    const output = await replicate.run(version, {
      input: {
        prompt: prompt,
        width: parseInt(width),
        height: parseInt(height),
        guidance_scale: 7.5,
        num_inference_steps: 30,
      },
    });

    res.status(200).json({ url: Array.isArray(output) ? output[0] : output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка генерации', details: err.message });
  }
}