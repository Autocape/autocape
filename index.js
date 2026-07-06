const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const DiscordOAuth2 = require('discord-oauth2');
const Vibrant = require('node-vibrant');
const express = require('express');
const cors = require('cors');
const config = require('./config.json');


const oauth = new DiscordOAuth2({
    clientId: config.discordclientid,
    clientSecret: config.discordsecret,
    redirectUri: config.redirecturi,
});

if (config.portneeded == "true") {
    if (config.port == null) {
        console.log("no port in config.json")
        process.exit(1);
    }
    else {
         fullUrl = config.hostname + ":" + config.port;
}}
else {
     fullUrl = config.hostname;
}

var capesmade = 0;

if (fs.existsSync(__dirname + "/results") == false) {
    fs.mkdirSync(__dirname + "/results");
}


const app = express();
app.use(cors());


app.get('/', (req, res) => {

    res.sendFile(__dirname + '/cloakslol/autocape.html');
});


app.get("/discord", async (req, res) => {
    res.redirect("https://discord.gg/MT6TpR7rqZ")
})
app.get("/support", async (req, res) => {
    res.redirect("https://discord.gg/MT6TpR7rqZ")
})
app.get("/help", async (req, res) => {
    res.redirect("https://discord.gg/MT6TpR7rqZ")
})


app.get("/cape/:id", async (req, res) => {
    const id = req.params.id;


    if (id == null) {
        res.send(rendererror("err:400 malforemd @ /cape : no valid params passed", "400"))
        return;
    }

    const file = __dirname + "/results/" + id + ".png";
    console.log(file)
    if (fs.existsSync(file)) {
        res.sendFile(file)
    }
    else {
        res.send(rendererror("err:404 notfound @ /cape : id " + id + " ip: " + req.ip, "404"))

    }


})

app.get('/resize', async (req, res) => {
    res.sendFile(__dirname + "/cloakslol/resizerui.html")
})



app.get('/js/localize.js', async (req, res) => {
    res.sendFile(__dirname + "/cloakslol/localize.js")
})

app.get('/localize/:languagecode/:pageid', async (req, res) => {
    var filepath = __dirname + "/cloakslol/localizejs/" + req.params.languagecode + "/" + req.params.pageid + ".json";
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath)
    }
    else {

        res.sendStatus(404)


    }
})

app.get('/authendpoint', async (req, res) => {
    //discord oauth2 endpoint
    const code = req.query.code;
    try {
    const token = await oauth.tokenRequest({
        code,
        scope: ['identify'],
        grantType: 'authorization_code',
    });
} catch (err) {
    console.log(err)
    res.send(rendererror("err:500 internal server error @ /authendpoint : " + err, "500"))
    return;
}
    try {
    const user = await oauth.getUser(token.access_token);
} catch (err) {
    console.log(err)
    res.send(rendererror("err:500 internal server error @ /authendpoint : " + err, "500"))
    return;
}
    res.send(user);
})


app.get('/result', async (req, res) => {
    res.send(rendererror("err:400 malformed @ /result : no valid params passed", "400"))
});
app.get("/result/:id", async (req, res) => {
    const id = req.params.id;
    if (id == null) {
        res.send(rendererror("err:400 malformed @ /result/:id :id " + id, "400"))
        return;
    }

    const file = __dirname + "/results/" + id + ".png";
    if (!fs.existsSync(file)) {
        res.send(rendererror("err:404 not found @ /result/:id :id " + id, "404"))
        return;
    }


    const htmldata = fs.readFileSync(__dirname + "/cloakslol/result.html", 'utf8');
    const replaced = htmldata.replace("{{imgurl}}", "http://"+ fullUrl +"/cape/" + id);
    const replaced2 = replaced.replace("{{imgurl2}}", "http://"+ fullUrl +"/cape/" + id);

    res.send(replaced2)

});

