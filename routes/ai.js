const express = require('express');
const router = express.Router();

router.post('/chat', (req, res) => {
  const { message } = req.body;

  let reply = "Tell me what kind of movie you're in the mood for 🎬";
  const msg = message.toLowerCase();

  if (msg.includes("tonight")) {
    reply = "🌙 Try Oppenheimer or ZNMD tonight!";
  }
  else if (msg.includes("rrr")) {
    reply = "🔥 RRR is amazing — try Baahubali!";
  }
  else if (msg.includes("pathaan")) {
    reply = "💥 Pathaan fans usually enjoy War or Jawan.";
  }
  else if (msg.includes("compare")) {
    reply = "🎬 RRR is emotional and grand, Pathaan is stylish and action-packed.";
  }
  else if (msg.includes("romantic")) {
    reply = "💕 Try YJHD or Before Sunrise.";
  }
  else if (msg.includes("comedy")) {
    reply = "😂 Hera Pheri, 3 Idiots, or Hangover!";
  }
  else if (msg.includes("horror")) {
    reply = "👻 Stree or The Conjuring!";
  }
  else if (msg.includes("thriller")) {
    reply = "🧩 Drishyam or Gone Girl!";
  }
  else if (msg.includes("action")) {
    reply = "💥 John Wick or Mad Max!";
  }
  else if (msg.includes("sad")) {
    reply = "😢 Kal Ho Naa Ho will hit hard.";
  }
  else if (msg.includes("feel good")) {
    reply = "😊 ZNMD or The Intern!";
  }
  else if (msg.includes("bollywood")) {
    reply = "🇮🇳 3 Idiots or Dangal!";
  }
  else if (msg.includes("hollywood")) {
    reply = "🌎 Inception or Interstellar!";
  }
  else if (msg.includes("sci") || msg.includes("space")) {
    reply = "🚀 Interstellar or Dune!";
  }
  else if (msg.includes("family")) {
    reply = "👨‍👩‍👧‍👦 Coco or Paddington!";
  }
  else if (msg.includes("anime")) {
    reply = "🎌 Your Name or Spirited Away!";
  }
  else if (msg.includes("crime")) {
    reply = "🔍 Gangs of Wasseypur or Godfather!";
  }
  else if (msg.includes("best")) {
    reply = "⭐ Shawshank Redemption or Dark Knight!";
  }
  else if (msg.includes("new")) {
    reply = "🆕 Oppenheimer or Dune 2!";
  }
  else if (msg.includes("underrated")) {
    reply = "💎 Tumbbad or The Prestige!";
  }
  else {
    reply = "🎬 Ask me about genre, mood, or comparisons!";
  }

  res.json({ success: true, reply });
});

module.exports = router;