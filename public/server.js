const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let gameBoard = ['', '', '', '', '', '', '', '', ''];
let players = [];
let currentPlayerIndex = 0;

io.on('connection', (socket) => {
  console.log('Novo jogador conectado');
  players.push(socket);

  // Envia o tabuleiro atual e o turno quando um novo jogador se conecta
  socket.emit('updateBoard', { gameBoard, currentTurn: players[currentPlayerIndex].id });

  socket.on('cellClick', (index) => {
    const currentPlayerSocket = players[currentPlayerIndex];
    if (gameBoard[index] === '' && socket === currentPlayerSocket) {
      gameBoard[index] = currentPlayerSocket.id;

      if (checkWinner()) {
        io.emit('updateBoard', { gameBoard, currentTurn: 'Game Over', winner: `GG player: ${currentPlayerSocket.id} ganhou!` });
      } else if (gameBoard.every(cell => cell !== '')) {
        io.emit('updateBoard', { gameBoard, currentTurn: 'Game Over', gameOver: 'Empate!' });
      } else {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        const nextPlayerSocket = players[currentPlayerIndex];
        io.emit('updateBoard', { gameBoard, currentTurn: nextPlayerSocket.id });
      }
    }
  });

  socket.on('restartGame', () => {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayerIndex = 0;

    io.emit('updateBoard', { gameBoard, currentTurn: players[currentPlayerIndex].id });
  });

  socket.on('disconnect', () => {
    const disconnectedPlayerIndex = players.indexOf(socket);
    if (disconnectedPlayerIndex !== -1) {
      players.splice(disconnectedPlayerIndex, 1);
      if (currentPlayerIndex >= players.length) {
        currentPlayerIndex = 0;
      }
    }

    console.log('Jogador desconectado');
  });
});


function checkWinner() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  return winPatterns.some(pattern => {
    const [a, b, c] = pattern;
    return gameBoard[a] !== '' && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
  });
}

server.listen(8080, '10.35.5.18', () => {
  console.log('Servidor rodando em: http://localhost:8080');
});