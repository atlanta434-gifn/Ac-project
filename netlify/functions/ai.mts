import type { Config } from '@netlify/functions'

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const apiKey = Netlify.env.get('GROQ_API_KEY')
  if (!apiKey) {
    return Response.json({ error: 'GROQ_API_KEY غير محدد في إعدادات Netlify' }, { status: 500 })
  }

  const { messages, subject } = await req.json()

  const systemMessage = {
    role: 'system',
    content: `أنت مساعد ذكاء اصطناعي متخصص في ${subject || 'الهندسة الكهربائية'}. أجب باللغة العربية بشكل واضح ومفصل ودقيق علمياً.`,
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [systemMessage, ...(messages || [])],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    return Response.json({ error: 'فشل الاتصال بـ Groq API', status: response.status }, { status: 502 })
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || 'لا توجد استجابة'

  return Response.json({ content })
}

export const config: Config = {
  method: 'POST',
}
