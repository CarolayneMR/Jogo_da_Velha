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
let currentPlayer = 'X';

io.on('connection', (socket) => {
  console.log('Novo jogador conectado');

  // Envia o tabuleiro atual quando um novo jogador se conecta
  io.emit('updateBoard', gameBoard);

  socket.on('cellClick', (index) => {
    if (gameBoard[index] === '') {
      gameBoard[index] = currentPlayer;
      io.emit('updateBoard', gameBoard);

      if (checkWinner()) {
        io.emit('gameOver', `${currentPlayer} venceu!`);
      } else if (gameBoard.every(cell => cell !== '')) {
        io.emit('gameOver', 'Empate!');
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  });

  socket.on('disconnect', () => {
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
  
