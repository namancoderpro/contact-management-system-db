import * as dotenv from 'dotenv';
import { GeneratedAlways, Kysely } from "kysely"
import { NeonDialect } from "kysely-neon"
import ws from "ws"

dotenv.config();

interface Database{
    contacts: ContactTable
}

interface ContactTable {
    id: GeneratedAlways<number>
    name: string
    phone: string
    email: string
}

const db = new Kysely<Database>({
    dialect: new NeonDialect({
        connectionString: process.env.DATABASE_URL,
        webSocketConstructor: ws,
    }),
})

const schema = db.schema

// create table
async function createContactsTable(): Promise<void> {
    await schema
        .createTable('contacts')
        .ifNotExists()
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('phone', 'text', col => col.notNull())
        .addColumn('email', 'text', col => col.notNull())
        .execute()
}

createContactsTable();

// create function to add contact and return id

async function insertContact(name: string, phone: string, email: string) {
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
        .execute()
}

insertContact("Kysely Doe", "1234567890", "qTqQ1@example.com");
insertContact("Neon Doe", "1234567890", "qTqQ1@example.com");

// Read from the database
async function getContacts() {
    const contacts = await db.selectFrom("contacts").selectAll().execute();
    return contacts;    
}

const contacts = getContacts();

// Delete a contact from the database
async function deletePerson(id: number) {
    return await db.deleteFrom('contacts').where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

// deletePerson(1);

// Update a contact in the database
async function updateContact(id: number, name: string, phone: string, email: string) {
    return await db
      .updateTable('contacts')
      .set({ name, phone, email })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

// updateContact(1, 'Jane Doe', '1234567890', 'qTqQ1@example.com');