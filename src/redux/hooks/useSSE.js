// hooks/useSSE.js
import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../../redux/slices/notificationSlice";
import { selectUser } from "../../redux/slices/authSlice";
import { BASE_URL } from "../../Content/Url";

const useSSE = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  const disconnectSSE = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log("SSE connection closed");
    }

    isConnectingRef.current = false;
  }, []);

  // Use a named function expression to allow recursive calls
  const connectSSE = useCallback(
    function connectSSE() {
      if (isConnectingRef.current) {
        console.log("Connection already in progress, skipping...");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token || !user) {
        console.log("No token or user found, skipping SSE connection");
        return;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const sseUrl = `${BASE_URL}/sse/events?token=${token}`;
      console.log("Connecting to SSE at:", sseUrl);

      isConnectingRef.current = true;

      try {
        const eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log("SSE connection established for user:", user?.id);
          isConnectingRef.current = false;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("SSE message received:", data);

            switch (data.type) {
              case "connected":
                console.log("SSE connected:", data.message);
                break;

              case "status_change":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "status_change",
                    metadata: {
                      applicationId: data.applicationId,
                      oldStatus: data.oldStatus,
                      newStatus: data.newStatus,
                      university: data.university,
                      course: data.course,
                      oldStatusLabel: data.oldStatusLabel,
                      newStatusLabel: data.newStatusLabel,
                    },
                  }),
                );
                console.log("Notification dispatched to Redux");
                break;

              default:
                console.log("Unknown SSE message type:", data.type);
            }
          } catch (err) {
            console.error("Error parsing SSE message:", err);
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE connection error:", error);

          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          isConnectingRef.current = false;

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect SSE...");
            connectSSE(); // Now safely calls the named function recursively
          }, 5000);
        };
      } catch (err) {
        console.error("Error creating SSE connection:", err);
        isConnectingRef.current = false;
      }
    },
    [dispatch, user],
  );

  useEffect(() => {
    connectSSE();

    return () => {
      disconnectSSE();
    };
  }, [connectSSE, disconnectSSE]);

  return { connectSSE, disconnectSSE };
};

export default useSSE;
