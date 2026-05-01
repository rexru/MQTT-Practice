const mqtt = require('mqtt');
const { InfluxDB, Point} = require('@influxdata/influxdb-client');

//Configuration
const mqttUrl = 'mqtt://mqtt-broker:1883';
const influxUrl = 'http://influxdb:8086';
const influxToken = 'k_PBPdtayq5Xaaxihmi58GMrY_qki41yLAP9GnrP-NINH9npvEK99e8eoWYvB2ZUe5OgfX5SH9Sobop6uZGLtQ==';
const org = 'my-org';
const bucket = 'mqtt-data';

// --- SETUP INFLUXDB ---
const writeApi = new InfluxDB({ url: influxUrl, token: influxToken }).getWriteApi(org, bucket);

// --- SETUP MQTT ---
const client = mqtt.connect(mqttUrl);

client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    client.subscribe('test/#'); // Listens to all topics starting with sensors/
});

client.on('message', (topic, message) => {
    const value = parseFloat(message.toString());
    console.log(`Received: ${value} on ${topic}`);

    if (!isNaN(value)) {
        // Create a data point
        const point = new Point('environment')
            .tag('location', topic)
            .floatField('value', value);

        // Write to InfluxDB
        writeApi.writePoint(point);
        console.log(`Saved ${value} to InfluxDB`);
    }
});

