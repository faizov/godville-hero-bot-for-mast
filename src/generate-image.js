import { createCanvas, loadImage } from "canvas";
import fs from "fs/promises";

const canvasWidth = 1500;
const canvasHeight = 500;
const backgroundsFolder = "./src/assets/backgrounds/";
const charactersFolder = "./src/assets/characters/";
const layerFolder = "./src/assets/";

const textXOffset = 1020;

async function getRandomFile(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    const randomIndex = Math.floor(Math.random() * files.length);
    return files[randomIndex];
  } catch (error) {
    console.error("Error reading folder:", error);
    throw error;
  }
}

export async function generateImage(moneys, lives, location, quest) {
  try {
    const backgroundFileName = await getRandomFile(backgroundsFolder);
    const characterFileName = await getRandomFile(charactersFolder);

    const [background, character, layer] = await Promise.all([
      loadImage(`${backgroundsFolder}/${backgroundFileName}`),
      loadImage(`${charactersFolder}/${characterFileName}`),
      loadImage(`${layerFolder}/layer.png`),
    ]);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

    const characterWidth = 500;
    const characterHeight = 500;
    const x = canvasWidth - characterWidth - 200;
    const y = canvasHeight - characterHeight;

    ctx.drawImage(character, x, y, characterWidth, characterHeight);

    ctx.drawImage(layer, 0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Arial";
    ctx.textAlign = "left";

    ctx.fillText(moneys, canvasWidth - textXOffset, 95);
    ctx.fillText(lives, canvasWidth - textXOffset, 190);
    ctx.fillText(location, canvasWidth - textXOffset, 280);
    ctx.fillText(quest, canvasWidth - textXOffset, 365, 1000);

    const generatedImageName = `./src/generated_image.png`;
    const buffer = canvas.toBuffer();
    await fs.writeFile(generatedImageName, buffer);

    return generatedImageName;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

generateImage(
  "около 25 тысяч",
  "105 / 500",
  "66 шагов от столицы",
  "организовать званый ужин для незваных гостей"
);
