import fastify from "fastify";
import logger from "./logger";
import { AMQPClient } from "./amqpClient";


const amqpURL = process.env.AMQP_URL as string;
const REPLY_QUEUE = process.env.AMQP_REPLY_QUEUE as string;
const QUEUE = process.env.AMQP_QUEUE_M1_M2 as string;

let amqpClient: AMQPClient;

async function startServer() {
    const server = fastify({
        logger: logger.child({ submodule: 'fastify' }),
        ignoreTrailingSlash: true,
        // trustProxy: true,
    })

    server.all('*', async (request) => {
        const { method, body, params, query, } = request;
        const reqStr = JSON.stringify({ method, body, params, query, });

        const rpcResponse = await amqpClient.send(QUEUE, reqStr);

        return JSON.parse(rpcResponse);
    });

    return await server.listen({ port: 3000, host: "0.0.0.0" });
}

(async () => {
    try {
        amqpClient = new AMQPClient(amqpURL, REPLY_QUEUE);
        await amqpClient.instanciate();
    } catch (e) {
        logger.child({ submodule: 'init' })
            .error(e, 'Unexpected error occured while creating AMQP client. Finishing process');
        process.exit(1);
    }
})().then(async () => {
    try {
        await startServer();
    } catch (e) {
        logger.child({ submodule: 'init' })
            .error(e, 'Unexpected error occured. Finishing process');
        process.exit(1);
    }
});