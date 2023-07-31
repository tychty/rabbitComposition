import pino, { LoggerOptions, multistream } from "pino";
import pinoElasticSearch from "pino-elasticsearch";
import { FastifyReply, FastifyRequest } from "fastify";
import PinoPretty from "pino-pretty";


const LOG_LEVEL = process.env.LOG_LEVEL || 'info';


const streamToElastic = pinoElasticSearch({
    index: process.env.LOG_AGGREGATOR_INDEX,
    node: process.env.LOG_AGGREGATOR_URL,
    consistency: 'one',
    'es-version': 7,
    'flush-bytes': 1000
});

// ; (streamToElastic as any).on('error', (error: any) => {
//     console.log('Elasticsearch client error:', error);
// });
// ; (streamToElastic as any).on('insertError', (error: any) => {
//     console.log('Elasticsearch server error:', error);
// });
// ; (streamToElastic as any).on('unknown', (error: any) => {
//     console.log('Elasticsearch unk error:', error);
// });
// ; (streamToElastic as any).on('insert', (stats: Record<string, any>) => {
//     console.log('Elasticsearch insert done:', stats);
// });

const pinoConf: LoggerOptions = {
    level: LOG_LEVEL,
    formatters: { level: (label, number) => { return { level: number, 'level-label': label } } },
    serializers: {
        res(reply: FastifyReply) {
            // The default
            return {
                statusCode: reply.statusCode
            }
        },
        req(request: FastifyRequest) {
            return {
                method: request.method,
                url: request.url,
                path: request.routerPath,
                parameters: request.params,
                // Including the headers in the log could be in violation
                // of privacy laws, e.g. GDPR. You should use the "redact" option to
                // remove sensitive fields. It could also leak authentication data in
                // the logs.
                headers: request.headers,
            };
        }
    },
    redact: {
        paths: ['req.headers.authorization'],
        censor: '***REDACTED***'
    },
};

const streams = multistream([streamToElastic, PinoPretty({ colorize: true, ignore: 'module,level-label', })])
const logger = pino(pinoConf, streams)
    .child({ module: 'm1' });

export default logger;
