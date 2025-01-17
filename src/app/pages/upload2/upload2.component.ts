import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload2.component.html',
  styleUrls: ['./upload2.component.css'],
  standalone: true,
  imports: [NgForOf, NgClass, NgIf, RouterModule],
})
export class Upload2Component implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  uploadedFiles: File[] = [];
  isUploading = false;
  uploadProgress = 0;
  plagiarismResultsVisible = false;
  similarityResults: { files: string[]; max_similarity: number }[] = [];
  inspirationResult: string = '';
  currentTab: string = 'text'; // Default tab for text plagiarism checker

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  // API Base URL
  apiBaseUrl = 'https://host-api-python.onrender.com';

  // File selection
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.uploadedFiles.push(files[i]);
    }
    console.log('Selected files:', this.uploadedFiles);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    console.log('Updated files:', this.uploadedFiles);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files: FileList = event.dataTransfer?.files || new DataTransfer().files;
    for (let i = 0; i < files.length; i++) {
      this.uploadedFiles.push(files[i]);
    }
    console.log('Dropped files:', this.uploadedFiles);
  }

  uploadFiles() {
    if (this.uploadedFiles.length < 1) {
      alert('Please select files to upload.');
      return;
    }
  
    this.isUploading = true;
    const formData = new FormData();
  
    // Append files to the form data
    this.uploadedFiles.forEach((file) => formData.append('files', file, file.name));
    const uploadUrl = `${this.apiBaseUrl}/upload`;
  
    this.http.post(uploadUrl, formData).subscribe(
      (response: any) => {
        this.isUploading = false;
        console.log('Server response:', response); // Add this line for debugging
  
        // Ensure 'response.file_urls' is defined before accessing 'length'
        if (response && response.file_urls) {
          const filePaths = response.file_urls; // Ensure this key matches the backend response
          console.log('Uploaded file paths:', filePaths);
  
          if (filePaths.length === 2) {
            this.checkInspiration(filePaths); // Call inspiration check for 2 files
          } else if (filePaths.length > 2) {
            this.checkSimilarities(filePaths); // Call similarity check for multiple files
          } else {
            alert('Please upload at least 2 files.');
          }
        } else {
          console.error('No file URLs returned from the server.', response); // Log the entire response for debugging
          alert('No file URLs returned from the server.');
        }
      },
      (error) => {
        console.error('Upload error:', error);
        this.isUploading = false;
  
        if (error.status === 400) {
          alert('Invalid request. Please check file format and size.');
        } else {
          alert('An unexpected error occurred.');
        }
      }
    );
  }

  checkSimilarities(filePaths: string[]) {
    const similaritiesUrl = `${this.apiBaseUrl}/similarities`;
  
    this.http.post(similaritiesUrl, { file_paths: filePaths }).subscribe(
      (response: any) => {
        console.log('Similarity check response:', response);
        this.displayPlagiarismResults(response);
      },
      (error) => {
        console.error('Similarity check error:', error);
      }
    );
  }
  
  checkInspiration(filePaths: string[]) {
    const inspirationUrl = `${this.apiBaseUrl}/inspiration`;
  
    this.http.post(inspirationUrl, { file_paths: filePaths }).subscribe(
      (response: any) => {
        console.log('Inspiration check response:', response);
        this.displayInspirationResult(response);
      },
      (error) => {
        console.error('Inspiration check error:', error);
      }
    );
  }
  
  displayPlagiarismResults(response: any) {
    console.log('Plagiarism results:', response);
    this.similarityResults = response;
    this.similarityResults.sort((a, b) => b.max_similarity - a.max_similarity);
    this.plagiarismResultsVisible = true;
  }

  displayInspirationResult(response: any) {
    console.log('Inspiration result:', response);

    if (response && response.inspiration_percentage !== undefined) {
      const file1 = this.uploadedFiles[0].name;
      const file2 = this.uploadedFiles[1].name;
      this.inspirationResult = `${file1} is inspired ${response.inspiration_percentage.toFixed(2)}% by ${file2}`;
    } else {
      console.error('Invalid inspiration response:', response);
      alert('Failed to retrieve inspiration result.');
    }

    this.plagiarismResultsVisible = true;
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
    this.resetView();
  }

  resetView() {
    this.plagiarismResultsVisible = false;
    this.uploadedFiles = [];
    this.inspirationResult = '';
    this.similarityResults = [];
  }

  checkAgain() {
    this.resetView();
  }
}
