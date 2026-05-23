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

              case "lead_assigned":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "lead_assigned",
                    metadata: {
                      leadId: data.leadId,
                      leadName: data.leadName,
                      counsellorId: data.counsellorId,
                      assignedBy: data.assignedBy,
                    },
                  }),
                );
                console.log("Lead assigned notification dispatched");
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
                console.log("Status change notification dispatched");
                break;

              // --- New application events ---
              case "application_created":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "application_created",
                    metadata: {
                      applicationId: data.applicationId,
                    },
                  }),
                );
                console.log("Application created notification dispatched");
                break;

              case "application_updated":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "application_updated",
                    metadata: {
                      applicationId: data.applicationId,
                    },
                  }),
                );
                console.log("Application updated notification dispatched");
                break;

              case "application_deleted":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "application_deleted",
                    metadata: {
                      applicationId: data.applicationId,
                    },
                  }),
                );
                console.log("Application deleted notification dispatched");
                break;

              // --- Document events ---
              case "document_shared":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "document_shared",
                    metadata: {
                      documentId: data.documentId,
                      applicationId: data.applicationId,
                    },
                  }),
                );
                console.log("Document shared notification dispatched");
                break;

              case "document_verified":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "document_verified",
                    metadata: {
                      documentId: data.documentId,
                      applicationId: data.applicationId,
                    },
                  }),
                );
                console.log("Document verified notification dispatched");
                break;

              case "document_rejected":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "document_rejected",
                    metadata: {
                      documentId: data.documentId,
                      applicationId: data.applicationId,
                    },
                  }),
                );
                console.log("Document rejected notification dispatched");
                break;

              case "new_chat_message":
                // ✅ conversationId is required in metadata – fallback to null if missing
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "chat_message",
                    metadata: {
                      conversationId: data.conversationId || null,
                      senderName: data.senderName,
                      senderRole: data.senderRole,
                      preview: data.preview,
                    },
                  }),
                );
                console.log("Chat notification added to bell");
                break;

              case "lead_created":
                dispatch(
                  addNotification({
                    message:
                      data.message ||
                      `Lead "${data.leadName}" added by counsellor ${data.counsellorName}`,
                    type: "lead_created",
                    metadata: {
                      leadId: data.leadId,
                      leadName: data.leadName,
                      counsellorId: data.counsellorId,
                      counsellorName: data.counsellorName,
                    },
                  }),
                );
                console.log("Lead created notification dispatched");
                break;

              // --- New: Counsellor added lead (admin view) ---
              case "counsellor_added_lead":
                dispatch(
                  addNotification({
                    message:
                      data.message ||
                      `Counsellor ${data.counsellorName} added a new lead: ${data.leadName}`,
                    type: "counsellor_added_lead",
                    metadata: {
                      leadId: data.leadId,
                      leadName: data.leadName,
                      counsellorId: data.counsellorId,
                      counsellorName: data.counsellorName,
                    },
                  }),
                );
                console.log("Counsellor added lead notification sent to admin");
                break;

              case "counsellor_added_application":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "counsellor_added_application",
                    metadata: data.metadata,
                  }),
                );
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
            connectSSE();
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
