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
    }

    isConnectingRef.current = false;
  }, []);

  const connectSSE = useCallback(
    function connectSSE() {
      if (isConnectingRef.current) {
        return;
      }

      const token = localStorage.getItem("token");

      if (!token || !user) {
        return;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const sseUrl = `${BASE_URL}/sse/events?token=${token}`;
      isConnectingRef.current = true;

      try {
        const eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          isConnectingRef.current = false;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case "connected":
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
                break;

              case "new_chat_message":
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
                break;

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

              case "payment_awaiting_verification":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "payment_awaiting_verification",
                    metadata: data.metadata,
                  }),
                );
                break;

              case "payment_verified":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "payment_verified",
                    metadata: data.metadata,
                  }),
                );
                break;

              case "payment_rejected":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "payment_rejected",
                    metadata: data.metadata,
                  }),
                );
                break;

              case "payment_added_by_admin":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "payment_added_by_admin",
                    metadata: data.metadata,
                  }),
                );
                break;

              case "consultancy_fee_added":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "consultancy_fee_added",
                    metadata: data.metadata,
                  }),
                );
                break;

              case "payment_credited":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "payment_credited",
                    metadata: data.metadata,
                  }),
                );
                break;

              case "payment_received":
                dispatch(
                  addNotification({
                    message: data.message,
                    type: "payment_received",
                    metadata: data.metadata,
                  }),
                );
                break;

              default:
                break;
            }
          } catch (_err) {
            // Silently handle json parsing
          }
        };

        eventSource.onerror = () => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          isConnectingRef.current = false;

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connectSSE();
          }, 5000);
        };
      } catch (_err) {
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
