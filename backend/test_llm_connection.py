"""
Test koneksi ke Qwen LLM API — cari model yang valid.
Jalankan: python test_llm_connection.py
"""
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("NINEROUTER_URL", "https://dashscope-intl.aliyuncs.com/compatible-mode/v1")
API_KEY  = os.getenv("NINEROUTER_KEY", "")
ENDPOINT = f"{BASE_URL}/chat/completions"

MODELS_TO_TEST = [
    "qwen-plus",
    "qwen-max",
    "qwen-turbo",
    "qwen3-235b-a22b",
    "qwen3-32b",
    "qwen3-14b",
    "qwen3-7b",
    "qwen3-4b",
]

def test_model(model_name: str) -> bool:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": "1+1=?"}],
        "temperature": 0.1,
        "max_tokens": 20,
    }
    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(ENDPOINT, headers=headers, json=payload)
            if resp.status_code == 200:
                reply = resp.json()["choices"][0]["message"]["content"]
                print(f"  [OK] [{model_name}] -> \"{reply.strip()}\"")
                return True
            else:
                err = resp.json().get("error", {}).get("message", resp.text)[:100]
                print(f"  [FAIL] [{model_name}] -> {err}")
                return False
    except Exception as e:
        print(f"  [ERR] [{model_name}] -> Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print(f"  Endpoint : {ENDPOINT}")
    print(f"  API Key  : {API_KEY[:20]}..." if API_KEY else "  [ERROR] API Key kosong!")
    print("=" * 60)

    if not API_KEY:
        print("\n[FAIL] Tambahkan NINEROUTER_KEY ke file backend/.env")
        exit(1)

    working = []
    print("\nMencoba model-model berikut:\n")
    for m in MODELS_TO_TEST:
        if test_model(m):
            working.append(m)

    print("\n" + "=" * 60)
    if working:
        print(f"[BERHASIL] Model yang bekerja: {working}")
    else:
        print("[GAGAL] Tidak ada model yang berhasil. Cek API key atau URL.")
    print("=" * 60)
