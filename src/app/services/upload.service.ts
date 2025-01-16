import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl = 'https://plagiarism-yu4v.onrender.com';

  constructor(private http: HttpClient) { }

  compareFiles(file1: File, file2: File): Observable<any> {
    const formData = new (window as any).FormData() as FormData;
    formData.append('file1', file1, file1.name);
    formData.append('file2', file2, file2.name);

    return this.http.post<any>(`${this.apiUrl}/compare`, formData);
  }

  groupFiles(files: File[]): Observable<any> {
    const formData = new (window as any).FormData() as FormData;
    files.forEach(file => formData.append('files', file, file.name));

    return this.http.post<any>(`${this.apiUrl}/group`, formData);
  }
}
