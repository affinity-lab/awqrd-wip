import {sql} from "drizzle-orm";
import {int, MySqlColumn, type MySqlIntBuilder} from "drizzle-orm/mysql-core";

/**
 * Generates a definition for an auto-incrementing primary key column named 'id' in a MySQL database.
 * @returns A MySQL integer builder object with additional constraints for the 'id' column.
 */
export function id() { return int("id").autoincrement().primaryKey(); }

/**
 * Creates a reference column definition.
 * @param name - The name of the column.
 * @param field - A function that returns the reference field.
 * @param [nullable=false] - Indicates whether the column is nullable (default: false).
 * @returns  A reference column definition.
 */
export function reference(name: string, field: () => MySqlColumn, nullable: boolean = false) {
	return nullable
		? int(name).references(field)
		: int(name).notNull().references(field);
}

/**
 * Creates an SQL expression for checking if a column's value is in a list of IDs.
 * @param col - The column to check.
 * @param ids - The list of IDs.
 * @returns An SQL expression.
 */
export function In(col: MySqlColumn, ids: string) { return sql`${col} in (${sql.placeholder(ids)})`;}