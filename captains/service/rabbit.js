import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBIT_URL;

let connection, channel;

export async function connect() {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
}
console.log(RABBITMQ_URL);

export const subscribeToQueue = async (queueName, callback) => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        channel.consume(queueName, (message) => {
            if (message !== null) {
                callback(JSON.parse(message.content.toString()));
                channel.ack(message);
            }
        });
    } catch (error) {
        console.error('Error in RabbitMQ connection:', error);
        throw error;
    }
};

export async function publishToQueue(queueName, data) {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(data));
}
