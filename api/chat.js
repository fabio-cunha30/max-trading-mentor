export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Proteção de origem — só aceita do seu domínio
  const origin = req.headers.origin || '';
  const allowed = [
    'https://max-trading-mentor.vercel.app',
    'http://localhost:3000'
  ];
  if (!allowed.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body;

    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Limite de segurança
    if (body.messages.length > 30) {
      return res.status(400).json({ error: 'Too many messages' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY  // chave segura no servidor
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
