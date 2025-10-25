import qs from 'qs';
import { api } from './axios';
import type {
  Trip,
  EmployeeTripStats,
} from './types';

const collection = 'trips';

export interface TripResponse {
  docs: Trip[];
  stats: EmployeeTripStats;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: null | number;
  page: number;
  pagingCounter: number;
  prevPage: null | number;
  totalDocs: number;
  totalPages: number;
}

export interface CompletedTripsCount {
  totalDocs: number;
}

export const fetchEmployeeTrips = async (
  employeeId: string | undefined,
): Promise<TripResponse> => {
  const query = qs.stringify(
    {
      where: {
        employee: { in: [employeeId] },
        status: { equals: 'inprogress' },
      },
      select: {
        transactions: false,
      },
      populate: {
        employee: {
          name: true,
        },
        areas: {
          name: true,
        },
        blocks: {
          name: true,
          area: true,
        },
      },
      limit: 1000,
    },
    { addQueryPrefix: true },
  );

  return (await api.get<TripResponse>(`/${collection}${query}`)).data;
};

export const fetchEmployeeTripStats = async (
  employeeId: string | undefined,
): Promise<CompletedTripsCount> => {
  const query = qs.stringify(
    {
      where: {
        employee: { in: [employeeId] },
        status: { equals: 'completed' },
      },
    },
    { addQueryPrefix: true },
  );

  return (await api.get<CompletedTripsCount>(`/${collection}/count${query}`))
    .data;
};
