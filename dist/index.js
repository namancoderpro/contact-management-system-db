"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const kysely_1 = require("kysely");
const kysely_neon_1 = require("kysely-neon");
const ws_1 = __importDefault(require("ws"));
dotenv.config();
const db = new kysely_1.Kysely({
    dialect: new kysely_neon_1.NeonDialect({
        connectionString: process.env.DATABASE_URL,
        webSocketConstructor: ws_1.default,
    }),
});
const schema = db.schema;
// create table
async function createContactsTable() {
    await schema
        .createTable('contacts')
        .ifNotExists()
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('phone', 'text', col => col.notNull())
        .addColumn('email', 'text', col => col.notNull())
        .execute();
}
createContactsTable();
// create function to add contact and return id
async function insertContact(name, phone, email) {
    await db
        .insertInto('contacts')
        .values([
        {
            name,
            phone,
            email
        }
    ])
        .returning('id')
        .execute();
}
// insertContact("Kysely Doe", "1234567890", "qTqQ1@example.com");
insertContact("Neon Doe", "1234567890", "qTqQ1@example.com");
// Read from the database
async function getContacts() {
    const contacts = await db.selectFrom("contacts").selectAll().execute();
    console.log(contacts);
    return contacts;
}
// Delete a contact from the database
async function deletePerson(id) {
    return await db.deleteFrom('contacts').where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
}
// deletePerson(1);
// Update a contact in the database
async function updateContact(id, name, phone, email) {
    return await db
        .updateTable('contacts')
        .set({ name, phone, email })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
}
// updateContact(1, 'Jane Doe', '1234567890', 'qTqQ1@example.com');
getContacts();
