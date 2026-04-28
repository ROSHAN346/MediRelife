from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import SessionLocal, engine
import models
from pydantic import BaseModel
from datetime import date
from fastapi.middleware.cors import CORSMiddleware

import os, json
# from openai import OpenAI

# ------------------------
# APP INIT
# ------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# DB SETUP
# ------------------------

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------
# OPENAI CLIENT
# ------------------------

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ------------------------
# SCHEMAS
# ------------------------

class OCRRequest(BaseModel):
    text: str

class FullMedicineCreate(BaseModel):
    brand_name: str
    generic_name: str
    dosage_form: str
    manufacturer: str = "Unknown"
    stock_qty: int
    expiry_date: date
    price: float
    user_id: int

# ------------------------
# HELPER: LEGAL CHECK
# ------------------------

def is_valid_medicine(name: str):
    # 🔥 Replace with real DB/API later
    allowed = ["paracetamol", "aspirin", "crocin"]
    return any(x in name.lower() for x in allowed)

# ------------------------
# OCR → LLM EXTRACTION
# ------------------------

@app.post("/extract-medicine")
def extract_medicine(req: OCRRequest):

    text = req.text.strip()

    # Step 1: basic validation
    if not text or len(text) < 5:
        return {"invalid": True}

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": "Extract medicine info strictly as JSON."
                },
                {
                    "role": "user",
                    "content": f"""
Extract medicine details from this OCR text.

Return ONLY JSON:
{{
  "brand_name": "",
  "generic_name": "",
  "dosage_form": "",
  "manufacturer": ""
}}

If not a medicine:
{{"invalid": true}}

OCR TEXT:
{text}
"""
                }
            ]
        )

        output = response.choices[0].message.content.strip()

        try:
            data = json.loads(output)
        except:
            return {"invalid": True}

        if data.get("invalid") or not data.get("brand_name"):
            return {"invalid": True}

        return {"success": True, "data": data}

    except Exception as e:
        print("LLM ERROR:", e)
        return {"invalid": True}

# ------------------------
# FINAL SUBMIT API
# ------------------------
# ------------------------
# USER SCHEMA
# ------------------------

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


# ------------------------
# CREATE USER
# ------------------------

@app.post("/user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password  # ⚠️ hash later
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created",
        "user_id": new_user.id
}


@app.post("/insert-full")
def insert_full(data: FullMedicineCreate, db: Session = Depends(get_db)):

    # -------- VALIDATION --------
    # if len(data.brand_name.strip()) < 3:
    #     raise HTTPException(400, "Invalid medicine name")

    # if data.stock_qty <= 0:
    #     raise HTTPException(400, "Stock must be > 0")

    # if data.price <= 0:
    #     raise HTTPException(400, "Price must be > 0")

    # if data.expiry_date <= date.today():
    #     raise HTTPException(400, "Medicine expired")

    # # -------- LEGAL CHECK --------
    # if not is_valid_medicine(data.brand_name):
    #     raise HTTPException(400, "Illegal medicine")

    # -------- CHECK EXISTING MEDICINE --------
    # existing = db.query(models.Medicine).filter(
    #     models.Medicine.brand_name.ilike(data.brand_name),
    #     models.Medicine.user_id == data.user_id
    # ).first()

    # if existing:
    #     med = existing
    # else:
    med = models.Medicine(
            brand_name=data.brand_name,
            generic_name=data.generic_name,
            dosage_form=data.dosage_form,
            manufacturer=data.manufacturer,
            user_id=data.user_id
        )
    db.add(med)
    db.commit()
    db.refresh(med)

    # -------- INSERT INVENTORY --------
    inv = models.Inventory(
        user_id=data.user_id,
        medicine_id=med.id,
        stock_qty=data.stock_qty,
        expiry_date=data.expiry_date,
        price=data.price
    )

    db.add(inv)
    db.commit()

    return {
        "status": "success",
        "medicine_id": med.id,
        "message": "Medicine added successfully"
    }

# ------------------------
# SEARCH API
# ------------------------

@app.get("/search")
def search_medicine(query: str, db: Session = Depends(get_db)):

    medicines = db.query(models.Medicine).filter(
        or_(
            models.Medicine.brand_name.ilike(f"%{query}%"),
            models.Medicine.generic_name.ilike(f"%{query}%")
        )
    ).all()

    result = []

    for med in medicines:
        for inv in med.inventory:

            if inv.stock_qty <= 0:
                continue

            days_left = (inv.expiry_date - date.today()).days
            if days_left < 0:
                continue

            result.append({
                "medicine_id": med.id,
                "brand_name": med.brand_name,
                "generic_name": med.generic_name,
                "stock": inv.stock_qty,
                "expiry_date": inv.expiry_date,
                "price": inv.price,
                "user_id": inv.user_id
            })

    return result