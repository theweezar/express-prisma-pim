# EAV Product Information Management System

A backend project that implements an **Entity–Attribute–Value (EAV)** model for flexible product information management.  
Built with **Express**, **TypeScript**, and **Prisma**, this system allows dynamic attributes without schema changes while keeping strong data validation and consistency.

---

## 🎯 Project Goals

- Support **dynamic product attributes** (EAV pattern)
- Avoid frequent database schema migrations
- Keep **runtime validation** and **domain rules** explicit
- Maintain clean architecture and SOLID principles
- Use Prisma as the ORM with multiple database adapters

---

## 🧱 Tech Stack

- **Node.js**
- **TypeScript**
- **Express**
- **Prisma ORM**
- **SQLite**

---

## 🧠 EAV Concept Overview

Instead of hardcoding product attributes into table columns, this project uses:

- **SystemEntity** — the main entity (e.g. Product)
- **AttributeDefinition** — metadata describing attributes
- **AttributeValue** — actual values stored per entity

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Generate Prisma client

```bash
npm run gen
```

### Run migrations

```bash
npm run reset
```

### Start development server

```bash
npm run dev
```
