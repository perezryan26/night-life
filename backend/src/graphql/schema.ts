import {
  analyticsGraphQLOperations,
} from '../modules/analytics';
import { authGraphQLOperations } from '../modules/auth';
import { bookingsGraphQLOperations } from '../modules/bookings';
import { clubsGraphQLOperations } from '../modules/clubs';

export const graphqlOperations = [
  ...authGraphQLOperations,
  ...clubsGraphQLOperations,
  ...bookingsGraphQLOperations,
  ...analyticsGraphQLOperations,
];

export const graphqlSchemaSDL = `
  type AuthTokens {
    accessToken: String!
    refreshToken: String
  }

  type Club {
    id: ID!
    name: String!
  }

  type BookingStatus {
    status: String!
  }

  type AnalyticsOverview {
    occupancyRate: Float!
    approvalRate: Float!
    revenue: Float!
  }

  type Query {
    club(clubId: ID!): Club
    analyticsOverview(clubId: ID!): AnalyticsOverview!
  }

  type Mutation {
    login(email: String!, password: String!): AuthTokens!
    refreshSession(refreshToken: String!): AuthTokens!
    requestPasswordReset(email: String!): Boolean!
    addEmployeeMembership(clubId: ID!, userId: ID!, role: String!): Boolean!
    requestBooking(clubId: ID!, timeSlotId: ID!, partySize: Int!): BookingStatus!
    approveBooking(clubId: ID!, bookingId: ID!): BookingStatus!
  }
`;
