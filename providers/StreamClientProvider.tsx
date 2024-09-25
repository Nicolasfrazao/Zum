'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';

import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

/**
 * This component wraps the StreamVideo component and provides it with
 * a configured StreamVideoClient instance.
 *
 * The StreamVideoClient is created only when the user is loaded and
 * authenticated. The client is configured with the API key from the
 * environment variable NEXT_PUBLIC_STREAM_API_KEY.
 *
 * The client is also configured with a user object that contains the
 * user's id, name, and image.
 *
 * The user object is obtained from the useUser hook from the @clerk/nextjs
 * library.
 *
 * The tokenProvider function is used to generate a token for the client.
 * This function is imported from the actions/stream.actions file.
 *
 * The client is stored in the component's state and is updated only when
 * the user is loaded and authenticated.
 *
 * The StreamVideo component is rendered only when the client is available.
 * Until then, a Loader component is rendered.
 */
const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    /**
     * If the user is not loaded or authenticated, do nothing.
     */
    if (!isLoaded || !user) return;

    /**
     * If the API key is not available, throw an error.
     */
    if (!API_KEY) throw new Error('Stream API key is missing');

    /**
     * Create a new StreamVideoClient instance with the API key and user
     * information.
     */
    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user?.id,
        name: user?.username || user?.id,
        image: user?.imageUrl,
      },
      /**
       * Use the tokenProvider function to generate a token for the client.
       */
      tokenProvider,
    });

    /**
     * Store the client in the component's state.
     */
    setVideoClient(client);
  }, [user, isLoaded]);

  /**
   * If the client is not available, render a Loader component.
   */
  if (!videoClient) return <Loader />;

  /**
   * Render the StreamVideo component with the client.
   */
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;

