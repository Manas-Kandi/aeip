-- CreateTable
CREATE TABLE "ProvenanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ts" DATETIME NOT NULL,
    "agent" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "inputs" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "token_ref" TEXT NOT NULL,
    "policies_checked" TEXT NOT NULL,
    "trace_id" TEXT,
    "hash" TEXT NOT NULL,
    "sig" TEXT NOT NULL,
    "ver" TEXT NOT NULL
);
