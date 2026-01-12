-- CreateTable
CREATE TABLE "SystemEntity" (
    "UUID" TEXT NOT NULL PRIMARY KEY,
    "systemEntityType" TEXT NOT NULL
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
    "maxlength" INTEGER
);

-- CreateTable
CREATE TABLE "AttributeValue" (
    "UUID" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT,
    "entityUUID" TEXT NOT NULL,
    "attributeID" INTEGER NOT NULL,
    CONSTRAINT "AttributeValue_entityUUID_fkey" FOREIGN KEY ("entityUUID") REFERENCES "SystemEntity" ("UUID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttributeValue_attributeID_fkey" FOREIGN KEY ("attributeID") REFERENCES "AttributeDefinition" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AttributeDefinition_systemEntityType_key_key" ON "AttributeDefinition"("systemEntityType", "key");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeValue_entityUUID_attributeID_key" ON "AttributeValue"("entityUUID", "attributeID");

