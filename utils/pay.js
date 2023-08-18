const https = require('https');

const result = async (params) => {

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }
    let data = ''
  
    return new Promise((resolve, reject) => {
      const _req = https.request(options, res => {
      
  
        res.on('data', (chunk) => {
          data += chunk
          return data
        });
  
        res.on('end', () => {
          resolve(data)
        });
          
      }).on('error', error => {
        reject(error)
      });
      _req.write(params)
      _req.end()
    });
  }  
  
module.exports = result