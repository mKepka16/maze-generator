// Dimensions
const WIDTH = 960;
const HEIGHT = 960;

let pathColor = 'white';
let wallColor = 'black';
let unexploredEdgesColor = 'red';
let CELL_SIZE = 50;
let CELL_SPACING = 4;
let exploringSpeed = 10;
let currentGeneratingInterval;
let instantGenerate = false;
let cellsInRow;
let cellsInColumn;

// Canvas init
const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
document.body.append(canvas);
const ctx = canvas.getContext('2d');

// Directions
const N = 1 << 0;
const S = 1 << 1;
const W = 1 << 2;
const E = 1 << 3;

async function generateMaze() {
  return new Promise((res) => {
    clearCanvas();
    cellsInRow = Math.floor(
      (WIDTH - CELL_SPACING) / (CELL_SIZE + CELL_SPACING)
    );

    cellsInColumn = Math.floor(
      (HEIGHT - CELL_SPACING) / (CELL_SIZE + CELL_SPACING)
    );

    const cells = new Array(cellsInRow * cellsInColumn);
    const edges = [];

    ctx.fillStyle = pathColor;

    // Add a random cell and two initial edges.
    const start = getCellIndex(0, cellsInColumn - 1);
    cells[start] = 0;
    fillCell(start);
    edges.push({ index: start, direction: N });
    edges.push({ index: start, direction: E });

    if (instantGenerate) {
      while (!(done = exploreEdge())) {}
      res(cells);
    } else {
      currentGeneratingInterval = setInterval(() => {
        const done = exploreEdge();
        if (done) {
          res(cells);
          clearInterval(currentGeneratingInterval);
        }
      }, 100 / exploringSpeed);
    }

    function exploreEdge() {
      const edge = popRandom(edges);
      if (!edge) return true;

      const cellIndex = edge.index;
      const direction = edge.direction;
      // index after moving one in direction
      const newCellIndex =
        cellIndex +
        (direction === N
          ? -cellsInRow
          : direction === S
          ? cellsInRow
          : direction === W
          ? -1
          : +1);

      const { x: newCellX, y: newCellY } = getCellCords(newCellIndex);
      let newCellDirectionForPreviousCell;

      const isNewCellPartOfMaze = cells[newCellIndex] != null;

      ctx.fillStyle = isNewCellPartOfMaze ? wallColor : pathColor;
      if (direction === N) {
        fillNorth(cellIndex);
        newCellDirectionForPreviousCell = S;
      } else if (direction === S) {
        fillSouth(cellIndex);
        newCellDirectionForPreviousCell = N;
      } else if (direction === W) {
        fillWest(cellIndex);
        newCellDirectionForPreviousCell = E;
      } else {
        fillEast(cellIndex);
        newCellDirectionForPreviousCell = W;
      }

      if (isNewCellPartOfMaze === false) {
        fillCell(newCellIndex);
        cells[cellIndex] |= direction;
        cells[newCellIndex] |= newCellDirectionForPreviousCell;

        ctx.fillStyle = unexploredEdgesColor;

        if (newCellY > 0 && cells[newCellIndex - cellsInRow] == null) {
          fillNorth(newCellIndex);
          edges.push({ index: newCellIndex, direction: N });
        }
        if (
          newCellY < cellsInColumn - 1 &&
          cells[newCellIndex + cellsInRow] == null
        ) {
          fillSouth(newCellIndex);
          edges.push({ index: newCellIndex, direction: S });
        }
        if (newCellX > 0 && cells[newCellIndex - 1] == null) {
          fillWest(newCellIndex);
          edges.push({ index: newCellIndex, direction: W });
        }
        if (newCellX < cellsInRow - 1 && cells[newCellIndex + 1] == null) {
          fillEast(newCellIndex);
          edges.push({ index: newCellIndex, direction: E });
        }
      }
    }
  });
}

