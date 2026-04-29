// hooks/useSSE.js
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../redux/slices/notificationSlice';
import { selectUser } from '../../redux/slices/authSlice';

const useSSE = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectSSERef = useRef(null);

  const connectSSE = useCallback(() => {
    const token = localStorage.getItem('token');

    if (!token || !user) {
      console.log('No token or user found, skipping SSE connection');
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const BASE_URL = 'http://localhost:3001/api/v1';
    const sseUrl = `${BASE_URL}/sse/events?token=${token}`;

    console.log('Connecting to SSE at:', sseUrl);

    try {
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection established for user:', user?.id);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE message received:', data);

          switch (data.type) {
            case 'connected':
              console.log('SSE connected:', data.message);
              break;

            case 'status_change':
              dispatch(addNotification({
                message: data.message,
                type: 'status_change',
                metadata: {
                  applicationId: data.applicationId,
                  oldStatus: data.oldStatus,
                  newStatus: data.newStatus,
                  university: data.university,
                  course: data.course,
                  oldStatusLabel: data.oldStatusLabel,
                  newStatusLabel: data.newStatusLabel
                }
              }));
              console.log('Notification dispatched to Redux');
              break;

            default:
              console.log('Unknown SSE message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect SSE...');
          connectSSERef.current?.(); // ✅ safe + fresh
        }, 5000);
      };
    } catch (err) {
      console.error('Error creating SSE connection:', err);
    }
  }, [dispatch, user]);

  // ✅ FIX: update ref AFTER render
  useEffect(() => {
    connectSSERef.current = connectSSE;
  }, [connectSSE]);

  const disconnectSSE = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('SSE connection closed');
    }
  }, []);

  useEffect(() => {
    connectSSE();

    return () => {
      disconnectSSE();
    };
  }, [connectSSE, disconnectSSE]);

  return { connectSSE, disconnectSSE };
};

export default useSSE;