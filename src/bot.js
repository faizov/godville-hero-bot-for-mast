import fetch from "node-fetch";
import * as dotenv from "dotenv";
import { createRestAPIClient } from "masto";
import schedule from "node-schedule";
import fs from "fs/promises";

import { generateImage } from "./generate-image.js";

dotenv.config();

const masto = createRestAPIClient({
  url: process.env.url,
  accessToken: process.env.accessToken,
});

const nameHero = process.env.nameHero;
const token = process.env.token;
const heroUrl = `https://godville.net/gods/api/${nameHero}/${token}`;

async function fetchData() {
  try {
    const response = await fetch(heroUrl);
    return await response.json();
  } catch (error) {
    console.error(`Произошла ошибка: ${error}`);
    throw error;
  }
}

async function newPostDiary() {
  const data = await fetchData();

  await masto.v1.statuses.create({
    status: data.diary_last,
    visibility: "public",
  });
}

async function updateProfile() {
  const data = await fetchData();
  const encodedStringGodName = encodeURIComponent(data.godname);
  const encodedStringClanName = encodeURIComponent(data.clan);

  const location = !!data.town_name.length
    ? data.town_name
    : `${data.distance} шагов от столицы`;

  await generateImage(
    data.gold_approx,
    `${data.health} / ${data.max_health}`,
    location,
    data.quest
  );

  await masto.v1.accounts.updateCredentials({
    displayName: data.name,
    note: `Добро пожаловать на мою страницу, где я публикую фрагменты из личного дневника и делюсь своей актуальной информацией из мира Годвилля.
    Мое местоположение: ${location}
    Золота в кармане: ${data.gold_approx}
    Выполняю квест: ${data.quest}`,
    header: new Blob([await fs.readFile("./src/generated_image.png")]),
    fields_attributes: {
      0: {
        name: "Игровой персонаж Godville",
        value: `https://godville.net/gods/${encodedStringGodName}`,
      },
      1: {
        name: `Состою в клане ${data.clan}`,
        value: `https://godville.net/stats/guild/${encodedStringClanName}`,
      },
      2: {
        name: "Мой уровень",
        value: data.level,
      },
      3: {
        name: "Здоровье",
        value: `${data.health}/${data.max_health}`,
      },
    },
  });
}

schedule.scheduleJob("0 */2 * * *", function () {
  newPostDiary();
});

schedule.scheduleJob("*/5 * * * *", function () {
  updateProfile();
});
