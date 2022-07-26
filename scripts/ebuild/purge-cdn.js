const https = require('https');

function main () {

    const version = process.argv[2] || '1.0.0';

    console.log(`Purge version = ${version}`);
    
    [
        // todo add list with version
    ].forEach(name => {
        https.get(`https://purge.jsdelivr.net/${name}`, () => {
        
        });
    });
}

main();

