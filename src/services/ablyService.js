import * as Ably from 'ably';
import { BASE_URL } from '../Content/Url';

let client = null;

export async function connectAbly(token) {
  if (client) return client;

client = new Ably.Realtime({
  authUrl: `${BASE_URL}/chat/token?token=${token}`,
  authMethod: 'GET',
});

  return new Promise((resolve, reject) => {
    client.connection.once('connected', () => {
      console.log('🔌 Ably connected');
      resolve(client);
    });

    client.connection.once('failed', reject);
  });
}

export function getAbly() {
  return client;
}

export function disconnectAbly() {
  client?.close();
  client = null;
}

export function subscribeToChannel(channelName, eventName, callback) {
  if (!client) return;

  const channel = client.channels.get(channelName);

  channel.subscribe(eventName, (msg) => {
    callback(msg.data);
  });

  return () => channel.unsubscribe(eventName);
}

export function unsubscribeFromChannel(channelName) {
  if (!client) return;

  client.channels.get(channelName).detach();
}