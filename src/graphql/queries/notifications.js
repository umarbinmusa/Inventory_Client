import { gql } from "@apollo/client";

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($unreadOnly: Boolean) {
    notifications(unreadOnly: $unreadOnly) {
      id
      type
      message
      read
      createdAt
      product {
        id
        productName
      }
      sale {
        id
        receiptNumber
      }
      order {
        id
        orderNumber
      }
    }
  }
`;

export const UNREAD_NOTIFICATION_COUNT_QUERY = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;
