export const COL = 12;
export const ROW = 25;
export const DROP_WAIT = 4;
export const BLOCK_SIZE = 16;
/** @type {(Mino|null)[]} */
export const MINO_LIST = [
  // BlockType:0 は空白用
  null,

  // T型
  {
    rotatableCount: 4,

    /**
     * イメージ： xが中心（0,0）, □がブロック
     * _ □ _
     * □ x □
     * _ _ _
     */
    positions: [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ],

    color: "blue",
  },

  // 棒型
  // □ x □ □
  {
    rotatableCount: 2,
    positions: [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
    color: "limegreen",
  },

  // L型
  {
    rotatableCount: 4,
    positions: [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    color: "skyblue",
  },

  // J型
  {
    rotatableCount: 4,
    positions: [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
    ],
    color: "orange",
  },

  // S型
  {
    rotatableCount: 2,
    positions: [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
    color: "red",
  },

  // Z型
  {
    rotatableCount: 2,
    positions: [
      { x: 0, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
    ],
    color: "yellow",
  },

  // □型
  {
    rotatableCount: 1,
    positions: [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
    color: "magenta",
  },
];
export const NULL_BLOCK_TYPE = 0;
export const ACCEPTED_KEY_LIST = [
  "x",
  "z",
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
  "ArrowUp",
];

export const minMinoIndex = 1;
export const maxMinoIndex = MINO_LIST.length;

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 * }} Vec2
 * 
 * @typedef {{
 *   rotatableCount: number, // 回転可能回数
 *   positions: Vec2[],
 *   color: string,
 * }} Mino
 */
