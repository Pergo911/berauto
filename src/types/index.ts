export const RENTAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
} as const;

export type RentalStatus = (typeof RENTAL_STATUS)[keyof typeof RENTAL_STATUS];

export const RENTAL_EVENT_TYPE = {
  REQUEST: "REQUEST",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  HANDOVER: "HANDOVER",
  RETURN: "RETURN",
} as const;

export type RentalEventType =
  (typeof RENTAL_EVENT_TYPE)[keyof typeof RENTAL_EVENT_TYPE];

export const USER_ROLE = {
  USER: "user",
  AGENT: "agent",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const CAR_STATUS = {
  AVAILABLE: "AVAILABLE",
  RENTED: "RENTED",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type CarStatus = (typeof CAR_STATUS)[keyof typeof CAR_STATUS];
