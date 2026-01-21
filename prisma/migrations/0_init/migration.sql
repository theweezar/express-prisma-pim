-- CreateTable
CREATE TABLE "SystemEntity" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "UUID" TEXT NOT NULL,
    "systemEntityType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "AttributeDefinition" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "systemEntityType" TEXT NOT NULL,
    "attributeValueType" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "unique" BOOLEAN NOT NULL DEFAULT false,
    "minlength" INTEGER,
    "maxlength" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "AttributeGroupDefinition" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "systemEntityType" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "AttributeGroupAssignment" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attributeDefinitionID" INTEGER NOT NULL,
    "attributeGroupDefinitionID" INTEGER NOT NULL,
    "ordinal" INTEGER NOT NULL,
    CONSTRAINT "AttributeGroupAssignment_attributeDefinitionID_fkey" FOREIGN KEY ("attributeDefinitionID") REFERENCES "AttributeDefinition" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttributeGroupAssignment_attributeGroupDefinitionID_fkey" FOREIGN KEY ("attributeGroupDefinitionID") REFERENCES "AttributeGroupDefinition" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttributeValue" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "UUID" TEXT NOT NULL,
    "value" TEXT,
    "entityID" INTEGER NOT NULL,
    "attributeID" INTEGER NOT NULL,
    CONSTRAINT "AttributeValue_entityID_fkey" FOREIGN KEY ("entityID") REFERENCES "SystemEntity" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttributeValue_attributeID_fkey" FOREIGN KEY ("attributeID") REFERENCES "AttributeDefinition" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemEntity_UUID_key" ON "SystemEntity"("UUID");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeDefinition_systemEntityType_key_key" ON "AttributeDefinition"("systemEntityType", "key");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeGroupDefinition_systemEntityType_key_key" ON "AttributeGroupDefinition"("systemEntityType", "key");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeGroupAssignment_attributeGroupDefinitionID_attributeDefinitionID_key" ON "AttributeGroupAssignment"("attributeGroupDefinitionID", "attributeDefinitionID");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeValue_UUID_key" ON "AttributeValue"("UUID");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeValue_entityID_attributeID_key" ON "AttributeValue"("entityID", "attributeID");

