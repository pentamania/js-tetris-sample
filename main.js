import { start } from "./app.js";

// SpaceKeyで開始
document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    console.log("start");
    start();
  }
});
