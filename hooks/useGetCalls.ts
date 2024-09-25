import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

/**
 * This hook will get all the calls that the current user is participating in.
 * The calls are sorted by their start time in descending order.
 * The calls are filtered to only include calls that the user is participating in
 * and that are upcoming or have ended.
 *
 * The hook will return an object with the following properties:
 *
 * - endedCalls: an array of calls that the user is participating in and that
 *   have ended.
 * - upcomingCalls: an array of calls that the user is participating in and that
 *   are upcoming.
 * - callRecordings: an array of all the calls that the user is participating in.
 * - isLoading: a boolean indicating whether the hook is currently loading the
 *   calls.
 */
export const useGetCalls = () => {
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    /**
     * This function will load the calls that the user is participating in.
     * It will first check if the user is logged in and if the Stream Video
     * client is available. If either of those conditions are not met, it
     * will return.
     *
     * Then, it will set the isLoading state to true, indicating that the hook
     * is currently loading the calls.
     *
     * Next, it will query the Stream Video API to get all the calls that the
     * user is participating in. The calls are sorted by their start time in
     * descending order. The calls are filtered to only include calls that the
     * user is participating in and that are upcoming or have ended.
     *
     * If the call is successful, it will set the calls state to the result of
     * the query. If there is an error, it will log the error to the console.
     *
     * Finally, it will set the isLoading state to false, indicating that the
     * hook is no longer loading the calls.
     */
    const loadCalls = async () => {
      if (!client || !user?.id) return;
      
      setIsLoading(true);

      try {
        // https://getstream.io/video/docs/react/guides/querying-calls/#filters
        const { calls } = await client.queryCalls({
          sort: [{ field: 'starts_at', direction: -1 }],
          filter_conditions: {
            starts_at: { $exists: true },
            $or: [
              { created_by_user_id: user.id },
              { members: { $in: [user.id] } },
            ],
          },
        });

        setCalls(calls);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [client, user?.id]);

  const now = new Date();

  /**
   * This function will filter the calls to only include calls that have ended.
   * It will return an array of calls that the user is participating in and that
   * have ended.
   */
  const endedCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    return (startsAt && new Date(startsAt) < now) || !!endedAt
  })

  /**
   * This function will filter the calls to only include calls that are upcoming.
   * It will return an array of calls that the user is participating in and that
   * are upcoming.
   */
  const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
    return startsAt && new Date(startsAt) > now
  })

  return { endedCalls, upcomingCalls, callRecordings: calls, isLoading }
};
