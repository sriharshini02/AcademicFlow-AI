import bcrypt from 'bcryptjs'; 
import mysql from 'mysql2/promise';

// ⚙️ Database Config
const dbConfig = {
    host: 'mysqldb',
    user: 'harshini',
    password: 'harshini',
    database: 'academic_db'
};

const NEW_PASSWORD = 'proctor123';

async function updateProctorPasswords() {
    try {
        console.log("🔄 Connecting to Database...");
        const connection = await mysql.createConnection(dbConfig);

        console.log(`🔐 Hashing password: '${NEW_PASSWORD}'...`);
        // Generate the hash
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
        
        console.log("💾 Updating database...");
        // Update ALL users who are Proctors
        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE role = ?',
            [hashedPassword, 'Proctor']
        );

        console.log(`🎉 Success! Updated ${result.changedRows} Proctors.`);
        await connection.end();

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

updateProctorPasswords();