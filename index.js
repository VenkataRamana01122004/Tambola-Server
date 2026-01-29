// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const games = {};

// ---------------- HELPERS ----------------

function getPlayersTable(game) {
  if (!game || !game.players) return [];

  return Object.entries(game.players).map(
    ([playerCode, p]) => ({
      playerCode,
      name: p.playerName,
      status: p.status || "OFFLINE",
      autoMark: !!p.allowAutoMark,
    })
  );
}

function generateRealTambolaTicketFixed() {
  // Step 1: Prepare numbers per column
  const columns = [];
  for (let i = 0; i < 9; i++) {
    const start = i * 10 + 1;
    const end = i === 8 ? 90 : start + 9;
    const nums = [];
    for (let n = start; n <= end; n++) nums.push(n);
    columns.push(nums);
  }

  // Step 2: Determine how many numbers in each column (1-3) ensuring total 15 numbers
  const colCounts = Array(9).fill(0);

  // First assign 1 to each column randomly until we have 15 total numbers
  let totalNumbers = 0;
  while (totalNumbers < 15) {
    for (let i = 0; i < 9 && totalNumbers < 15; i++) {
      if (colCounts[i] < 3) {
        colCounts[i]++;
        totalNumbers++;
      }
    }
  }

  // Step 3: Pick numbers from columns
  const colNumbers = columns.map((col, i) => {
    const count = colCounts[i];
    const temp = [...col];
    const picked = [];
    for (let j = 0; j < count; j++) {
      const idx = Math.floor(Math.random() * temp.length);
      picked.push(temp.splice(idx, 1)[0]);
    }
    return picked.sort((a, b) => a - b);
  });

  // Step 4: Arrange numbers into 3 rows × 9 columns
  const ticket = Array.from({ length: 3 }, () => Array(9).fill(null));

  for (let col = 0; col < 9; col++) {
    const nums = colNumbers[col];
    // Shuffle rows so numbers are randomly assigned but each row ends with exactly 5 numbers
    const rows = [0, 1, 2];
    rows.sort(() => Math.random() - 0.5);
    nums.forEach((num, i) => {
      ticket[rows[i]][col] = num;
    });
  }

  // Step 5: Adjust rows to ensure exactly 5 numbers per row
  for (let row = 0; row < 3; row++) {
    let count = ticket[row].filter(n => n !== null).length;
    while (count > 5) {
      // remove a random number
      const nonNullCols = ticket[row].map((n, idx) => n !== null ? idx : -1).filter(n => n !== -1);
      const removeCol = nonNullCols[Math.floor(Math.random() * nonNullCols.length)];
      ticket[row][removeCol] = null;
      count--;
    }
    while (count < 5) {
      // add number from columns that have numbers in other rows
      const candidateCols = ticket.map((r, cIdx) => r[row] === undefined ? cIdx : null).filter(n => n !== null);
      // find a column that still has numbers left
      const availableCols = [];
      for (let col = 0; col < 9; col++) {
        if (!ticket[row][col]) {
          const numsLeft = columns[col].filter(n => !ticket.flat().includes(n));
          if (numsLeft.length) availableCols.push(col);
        }
      }
      if (!availableCols.length) break;
      const colToAdd = availableCols[Math.floor(Math.random() * availableCols.length)];
      const numsLeft = columns[colToAdd].filter(n => !ticket.flat().includes(n));
      ticket[row][colToAdd] = numsLeft[Math.floor(Math.random() * numsLeft.length)];
      count++;
    }
  }

  return ticket;
}

function firstFive(ticket, called) {
  let count = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      if (ticket[row][col] !== null && called.has(ticket[row][col])) {
        count++;
        if (count >= 5) return true;
      }
    }
  }
  return false;
}

function lineComplete(ticket, startRow, called) {
  if (!Array.isArray(ticket)) return false;
  if (!ticket[startRow]) return false;

  for (let col = 0; col < 9; col++) {
    const num = ticket[startRow][col];
    if (num !== null && !called.has(num)) {
      return false;
    }
  }
  return true;
}

function fullHouse(ticket, called) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const num = ticket[row][col];
      if (num !== null && !called.has(num)) return false;
    }
  }
  return true;
}