app.get('/makecape', async (req, res) => {
    forecerender = req.query.fromeditor;
    usecolourmatch = req.query.colourmatch;
    customcolour = req.query.customcolour;
    stateid = req.query.stateid;
    baseimagelocation = req.query.img;

    starttime = Date.now();

    capesmade = capesmade + 1;



    if (forecerender == null) {
        forecerender = "false"
        console.log("not forced render")
    }


    if (forecerender == "true") {
        console.log("forced render")
    }
    else {
        console.log("not forced render")
    }

    if (usecolourmatch == null) {
        usecolourmatch = "false"
    }

    if (!customcolour == null) {
        usecolourmatch = "false"
    }

    if (baseimagelocation == null) {
        res.json({ "err": "noimg" })
        return;
    }
    if (baseimagelocation.endsWith('.png')) {

        if (baseimagelocation.includes('http')) {
            console.log('http')
            axios.get(baseimagelocation, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Autocape/AutocapeBot (Support:discord.gg/wxRatfNSwz) Axios/1.4.0' } } )
                .then(async response => {
                    const outputBuffer = await checkaspectratio(response.data)

                    if (outputBuffer == "err:aspectratio") {
                        res.json({ "err": "aspectratio" });
                    }
                    else {


                        res.setHeader('sex', '10');
                        res.setHeader('pussy', '1');
                        res.setHeader('trinidad', 'is kinda bad');
                        res.setHeader('resultid', outputBuffer);
                        res.json({ "resultid": outputBuffer });
                        if (stateid == null) {
                            console.log("no stateid")
                        } else {
                            axios.get(config.boturl + "/replace?stateid=" + stateid + "&resultid=" + outputBuffer)
                        }

                    }



                })
        }
        else {
            res.json({ "err": "localdenied" })

        }
    }
    else {
        res.json({ "err": "notfound" })
    }


});

function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

function rendererror(err, userdisplayerror) {
    const htmldata = fs.readFileSync(__dirname + "/cloakslol/error.html", 'utf8');
    console.error(err);
    errner = err + " @ " + Date.now()
    errorid = "Autocape:" + makeresultid(15)
    
    var replaced = replaceAll(htmldata, "{{error}}", userdisplayerror);
    replaced = replaceAll(replaced, "{{errorid}}", errorid);
    return replaced;
}

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

function makeresultid(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result + Date.now();
}


async function checkaspectratio(imagelocation) {

    const metadata = await sharp(imagelocation).metadata();
    const widthog = metadata.width;
    const heightog = metadata.height;
    const format = metadata.format;
    var aspectratioog = widthog / heightog;
    console.log(aspectratioog)
    var aspectratio = Math.round(aspectratioog * 1000) / 1000;
    console.log(aspectratio)

    if (forecerender == "true") {
        aspectratio = 0.625
    }
    templatename = "template.png"

    

    if (aspectratio == 0.625) {
        console.log('correct aspect ratio')
        if (format == 'png') {
            const versions = config.version
            const outputBuffer = await sharp(imagelocation)
                .resize(320, 512)
                .toBuffer();
            if (usecolourmatch == "true") {
                const bombs = await sharp(outputBuffer)
                    .stats()
                    .then(({ channels: [rc, gc, bc] }) => {
                        const r = Math.round(rc.mean),
                            g = Math.round(gc.mean),
                            b = Math.round(bc.mean);
                        console.log(r + " " + g + " " + b)
                        //convert rgb to hex
                        hexcol = ((r << 16) + (g << 8) + b).toString(16);
                        console.log(hexcol)
                    });



            }
            else if (usecolourmatch == "border") {
                console.log("border")
                const bombs = await sharp(outputBuffer).metadata();
                const fillwidth = bombs.width - 2;
                const fillheight = bombs.height - 2;
                const holeHeight = bombs.height - 1;
                const tops = await sharp(outputBuffer)
                    .extract({ left: 0, top: 0, width: bombs.width, height: 1 })
                    .toBuffer();
                const bottoms = await sharp(outputBuffer)
                    .extract({ left: 0, top: holeHeight, width: bombs.width, height: 1 })
                    .toBuffer();


                const fill = await sharp({
                    create: {
                        width: bombs.width,
                        height: bombs.height,
                        channels: 4,
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    }
                })
                    .composite([{ input: tops }, { input: bottoms }])
                    .toBuffer();

                const ammm = await sharp(fill)
                    .stats()
                    .then(({ channels: [rc, gc, bc] }) => {
                        const r = Math.round(rc.mean),
                            g = Math.round(gc.mean),
                            b = Math.round(bc.mean);
                        console.log(r + " " + g + " " + b)
                        //convert rgb to hex
                        hexcol = ((r << 16) + (g << 8) + b).toString(16);
                        console.log(hexcol)
                    });
            }
            else if (usecolourmatch == "prominant") {
                console.log("prominant")
                await Vibrant.from(outputBuffer).getPalette((err, palette) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    const mostProminentColor = palette.Vibrant.getHex();

                    console.log(`most prominent color ${mostProminentColor}`);
                    //remove #
                    var prmcolour = mostProminentColor.replace("#", "")

                    console.log("santized hexole" + prmcolour)
                    hexcol = prmcolour;

                });
            } else {
                hexcol = "121713"
            }
            console.log("colour applied" + hexcol)
            const svgtemplate = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" >
                        <path transform="translate(1024,0)"  d="M0 0H256V32H64V64H0V0Z" fill="#${hexcol}"/>
                        <path transform="translate(1088,64)"  d="M0 0H256V32H288V64H320V160H352V288H384V640H160V608H128V544H96V448H64V288H32V160V64H0V0Z" fill="#${hexcol}"/>
                        <path d="M32 0H672V32H704V352H736V703.913H704V544H32H0V32H32V0Z" fill="#${hexcol}"/>
                    </svg>
                    `;
            svgBuffertemplate = Buffer.from(svgtemplate);

            var overlayBuffer = await sharp(templatename)
                .composite([{ input: svgBuffertemplate, top: 0, left: 0 }])
                .toBuffer();

            overlayBuffer = await sharp(overlayBuffer)
                .composite([{ input: outputBuffer, top: 32, left: 32 }])
                .toBuffer();
            if (config.isdev == "true") {
                const width = 2048;
                const height = 1024;
                rendertime = Date.now() - starttime;
                const svgImage = `
                <svg width="${width}" height="${height}">
                  <style>
                  .title { fill: #FF0000; font-size: 15px; font-weight: bold;}
                  </style>
                  <text font-family="Arial, Helvetica, sans-serif" x="5px" y="900px" class="title">${versions}</text>
                  <text font-family="Arial, Helvetica, sans-serif" x="5px" y="920px" class="title">[AUTOCAPE DEBUG]</text>
                  <text font-family="Arial, Helvetica, sans-serif" x="5px" y="940px" class="title">IMGURL:${baseimagelocation}</text>
                  <text font-family="Arial, Helvetica, sans-serif" x="5px" y="960px" class="title">format:${format} height:${heightog} width:${widthog} aspectratioog:${aspectratioog} aspectratiorounded:${aspectratio} calculatedcolour:${hexcol} colourcalculationmodus:${usecolourmatch}</text>
                    <text font-family="Arial, Helvetica, sans-serif" x="5px" y="980px" class="title">host:${config.hostname}</text>
                    <text font-family="Arial, Helvetica, sans-serif" x="5px" y="1000px" class="title">rendertime(not counting debuginfo):${rendertime}</text>
                    <text font-family="Arial, Helvetica, sans-serif" x="1700px" y="1000px" class="title">DEBUG BUILD : NOT PRODUCTION READY</text>
                    <text font-family="Arial, Helvetica, sans-serif" x="1700px" y="940px" class="title">DEBUG BUILD : NOT PRODUCTION READY</text>

                </svg>
                `;
                svgBuffera = Buffer.from(svgImage);
                overlayBuffer = await sharp(overlayBuffer)
                    .composite([{ input: svgBuffera, top: 0, left: 0 }])
                    .toBuffer();
            }
            var resultid = makeresultid(10);
            fs.writeFileSync(__dirname + "/results/" + resultid + ".png", overlayBuffer);

            return resultid;


        }
    }
    else {

        console.log('incorrect aspect ratio')
        return "err:aspectratio"

    }

}

app.listen(config.port, () => console.log(`app listening on http://${fullUrl} !`))