function colorMaze(cells) {
  let distance = 0;
  const visited = new Array(cellsInRow * cellsInColumn);
  let frontier = [(cellsInColumn - 1) * cellsInRow];

  setInterval(() => {
    let frontierLength;
    if (!(frontierLength = frontier.length)) return true;

    ctx.fillStyle = `hsl(${distance++ % 360}, 100%, 50%)`;
    frontier.forEach((index) => fillCell(index));

    const newFrontier = [];
    let currentCellIndex;
    let newCellIndex;

    for (var i = 0; i < frontierLength; ++i) {
      currentCellIndex = frontier[i];
      if (
        cells[currentCellIndex] & E &&
        !visited[(newCellIndex = currentCellIndex + 1)]
      ) {
        visited[newCellIndex] = true;
        fillEast(currentCellIndex);
        newFrontier.push(newCellIndex);
      }
      if (
        cells[currentCellIndex] & W &&
        !visited[(newCellIndex = currentCellIndex - 1)]
      ) {
        visited[newCellIndex] = true;
        fillEast(newCellIndex);
        newFrontier.push(newCellIndex);
      }
      if (
        cells[currentCellIndex] & S &&
        !visited[(newCellIndex = currentCellIndex + cellsInRow)]
      ) {
        visited[newCellIndex] = true;
        fillSouth(currentCellIndex);
        newFrontier.push(newCellIndex);
      }
      if (
        cells[currentCellIndex] & N &&
        !visited[(newCellIndex = currentCellIndex - cellsInRow)]
      ) {
        visited[newCellIndex] = true;
        fillSouth(newCellIndex);
        newFrontier.push(newCellIndex);
      }
    }

    frontier = newFrontier;
  }, 20);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const generateBtn = document.querySelector('.generateBtn');
generateBtn.onclick = renderMaze;

const wallsColorInput = document.querySelector('.wallsColor');
wallsColorInput.onchange = (e) => (wallColor = e.target.value);

const pathColorInput = document.querySelector('.pathColor');
pathColorInput.onchange = (e) => (pathColor = e.target.value);

const unexploredEdgesColorInput = document.querySelector(
  '.unexploredEdgesColor'
);
unexploredEdgesColorInput.onchange = (e) =>
  (unexploredEdgesColor = e.target.value);

const wallThicknessInput = document.querySelector('.wallsThickness');
wallThicknessInput.onchange = (e) =>
  Number((CELL_SPACING = Number(e.target.value)));

const pathSizeInput = document.querySelector('.pathSize');
pathSizeInput.onchange = (e) => Number((CELL_SIZE = Number(e.target.value)));

const exploringSpeedInput = document.querySelector('.exploringSpeed');
exploringSpeedInput.onchange = (e) => (exploringSpeed = Number(e.target.value));

const instantGenerateInput = document.querySelector('.instantGenerate');
instantGenerateInput.onchange = (e) => (instantGenerate = e.target.checked);

async function renderMaze() {
  generateBtn.disabled = true;
  clearInterval(currentGeneratingInterval);
  const cells = await generateMaze();
  colorMaze(cells);
  generateBtn.disabled = false;
}

function fillCell(index) {
  const i = index % cellsInRow;
  const j = Math.floor(index / cellsInRow);

  ctx.fillRect(
    i * CELL_SIZE + (i + 1) * CELL_SPACING,
    j * CELL_SIZE + (j + 1) * CELL_SPACING,
    CELL_SIZE,
    CELL_SIZE
  );
}

function fillEast(index) {
  const i = index % cellsInRow;
  const j = Math.floor(index / cellsInRow);

  ctx.fillRect(
    (i + 1) * (CELL_SIZE + CELL_SPACING),
    j * CELL_SIZE + (j + 1) * CELL_SPACING,
    CELL_SPACING,
    CELL_SIZE
  );
}

function fillWest(index) {
  const i = index % cellsInRow;
  const j = Math.floor(index / cellsInRow);

  ctx.fillRect(
    i * (CELL_SIZE + CELL_SPACING),
    j * CELL_SIZE + (j + 1) * CELL_SPACING,
    CELL_SPACING,
    CELL_SIZE
  );
}

function fillSouth(index) {
  const i = index % cellsInRow;
  const j = Math.floor(index / cellsInRow);

  ctx.fillRect(
    i * CELL_SIZE + (i + 1) * CELL_SPACING,
    (j + 1) * (CELL_SIZE + CELL_SPACING),
    CELL_SIZE,
    CELL_SPACING
  );
}

function fillNorth(index) {
  const i = index % cellsInRow;
  const j = Math.floor(index / cellsInRow);

  ctx.fillRect(
    i * CELL_SIZE + (i + 1) * CELL_SPACING,
    j * (CELL_SIZE + CELL_SPACING),
    CELL_SIZE,
    CELL_SPACING
  );
}

function popRandom(array) {
  if (!array.length) return;
  const i = Math.floor(Math.random() * array.length);
  return array.splice(i, 1)[0];
}

function getCellIndex(x, y) {
  return y * cellsInRow + x;
}

function getCellCords(index) {
  const x = index % cellsInRow;
  const y = Math.floor(index / cellsInRow);
  return { x, y };
}
