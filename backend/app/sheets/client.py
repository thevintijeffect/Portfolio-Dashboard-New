import json
import gspread
from google.oauth2.service_account import Credentials
from app.config import settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

def get_sheet_client():
    if not settings.GOOGLE_CREDS_JSON:
        raise ValueError("GOOGLE_CREDS_JSON is missing")

    creds_info = json.loads(settings.GOOGLE_CREDS_JSON)
    creds = Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    return gspread.authorize(creds)

def open_sheet():
    client = get_sheet_client()
    if not settings.GOOGLE_SHEET_ID:
        raise ValueError("GOOGLE_SHEET_ID is missing")
    return client.open_by_key(settings.GOOGLE_SHEET_ID)
