
export interface TripResponse {
    trips: Trip[]
}

export interface Trip {
    startDate: Date
    startTimezoneId: string
    endDate: Date
    endTimezoneId: string
    countries: TripCountry[]
}

export interface TripCountry {
    name: string
    cities: TripCity[]
}

export interface TripCity {
    name: string
    sites: string[]
}
