import GameLogic from './gameLogic';

describe('game setup', () => {
  let gl;
  beforeEach(() => {
    gl = new GameLogic;
  });

  test('currentPlayer is initially null', () => {
    expect(gl.currentPlayer).toBe(null);
  });

  describe('start()', () => {
    test('currentPlayer is null after start', () => {
      gl.start();
      expect(gl.currentPlayer).toBe(null);
    });

    test('game is set to standard opening values after start', () => {
      gl.start();
      expect(gl.currentPlayer).toBe(null);
    });
  });

  test('currentPlayer is not null after decide', () => {
    gl.start();
    gl.decide();
    expect(gl.currentPlayer).not.toBe(null);
  });

  test('currentPlayer switched to opponent on nextTurn', () => {
    gl.start();
    gl.decide();
    const before = gl.currentPlayer;
    const expected = (before === 'dark' ? 'light' : 'dark');

    gl.nextTurn();
    expect(gl.currentPlayer).toEqual(expected);
    expect(gl.opponent).toEqual(before);
  });
});

describe('turns and dice rolls', () => {
  let gl, rollDiceMock = jest.fn();

  beforeEach(() => {
    rollDiceMock.mockReturnValue([5, 5]);
    gl = new GameLogic;
    gl.rollDice = rollDiceMock;
    setDarkPlayerFirst(gl);
    gl.start();
    gl.decide();
  });

  describe('rollPlayerDice()', () => {
    test('doubles dice on a double', () => {
      gl.rollPlayerDice();
      expect(gl.lastRoll).toEqual([5,5,5,5]);
    });
  });

  describe('doMove()', () => {
    test('doMove does one at a time', () => {
      gl.rollPlayerDice();
      gl.doMove(11, 16);
      expect(gl.lastRoll).toEqual([5,5,5]);
      gl.doMove(11, 16);
      expect(gl.lastRoll).toEqual([5,5]);
      gl.doMove(11, 16);
      expect(gl.lastRoll).toEqual([5]);
      gl.doMove(11, 16);
      expect(gl.lastRoll).toEqual([]);
    });
  });
});

describe('move calculation', () => {
  let gl;

  beforeEach(() => {
    gl = new GameLogic;
    setDarkPlayerFirst(gl);
    gl.start();
    gl.decide();
  });

  describe('setPossibleMoves()', () => {
    test('sets up simple and compound moves', () => {
      gl.dark = { '0': 2 };
      gl.light = {};
      setPossibleMovesWithRoll(gl, [2, 3]);
      expect(gl.darkMoves).toEqual( {"0": [2, 3, [2, 5]]});
    });

    test('does not set up moves where opponent has 2 or more chips', () => {
      gl.dark = { '0': 2 };
      gl.light = { 3: 2 };
      setPossibleMovesWithRoll(gl, [2, 3]);
      expect(gl.darkMoves).toEqual( {"0": [2, [2, 5]]});
    });

    test('does not set up compound moves where opponent has 2 or more chips on compound target', () => {
      gl.dark = { '0': 2 };
      gl.light = { 5: 2 };
      setPossibleMovesWithRoll(gl, [2, 3]);
      expect(gl.darkMoves).toEqual( {"0": [2, 3]});
    });

    test('does not set up compound moves where opponent has 2 or more chips on intermediate target', () => {
      gl.dark = { '0': 2 };
      gl.light = { 2: 2, 3: 2 };
      setPossibleMovesWithRoll(gl, [2, 3]);
      expect(gl.darkMoves).toEqual( {});
    });

    test('does not set up compound moves where opponent has 2 or more chips on intermediate target, double roll', () => {
      gl.dark = { '0': 2 };
      gl.light = { 4: 2 };
      setPossibleMovesWithRoll(gl, [2, 2]);
      expect(gl.darkMoves).toEqual( {"0": [2]});
    });

    test('does not set up compound moves where opponent has 2 or more chips on intermediate target, double roll later', () => {
      gl.dark = { '0': 2 };
      gl.light = { 6: 2 };
      setPossibleMovesWithRoll(gl, [2, 2]);
      expect(gl.darkMoves).toEqual( {"0": [2, [2, 4]]});
    });

    test('does not set up compound moves where opponent has 2 or more chips on intermediate target, double roll later later', () => {
      gl.dark = { '0': 2 };
      gl.light = { 8: 2 };
      setPossibleMovesWithRoll(gl, [2, 2]);
      expect(gl.darkMoves).toEqual( {"0": [2, [2, 4], [2, 4, 6]]});
    });
  });
});

function setPossibleMovesWithRoll(gl, roll) {
  let rollDiceMock = jest.fn();
  rollDiceMock.mockReturnValue(roll);
  gl.rollDice = rollDiceMock;
  gl.rollPlayerDice();
  gl.setPossibleMoves();
}

function setDarkPlayerFirst(gl) {
  let rollDecidingDiceMock = jest.fn();
  rollDecidingDiceMock.mockReturnValue([6, 3]);
  gl.rollDecidingDice = rollDecidingDiceMock;
}