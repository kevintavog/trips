
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
    dailyHealth: TripHealth[]
}

export const emptyTrip: Trip = {
    id: '',
    startDate: new Date(),
    startTimezoneId: '',
    endDate: new Date(),
    endTimezoneId: '',
    countries: [],
    health: [],
    dailyHealth: [],
}

export interface TripCountry {
    name: string
    cities: TripCity[]
}

export interface TripDailyDetails {
    daily: TripDayInfo[]
}

export interface TripDayInfo {
    day: string
    countries: TripCountry[]
    health: TripHealth[]
    images: TripImageInfo[]
    detailedHealth: TripHealth[]
}

export interface TripImageInfo {
    thumbURL: string
    createdDate: Date
    city: string
    country: string
    sitename: string
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
    date: string
}
