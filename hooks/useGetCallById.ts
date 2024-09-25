import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useGetCallById = (id: string | string[]) => {
  // This hook will make a call to the Stream Video API to get a call by its ID
  // It will store the result in the `call` state and will toggle the `isCallLoading` state
  // when the call is loading or loaded

  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  // This hook will use the `useStreamVideoClient` hook to get the Stream Video client
  const client = useStreamVideoClient();

  useEffect(() => {
    // If the client is not ready yet, do nothing
    if (!client) return;

    // This function will load the call by its ID
    const loadCall = async () => {
      try {
        // https://getstream.io/video/docs/react/guides/querying-calls/#filters
        // We are going to query the Stream Video API to get the call by its ID
        const { calls } = await client.queryCalls({ filter_conditions: { id } });

        // If we got a call, store it in the `call` state
        if (calls.length > 0) setCall(calls[0]);

        // Toggle the `isCallLoading` state to false, meaning that the call is loaded
        setIsCallLoading(false);
      } catch (error) {
        // If there is an error, log it and toggle the `isCallLoading` state to false
        console.error(error);
        setIsCallLoading(false);
      }
    };

    // Call the `loadCall` function
    loadCall();
  }, [client, id]);

  // Return the `call` and `isCallLoading` states
  return { call, isCallLoading };
};

