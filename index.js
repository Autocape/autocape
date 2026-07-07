const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const DiscordOAuth2 = require('discord-oauth2');
const express = require('express');
const cors = require('cors');
const config = require('./config.json');

const app = express();
app.use(cors());

const oauth = new DiscordOAuth2({
    clientId: config.discordclientid,
    clientSecret: config.discordsecret,
    redirectUri: config.redirecturi,
});

let fullUrl = config.hostname;
if (config.portneeded === "true") {
    if (!config.port) {
        console.error("No port specified in config.json");
        process.exit(1);
    }
    fullUrl = `${config.hostname}:${config.port}`;
}

const resultsDir = path.join(__dirname, "results");
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

function renderError(errorMessage, displayError) {
    const htmlData = fs.readFileSync(path.join(__dirname, "pages/error.html"), 'utf8');
    const errorTime = `${errorMessage} @ ${Date.now()}`;
    const errorId = `Autocape:${generateResultId(15)}`;
    
    console.error(errorTime);
    
    return htmlData
        .replaceAll("{{error}}", displayError)
        .replaceAll("{{errorid}}", errorId);
}

function generateResultId(length) {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result + Date.now();
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'pages/autocape.html')));
app.get('/resize', (req, res) => res.sendFile(path.join(__dirname, "pages/resizerui.html")));
app.get('/js/localize.js', (req, res) => res.sendFile(path.join(__dirname, "pages/localize.js")));

['/discord', '/support', '/help'].forEach(route => {
    app.get(route, (req, res) => res.redirect("https://discord.gg/MT6TpR7rqZ"));
});

app.get('/localize/:languagecode/:pageid', (req, res) => {
    const filePath = path.join(__dirname, "pages/localizejs", req.params.languagecode, `${req.params.pageid}.json`);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendStatus(404);
    }
});

app.get("/cape/:id", (req, res) => {
    const id = req.params.id;
    if (!id) return res.send(renderError("Error: 400 - malformed @ /cape : no valid params passed", "400"));

    const file = path.join(resultsDir, `${id}.png`);
    if (fs.existsSync(file)) {
        res.sendFile(file);
    } else {
        res.send(renderError(`Error: 404 - Not found @ /cape : id ${id} ip: ${req.ip}`, "404"));
    }
});

app.get('/authendpoint', async (req, res) => {
    const code = req.query.code;
    try {
        const token = await oauth.tokenRequest({
            code,
            scope: ['identify'],
            grantType: 'authorization_code',
        });
        const user = await oauth.getUser(token.access_token);
        res.send(user);
    } catch (err) {
        console.error(err);
        res.send(renderError(`Error: 500 - Internal server error @ /authendpoint : ${err}`, "500"));
    }
});

app.get('/result', (req, res) => res.send(renderError("Error: 400 - Malformed @ /result : no valid params passed", "400")));

app.get("/result/:id", (req, res) => {
    const id = req.params.id;
    if (!id) return res.send(renderError(`Error: 400 - Malformed @ /result/:id :id ${id}`, "400"));

    const file = path.join(resultsDir, `${id}.png`);
    if (!fs.existsSync(file)) {
        return res.send(renderError(`Error: 404 - Not found @ /result/:id :id ${id}`, "404"));
    }

    const htmlData = fs.readFileSync(path.join(__dirname, "pages/result.html"), 'utf8');
    const targetUrl = `http://${fullUrl}/cape/${id}`;
    
    const replaced = htmlData
        .replaceAll("{{imgurl}}", targetUrl)
        .replaceAll("{{imgurl2}}", targetUrl);

    res.send(replaced);
});

app.get('/makecape', async (req, res) => {
    const forceRender = req.query.fromeditor === "true";
    const customColor = req.query.customcolour;
    const useColorMatch = customColor ? "custom" : (req.query.colourmatch || "false");
    const stateId = req.query.stateid;
    const baseImageLocation = req.query.img;
    const startTime = Date.now();

    if (!baseImageLocation) return res.json({ err: "noimg" });
    if (!baseImageLocation.endsWith('.png')) return res.json({ err: "notfound" });
    if (!baseImageLocation.startsWith('http')) return res.json({ err: "localdenied" });

    try {
        const response = await axios.get(baseImageLocation, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Autocape/AutocapeBot (Support:discord.gg/wxRatfNSwz) Axios/1.4.0' }
        });

        const outputBuffer = await generateCape(response.data, {
            forceRender,
            useColorMatch,
            customColor,
            baseImageLocation,
            startTime
        });

        if (outputBuffer === "err:aspectratio") {
            return res.json({ err: "aspectratio" });
        }

        res.setHeader('resultid', outputBuffer);
        res.json({ resultid: outputBuffer });

        if (stateId) {
            axios.get(`${config.boturl}/replace?stateid=${stateId}&resultid=${outputBuffer}`)
                .catch(err => console.error('bot err: ', err));
        }

    } catch (error) {
        console.error("img processing err:", error);
        res.json({ err: "processing_error" });
    }
});

