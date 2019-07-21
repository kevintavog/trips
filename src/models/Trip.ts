
export interface TripResponse {
    trips: Trip[]
}

export interface Trip {
    startDate: Date
    startTimezoneId: string
    endDate: Date
    endTimezoneId: string
    countries: TripCountry[]
    health: TripHealth[]
}

export interface TripCountry {
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
}