import streamlit as st
import requests
import pandas as pd

BASE_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="Medicine SaaS", layout="wide")

st.title("💊 Medicine Inventory System")

# ---------------------------
# TABS
# ---------------------------
tab1, tab2, tab3 = st.tabs(["➕ Add Medicine", "📦 Add Inventory", "🔍 Search"])

# ---------------------------
# ADD MEDICINE
# ---------------------------
with tab1:
    st.header("Add Medicine")

    brand = st.text_input("Brand Name")
    generic = st.text_input("Generic Name")
    dosage = st.text_input("Dosage Form")

    if st.button("Add Medicine"):
        res = requests.post(f"{BASE_URL}/medicine", json={
            "brand_name": brand,
            "generic_name": generic,
            "dosage_form": dosage
        })

        if res.status_code == 200:
            st.success(f"✅ Added! ID: {res.json().get('medicine_id')}")
        else:
            st.error("❌ Failed to add medicine")


# ---------------------------
# ADD INVENTORY
# ---------------------------
with tab2:
    st.header("Add Inventory")

    pharmacy_id = st.number_input("Pharmacy ID", min_value=1, step=1)
    medicine_id = st.number_input("Medicine ID", min_value=1, step=1)
    stock = st.number_input("Stock Quantity", min_value=1, step=1)
    expiry = st.date_input("Expiry Date")
    price = st.number_input("Price", min_value=1.0)

    if st.button("Add Inventory"):
        res = requests.post(f"{BASE_URL}/inventory", json={
            "pharmacy_id": int(pharmacy_id),
            "medicine_id": int(medicine_id),
            "stock_qty": int(stock),
            "expiry_date": str(expiry),
            "price": float(price)
        })

        if res.status_code == 200:
            st.success("✅ Inventory Added")
        else:
            st.error(res.text)


# ---------------------------
# SEARCH
# ---------------------------
with tab3:
    st.header("Search Medicine")

    query = st.text_input("Enter medicine name (e.g., para)")

    if st.button("Search"):
        res = requests.get(f"{BASE_URL}/search", params={"query": query})

        if res.status_code == 200:
            data = res.json()

            if len(data) == 0:
                st.warning("No results found")
            else:
                df = pd.DataFrame(data)

                # 🔥 Highlight expiry urgency
                if "expiry_date" in df.columns:
                    df["expiry_date"] = pd.to_datetime(df["expiry_date"])
                    df["days_left"] = (df["expiry_date"] - pd.Timestamp.today()).dt.days

                st.subheader("Results")
                st.dataframe(df, use_container_width=True)

                # 📊 Simple insights
                st.subheader("Insights")
                st.write(f"Total Results: {len(df)}")

                if "days_left" in df.columns:
                    st.write("⚠️ Expiring Soon (<30 days):",
                             len(df[df["days_left"] < 30]))

        else:
            st.error("Search failed")