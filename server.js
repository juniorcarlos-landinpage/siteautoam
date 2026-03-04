require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = process.env.INSTANCE_NAME;

// Função para enviar mensagem de texto
async function sendTextMessage(remoteJid, text) {
  try {
    const url = `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`;
    const data = {
      number: remoteJid,
      text: text,
      delay: 1200,
      linkPreview: true
    };

    await axios.post(url, data, {
      headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log(`Resposta enviada para ${remoteJid}`);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
  }
}

// Endpoint do Webhook
app.post('/webhook', async (req, res) => {
  const payload = req.body;

  // Verifica se é um evento de mensagem recebida
  if (payload.event === 'messages.upsert' && !payload.data.key.fromMe) {
    const remoteJid = payload.data.key.remoteJid;
    const messageContent = payload.data.message?.conversation || 
                           payload.data.message?.extendedTextMessage?.text || 
                           "";

    console.log(`Mensagem recebida de ${remoteJid}: ${messageContent}`);

    // Lógica simples de palavras-chave
    const messageLower = messageContent.toLowerCase();

    if (messageLower.includes('oi') || messageLower.includes('ola') || messageLower.includes('olá')) {
      await sendTextMessage(remoteJid, 'Olá! Sou um robô de automação. Como posso te ajudar hoje?');
    } else if (messageLower.includes('ajuda') || messageLower.includes('suporte')) {
      await sendTextMessage(remoteJid, 'Entendido! Logo um atendente humano falará com você. Por favor, aguarde.');
    } else if (messageLower.includes('pix') || messageLower.includes('pagamento')) {
      await sendTextMessage(remoteJid, 'Para pagamentos via PIX, use a chave: seu@email.com. Após o envio, me mande o comprovante!');
    }
  }

  res.status(200).send('OK');
});

app.get('/', (req, res) => {
    res.send('Servidor de Automação Evolution API está rodando! 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
