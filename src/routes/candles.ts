import { Request, Response, Router } from "express";
import CandleController from "src/controllers/CandleController";

export const Candlerouter = Router();
const candleCtrl = new CandleController();
Candlerouter.get("/:quatity", async (req: Request, res: Response) => {
  const quatity = parseInt(req.params.quantity);
  const lastCandles = await candleCtrl.findLastCandles(quatity);
  return res.json(lastCandles);
});
