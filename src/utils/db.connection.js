import { createRequire } from "module";
const require = createRequire(import.meta.url);
const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

const dbConfig = {
      user: "pssbsa",
      password: "PSSBSA_MAY2023",
      connectString: "203.95.216.155:1556/avt06p",

};

export async function getConnection() {
      let connection;
      try {
            connection = await oracledb.getConnection({
                  user: dbConfig.user,
                  password: dbConfig.password,
                  connectString: dbConfig.connectString
            });
            return connection
      } catch (err) {
            console.log(err)
            throw { message: "Database Connection Issue...!!!" }
      }
}
