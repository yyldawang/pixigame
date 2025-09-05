<template>
  <div ref="pixiContainer"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as PIXI from "pixi.js";
import gameImage from "@/assets/game.png";

// 创建容器引用
const pixiContainer = ref(null);
// 定义全局可访问的变量
let app = null;
let groundSprite = null;
let cactusSprite = null;
let startText = null;
let runAnimation = null;
let dinoJumpSprite = null;

onMounted(async () => {
  try {
    preventZoom();
    // 初始化 Pixi 应用
    app = new PIXI.Application();
    await app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xffffff,
      resolution: window.devicePixelRatio || 1,
      antialias: true, //抗锯齿
    });

    // 通过渲染器获取 canvas 元素
    if (app.renderer && app.renderer.canvas) {
      console.log(app.screen);
      console.log(window.innerHeight, window.innerWidth);
      // 将 canvas 添加到 Vue 组件的容器中
      pixiContainer.value.appendChild(app.renderer.canvas);
      // 在 appendChild 后
      app.renderer.canvas.style.display = "block";
      app.renderer.canvas.style.position = "fixed";
      app.renderer.canvas.style.top = "0";
      app.renderer.canvas.style.left = "0";
      console.log(pixiContainer.value)
      // 创建游戏的容器
      const container = new PIXI.Container();
      // 将容器添加到舞台
      app.stage.addChild(container);

      // 创建游戏的精灵纹理
      const baseTexture = await PIXI.Assets.load(gameImage);
      const frame = new PIXI.Rectangle(75, 0, 88, 100);
      // 创建恐龙纹理
      const dinoTexture = new PIXI.Texture({
        source: baseTexture,
        frame,
      });
      const dino = new PIXI.Sprite(dinoTexture);
      dino.visible = false;
      container.addChild(dino);

      // 恐龙跑步动画
      let dinoRunTextures = [];
      for (let i = 0; i < 2; i++) {
        dinoRunTextures.push(
          new PIXI.Texture({
            source: baseTexture,
            frame: new PIXI.Rectangle(1680 + (2 + i) * 88, 0, 88, 100),
          })
        );
      }
      runAnimation = new PIXI.AnimatedSprite(dinoRunTextures);
      runAnimation.visible = false;
      runAnimation.animationSpeed = 0.1;
      runAnimation.play();
      container.addChild(runAnimation);

      //  恐龙跳跃精灵
      const dinoJumpTexture = new PIXI.Texture({
        source: baseTexture,
        frame: new PIXI.Rectangle(1680, 0, 88, 100),
      });
      dinoJumpSprite = new PIXI.Sprite(dinoJumpTexture);
      dinoJumpSprite.visible = false;
      dinoJumpSprite.x = 60;
      dinoJumpSprite.y = window.innerHeight - 50 - 100;
      container.addChild(dinoJumpSprite);

      // 恐龙游戏地面精灵
      const groundTexture = new PIXI.Texture({
        source: baseTexture,
        frame: new PIXI.Rectangle(50, 100, 2300, 30),
      });
      groundSprite = new PIXI.TilingSprite(groundTexture);
      groundSprite.width = window.innerWidth;
      groundSprite.height = 30;
      groundSprite.position.set(0, window.innerHeight - 30);
      container.addChild(groundSprite);

      // 创建仙人掌精灵
      const cactusTexture = new PIXI.Texture({
        source: baseTexture,
        frame: new PIXI.Rectangle(515, 0, 30, 60),
      });
      cactusSprite = new PIXI.Sprite(cactusTexture);
      cactusSprite.x = window.innerWidth / 2;
      cactusSprite.y = window.innerHeight - 50 - 30;
      container.addChild(cactusSprite);

      // 创建文字
      startText = new PIXI.Text("点击开始游戏", {
        fontFamily: "Arial",
        fontSize: 56,
        fill: 0x333333,
        align: "center",
      });
      startText.x = window.innerWidth / 2;
      startText.y = window.innerHeight / 2;
      startText.anchor.set(0.5);
      container.addChild(startText);
      startText.interactive = true;
      startText.on("click", () => {
        playGame();
      });

      let isGaming = false;
      let isGameover = false;

      function playGame() {
        isGaming = true;
        runAnimation.visible = true;
        runAnimation.x = 60;
        runAnimation.y = window.innerHeight - 50 - 100;
        startText.visible = false;
      }

      let score = 0;
      let jumpVelocity = 20;
      let gravity = 1;
      app.ticker.add((delta) => {
        if (isGameover) return;
        if (isGaming) {
          groundSprite.tilePosition.x -= 10; // 控制平铺纹理偏移，实现地面滚动
          cactusSprite.x -= 10;
          if (cactusSprite.x < -30) {
            cactusSprite.x = window.innerWidth;
            score++;
          }
        }
        if (dinoJumpSprite.visible) {
          jumpVelocity -= gravity;
          dinoJumpSprite.y -= jumpVelocity;
          if (dinoJumpSprite.y > window.innerHeight - 50 - 100) {
            dinoJumpSprite.y = window.innerHeight - 50 - 100;
            jumpVelocity = 20;
            dinoJumpSprite.visible = false;
            runAnimation.visible = true;
          }
        }
        // 检测碰撞
        if (isGaming && !isGameover) {
          // 仅在游戏运行时检测
          // 恐龙的碰撞矩形（使用跑步动画或跳跃精灵的位置和尺寸）
          const dinoRect = {
            x: dinoJumpSprite.visible ? dinoJumpSprite.x : runAnimation.x,
            y: dinoJumpSprite.visible ? dinoJumpSprite.y : runAnimation.y,
            width: 88, // 恐龙精灵宽度（与纹理尺寸一致）
            height: 100, // 恐龙精灵高度（与纹理尺寸一致）
          };

          // 仙人掌的碰撞矩形
          const cactusRect = {
            x: cactusSprite.x,
            y: cactusSprite.y,
            width: 30, // 仙人掌宽度（与纹理尺寸一致）
            height: 60, // 仙人掌高度（与纹理尺寸一致）
          };

          // 矩形碰撞检测公式：两矩形有重叠则判定为碰撞
          if (
            dinoRect.x + dinoRect.width > cactusRect.x &&
            dinoRect.x < cactusRect.x + cactusRect.width &&
            dinoRect.y + dinoRect.height > cactusRect.y &&
            dinoRect.y < cactusRect.y + cactusRect.height
          ) {
            gameOver();
            startText.visible = false;
            let overText = new PIXI.Text(
              "最后得分：" + score + "。点击后重新开始",
              {
                fontFamily: "Arial",
                fontSize: 56,
                fill: 0x333333,
                align: "center",
              }
            );
            overText.x = window.innerWidth / 2;
            overText.y = window.innerHeight / 2;
            overText.anchor.set(0.5);
            container.addChild(overText);

            overText.interactive = true;
            overText.on("click", () => {
              location.reload();
            });
          }
        }
      });

      function gameOver() {
        isGameover = true;
        window.alert("游戏失败");
      }

      window.addEventListener("keydown", (e) => {
        // 仅在游戏运行且未结束时允许跳跃
        if (isGaming && !isGameover && e.code === "Space") {
          runAnimation.visible = false;
          dinoJumpSprite.visible = true;
          jumpVelocity = 20;
        }
      });

      window.addEventListener("resize", handleResize);
    } else {
      console.error("PixiJS 渲染器未正确初始化");
    }
  } catch (error) {
    console.error("初始化 PixiJS 时出错:", error);
  }
});

