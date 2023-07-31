import EventEmitter from "events";
import { Channel, connect as amqpConnect } from "amqplib";
import { generateUUID } from "./uuid";
import logger from "./logger";


const amqplogger = logger.child({ submodule: 'amqp' });

export class AMQPClient {
    protected emitter: EventEmitter;
    protected channel: Channel | undefined;
    constructor(protected url: string, protected replyQueue: string) {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(0);
    }
    async instanciate() {
        if (this.channel) return;

        const channel = await amqpConnect(this.url)
            .then(conn => {
                conn.on('error', (err) => {
                    amqplogger.error(err, 'Unexpected error on connection');
                });
                return conn.createChannel();
            })
            .then(async (channel) => {
                channel.on('error', (err) => {
                    amqplogger.error(err, 'Unexpected error on channel');
                });
                await channel.consume(this.replyQueue,
                    msg => msg ? this.emitter!.emit(msg.properties.correlationId, msg.content.toString()) : undefined,
                    { noAck: true });
                return channel;
            });
        this.channel = channel;

        amqplogger.info(`----- Awaiting RPC Replies On Queue ${this.replyQueue} -----`);
    }
    send(queue: string, message: string): Promise<string> {
        return new Promise<string>(async (resolve) => {
            if (!this.channel) throw new Error('no channel. Please instanciate client');

            amqplogger.info({ amqpMessage: message, queue }, 'sending message');
            const correlationId = generateUUID();

            this.emitter.once(correlationId, (content: string) => {
                amqplogger.info({ amqpMessage: content, queue }, 'reply received');
                resolve(content);
            });
            this.channel.sendToQueue(queue, Buffer.from(message), { correlationId, replyTo: this.replyQueue, persistent: true, });
        })
    }
}