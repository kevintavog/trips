import { DateTime } from 'luxon'
import { Trip, TripCity } from '@/models/Trip'

class Displayable {
  public weekMonthDay(date: string | Date, timezoneId: string): string {
    const l = DateTime.fromISO(date.toString(), { setZone: true }).setZone(timezoneId)
    return `${l.weekdayLong}, ${l.monthLong} ${l.day}`
  }

  public dateOnly(date: string | Date, timezoneId: string): string {
    const l = DateTime.fromISO(date.toString(), { setZone: true }).setZone(timezoneId)
    return `${l.weekdayLong}, ${l.toLocaleString()}`
  }

  public countryList(trip: Trip): string[] {
    return trip.countries.map((c) => c.name)
  }

  public cityList(cities: TripCity[]): string[] {
    return cities.map((c) => c.name)
  }

  public stepsString(count: number): string {
    if (count < 3000) {
      return `${count}`
    }
    return `${Math.floor(count / 1000)}K`
  }

  public metersString(distance: number): string {
    if (distance < 5000) {
      return `${Math.floor(distance)} meters`
    }
    return `${Math.floor(distance / 1000)} km`
  }

  public detailedDistance(distance: number): string {
    if (distance < 2000) {
      return `${Math.floor(distance)} meters`
    }
    return `${Math.floor(distance / 10) / 100} km`
  }
}

export const displayable = new Displayable()
