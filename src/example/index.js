const graphics = new PIXI.Graphics().rect(100, 100, 100, 100).fill({
  color: "red",
  alpha: 0.5,
});
const roundRect = new PIXI.Graphics().roundRect(200, 200, 100, 50, 20).fill({
  color: "pink",
  alpha: 0.9,
});
const ellipse = new PIXI.Graphics().ellipse(400, 400, 100, 50).fill({
  color: "yellow",
  alpha: 0.5,
});
const circle = new PIXI.Graphics().circle(500, 500, 50).fill({
  color: "green",
  alpha: 0.5,
});
const polygon = new PIXI.Graphics()
  .poly([0, 0, 100, 0, 150, 50, 100, 100, 0, 100])
  .fill({
    color: "blue",
    alpha: 0.5,
  });
const arc = new PIXI.Graphics().arc(300, 300, 50, 0, Math.PI, true).fill({
  color: "orange",
  alpha: 0.7,
});
const line = new PIXI.Graphics()
  .moveTo(300, 20)
  .lineTo(400, 120)
  .lineTo(500, 20)
  .stroke({
    color: "white",
    alpha: 0.5,
    width: 5,
  });
app.stage.addChild(graphics);
app.stage.addChild(roundRect);
app.stage.addChild(ellipse);
app.stage.addChild(circle);
app.stage.addChild(polygon);
app.stage.addChild(arc);
app.stage.addChild(line);
