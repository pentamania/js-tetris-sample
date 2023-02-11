import {
  MINO_LIST,
  maxMinoIndex,
  NULL_BLOCK_TYPE,
  BLOCK_SIZE,
  COL,
  ROW,
  ACCEPTED_KEY_LIST,
  DROP_WAIT,
} from "./const.js";
import { randomInt } from "./utils.js";

// ミノ開始位置
const minoStartX = Math.floor(COL / 2);
const minoStartY = 1;

// Init canvas
const canvas = /**@type{HTMLCanvasElement}*/ (
  document.getElementById("screen")
);
const ctx = canvas.getContext("2d");
const fieldWidth = (canvas.width = BLOCK_SIZE * COL);
const fieldHeight = (canvas.height = BLOCK_SIZE * ROW);

// Game stats
let dropInterval = 60; // frame
let _dropWait = 0;
let isGameRunning = false;
let frameCount = 0;
/** @type {MinoStatus} */
let currentMino = {
  x: 5,
  y: 1,
  blockType: 1,
  rotateCount: 1,
};

/**
 * フィールド二次元配列、初期化
 *
 * @type {(number[])[]}
 */
const fieldMatrix = [];
for (let y = 0; y < ROW; y++) {
  fieldMatrix.push([]);
  for (let x = 0; x < COL; x++) {
    fieldMatrix[y].push(NULL_BLOCK_TYPE);
  }
}

/**
 * 指定座標が空いているかどうか
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function isPositionEmpty(x, y) {
  if (!fieldMatrix[y]) return false;
  return (
    fieldMatrix[y][x] != undefined && fieldMatrix[y][x] === NULL_BLOCK_TYPE
  );
}

/**
 * ミノを置けるか試す、実際に置く
 *
 * @param {MinoStatus} s
 * @param {boolean} updateField フィールド値を更新（配置確定）
 * @returns {boolean} 置けたらtrueを返す
 */
function putMino(s, updateField = false) {
  // 軸位置にすでに置けない場合
  if (!isPositionEmpty(s.x, s.y)) {
    // if (fieldMatrix[s.y][s.x] != NULL_BLOCK_TYPE) {
    return false;
  }

  // 軸位置のブロック配置
  if (updateField) {
    fieldMatrix[s.y][s.x] = s.blockType;
  }

  // 周辺ブロックを置けるか？
  const minoData = MINO_LIST[s.blockType];
  for (let i = 0; i < 3; i++) {
    let dx = minoData.positions[i].x;
    let dy = minoData.positions[i].y;

    // 各ブロック回転処理
    const r = s.rotateCount % minoData.rotatableCount;
    for (let j = 0; j < r; j++) {
      const nx = dx,
        ny = dy;
      dx = ny;
      dy = -nx;
    }

    // 指定位置にブロックがあるためNG
    if (!isPositionEmpty(s.x + dx, s.y + dy)) {
      // if (fieldMatrix[s.y + dy][s.x + dx] != NULL_BLOCK_TYPE) {
      return false;
    }

    // 確定
    if (updateField) {
      fieldMatrix[s.y + dy][s.x + dx] = s.blockType;
    }
  }

  if (!updateField) {
    putMino(s, true);
  }

  return true;
}

/**
 * 現在のミノ占有ブロックをクリア
 * @param {MinoStatus} s
 */
function _clearMinoBlock(s) {
  const minoData = MINO_LIST[s.blockType];

  fieldMatrix[s.y][s.x] = NULL_BLOCK_TYPE;
  for (let i = 0; i < 3; i++) {
    let dy = minoData.positions[i].y;
    let dx = minoData.positions[i].x;
    const r = s.rotateCount % minoData.rotatableCount;
    for (let j = 0; j < r; j++) {
      const nx = dx,
        ny = dy;
      dx = ny;
      dy = -nx;
    }
    fieldMatrix[s.y + dy][s.x + dx] = NULL_BLOCK_TYPE;
  }
}

/**
 * つぎのミノをセット
 * @param {MinoStatus} s
 */
function _resetMino(s) {
  s.x = minoStartX;
  s.y = minoStartY;
  s.blockType = randomInt(maxMinoIndex - 1) + 1;
  s.rotateCount = randomInt(4);
  // console.log("reset", s);
}

/**
 * ミノを落とす
 */
