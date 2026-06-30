"use client";

import { createContext, useContext, useReducer, useCallback } from "react";
import type { Trip, TripSession } from "@/types";

type CreateTripInput = {
  title: string;
  startDate: string;
  endDate: string;
  destinationLabel?: string;
  notes?: string;
};

type AppState = { sessions: TripSession[] };
type AppAction = { type: "CREATE_TRIP"; session: TripSession };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "CREATE_TRIP":
      return { ...state, sessions: [...state.sessions, action.session] };
    default:
      return state;
  }
}

type StoreContextValue = {
  sessions: TripSession[];
  createTrip: (input: CreateTripInput) => Trip;
  getTripSession: (tripId: string) => TripSession | undefined;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { sessions: [] });

  const createTrip = useCallback((input: CreateTripInput): Trip => {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: crypto.randomUUID(),
      title: input.title,
      startDate: input.startDate,
      endDate: input.endDate,
      destinationLabel: input.destinationLabel,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({
      type: "CREATE_TRIP",
      session: {
        trip,
        mediaItems: [],
        placeVisits: [],
        timelineEntries: [],
        story: null,
        evidence: [],
      },
    });
    return trip;
  }, []);

  const getTripSession = useCallback(
    (tripId: string) => state.sessions.find((s) => s.trip.id === tripId),
    [state.sessions]
  );

  return (
    <StoreContext.Provider value={{ sessions: state.sessions, createTrip, getTripSession }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
