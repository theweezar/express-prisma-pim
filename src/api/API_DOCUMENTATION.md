# Express Prisma PIM REST API

A comprehensive REST API for managing Product Information Management (PIM) system entities, attributes, and groups.

## Getting Started

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will run on `http://localhost:3000` by default. You can change the port using the `PORT` environment variable.

## API Endpoints

### System Entities

Manage system entities (PRODUCT, CATALOG, CATEGORY, etc.)

#### Create Entity
```
POST /entities
Content-Type: application/json

{
  "type": "PRODUCT",
  "attributes": {
    "name": "Product Name",
    "sku": "SKU123",
    "description": "Product description"
  }
}
```

#### List Entities by Type
```
GET /entities?type=PRODUCT
```

#### Get Entity by UUID
```
GET /entities/{uuid}
```

#### Update Entity
```
PATCH /entities/{uuid}
Content-Type: application/json

{
  "attributes": {
    "name": "Updated Name",
    "description": "Updated description"
  }
}
```

#### Delete Entity
```
DELETE /entities/{uuid}
```

---

### Attribute Definitions

Manage attribute definitions for system entities.

#### Create Attribute Definition
```
POST /attribute-definitions
Content-Type: application/json

{
  "key": "name",
  "label": "Product Name",
  "systemEntityType": "PRODUCT",
  "attributeValueType": "STRING",
  "required": true,
  "unique": false,
  "minlength": 1,
  "maxlength": 255
}
```

**Supported Attribute Value Types:**
- NA
- STRING
- NUMBER
- BOOLEAN
- ARRAY
- DATE
- DATETIME

#### List Attribute Definitions by Entity Type
```
GET /attribute-definitions?entityType=PRODUCT
```

#### Get Attribute Definition by ID
```
GET /attribute-definitions/{id}
```

#### Update Attribute Definition
```
PATCH /attribute-definitions/{id}
Content-Type: application/json

{
  "label": "Updated Label",
  "required": true,
  "maxlength": 500
}
```

#### Delete Attribute Definition
```
DELETE /attribute-definitions/{id}
```

---

### Attribute Groups

Organize attributes into groups for better UI/UX.

#### Create Attribute Group
```
POST /attribute-groups
Content-Type: application/json

{
  "key": "basic-info",
  "label": "Basic Information",
  "systemEntityType": "PRODUCT",
  "ordinal": 1
}
```

#### List Attribute Groups by Entity Type
```
GET /attribute-groups?entityType=PRODUCT
```

#### Update Attribute Group
```
PATCH /attribute-groups/{id}
Content-Type: application/json

{
  "label": "Updated Group Label",
  "ordinal": 2
}
```

#### Delete Attribute Group
```
DELETE /attribute-groups/{id}
```

---

### Attribute Group Assignments

Assign attributes to groups.

#### Assign Attribute to Group
```
POST /attribute-group-assignments
Content-Type: application/json

{
  "systemEntityType": "PRODUCT",
  "groupID": "1",
  "attributeID": "5"
}
```

#### Unassign Attribute from Group
```
DELETE /attribute-group-assignments/{id}
```

---

## Error Handling

The API returns standardized error responses:

### Validation Error (422)
```json
{
  "error": "Validation Error",
  "code": "attribute_key",
  "message": "Value must be a number.",
  "detail": "The value 'invalid' for 'price' cannot be converted to a number."
}
```

### Not Found Error (404)
```json
{
  "error": "Entity not found"
}
```

### Bad Request Error (400)
```json
{
  "error": "Invalid or missing entity type",
  "validTypes": ["NA", "PRODUCT", "CATALOG", "CATEGORY"]
}
```

### Server Error (500)
```json
{
  "error": "Internal Server Error",
  "message": "Error details"
}
```

---

## System Entity Types

- **NA** - Not assigned
- **PRODUCT** - Product entity
- **CATALOG** - Catalog entity
- **CATEGORY** - Category entity

---

## Health Check

Check server status:

```
GET /health
```

Response:
```json
{
  "status": "ok"
}
```