async function generateCape(imageBuffer, options) {
    const metadata = await sharp(imageBuffer).metadata();
    const widthOg = metadata.width;
    const heightOg = metadata.height;
    const format = metadata.format;
    const aspectRatioOg = widthOg / heightOg;
    let aspectRatio = Math.round(aspectRatioOg * 1000) / 1000;

    if (options.forceRender) {
        aspectRatio = 0.625;
    }

    if (aspectRatio !== 0.625) {
        console.log('Incorrect aspect ratio');
        return "err:aspectratio";
    }

    if (format !== 'png') return "err:aspectratio";

    const outputBuffer = await sharp(imageBuffer)
        .resize(320, 512)
        .toBuffer();

    let hexColor = "121713"; 

    if (options.useColorMatch === "true") {
        const stats = await sharp(outputBuffer).stats();
        const [rc, gc, bc] = stats.channels;
        const r = Math.round(rc.mean);
        const g = Math.round(gc.mean);
        const b = Math.round(bc.mean);
        hexColor = ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');

    } else if (options.useColorMatch === "border") {
        const borderMeta = await sharp(outputBuffer).metadata();
        const tops = await sharp(outputBuffer)
            .extract({ left: 0, top: 0, width: borderMeta.width, height: 1 })
            .toBuffer();
        const bottoms = await sharp(outputBuffer)
            .extract({ left: 0, top: borderMeta.height - 1, width: borderMeta.width, height: 1 })
            .toBuffer();

        const fill = await sharp({
            create: {
                width: borderMeta.width,
                height: borderMeta.height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
            .composite([{ input: tops }, { input: bottoms }])
            .toBuffer();

        const stats = await sharp(fill).stats();
        const [rc, gc, bc] = stats.channels;
        const r = Math.round(rc.mean);
        const g = Math.round(gc.mean);
        const b = Math.round(bc.mean);
        hexColor = ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');

    }

     else if (options.useColorMatch === "custom" && options.customColor) {
        hexColor = options.customColor;
    }

    const svgTemplate = `
        <svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" >
            <path transform="translate(1024,0)" d="M0 0H256V32H64V64H0V0Z" fill="#${hexColor}"/>
            <path transform="translate(1088,64)" d="M0 0H256V32H288V64H320V160H352V288H384V640H160V608H128V544H96V448H64V288H32V160V64H0V0Z" fill="#${hexColor}"/>
            <path d="M32 0H672V32H704V352H736V703.913H704V544H32H0V32H32V0Z" fill="#${hexColor}"/>
        </svg>
    `;

    let overlayBuffer = await sharp(path.join(__dirname, "template.png"))
        .composite([{ input: Buffer.from(svgTemplate), top: 0, left: 0 }])
        .toBuffer();

    overlayBuffer = await sharp(overlayBuffer)
        .composite([{ input: outputBuffer, top: 32, left: 32 }])
        .toBuffer();

    if (config.isdev === "true") {
        const renderTime = Date.now() - options.startTime;
        const debugSvg = `
        <svg width="2048" height="1024">
            <style>
                .title { fill: #FF0000; font-size: 15px; font-weight: bold;}
            </style>
            <text font-family="Arial, Helvetica, sans-serif" x="5px" y="900px" class="title">${config.version}</text>
            <text font-family="Arial, Helvetica, sans-serif" x="5px" y="920px" class="title">[AUTOCAPE DEBUG]</text>
            <text font-family="Arial, Helvetica, sans-serif" x="5px" y="940px" class="title">IMGURL:${options.baseImageLocation}</text>
            <text font-family="Arial, Helvetica, sans-serif" x="5px" y="960px" class="title">format:${format} height:${heightOg} width:${widthOg} aspectratioog:${aspectRatioOg} aspectratiorounded:${aspectRatio} calculatedcolour:${hexColor} colourcalculationmodus:${options.useColorMatch}</text>
            <text font-family="Arial, Helvetica, sans-serif" x="5px" y="980px" class="title">host:${config.hostname}</text>
            <text font-family="Arial, Helvetica, sans-serif" x="5px" y="1000px" class="title">rendertime(not counting debuginfo):${renderTime}ms</text>
            <text font-family="Arial, Helvetica, sans-serif" x="1700px" y="1000px" class="title">DEBUG BUILD : NOT PRODUCTION READY</text>
            <text font-family="Arial, Helvetica, sans-serif" x="1700px" y="940px" class="title">DEBUG BUILD : NOT PRODUCTION READY</text>
        </svg>
        `;
        overlayBuffer = await sharp(overlayBuffer)
            .composite([{ input: Buffer.from(debugSvg), top: 0, left: 0 }])
            .toBuffer();
    }

    const resultId = generateResultId(10);
    fs.writeFileSync(path.join(resultsDir, `${resultId}.png`), overlayBuffer);

    return resultId;
}

app.listen(config.port, () => console.log(`App listening on http://${fullUrl} !`));