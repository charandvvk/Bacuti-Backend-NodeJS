import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

// Create the connection pool. The pool-specific settings are the defaults
export const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

// Function to connect to the database and handle errors
const testDatabaseConnection = async () => {
    try {
        // Get a connection from the pool
        const connection = await pool.getConnection();
        connection.release(); // Release the connection back to the pool immediately
        console.log("Connected to the database successfully!");
    } catch (error) {
        console.error("Connection error:", error);
        throw error;
    }
};

// Call the function to connect to the database
testDatabaseConnection();
