import { Channel } from "amqplib";
import { config } from "dotenv";
import { Server } from "socket.io";
import * as http from "http";
import CandleController from "src/controllers/CandleController";
import { connect } from "http2";
import { Candle } from "src/models/CandleModel";
config();

export default class CandleMessageChannel {
  private _channel: Channel;
  private _candleCtrl: CandleController;
  private _io: Server;

  constructor(server: http.Server) {
    this._candleCtrl = new CandleController();
    this._io = new Server(server, {
      cors: {
        origin: process.env.SOCKET_CLIENT_SERVER,
        methods: ["GET", "POST"],
      },
    });
    this._io.on("connection", () =>
      console.log("Web socket connection created")
    );
  }

  async createMessageChannel() {
    try {
      const connection = await connect(process.env.AMQP_SERVER);
      this._channel.assertQueue(process.env.QUEUE_NAME);
    } catch (error) {
      console.log("Connection to RabbitMq Failed");
      console.log(error);
    }
  }
  consumeMessages() {
    this._channel.consume(process.env.QUEUE_NAME, async (msg) => {
      const candleObj = JSON.parse(msg.content.toString());
      console.log("Message Received :", candleObj);
      this._channel.ack(msg);
      const candle: Candle = candleObj;
      await this._candleCtrl.save(candle);
      console.log("Canlde saved to database");
      this._io.emit(process.env.SOCKET_EVENT_NAME);
      console.log("new candle emited by web socket");
    });

    console.log("Candle consumer started");
  }
}
