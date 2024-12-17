import { runOracleQuery } from "../utils/db.connection.js";

export async function getLinesFromERP() {
    return await runOracleQuery("SELECT LINENAME FROM GTLINEMAST");
}