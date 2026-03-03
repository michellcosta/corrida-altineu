const https = require('https');
const apiKey = 'AIzaSyDRFDW_BYDpRzAElKT5xNIs_UjtjCNSJKg';

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET'
};

const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Erro ao processar JSON:', data);
        }
    });
});

req.on('error', error => {
    console.error(error);
});

req.end();
