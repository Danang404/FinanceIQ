import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# Key dari teman Anda
KEY = os.getenv("NINEROUTER_KEY", "")

# 2 URL yang mungkin digunakan
URLS = [
    "https://ws-ra70moluyn0nqqsg.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions",
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"
]

# Nama model persis seperti di screenshot
MODELS_EXACT_SCREENSHOT = [
    "Qwen3.7-Flash",
    "Qwen3.6-Plus",
    "Qwen3.5-Flash",
    "Qwen3.5-Plus",
    "DeepSeek-V4-Flash",
    "DeepSeek-V4-Pro",
    "Qwen3-Max",
    "Qwen3.6-Flash"
]

# Nama model versi huruf kecil (format standar API)
MODELS_LOWERCASE = [m.lower() for m in MODELS_EXACT_SCREENSHOT]

def test_model(url: str, model_name: str) -> str:
    headers = {
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": "Hai"}],
        "temperature": 0.1,
        "max_tokens": 10,
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                return "[OK] BERHASIL"
            else:
                err = resp.json().get("error", {}).get("message", resp.text)[:60]
                return f"[FAIL] GAGAL: {err}"
    except Exception as e:
        return f"[FAIL] ERROR: {e}"

if __name__ == "__main__":
    if not KEY:
        print("[FAIL] NINEROUTER_KEY kosong di .env")
        exit(1)

    print("=" * 70)
    print("MENGANALISIS KEMUNGKINAN ERROR NAMA MODEL")
    print("=" * 70)

    for url in URLS:
        print(f"\n[URL] Menguji Endpoint: {url}")
        print("-" * 70)
        
        # Test 1 model format Screenshot
        m_upper = MODELS_EXACT_SCREENSHOT[0]
        res_upper = test_model(url, m_upper)
        print(f"Format Screenshot '{m_upper}': {res_upper}")

        # Test 1 model format Huruf Kecil
        m_lower = MODELS_LOWERCASE[0]
        res_lower = test_model(url, m_lower)
        print(f"Format Huruf Kecil '{m_lower}': {res_lower}")
        print("-" * 70)
