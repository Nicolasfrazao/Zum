'use server';

import { currentUser } from '@clerk/nextjs/server';
import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

/**
 * Generates a Stream.io user token for the currently authenticated
 * user. The token is generated using the Stream.io Node SDK and is
 * configured with the following settings:
 *
 * - expiration time: 1 hour from now (3600 seconds)
 * - issued at: 1 minute ago (to ensure the token is always valid)
 *
 * The function first checks if the user is authenticated, and if not,
 * throws an error. It then checks if the Stream API key and secret are
 * defined, and if not, throws an error.
 *
 * If all conditions are met, it creates a new StreamClient instance
 * with the API key and secret, and then uses that instance to
 * generate a token for the user. The token is then returned.
 */
export const tokenProvider = async () => {
  // Get the currently authenticated user
  const user = await currentUser();

  // If the user is not authenticated, throw an error
  if (!user) throw new Error('User is not authenticated');

  // If the Stream API key or secret are not defined, throw an error
  if (!STREAM_API_KEY) throw new Error('Stream API key secret is missing');
  if (!STREAM_API_SECRET) throw new Error('Stream API secret is missing');

  // Create a new StreamClient instance with the API key and secret
  const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

  // Set the expiration time to 1 hour from now
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;

  // Set the issued at time to 1 minute ago (to ensure the token is always valid)
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  // Generate the token using the StreamClient instance
  const token = streamClient.createToken(user.id, expirationTime, issuedAt);

  // Return the generated token
  return token;
};

