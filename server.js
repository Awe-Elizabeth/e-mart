const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const https = require('https');
const asyncHandler = require('./middleware/async');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({path: './config/config.env'});

const app = express();

const PORT = process.env.PORT || 5000

// route files
const products = require('./routes/product.router');
const auth = require('./routes/auth.router');

//connect to Database
connectDB();

// body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(morgan('dev'));




// app.get('/paystack', async (req, res) => {

//     const {email, amount} = req.body; 
//     const prm = JSON.stringify({
//       "email": email,
//       "amount": amount
//     });

//   try {
//   const data = await result(prm);
//   console.log(data)
//   res.status(200).send(data)
//   // res.status(200).json({
//   //   data
//   // });
//   }catch(error){
//   console.error('Error:', error);
//   res.status(500).send('An error occurred')
//   }
// }); 

app.use('/api/v1/products', products);
app.use('/api/v1/auth', auth);


app.use(errorHandler);

const server = app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`.yellow.bold);
});

//Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1).red)
})