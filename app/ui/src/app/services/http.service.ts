import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  baseUrl="/api"

  constructor(
    private http: HttpClient
  ) { }

  public get(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`).toPromise();
  }

  public post<T>(path: string, data: T) {
    return this.http.post(`${this.baseUrl}/${path}`, data).toPromise();
  }

  public put<T>(path: string, data: T) {
    return this.http.put(`${this.baseUrl}/${path}`, data).toPromise();
  }

  public patch<T>(path: string, data: T) {
    return this.http.patch(`${this.baseUrl}/${path}`, data).toPromise();
  }

  public delete(path: string) {
    return this.http.delete(`${this.baseUrl}/${path}`).toPromise();
  }

  public options(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`).toPromise();
  }
}
