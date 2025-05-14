import dotenv from 'dotenv';
import express from 'express';
import expressWs from 'express-ws';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import sdk from 'microsoft-cognitiveservices-speech-sdk';

dotenv.config();

const app = express();
expressWs(app);

app.ws('/', (ws, req) => {
  ws._socket.setNoDelay(true);
  console.log('🔌 SipRTC connected');

  let dgConn = null;
  let msRecognizer = null;
  let msStream = null;

  // Set provider: 'deepgram' or 'microsoft'
  const provider = req.query.provider || 'microsoft';

    console.log('🔌 SipRTC provider',provider);

  const startMicrosoft = () => {
    const key = process.env.MS_SPEECH_KEY;
    const region = process.env.MS_SPEECH_REGION;

    if (!key || !region) {
      console.error('❌ Missing Microsoft Speech credentials: MS_SPEECH_KEY and/or MS_SPEECH_REGION');
      ws.close(1011, 'Missing Microsoft Speech credentials');
      return;
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      key,
      region
    );

    speechConfig.speechRecognitionLanguage = 'en-IN';

    const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(8000, 16, 1);
    msStream = sdk.AudioInputStream.createPushStream(audioFormat);
    const audioConfig = sdk.AudioConfig.fromStreamInput(msStream);

    msRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    msRecognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        const text = e.result.text;
        if (text) console.log('📝', text);
      }
    };

    msRecognizer.canceled = (s, e) => {
      console.error(`⚠️ Microsoft canceled: ${e.errorDetails}`);
    };

    msRecognizer.sessionStopped = () => {
      console.warn(`🛑 Microsoft session stopped`);
    };

    msRecognizer.startContinuousRecognitionAsync(
      () => console.log('🟢 Microsoft STT started'),
      err => console.error('❌ Microsoft start error:', err)
    );
  };

  const startDeepgram = () => {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    dgConn = deepgram.listen.live({
      model: 'nova-3',
      language: 'en-US',
      smart_format: true,
      encoding: 'mulaw',
      sample_rate: 8000,
    });

    dgConn.on(LiveTranscriptionEvents.Open, () => {
      console.log('🟢 Deepgram connected');
    });

    dgConn.on(LiveTranscriptionEvents.Transcript, (data) => {
      const t = data.channel?.alternatives?.[0]?.transcript;
      if (t) console.log('📝', t);
    });

    dgConn.on(LiveTranscriptionEvents.Error, console.error);
    dgConn.on(LiveTranscriptionEvents.Close, () => {
      console.log('🔴 Deepgram closed');
    });
  };

  if (provider === 'microsoft') {
    console.log('🚀 microsoft stt started');
    startMicrosoft();
  } else {
    console.log('🚀 deepgram stt started');
    startDeepgram();
  }

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.event === 'start') {
        console.log('🚀 SipRTC stream started');
      } else if (msg.event === 'media') {
        const audio = Buffer.from(msg.media.payload, 'base64');

        // Optional: skip silence
        // const mostlySilent = audio.every(byte => byte === 0xff);
        // if (mostlySilent) return;
        if (provider === 'microsoft' && msStream) {
          msStream.write(audio);
        } else if (provider === 'deepgram' && dgConn) {
          dgConn.send(audio);
        }
      } else if (msg.event === 'stop') {
        console.log('🛑 SipRTC stream stopped');

        if (dgConn) dgConn.finish();
        if (msRecognizer) msRecognizer.stopContinuousRecognitionAsync();
        if (msStream) msStream.close();
      }
    } catch (err) {
      console.error('⚠️ Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('❌ SipRTC disconnected');
    if (dgConn) dgConn.finish();
    if (msRecognizer) msRecognizer.stopContinuousRecognitionAsync();
    if (msStream) msStream.close();
  });

  ws.send('✅ Ready for SipRTC Media Stream');
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 WebSocket server running at ws://localhost:${PORT}/`);
});
