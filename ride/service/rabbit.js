import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBIT_URL || 'amqp://localhost:5672';

let connection = null;
let channel = null;

/**
 * Establishes a connection to RabbitMQ and creates a channel.
 */
async function connect() {
    try {
        if (!connection) {
            connection = await amqp.connect(RABBITMQ_URL);
            console.log('Connected to RabbitMQ');
        }
        if (!channel) {
            channel = await connection.createChannel();
        }
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}

/**
 * Subscribes to a RabbitMQ queue and processes messages using a callback function.
 * @param {string} queueName - Name of the queue to subscribe to.
 * @param {function} callback - Function to process incoming messages.
 */
async function subscribeToQueue(queueName, callback) {
    try {
        await connect(); // Ensure the connection and channel are ready
        await channel.assertQueue(queueName);
        console.log(`Subscribed to queue: ${queueName}`);

        channel.consume(queueName, (message) => {
            if (message) {
                callback(message.content.toString());
                channel.ack(message); // Acknowledge message processing
            }
        });
    } catch (error) {
        console.error(`Failed to subscribe to queue "${queueName}":`, error);
        throw error;
    }
}

/**
 * Publishes a message to a RabbitMQ queue.
 * @param {string} queueName - Name of the queue to publish to.
 * @param {string} data - Data to send to the queue.
 */
async function publishToQueue(queueName, data) {
    try {
        await connect(); // Ensure the connection and channel are ready
        await channel.assertQueue(queueName);
        channel.sendToQueue(queueName, Buffer.from(data));
        console.log(`Message published to queue "${queueName}":`, data);
    } catch (error) {
        console.error(`Failed to publish to queue "${queueName}":`, error);
        throw error;
    }
}

/**
 * Closes the RabbitMQ connection and channel gracefully.
 */
async function closeConnection() {
    try {
        if (channel) {
            await channel.close();
            console.log('RabbitMQ channel closed');
        }
        if (connection) {
            await connection.close();
            console.log('RabbitMQ connection closed');
        }
    } catch (error) {
        console.error('Failed to close RabbitMQ connection or channel:', error);
    }
}

export { connect, subscribeToQueue, publishToQueue, closeConnection };
