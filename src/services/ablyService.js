import * as Ably from 'ably';
import { BASE_URL } from '../Content/Url';

let client = null;
let connectionPromise = null;

export async function connectAbly(token) {
  if (client?.connection?.state === 'connected') return client;
  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise((resolve, reject) => {
    client = new Ably.Realtime({
      authUrl: `${BASE_URL}/chat/token?token=${token}`,
      authMethod: 'GET',
      echoMessages: false,
    });

    client.connection.once('connected', () => {
      console.log('✅ Ably Connected');
      resolve(client);
    });

    client.connection.once('failed', (err) => {
      console.error('❌ Ably Failed:', err);
      connectionPromise = null;
      reject(err);
    });
  });

  return connectionPromise;
}

// ✅ async — returns a Promise so .then() works
export async function subscribeToChannel(channelName, eventName, callback) {
  try {
    await connectionPromise; // wait until fully connected
  } catch (err) {
    console.error('Cannot subscribe, Ably not connected:', err);
    return () => {};
  }

  if (!client) {
    console.warn('❌ No Ably client');
    return () => {};
  }

  const channel = client.channels.get(channelName);

  const listener = (message) => {
    console.log(`📨 ${eventName} on ${channelName}:`, message.data);
    callback(message.data);
  };

  channel.subscribe(eventName, listener);
  console.log(`✅ Subscribed to ${channelName} | ${eventName}`);

  return () => {
    channel.unsubscribe(eventName, listener);
  };
}

export function unsubscribeFromChannel(channelName) {
  if (!client) return;
  const channel = client.channels.get(channelName);
  channel.unsubscribe();
  channel.detach();
}

export function disconnectAbly() {
  if (client) {
    client.close();
    client = null;
    connectionPromise = null;
  }
}