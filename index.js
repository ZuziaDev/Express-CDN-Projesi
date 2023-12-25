const express = require('express');
const cors = require("cors")
const app = express();
const ejs = require('ejs'); // EJS modülünü içe aktarın
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
const multer  = require('multer');
const upload = multer({ dest: 'static/image/' }); 
// EJS'yi kullanmak için view engine'i ayarlayın
app.set('view engine', 'ejs');
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

function convertHexToRgb(hex) {
    // Hex kodunu RGB değerine çevirme
    const hexValue = hex.replace("#", "");
    const red = parseInt(hexValue.substring(0, 2), 16);
    const green = parseInt(hexValue.substring(2, 4), 16);
    const blue = parseInt(hexValue.substring(4, 6), 16);
  
    return { red, green, blue };
  }
  
  function Hexlog({name: name, text:text, hex: hexColor}) {
    const rgbColor = convertHexToRgb(hexColor);
    const coloredText = `\x1b[38;2;${rgbColor.red};${rgbColor.green};${rgbColor.blue}m[${name}] ${text}\x1b[0m`;
    console.log(coloredText);
  }

app.get('/media', (req, res) => {
    var file = req.query.file;
    try {
        if (hmm(file)) {
            res.sendFile(__dirname + '/static/image/' + file, (err) => {
                if (err) {
                    res.sendFile(__dirname + '/static/zuzia_nah.png');
                }
            });
        } else {
            boyut(__dirname + '/static/image/' + file)
                .then(boyutMB => {
                    let mb = boyutMB;
                    let dosya = encodeURIComponent(file);
                    res.render(__dirname + '/site/index.ejs', { dosya, mb, file });
                })
                .catch(err => {
                    res.json({ error: "Ufak bir hata oldu lütfen sonra tekrar deneyiniz!" });
                    Hexlog({ name: "Express", text: err, hex: "#FF0000" });
                });
        }
    } catch (err) {
        res.sendFile(__dirname + '/static/zuzia_nah.png');
    }
});


app.get('/file', (req, res) => {
  var file = req.query.name;
    res.sendFile(__dirname + '/static/image/' + file);
});


app.post('/upload', (req, res) => {
    const base64 = req.body.base64;
    if (!base64) {
        return res.json({ status: "400", error: "Geçersiz veri." });
    }

    try {
        // Tarih ve saat ile saniyeyi al
        const now = new Date();
        const fileName = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        const type = 'png';

        // Base64 veriyi dosyaya kaydet
        const base64Buffer = Buffer.from(base64, 'base64');
        const filePath = `uploads/${fileName}.${type}`;
        fs.writeFileSync(filePath, base64Buffer);

        // İşlem tamamlandığında yanıt gönder
        handleResponse(fileName, type, res);
    } catch (err) {
        console.error('Dosya kaydetme hatası:', err);
        res.json({ status: "500", error: err });
    }
});

function handleResponse(fileName, type, res) {
    const fileTypeMapping = {
        "png": "Image",
    };

    const fileType = fileTypeMapping[type] || "Unknown";

    const response = {
        status: "200",
        url: `https://cdn.zuzia.dev/media?file=${fileName}.${type}`,
        type: fileType,
    };

    res.json(response);
    console.log(response);
}


function boyut(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      const boyutBytes = stats.size;
      const boyutMB = boyutBytes / 1024 / 1024;
      resolve(boyutMB);
    });
  });
}


function hmm(text) {
  const bt = ['.png', '.gif', '.jpg', '.jpeg', '.bmp', '.webp', '.svg', '.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv'];

return bt.some(alo => text.toLowerCase().includes(alo));
}

const port = 25598;
app.listen(port, () => {
 Hexlog({name: "Express", text: `Sunucu ${port} ile aktif`, hex: "#CC9BFF"});
});