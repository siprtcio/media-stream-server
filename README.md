# 🎙️ Media Stream Server

A Node.js-based real-time audio streaming and transcription server for SIP/WebRTC clients. It supports live speech-to-text conversion using Microsoft Azure or Deepgram as providers and is built to integrate with SIPRTC and similar communication platforms.

---

## 📖 About

**Media Stream Server** is designed for scenarios where live audio from SIP/WebRTC sessions needs to be transcribed or relayed in real time. It listens over WebSockets and streams audio to configurable STT (Speech-to-Text) engines, making it perfect for use in IVRs, contact centers, and voice assistants.

---

## 🚀 Key Features

- 🎧 **Real-time audio streaming** via WebSockets
- 🔄 **STT provider switching** (Microsoft Azure & Deepgram)
- 🌐 **Compatible with SIP/WebRTC** media sources
- 🧩 **Environment-configurable setup** (via `.env`)
- 📝 **Live transcription logs**
- ❌ Handles silence filtering and disconnection gracefully

---

## ⚙️ Installation

### Prerequisites

- Node.js v16+
- Valid credentials for Microsoft Azure or Deepgram
- Audio input source (e.g., SIPRTC)

### Steps

```bash
git clone https://github.com/siprtcio/media-stream-server.git
cd media-stream-server
npm install
```

#### Create a .env file in the root:
```bash
MS_SPEECH_KEY=your_microsoft_key
MS_SPEECH_REGION=your_region
DEEPGRAM_API_KEY=your_deepgram_key
```

### Start the server:
```bash
npm start
```

## 🧪 Usage Example
#### Connect to the server using WebSocket:
```bash
const ws = new WebSocket('ws://localhost:8080/?provider=microsoft');

ws.onopen = () => {
  ws.send(JSON.stringify({ event: 'start' }));
  // Then send base64 audio chunks as:
  ws.send(JSON.stringify({ event: 'media', media: { payload: base64AudioData } }));
};

ws.onmessage = (msg) => {
  console.log('Server:', msg.data);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

## 🛣️ Roadmap
- [ ] Microsoft Azure STT integration
- [ ] Deepgram STT integration
- [ ] Silence detection and filtering
- [ ] JWT-based client authentication
- [ ] Transcription response forwarding to external services
- [ ] Docker deployment support

## 📅 Initial Release
- [ ] Version: 1.0.0
- [ ] Released: June 2025
- [ ] Status: Beta

## 🔌 Upcoming Integrations
- [ ] 🔤 Google Cloud Speech-to-Text
- [ ] 🗃️ Audio recording to file system / S3
- [ ] 📊 Web-based transcription dashboard
- [ ] 🔐 Secure token-based WebSocket access

## 🔮 Future Enhancements
- [ ] 📡 Streaming to Kafka or Webhooks
- [ ] 🧠 NLP and real-time intent detection
- [ ] 📁 Multi-session support with unique session IDs
- [ ] 🎛️ Admin panel for connection logs and monitoring

## 🤝 Contribution
#### Contributions are welcome! To contribute:
- [ ] Fork the repository
- [ ] Create a new branch: git checkout -b my-feature
- [ ] Make your changes
- [ ] Commit: git commit -m "Add my feature"
- [ ] Push: git push origin my-feature
- [ ] Create a Pull Request