function dropMino() {
  // 現在のミノ位置情報を初期化
  _clearMinoBlock(currentMino);

  // 下にシフトできるかどうか試す
  currentMino.y++;
  if (!putMino(currentMino)) {
    // 配置できない場合：接地したとしてY位置を一旦戻して確定
    currentMino.y--;
    _mountAndPrepareNextMino();
  }

  // 落下ウェイトリセット
  _dropWait = DROP_WAIT;
}

/**
 * ミノをハードドロップする
 */
function hardDropMino() {
  // ミノが配置不可になるまで落下判定を行う
  do {
    _clearMinoBlock(currentMino);
    currentMino.y++;
  } while (putMino(currentMino));
  // 配置できない場合：接地したとしてY位置を一旦戻して確定
  currentMino.y--;
  _mountAndPrepareNextMino();
}

function _mountAndPrepareNextMino() {
  // 現在のミノを配置
  putMino(currentMino);

  // ライン消し
  clearLines();

  // 次のミノをセット
  _resetMino(currentMino);

  // 次のミノが置けなかったらゲームオーバー
  if (!putMino(currentMino)) {
    gameover();
  }
  // ウェイトリセット
  _dropWait = DROP_WAIT;
}

/**
 * ライン消し
 */
function clearLines() {
  let dev_lineCount = 0;
  for (let ay = ROW - 1; 0 <= ay; ay--) {
    let clearFlag = true;
    for (let ax = 0; ax < COL; ax++) {
      // 空白ブロックが一つでもあったら消さない -> フラグを下げる
      if (fieldMatrix[ay][ax] === 0) {
        clearFlag = false;
      }
    }

    if (clearFlag) {
      for (let by = ay; 1 <= by; by--) {
        for (let bx = 0; bx < COL; bx++) {
          fieldMatrix[by][bx] = fieldMatrix[by - 1][bx];
        }
      }
      dev_lineCount++;

      // 連続処理
      ay++;
    }
  }

  if (dev_lineCount) console.log("消したライン：", dev_lineCount);
}

/**
 * 簡易ゲームオーバー処理
 */
function gameover() {
  isGameRunning = false;
  alert("Game over!");
}

/**
 * ゲーム状態リセット
 */
function resetGame() {
  _dropWait = DROP_WAIT;

  // Field clear
  fieldMatrix.forEach((rowArray) => {
    const len = rowArray.length;
    for (let i = 0; i < len; i++) {
      rowArray[i] = 0;
    }
  });

  // reset mino
  _resetMino(currentMino);
}

/**
 * 描画処理
 *
 * ※本来毎フレームやらずにdirtyな時だけにするべき
 */
function render() {
  // Clear Background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, fieldWidth, fieldHeight);

  // Draw Field
  for (let y = 0; y < ROW; y++) {
    for (let x = 0; x < COL; x++) {
      const blockType = fieldMatrix[y][x];
      if (blockType != NULL_BLOCK_TYPE) {
        ctx.beginPath();
        ctx.fillStyle = MINO_LIST[blockType].color;
        ctx.rect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}

function tickGame() {
  // 自然落下
  if (_dropWait == 0 && frameCount % dropInterval === 0) {
    dropMino();
  }

  render();

  frameCount++;
  if (0 < _dropWait) _dropWait--;
  if (isGameRunning) requestAnimationFrame(tickGame);
}

/**
 * 入力処理
 */
document.addEventListener("keydown", (e) => {
  if (!ACCEPTED_KEY_LIST.includes(e.key)) return;

  if (e.key === "ArrowUp") {
    hardDropMino();
    return;
  }

  const current = currentMino;
  const next = Object.assign({}, currentMino);

  // 回転
  if (e.key.toLowerCase() === "x") {
    // 時計回り
    next.rotateCount++;
  }
  if (e.key.toLowerCase() === "z") {
    // 反時計
    next.rotateCount--;
    if (next.rotateCount < 0) next.rotateCount = 3;
  }

  // 移動
  if (e.key === "ArrowLeft") {
    next.x--;
  }
  if (e.key === "ArrowRight") {
    next.x++;
  }
  if (e.key === "ArrowDown") {
    next.y++;
  }

  // 更新
  if (
    next.x != current.x ||
    next.y != current.y ||
    next.rotateCount != current.rotateCount
  ) {
    _clearMinoBlock(current);
    if (putMino(next)) {
      // ミノ状態更新
      currentMino = next;
    } else {
      // 変化なし
      putMino(current);
    }
  }
});

export function start() {
  if (isGameRunning) return;
  resetGame();
  isGameRunning = true;
  tickGame();
}

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   blockType: number,
 *   rotateCount: number
 * }} MinoStatus
 */
