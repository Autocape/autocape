const sharp = require('sharp');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
var fullfilename = "cleared for security reasons"
const config = require('./config.json');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      //make directory with id
      idirecotry = makeid(25) + Date.now();
      fs.mkdirSync('uploads/' + idirecotry);
      cb(null, 'uploads/' + idirecotry);
    },
    filename: (req, file, cb) => {
        fileids = makeid(10)
        fullfilename = idirecotry + "/" + fileids + ".png"
      cb(null, fileids + ".png");

    }
  });
  
  
  // Create the multer instance
  const upload = multer({ storage: storage });


const app = express();
app.use(cors());
const port = 3000;

app.get('/', (req, res) => {
    res.redirect("cloaksplus.com")
    // res.sendFile(__dirname + '/cloakslol/index.html');
});

app.get('/chart', (req, res) => {
    res.redirect('https://supreme-windscreen-4f5.notion.site/Client-Compatibility-0e37ebdeac9248f581859edcb9cedcd5');
});
app.get('/charts', (req, res) => {
    res.redirect('https://supreme-windscreen-4f5.notion.site/Client-Compatibility-0e37ebdeac9248f581859edcb9cedcd5');
});

app.get('/viafabric', (req, res) => {
    res.redirect('https://supreme-windscreen-4f5.notion.site/Join-server-with-ViaFabric-mod-1a6a1f7692f443388f213b12479923c1');
});

app.get('/weeklytop', (req, res) => {

    res.send("err:down")
})

app.get('/autocape', async (req, res) => {
    // return autocape app
    res.sendFile(__dirname + "/cloakslol/autocape.html")
})



app.get('/upload/announce', async (req, res) => {
    
})

app.get('/upload', async (req, res) => {
    res.send("you dont GET it ;)")
})

app.post('/upload', upload.single('file'), (req, res) => {
    // Handle the uploaded file
    res.json({ path: fullfilename });
    fullfilename = "cleared for security reasons"
  });

app.get("/media/:id/:filename", async (req, res) => {
    const id = req.params.id;
    const filename = req.params.filename;

    if (id == null || filename == null) {
        res.send("err:malfomedrequest")
        return;
    }

    const file = __dirname + "/uploads/" + id + "/" + filename;
    console.log(file)
    if (fs.existsSync(file)) {
        res.sendFile(file)
    }
    else {
        res.send("err:404requestedresourcenotfound")

    }
    
        
})

app.get('/ui/resize', async (req, res) => {
    res.sendFile(__dirname + "/cloakslol/resizerui.html")
})
app.get('/challange', async (req, res) => {
    res.sendFile(__dirname + "/cloakslol/challange.html")
})

app.get('/removebg', async (req, res) => {
    const baseimagelocation = req.query.img;
    if (baseimagelocation == null) {
        res.send('err:imgnotfound')
        return;
    }
    if (baseimagelocation.includes("https")) {
        axios.get(baseimg, { responseType: 'arraybuffer' })
        .then(async response => {
            const meta = sharp(response.data)
            var width = meta.width;
            var height = meta.height;
            if (height = 1024 && width == 2048) {
                console.log("HD cape")
            }
            else if (height = 128 && width == 256) {
                console.log("SD cape")
            }
            else if (height = 64 && width == 128) {
                console.log("LD cape")
            }
            else if (height = 32 && width == 64) {
                console.log("MD cape")
            }
            else {
                console.log("not a cape")
                res.send("err:notcape")
            }
        })

    }
});


app.get("/validate", async (req, res) => {
    token = req.query.token;
    if (token == null) {
        res.send("err:tokennotfound")
        return;
    }
    
        
})

app.get('/makecape', async (req, res) => {
    baseimagelocation = req.query.img;
    if (baseimagelocation == null) {
        res.send('err:imgnotfound')
        return;
    }
    if (baseimagelocation.endsWith('.png')) {
    
    if (baseimagelocation.includes('http'))  {
        console.log('http')
        axios.get(baseimagelocation, { responseType: 'arraybuffer' })
            .then(async response => {
                const outputBuffer = await checkaspectratio(response.data)
                
                    if (outputBuffer == "err:toolarge") {
                        res.redirect("https://dev.cloaks.lol/ui/resize?img=" + baseimagelocation)
                    }
                    else {
                        res.setHeader('Content-Type', 'image/png');
                        res.setHeader('sex', '0');
                        res.setHeader('pussy', '0');
                        res.send(outputBuffer);
                    }
                  
                

            })
    }
    else {
        res.send('err:localdenied')
        
    }
}
else {
    res.send('err:notpng')
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




async function checkaspectratio(imagelocation) {
    const metadata = await sharp(imagelocation).metadata();
    const width = metadata.width;
    const height = metadata.height;
    const format = metadata.format;
    var aspectratio = width / height;
    console.log(aspectratio)
    aspectratio = Math.round(aspectratio * 1000) / 1000;
    console.log(aspectratio)
    if (aspectratio == 0.625) {
        console.log('correct aspect ratio')
        if (format == 'png') {
            
                const versions = config.version
                //draw version number as text
                const width = 2048;
                const height = 1024;
                const svgImage = `
                <svg width="${width}" height="${height}">
                  <style>
                  .title { fill: #FF0000; font-size: 15px; font-weight: bold;}
                  </style>
                  <text font-family="Arial, Helvetica, sans-serif" x="5px" y="900px" class="title">${versions}</text>
                  <text font-family="Arial, Helvetica, sans-serif" x="5px" y="920px" class="title">[AUTOCAPE DEBUG]</text>
                  <text font-family="Arial, Helvetica, sans-serif" x="5px" y="940px" class="title">IMGURL:${baseimagelocation}</text>
                  <text font-family="Arial, Helvetica, sans-serif" x="5px" y="960px" class="title">format:${format}</text>
                    <text font-family="Arial, Helvetica, sans-serif" x="5px" y="980px" class="title">captcha:true</text>
                    
                    

                </svg>
                `;
                svgBuffera = Buffer.from(svgImage);
            
            const outputBuffer = await sharp(imagelocation)
                .resize(320, 512)
                .toBuffer();
            var overlayBuffer = await sharp('template.png')
                
                .composite([{ input: outputBuffer, top: 32, left: 32 }])
                
                
                .toBuffer();
            overlayBuffer = await sharp(overlayBuffer)
                .composite([{ input: svgBuffera, top: 0, left: 0 }])
                .toBuffer();
            return overlayBuffer;
        }
    }
    else {
        
        console.log('incorrect aspect ratio')
        return "err:aspectratio"
        
    }

}

app.listen(port, () => console.log(`app listening on port ${port}!`))