import { AMQPClient } from "./amqpClient";
import logger from "./logger";


const amqpURL = process.env.AMQP_URL as string;
const QUEUE = process.env.AMQP_QUEUE_M1_M2 as string;

let amqpClient: AMQPClient;
(async () => {
    try {
        amqpClient = new AMQPClient(amqpURL);
        await amqpClient.instanciate();
    } catch (e) {
        logger.child({ submodule: 'init' })
            .error(e, 'Unexpected error occured while creating AMQP client. Finishing process');
        process.exit(1);
    }
})().then(async () => {
    try {
        await amqpClient.consume(QUEUE, msg => {
            const req: Record<string, unknown> = JSON.parse(msg);

            req.m2reply = true;

            return JSON.stringify(req);
        });
    } catch (e) {
        logger.child({ submodule: 'init' })
            .error(e, `Unexpected error occured while connecting to queue '${QUEUE}'. Finishing process`);
        process.exit(1);
    }
})