function handleResize() {
  if (app) {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    const { width, height } = app.screen;
    if (groundSprite) {
      groundSprite.width = width;
      groundSprite.position.set(0, height - 30);
    }
    if (cactusSprite) {
      cactusSprite.x = width / 2;
      cactusSprite.y = height - 50 - 30;
    }
    if (startText) {
      startText.x = width / 2;
      startText.y = height / 2;
    }
    if (dinoJumpSprite) {
      dinoJumpSprite.y = height - 50 - 100;
    }
    if (runAnimation) {
      runAnimation.y = height - 50 - 100;
    }
  }
}

// function preventZoom() {
//   // 禁止Ctrl+滚轮缩放
//   window.addEventListener('wheel', (e) => {
//     if (e.ctrlKey) {
//       e.preventDefault();
//     }
//   }, { passive: false });

//   // 禁止Ctrl+ +/- 缩放
//   window.addEventListener('keydown', (e) => {
//     if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
//       e.preventDefault();
//     }
//   }, { passive: false });

//   // 禁止Ctrl+0 重置缩放
//   window.addEventListener('keydown', (e) => {
//     if ((e.ctrlKey || e.metaKey) && e.key === '0') {
//       e.preventDefault();
//     }
//   }, { passive: false });
// }

// function handleWheelZoom (e) {
//   if (window.devicePixelRatio !== originalScale) {
//     // 重置缩放比例
//     document.body.style.zoom = '100%';
//     // 触发重新适配
//     handleResize();
//   }
// }

function preventZoom() {
  // 禁止 Ctrl + 滚轮
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) e.preventDefault();
    },
    { passive: false }
  );

  // 禁止 Ctrl + +/-/0
  window.addEventListener(
    "keydown",
    (e) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style>
/* 全局样式，必须放在非 scoped 的 style 标签中 */
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  touch-action: manipulation;
  box-sizing: border-box;
}

#pixiContainer {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>

