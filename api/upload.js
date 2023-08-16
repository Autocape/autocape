const multer = require('multer');
const fs = require('fs');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //make directory with id
    idirecotry = makeid(25) + Date.now();
    fs.mkdirSync('uploads/' + idirecotry);
    cb(null, 'uploads/' + idirecotry);
  },
  filename: (req, file, cb) => {
    cb(null, makeid(10) + ".png");
  }
});

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}


// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;


