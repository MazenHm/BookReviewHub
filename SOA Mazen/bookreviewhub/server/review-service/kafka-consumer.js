const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'review-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'review-group' });

const run = async () => {
  await consumer.connect();
  console.log('✅ Connected to Kafka as consumer');

  await consumer.subscribe({ topic: 'review-events', fromBeginning: true });
  console.log('📡 Subscribed to topic: review-events');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('📥 New event from Kafka:', {
        key: message.key.toString(),
        value: message.value.toString(),
        partition
      });
    }
  });
};

run().catch(console.error);
