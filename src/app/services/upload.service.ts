import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl = 'http://127.0.0.1:5000'; // Flask API base URL

  constructor(private http: HttpClient) { }

  // Method to compare two files
  compareFiles(file1: string, file2: string): Observable<any> {
    const body = { file1, file2 };
    return this.http.post(`${this.apiUrl}/compare`, body);
  }

  // Method to group similar files
  groupFiles(filePaths: string[]): Observable<any> {
    const body = { file_paths: filePaths };
    return this.http.post(`${this.apiUrl}/group`, body);
  }
}
