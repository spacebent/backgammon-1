import _ from 'lodash';

export default class GameLogic {

  BLANK_GAME = {
    currentPlayer: null,
    dark: {},
    light: {},
  };

  // standard initial game
  STANDARD_OPENING = {
    currentPlayer: null, // either 'dark' or 'light'
    opponent: null, // opposite of `currentPlayer`
    dark: {0: 2, 11: 5, 16: 3, 18: 5},
    light: {5: 5, 7: 3, 12: 3, 23: 5},
    darkMoves: {}, // maybe should be an object with methods
    lightMoves: {},
    lastRoll: [],
    lastInitialRoll: [],
  };

  constructor() {
    this.lastRoll = null;
    this.setGame(this.BLANK_GAME);
  }

  rolling = false;

  start = function() {
    this.setGame(this.STANDARD_OPENING);
  }

  decide = function() {
//    const roll = this.rollDecidingDice();
    const roll = [5,4]; // TESTING forces dark player first
    if (roll[0] === roll[1]) {
      return roll;
    } else {
      this.currentPlayer = (roll[0] > roll[1]) ? 'dark' : 'light';
      this.opponent = (this.currentPlayer === 'dark') ? 'light' : 'dark';
      return roll;
    }
  }

  nextTurn = function () {
    const current = this.currentPlayer;
    this.currentPlayer = this.opponent;
    this.opponent = current;
  }

  // basic roll for player's turn
  rollPlayerDice = function() {
    let lastRoll = this.rollDice();
    lastRoll = [2, 3]; // TESTING

    if (lastRoll[0] === lastRoll[1]) {
      lastRoll = [lastRoll[0], lastRoll[0], lastRoll[0], lastRoll[0]]
    }

    this.lastInitialRoll = lastRoll.slice();
    this.lastRoll = lastRoll.slice();
    this.setPossibleMoves();
  }

  setPossibleMoves = function() {
    this[this.currentPlayer + 'Moves'] = {}; // clear existing moves
    for(var sq in this[this.currentPlayer]) {
      // Logic for which moves can be made from each occupied spike
      const curr = parseInt(sq, 10);
      let   first = parseInt(this.lastRoll[0], 10),
       sec = parseInt(this.lastRoll[1], 10);

      // opponent goes backwards
      if (this.currentPlayer === 'light') {
        first = -first;
        sec = - sec;
      }

      // TODO object needs playerMoves to become highlightableMoves and moves
      // TODO object needs currentPlayer to autopoint to moves
  /*
      currentPlayer: method,
      _currentPlayer: dark/light
      opponent: null, // opposite of currentPlayer
      dark: {
        chips: {0: 2, 11: 5, 16: 3, 18: 5},
        moves: {},
        highlightMoves: {}
      }
      light: {
        chips: {5: 5, 7: 3, 12: 3, 23: 5},
        moves: {},
        highlightMoves: {}
      }
      lastRoll: [],
      lastInitialRoll: [],
  */

      let possibleMoves;

      if (first === sec) {
        possibleMoves = _.map(this.lastRoll, function(val, i) {
          let move = (curr + (val * (i + 1)));

          switch(i) {
            case 0:
              move = curr + val;
              break;
            case 1:
              move = [curr + val, curr + (val * 2)];
              break;
            case 2:
              move = [curr + val, curr + (val * 2), curr + (val * 3)];
              break;
            case 3:
              move = [curr + val, curr + (val * 2), curr + (val * 3), curr + (val * 4)];
              break;
          }
          return move;
        });
      } else {
        if(first && sec) {
          possibleMoves = [curr + first, curr + sec, [curr + first, curr + first + sec]];
        } else {
          possibleMoves = [curr + first];
        }
      }

      // exclude moves occupied by opponent, and offboard unless player can bear-off.
      let allowedMoves = [];
      const opponentSpikes = this[this.opponent];

      for(var i in possibleMoves) {

        let moveIndex = possibleMoves[i];
        if (Array.isArray(moveIndex)) {
          moveIndex = moveIndex[moveIndex.length - 1];
        }

        const taken = opponentSpikes[moveIndex] || 0,
          isOffboard = (moveIndex > 23 || moveIndex < 0) && !this.canOffboard();

        if (!isOffboard && (!taken || (taken < 2))) {
          allowedMoves.push(possibleMoves[i]);
        }
      }
      this[this.currentPlayer + 'Moves'][sq] = allowedMoves;
    }
  }

  canOffboard = function () {
    return false; // TODO implement
  }

  doMove = function(from, to) {
    const spikes = this[this.currentPlayer];
    spikes[to] = spikes[to] ? (spikes[to] + 1) : 1;
    spikes[from]--;

    const possibleMoves = this[this.currentPlayer + 'Moves'][from];
    const move = _.find(possibleMoves, function (item) {
      const test = Array.isArray(item) ? item[item.length - 1] : item;
      return test === to;
    });

    if (Array.isArray(move)) {
      if (this.lastInitialRoll.length === 2) {
        this.lastRoll = [];
      } else {
        for(var i in move) {
          this.lastRoll.pop();
        }
      }
    } else {
      this.lastRoll.splice(this.lastRoll.indexOf(to - from), 1);
    };
    this.setPossibleMoves();
    return true;
  }

  selectRandomMove = function() {
    // this.lightMoves needs to distinguish individual vs compound moves
    const possibleMoves = this.lightMoves,
      movablePieceKeys = Object.keys(this.lightMoves);

    const whichKey = movablePieceKeys[Math.floor(Math.random() * movablePieceKeys.length)];
    let index = Math.floor(Math.random() * possibleMoves[whichKey].length);

    return [parseInt(whichKey), possibleMoves[whichKey][index]];
  }

  automatedMoves = function() {
    let moves = [];

    for (var i in this.lastRoll) {
      moves.push(this.selectRandomMove());
      this.setPossibleMoves();
    }
    return moves;
  }

  // decides who gets first move
  rollDecidingDice = function() {
    return this.rollDice();
  }

  // utility method
  rollDice = function() {
    return [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
  }

  setGame = function(setting) {
    for(var property in setting) {
      this[property] = setting[property]
    }
  }
}
