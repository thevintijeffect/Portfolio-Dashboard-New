import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "")
    GOOGLE_CREDS_JSON = os.getenv("GOOGLE_CREDS_JSON", "")
    ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
    FX_API_URL = os.getenv("FX_API_URL", "https://open.er-api.com/v6/latest/SGD")
    BASE_CURRENCY = "SGD"

settings = Settings()
