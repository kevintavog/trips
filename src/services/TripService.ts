import axios from 'axios'
import { Trip, TripDailyDetails, TripResponse } from '@/models/Trip'

export class TripService {
  private tripResponse?: TripResponse
  public loadTrips(): Promise<TripResponse> {
    return new Promise((resolve, reject) => {
      if (this.tripResponse) {
        resolve(this.tripResponse)
      } else {
        axios.get('data/trips.json')
          .then((response) => {
            this.tripResponse = response.data as TripResponse
            resolve(this.tripResponse)
          }, (err) => {
            reject(this.getErrorMessage(err))
          })
      }
    })
  }

  public getTrip(id: string): Promise<Trip> {
    return new Promise((resolve, reject) => {
      this.loadTrips()
        .then((response) => {
          response.trips.forEach((t) => {
            if (t.id === id) {
              resolve(t)
              return
            }
          })
          resolve(response.trips[0])
          reject(`No trip found: ${id}`)
        }, (err) => {
          reject(this.getErrorMessage(err))
        })
    })
  }

  public getDayInfo(id: string): Promise<TripDailyDetails> {
    return new Promise((resolve, reject) => {
      this.loadTrips()
        .then((response) => {
          axios.get(`data/${id}.json`)
          .then((rsp) => {
            resolve(rsp.data as TripDailyDetails)
          }, (err) => {
            reject(this.getErrorMessage(err))
          })
        }, (err) => {
          reject(this.getErrorMessage(err))
        })
    })
  }

  private getErrorMessage(error: any) {
    let message = error.message
    if (error.response != null) {
      message = `${error.response.status}: ${error.message}`
    }
    return message
  }
}
