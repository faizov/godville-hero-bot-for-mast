import { createCanvas, loadImage } from "canvas";
import fs from "fs/promises";

const backgroundsFolder = "./src/assets/backgrounds/";
const charactersFolder = "./src/assets/characters/";
const layerFolder = "./src/assets/";

async function getRandomFile(folderPath) {
  const files = await fs.readdir(folderPath);
  const randomIndex = Math.floor(Math.random() * files.length);
  return files[randomIndex];
}

const canvas = createCanvas(1500, 500);
const ctx = canvas.getContext("2d");

export async function generateImage(moneys, lives) {
  const backgroundFileName = await getRandomFile(backgroundsFolder);
  const characterFileName = await getRandomFile(charactersFolder);

  const [background, character, layer] = await Promise.all([
    loadImage(`${backgroundsFolder}/${backgroundFileName}`),
    loadImage(`${charactersFolder}/${characterFileName}`),
    loadImage(`${layerFolder}/layer.png`),
  ]);

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const characterWidth = 500;
  const characterHeight = 500;
  const x = 100;
  const y = canvas.height - characterHeight;

  ctx.drawImage(character, x, y, characterWidth, characterHeight);

  ctx.drawImage(layer, 0, 0, canvas.width, canvas.height);

  const textX = canvas.width - 640; // Правый край холста минус общий отступ

  ctx.fillStyle = "#ffffff";
  ctx.font = "44px Arial";
  ctx.textAlign = "left";

  const monetsY = 210; // Отступ сверху для первого текста
  ctx.fillText(moneys, textX, monetsY);

  const livesY = 310; // Отступ сверху для второго текста
  ctx.fillText(lives, textX, livesY);

  const buffer = canvas.toBuffer();
  await fs.writeFile("./src/generated_image.png", buffer);
}
