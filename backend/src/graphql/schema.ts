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

  type Availability {
    availableSpots: Int!
    heldSpots: Int!
    confirmedSpots: Int!
    availabilityVersion: Int!
  }

  type AvailabilityHold {
    status: String!
    holdExpiresAt: String!
  }

  type AvailabilityEvent {
    event: String!
    availabilityVersion: Int!
  }

  type AnalyticsOverview {
    occupancyRate: Float!
    approvalRate: Float!
    revenue: Float!
  }

  type Query {
    club(clubId: ID!): Club
    analyticsOverview(clubId: ID!): AnalyticsOverview!
    sectionAvailability(clubId: ID!, sectionId: ID!, date: String!): Availability!
  }

  type Mutation {
    login(email: String!, password: String!): AuthTokens!
    refreshSession(refreshToken: String!): AuthTokens!
    requestPasswordReset(email: String!): Boolean!
    addEmployeeMembership(clubId: ID!, userId: ID!, role: String!): Boolean!
    createAvailabilityHold(clubId: ID!, sectionId: ID!, slotId: ID!, seats: Int!): AvailabilityHold!
    requestBooking(clubId: ID!, timeSlotId: ID!, partySize: Int!): BookingStatus!
    approveBooking(clubId: ID!, bookingId: ID!): BookingStatus!
  }

  type Subscription {
    availabilityUpdated(clubId: ID!, sectionId: ID!): AvailabilityEvent!
  }
`;
