import { gql } from "@apollo/client";

export const UPDATE_USER_STATUS_MUTATION = gql`
  mutation UpdateUserStatus($id: ID!, $isActive: Boolean, $role: Role) {
    updateUserStatus(id: $id, isActive: $isActive, role: $role) {
      id
      isActive
      role
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;
