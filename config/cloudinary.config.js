const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_KEY,
//   api_secret: process.env.CLOUDINARY_SECRET
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    allowed_formats: ['jpg', 'png'],
    folder: "profilePic",
    //   format: async (req, file) => "png", // supports promises as well
    //   public_id: (req, file) => "computed-filename-using-request",
  },
});

app.post('/profilePic', fileUpload.single('image', 1), function (req, res, next) {
  console.log("Image", req.file);  
})

module.exports = multer({ storage });