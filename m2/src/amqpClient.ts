import { Channel, connect as amqpConnect } from "amqplib";
import logger from "./logger";


const amqplogger = logger.child({ submodule: 'amqp' });

export class AMQPClient {
    protected channel: Channel | undefined;
    constructor(protected url: string) { }
    async instanciate() {
        this.channel = await amqpConnect(this.url)
            .then(conn => {
                conn.on('error', (err) => {
                    amqplogger.error(err, 'Unexpected error on connection');
                });
                return conn.createChannel();
            })
            .then(channel => {
                channel.on('error', (err) => {
                    amqplogger.error(err, 'Unexpected error on channel');
                });
                return channel;
            })
    }
    async consume(queue: string, onMessage: (msg: string) => Promise<string> | string) {
        if (!this.channel) throw new Error('no channel. Please instanciate client');

        await this.channel.consume(queue, async (msg) => {
            if (!this.channel) throw new Error('no channel. Please instanciate client');
            if (!msg) return;
            const { correlationId, replyTo } = msg.properties;
            const msgcontent = msg.content.toString();
            amqplogger.info({ correlationId, amqpMessage: msgcontent, queue }, 'incoming message');

            const reply = await onMessage(msgcontent);

            this.channel.sendToQueue(replyTo, Buffer.from(reply), { correlationId, persistent: true, });
            this.channel.ack(msg);
            amqplogger.info({ correlationId, amqpMessage: reply, queue }, 'reply sent');
        });

        amqplogger.info(`----- Awaiting RPC Requests On Queue ${queue} -----`);
    }
}