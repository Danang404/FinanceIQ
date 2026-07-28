import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const apiUrl = process.env.LLM_API_URL || 'https://ws-ra70moluyn0nqqsg.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions';
    const apiKey = process.env.LLM_API_KEY || '';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `LLM API error: ${response.status}`, detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[LLM Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error', detail: String(error) },
      { status: 500 }
    );
  }
}
