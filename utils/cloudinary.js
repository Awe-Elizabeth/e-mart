
const cloudinary = require('cloudinary').v2


// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});


const uploadImage = async (image, name) => {
  return await cloudinary.uploader.upload(image,
  { public_id: name }, 
  function(error, result) {
    // console.log(result)
  });
}

module.exports = uploadImage;