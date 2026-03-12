const { Client } = require('pg');
const fs = require('fs');

async function runSQL() {
    const client = new Client({
        connectionString: 'postgresql://postgres.cblfwxxxusoeejrjdnkt:uvnFrvw2UDV9vX5a@aws-1-sa-east-1.pooler.supabase.com:5432/postgres'
    });

    try {
        await client.connect();
        const sql = fs.readFileSync('setup_analytics_db.sql', 'utf8');

        console.log('Executando migração de Analytics...');
        await client.query(sql);
        console.log('Tabela instalada com sucesso no Supabase!');

    } catch (error) {
        console.error('Falha ao instalar:', error.message);
    } finally {
        await client.end();
    }
}

runSQL();
