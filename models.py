from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# ------------------------
# USER TABLE
# ------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)

    medicines = relationship("Medicine", back_populates="owner")
    inventory = relationship("Inventory", back_populates="owner")

    # ✅ ADD THIS
    orders = relationship("Order", back_populates="owner")


# ------------------------
# MEDICINE TABLE
# ------------------------

class Medicine(Base):
    __tablename__ = "medicine"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String)
    generic_name = Column(String)
    dosage_form = Column(String)
    manufacturer = Column(String)

    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="medicines")
    inventory = relationship("Inventory", back_populates="medicine")

    # ✅ ADD THIS
    orders = relationship("Order", back_populates="medicine")


# ------------------------
# INVENTORY TABLE
# ------------------------

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    medicine_id = Column(Integer, ForeignKey("medicine.id"))

    stock_qty = Column(Integer)
    expiry_date = Column(Date)
    price = Column(Float)

    owner = relationship("User", back_populates="inventory")
    medicine = relationship("Medicine", back_populates="inventory")

    user_status = Column(Integer, default=0)
    des_user = Column(String, default="")


# ------------------------
# ORDER TABLE
# ------------------------

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    medicine_id = Column(Integer, ForeignKey("medicine.id"))

    stock_qty = Column(Integer)
    expiry_date = Column(Date)
    price = Column(Float)

    # ✅ FIXED
    owner = relationship("User", back_populates="orders")
    medicine = relationship("Medicine", back_populates="orders")

    user_status = Column(Integer, default=0)
    des_user = Column(String, default="")