"""
Database initialization module.
This file breaks the circular import between app.py and models.py
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
