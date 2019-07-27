
export interface TripResponse {
    trips: Trip[]
}

export interface Trip {
    id: string
    startDate: Date
    startTimezoneId: string
    endDate: Date
    endTimezoneId: string
    countries: TripCountry[]
    dailyLocations: DayTripCountry[]
    health: TripHealth[]
}

export const emptyTrip: Trip = {
    id: '',
    startDate: new Date(),
    startTimezoneId: '',
    endDate: new Date(),
    endTimezoneId: '',
    countries: [],
    dailyLocations: [],
    health: [],
}

export interface TripCountry {
    name: string
    cities: TripCity[]
}

export interface DayTripCountry {
    day: string
    name: string
    cities: TripCity[]
}

export interface TripCity {
    name: string
    sites: string[]
}

export interface TripHealth {
    sourceName: string
    totalSteps: number
    totalFlights: number
    totalMeters: number
    daily: TripDayHealth[]
}

export interface TripDayHealth {
    day: string
    steps: number
    flights: number
    meters: number
}
