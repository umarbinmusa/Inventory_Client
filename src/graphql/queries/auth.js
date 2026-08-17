import { gql } from "@apollo/client";

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      fullName
      email
      role
      phone
      avatar
      lastLoginAt
      createdAt
    }
  }
`;

export const USERS_QUERY = gql`
  query Users($role: Role) {
    users(role: $role) {
      id
      fullName
      email
      role
      isActive
      lastLoginAt
      createdAt
    }
  }
`;
