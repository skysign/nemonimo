import express, { Request, Response } from 'express';
import { cloneDeep } from 'lodash';
import { Canvas } from 'canvas';
import { logger } from '../config/winston';
import * as fs from 'node:fs';

// const { createCanvas, loadImage } = require('canvas');
// const { createCanvas, Image } = require('canvas');

const routerAPIs = express.Router();

/* GET users listing. */
routerAPIs.get('/', (_req: Request, res: Response) => {
  res.send('v1 API');
});

routerAPIs.get('/myapi/:parameterInPath', (req: Request, res: Response) => {
  const resJson: any = {};
  const fieldName: string = req.params.parameterInPath;
  resJson[fieldName] = [`${fieldName}`, 'v1 api', 'get'];

  res.send(JSON.stringify(resJson));
});

routerAPIs.post('/myapi', (req: Request, res: Response) => {
  const reqBody: string = req.body;
  logger.debug(reqBody);

  const tmp: any = JSON.parse('{}');
  const json = cloneDeep(tmp);
  json.status = 'ok';

  res.send(JSON.stringify(json));
});

routerAPIs.get('/grid', (_req: Request, res: Response) => {
  const p: string = __dirname.concat('/grid.html');
  res.sendFile(p);
});

routerAPIs.post('/grid', (req: Request, res: Response) => {
  // const R:number = 3;
  // const C:number = 3;
  // const cellWidth:number = 70;
  // const cellHeight:number = 70;
  // const lineWidth:number = 3;
  // const lineColor:string = 'blue';
  // const imageWidth:number = lineWidth + ((cellWidth + lineWidth) * C);
  // const imageHeight:number = lineWidth + ((cellHeight + lineWidth) * R);
  console.log(JSON.stringify(req.body));

  const R: number = Number(req.body.R);
  const C: number = Number(req.body.C);
  const cellWidth: number = Number(req.body.cellWidth);
  const cellHeight: number = Number(req.body.cellHeight);
  const lineWidth: number = Number(req.body.lineWidth);
  const lineColor: string = req.body.lineColor as string;
  const lineType: string = req.body.lineType as string;
  const dx: number = lineWidth / 2;
  const dy: number = lineWidth / 2;
  const imageWidth: number = cellWidth * C + lineWidth / 2 + dx;
  const imageHeight: number = cellHeight * R + lineWidth / 2 + dy;

  const canvas: Canvas = new Canvas(imageWidth, imageHeight, 'image');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;

  for (let r: number = 0; r <= R; r += 1) {
    ctx.beginPath()
    if (lineType === 'dotline') {
      ctx.setLineDash([5, 5]);
    }
    ctx.lineTo(0, dy + r * cellHeight);
    ctx.lineTo(imageWidth, dy + r * cellHeight);
    ctx.stroke();
  }

  for (let c: number = 0; c <= C; c += 1) {
    ctx.beginPath();
    if (lineType === 'dotline') {
      ctx.setLineDash([5, 5]);
    }
    ctx.moveTo(dx + c * cellWidth, 0);
    ctx.lineTo(dx + c * cellWidth, imageHeight);
    ctx.stroke();
  }

  const filename: string = `../../../static/grid_images/grid_${R}x${C}_${lineColor}_cw${cellWidth}_cw${cellHeight}_lw${lineWidth}_lt${lineType}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFile(__dirname.concat(filename), buffer, (err) => {
    if (err) {
      console.log(err);
    }
    // api/static/grid_images/grid_3x3_black_cw70_cw70_lw3.png
    res.redirect(`grid${filename}`);
  });
});

export default routerAPIs;
