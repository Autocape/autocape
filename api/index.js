const sharp = require('sharp');
const axios = require('axios');
const buffer = require('buffer');
const bp = require('body-parser')
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
// digga fuck u bruh 


let db = new sqlite3.Database('./db/upload.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the upload database.');
  });

// db.run("CREATE TABLE upload(id text, chunks text, uploadedon text)")
const express = require('express');
const cors = require('cors');

var options = {
    inflate: true,
    limit: '100kb',
    type: 'text/plain'
  };
const app = express();
app.use(cors());
app.use(bp.raw(options))
app.use(bp.urlencoded({ extended: true }))
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/cloakslol/index.html');
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

app.get('/autocape', async (req, res) => {
    // return autocape app
    res.sendFile(__dirname + "/cloakslol/autocape.html")
})

app.get('/upload/announce', async (req, res) => {
    const uploadid = makeid(50);
    const chunkcount = req.query.chunkcount;
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    if (chunkcount == null) {
        //chnage status code to 40
        res.status(400)
        res.send('err:nochunksprovided' )
        return;
    }
    // check if chunkcount is a number
    if (isNaN(chunkcount)) {
        res.status(400)
        res.send('err:chunkcountnotanumber')
        return;
    }

    db.run(`INSERT INTO upload (id, chunks, uploadedon) VALUES ("` + uploadid + `", "` + chunkcount + `", "` + timestamp + `");`, function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        res.send("ok:" + uploadid)
      });
})

app.get('/upload', async (req, res) => {
    res.send("you dont GET it ;)")
})

app.post('/upload', async (req, res) => {
    chunkindex = req.query.chunkindex;
    uploadid = req.query.uploadid;
    chunk = req.body;
    console.log(chunk)
    if (chunkindex == null) {
        res.status(400)
        res.send('err:noindexprovided')
        return;
    }
    if (uploadid == null) {
        res.status(400)
        res.send('err:nouploadidprovided')
        return;
    }
    if (chunk == null) {
        res.status(400)
        res.send('err:nodataprovided')
        return;
    }   
    if (chunk == "{}") {
        res.status(400)
        res.send('err:u fucked up')
        return;
    }
    // check if chunkindex is a number
    if (isNaN(chunkindex)) {
        res.status(400)
        res.send('err:chunkindexnotanumber')
        return;
    }
    // check if uploadid is in database
    db.get(`SELECT * FROM upload WHERE id = "` + uploadid + `"`, function(err, row) {
        if (err) {
            return console.log(err.message);
        }
        if (row == null) {
            res.send('err:uploadidnotfound')
            return;
        }
        else {
            // uploadid found
            
            if (chunkindex > row.chunks) {
                res.send('err:chunkindexinvalid')
                return;
            }
            else if (chunkindex == row.chunks) {
                res.send('done')
                return;
            }
            else {
                // chunkindex valid
                // write chunk to file
                try {
                    if (!fs.existsSync('./storage/' + uploadid)) {
                      fs.mkdirSync('./storage/' + uploadid);
                    }
                    fs.writeFileSync('./storage/' + uploadid + '/' + chunkindex + '.chunk', chunk);
                    res.send('ok:chunkuploaded')
                  } catch (err) {
                    console.error(err);
                  }
            }
        }
    });


})

app.get('/ui/resize', async (req, res) => {
    res.sendFile(__dirname + "/cloakslol/resizerui.html")
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
                        res.send('err:toolarge')
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
    const aspectratio = width / height;
    if (aspectratio == 0.625) {
        console.log('correct aspect ratio')
        if (format == 'png') {
            const outputBuffer = await sharp(imagelocation)
                .resize(320, 512)
                .toBuffer();
            const overlayBuffer = await sharp('template.png')
                .composite([{ input: outputBuffer, top: 32, left: 32 }])
                .toBuffer();
            return overlayBuffer;
        }
    }
    else {
        //fix aspect ratio and then create cape
        console.log('incorrect aspect ratio')
        if (width < height) {
            
        }
        else {
          return "err:toolarge"
        }
    }

}

app.listen(port, () => console.log(`app listening on port ${port}!`))