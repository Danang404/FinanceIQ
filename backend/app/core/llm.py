import os
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Konstanta Gateway LLM
NINEROUTER_URL = os.getenv("NINEROUTER_URL", "http://localhost:20128")
NINEROUTER_KEY = os.getenv("NINEROUTER_KEY", "dummy_key")

def call_llm(messages: List[Dict[str, str]], model: str = "gpt-4o-mini", temperature: float = 0.7) -> str:
    """
    Fungsi ini memanggil LLM melalui 9Router.
    9Router akan menangani fallback secara otomatis jika dikonfigurasi di sisi gateway.
    """
    headers = {
        "Authorization": f"Bearer {NINEROUTER_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }
    
    # URL 9Router OpenAI API Compatible endpoint
    endpoint = f"{NINEROUTER_URL}/v1/chat/completions"
    
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        # Fallback lokal jika gateway gagal secara fatal
        print(f"Error memanggil LLM melalui 9Router: {e}")
        return "Mohon maaf, sistem sedang mengalami kendala jaringan saat memproses data Anda. Silakan coba lagi nanti."
