
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
    health: TripHealth[]
    daily: TripDayInfo[]
}

export const emptyTrip: Trip = {
    id: '',
    startDate: new Date(),
    startTimezoneId: '',
    endDate: new Date(),
    endTimezoneId: '',
    countries: [],
    health: [],
    daily: [],
}

export interface TripCountry {
    name: string
    cities: TripCity[]
}

export interface TripDayInfo {
    day: string
    countries: TripCountry[]
    health: TripHealth[]
}

export interface TripCity {
    name: string
    sites: string[]
}

export interface TripHealth {
    sourceName: string
    steps: number
    flights: number
    meters: number
}

export interface TripDayHealth {
    day: string
    steps: number
    flights: number
    meters: number
}
