const speech = require('@google-cloud/speech')
const fs = require('fs')
const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')


const app = express()

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.raw({ type: 'audio/l16', limit: '50mb' }));

const upload = multer({ dest: "audio/" })


app.post('/speech-to-text', (req, res) => {
  console.log(req.headers);
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.sendStatus(400)
    } else {
      console.log(req.body);
      const raw = req.body
      const client = new speech.SpeechClient()
      if (raw) {
        const audioBytes = Buffer.from(raw).toString('base64');

        // The audio file's encoding, sample rate in hertz, and BCP-47 language code
        const audio = {
          content: audioBytes,
        };

        const config = {
          encoding: 'LINEAR16',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
        };

        const request = {
          audio: audio,
          config: config,
        };

        // Detects speech in the audio file
        client
          .recognize(request)
          .then(data => {
            const response = data[0];
            const transcription = response.results
              .map(result => result.alternatives[0].transcript)
              .join('\n');
            console.log(`Transcription: ${transcription}`);
            res.send(transcription)
          })
          .catch(err => {
            console.error('ERROR:', err);
            res.send(err)
          });
      } else {
        res.send("File not found.");
      }
    }
  })

})

app.get('/', (req, res) => {
  res.send("Welcome to the Cloud Speech-to-Text service.");
})

const PORT = 8080 || process.env.PORT

app.listen(PORT, () => console.log(`Server listen on port ${PORT}`))