const express = require('express');
const multer = require('multer');   
const cors = require('cors');   
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// multer is a middleware which is used to store files in the server
const fileStorge = multer.diskStorage({
    // the cb is a callback function, which will be called by multer when the file is done storing
    destination: (req, file, cb) => {
        cb(null, 'images');
        // cb(errorMssg,name of the directory where the file will be stored));
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
        // cb(errorMssg, name of the file);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
        // cb(errorMssg, store it );
    } else {
        cb(null, false);
        // cb(errorMssg, dont store it);
    }
}

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(multer({storage: fileStorge , fileFilter: fileFilter}).single('image'));

app.set('view engine', 'ejs');
app.set('views', 'views');

const websiteRoutes = require('./routes/websiteRoutes');
const extensionRoutes = require('./routes/extensionRoutes');

app.use(websiteRoutes);
app.use('/extension',extensionRoutes);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});