// ---------------- SOCKET ----------------
io.on("connection", socket => {
  // console.log("✅ Connected:", socket.id);

  // ---------- CREATE GAME ----------
  socket.on("host_create_game", () => {
  const roomCode = randomUUID().slice(0, 6).toUpperCase();

<<<<<<< HEAD
  const game = games[roomCode] = {
    hostId: socket.id,
    players: {},
    tickets: {},
    called: [],
    calledSet: new Set(),
    current: null,
    chat: [],
    claims: {
      FIRST_FIVE: null,
      FIRST_LINE: null,
      MIDDLE_LINE: null,
      LAST_LINE: null,
      FULL_HOUSE: null
    }
  };
=======
    games[roomCode] = {
      hostId: socket.id,
      players: {},
      tickets: {},
      called: [],
      calledSet: new Set(),
      current: null,
      chat: [], // 🆕 chat history
      claims: {
        FIRST_FIVE: null,
        FIRST_LINE: null,
        MIDDLE_LINE: null,
        LAST_LINE: null,
        FULL_HOUSE: null
      }
    };
>>>>>>> 909c898eb1d8b52a30b8b91d392633f318b2e780

  socket.join(roomCode);
  socket.emit("game_created", { roomCode });

  io.to(roomCode).emit(
    "players_table_update",
    getPlayersTable(game)
  );
  });

<<<<<<< HEAD
 socket.on("sendEmoji", ({ roomCode, playerName, emoji }) => {
    io.to(roomCode).emit("receiveEmoji", {
      playerName,
      emoji,
      time: Date.now(),
    });
  });

  socket.on("sendEmojiToPlayer", ({ targetSocketId, emoji, from }) => {
  io.to(targetSocketId).emit("receiveEmoji", {
    playerName: from,
    emoji,
  });
});



=======
>>>>>>> 909c898eb1d8b52a30b8b91d392633f318b2e780

socket.on("player_send_message", ({ roomCode, playerCode, message }) => {
  const game = games[roomCode];
  if (!game) return;

  const sender =
    playerCode === "HOST"
      ? { playerName: "HOST" }
      : game.players[playerCode];

  if (!sender) return;

  const chatMsg = {
    user: sender.playerName,
    message,
    time: Date.now(),
  };

  game.chat.push(chatMsg);

  io.to(roomCode).emit("chat_message", chatMsg);
});




  // ---------- ADD PLAYER ----------
  socket.on("host_add_player", ({ roomCode, playerName }) => {
    const g = games[roomCode];
    if (!g) return;

    const playerCode = randomUUID().slice(0, 4).toUpperCase();
    // g.players[playerCode] = { playerName };
    g.players[playerCode] = {
  playerName,
  allowAutoMark: false, // 🔒 default OFF
};


    g.tickets[playerCode] = [];

    io.to(roomCode).emit("player_added", { playerCode, playerName });
    io.to(roomCode).emit(
  "players_table_update",
  getPlayersTable(games[roomCode])
);


  });

  socket.on("toggle_player_auto_mark", ({ roomCode, playerCode, allowed }) => {
  const game = games[roomCode];
  if (!game) return;
  if (socket.id !== game.hostId) return;

  const player = game.players[playerCode];
  if (!player) return;

  player.allowAutoMark = allowed;

  // 🔔 notify only that player
  if (player.socketId) {
    io.to(player.socketId).emit("auto_mark_permission", {
      allowed,
    });
  }
});




  socket.on("host_remove_player", ({ roomCode, playerCode }) => {
  const game = games[roomCode];
  if (!game || game.hostId !== socket.id) return;

  if (!game.players[playerCode]) return; // 🔐 safety

  delete game.players[playerCode];
  delete game.tickets[playerCode];

  io.to(roomCode).emit("player_removed", { playerCode });
  io.to(roomCode).emit(
  "players_table_update",
  getPlayersTable(games[roomCode])
);


});



  // ---------- ASSIGN TICKETS ----------
  socket.on("host_assign_ticket", ({ roomCode, playerCode, count = 1 }) => {
  const g = games[roomCode];
  if (!g) return;

  if (!Array.isArray(g.tickets[playerCode])) {
  g.tickets[playerCode] = [];
}

  for (let i = 0; i < count; i++) {
const ticket = generateRealTambolaTicketFixed();
g.tickets[playerCode].push(ticket);
// console.table(ticket);
  }

  // ✅ notify host UI
  io.to(roomCode).emit("ticket_assigned", { playerCode });

  // ✅ NEW: notify player directly if online
  const playerSocketId = g.players[playerCode]?.socketId;
  if (playerSocketId) {
    io.to(playerSocketId).emit("tickets_updated", {
      tickets: g.tickets[playerCode]
    });
  }
});


  // ---------- CALL NUMBER ----------
  socket.on("host_call_number", ({ roomCode }) => {
    const g = games[roomCode];
    if (!g) return;
    if (g.calledSet.size === 90) return;

    let n;
    do { n = Math.floor(Math.random() * 90) + 1; }
    while (g.calledSet.has(n));

    g.calledSet.add(n);
    g.called.push(n);
    g.current = n;

    io.to(roomCode).emit("number_called", {
      number: n,
      called: g.called
    });
  });

  // ---------- 🚀 NEW GAME = NEW ROOM ----------
  socket.on("host_reset_game", ({ roomCode }) => {
  const g = games[roomCode];
  if (!g || g.hostId !== socket.id) return;

  // 🔄 reset only game state
  g.called = [];
  g.calledSet = new Set();
  g.current = null;

  // 🔄 reset tickets (players stay)
  for (const p in g.tickets) {
    g.tickets[p] = [];
  }

  // 🔄 reset claims
  g.claims = {
    FIRST_FIVE: null,
    FIRST_LINE: null,
    MIDDLE_LINE: null,
    LAST_LINE: null,
    FULL_HOUSE: null,
  };

  io.to(roomCode).emit("game_reset");
});



  // ---------- PLAYER JOIN ----------
// ---------- PLAYER JOIN ----------
socket.on("player_join_with_code", ({ playerCode }) => {
  for (const roomCode in games) {
    const g = games[roomCode];
    const player = g.players[playerCode];

    if (!player) continue;

<<<<<<< HEAD
    // 🚨 Prevent duplicate active login
    if (player.socketId && player.socketId !== socket.id) {
      io.to(player.socketId).emit("force_logout", {
        reason: "You logged in from another device"
      });
=======
      socket.join(roomCode);
      socket.emit("player_joined", {
  roomCode,
  playerName: g.players[playerCode].playerName,
  tickets: g.tickets[playerCode],
  called: g.called,
  current: g.current,
  claims: g.claims,
  allowAutoMark: g.players[playerCode].allowAutoMark, // 👈
  chat: g.chat,
});

      return;
>>>>>>> 909c898eb1d8b52a30b8b91d392633f318b2e780
    }

    // 🔁 reconnect or fresh join
    player.socketId = socket.id;
    player.status = "ONLINE";

    // ✅ IMPORTANT: join room BEFORE emitting updates
    socket.join(roomCode);

    // ✅ Send FULL players table (single source of truth)
    io.to(roomCode).emit(
  "players_table_update",
  getPlayersTable(games[roomCode])
);


    // ✅ Send personal game state to this player
    socket.emit("player_joined", {
      roomCode,
      playerName: player.playerName,
      tickets: g.tickets[playerCode] || [],
      called: g.called || [],
      current: g.current || null,
      claims: g.claims || {},
      allowAutoMark: !!player.allowAutoMark,
      chat: g.chat || [],
    });

    return;
  }

  socket.emit("join_error", { message: "Invalid player code" });
});



socket.on("disconnect", () => {
  for (const roomCode in games) {
    const g = games[roomCode];

    for (const playerCode in g.players) {
      const player = g.players[playerCode];

      if (player.socketId === socket.id) {
        player.socketId = null;
        player.status = "OFFLINE";

        const game = games[roomCode];

io.to(roomCode).emit(
  "players_table_update",
  getPlayersTable(games[roomCode])
);



        return;
      }
    }
  }
});




  // ---------- CLAIM ----------
socket.on("player_claim", ({ roomCode, playerCode, claimType }) => {
  const game = games[roomCode];
  if (!game) return;

  if (game.claims[claimType]) {
    socket.emit("claim_rejected", { claimType });
    return;
  }

  const player = game.players[playerCode];
  if (!player) return;

  const tickets = Array.isArray(game.tickets[playerCode])
    ? game.tickets[playerCode]
    : [];

    if (!tickets.length) {
    socket.emit("claim_rejected", { claimType });
    return;
  }
  
  const calledSet = new Set(game.called);
  let valid = false;

  for (const ticket of tickets) {
    if (!ticket) continue;

    switch (claimType) {
      case "FIRST_FIVE":
        valid = firstFive(ticket, calledSet);
        break;

      case "FIRST_LINE":
        valid = lineComplete(ticket, 0, calledSet);
        break;

      case "MIDDLE_LINE":
        valid = lineComplete(ticket, 1, calledSet);
        break;

      case "LAST_LINE":
        valid = lineComplete(ticket, 2, calledSet);
        break;

      case "FULL_HOUSE":
        valid = fullHouse(ticket, calledSet);
        break;
    }
    if (valid) break; // ANY ticket can win
  }

  if (!valid) {
    socket.emit("claim_rejected", { claimType });
    return;
  }

  const winnerName = player.playerName || playerCode;
game.claims[claimType] = winnerName;

io.to(roomCode).emit("claim_accepted", {
  claimType,
  winner: winnerName,
});
});
});

app.get("/", (req, res) => {
  res.send("Tambola Server With chat is running By Venkata Ramana Vegulla ");
});

server.listen(2004, () =>
  console.log("Venkata Ramana Vegulla")
);
