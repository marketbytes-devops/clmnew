from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, Enum, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class EntityTypeEnum(str, enum.Enum):
    client_customer = 'client_customer'
    vendor_supplier = 'vendor_supplier'
    internal_entity = 'internal_entity'
    partner = 'partner'

class AddressTypeEnum(str, enum.Enum):
    billing = 'billing'
    shipping = 'shipping'
    registered = 'registered'

class Client(Base):
    __tablename__ = 'clients'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    entity_type = Column(Enum(EntityTypeEnum), nullable=False)
    legal_name = Column(String(255), nullable=False)
    trade_name = Column(String(255))
    tax_id = Column(String(50))
    jurisdiction_id = Column(BigInteger, ForeignKey('client_jurisdictions.id', ondelete='SET NULL'))
    website = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
    jurisdiction = relationship("ClientJurisdiction")
    contacts = relationship("ClientContact", back_populates="client", cascade="all, delete-orphan")
    addresses = relationship("ClientAddress", back_populates="client", cascade="all, delete-orphan")
    contracts_link = relationship("ClientContractsLink", back_populates="client", cascade="all, delete-orphan")

class ClientContact(Base):
    __tablename__ = 'client_contacts'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    client_id = Column(BigInteger, ForeignKey('clients.id', ondelete='CASCADE'), nullable=False)
    full_name = Column(String(255), nullable=False)
    title = Column(String(100))
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    is_primary = Column(Boolean, default=False)

    client = relationship("Client", back_populates="contacts")

class ClientJurisdiction(Base):
    __tablename__ = 'client_jurisdictions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    country = Column(String(100))
    state = Column(String(100))
    tax_laws = Column(Text)
    currency = Column(String(10), default='USD')

    organization = relationship("Organization")

class ClientAddress(Base):
    __tablename__ = 'client_addresses'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    client_id = Column(BigInteger, ForeignKey('clients.id', ondelete='CASCADE'), nullable=False)
    address_type = Column(Enum(AddressTypeEnum), default=AddressTypeEnum.billing)
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100))

    client = relationship("Client", back_populates="addresses")

class ClientContractsLink(Base):
    __tablename__ = 'client_contracts_link'

    client_id = Column(BigInteger, ForeignKey('clients.id', ondelete='CASCADE'), primary_key=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), primary_key=True)

    client = relationship("Client", back_populates="contracts_link")
    # contract = relationship("Contract", back_populates="client_links")
