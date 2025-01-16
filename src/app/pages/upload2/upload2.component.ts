import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-upload',
  templateUrl: './upload2.component.html',
  styleUrls: ['./upload2.component.css'],
  standalone: true,
  imports: [NgForOf, NgClass, NgIf]
})
export class Upload2Component implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  uploadedFiles: any[] = [];
  isUploading = false;
  uploadProgress = 0;
  plagiarismResultsVisible = false;
  similarityResults: any[] = [];
  inspirationResult: string = '';
  currentTab: string = 'code'; // Default tab

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  // for remote : https://host-api-python.onrender.com
  // for local : http://127.0.0.1:5000

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedFiles.push(files[i]);
      }
      console.log('Selected files:', this.uploadedFiles);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    console.log('Updated files:', this.uploadedFiles);
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.add('drag-over');
  }

  onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('drag-over');
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedFiles.push(files[i]);
      }
      console.log('Dropped files:', this.uploadedFiles);
    }
  }

  uploadFiles() {
    if (this.uploadedFiles.length > 0) {
      this.isUploading = true;
      const formData = new FormData();
      this.uploadedFiles.forEach(file => {
        formData.append('files', file, file.name);
      });

      if (this.uploadedFiles.length === 2) {
        this.uploadFilesForInspiration(formData);
      } else {
        this.uploadFilesForSimilarity(formData);
      }
    } else {
      alert('No files selected for upload');
    }
  }

  uploadFilesForSimilarity(formData: FormData) {
    this.http.post('https://host-api-python.onrender.com/upload', formData).subscribe(
      (response: any) => {
        this.isUploading = false;
        this.plagiarismResultsVisible = true;
        const fileUrls = response.file_urls; // Get the file URLs from the response
        this.checkSimilarities(fileUrls); // Pass the URLs to the similarity check method
      },
      (error) => {
        console.error('Upload error:', error);
        this.isUploading = false;
      }
    );
  }

  uploadFilesForInspiration(formData: FormData) {
    this.http.post('https://host-api-python.onrender.com/upload', formData).subscribe(
      (response: any) => {
        this.isUploading = false;
        this.plagiarismResultsVisible = true;
        const fileUrls = response.file_urls; // Get the file URLs from the response
        this.checkInspiration(fileUrls); // Pass the URLs to the inspiration check method
      },
      (error) => {
        console.error('Upload error:', error);
        this.isUploading = false;
      }
    );
  }

  checkSimilarities(fileUrls: string[]) {
    this.http.post('https://host-api-python.onrender.com/similarities', { file_paths: fileUrls }).subscribe(
      (response: any) => {
        this.displayPlagiarismResults(response);
      },
      (error) => {
        console.error('Similarity check error:', error);
      }
    );
  }

  checkInspiration(fileUrls: string[]) {
    this.http.post('https://host-api-python.onrender.com/inspiration', { file_paths: fileUrls }).subscribe(
      (response: any) => {
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
    this.sortSimilarityResults();
  }

  sortSimilarityResults() {
    this.similarityResults.sort((a, b) => a[1] - b[1]); // Sort by similarity percentage
  }

  displayInspirationResult(response: any) {
    console.log('Inspiration result:', response);
    const file1 = this.uploadedFiles[0].name;
    const file2 = this.uploadedFiles[1].name;
    this.inspirationResult = `${file1} is inspired ${response.inspiration_percentage.toFixed(2)}% by ${file2}`;
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }
}
