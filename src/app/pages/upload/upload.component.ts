import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  standalone: true,
  imports: [NgForOf, NgClass, NgIf]
})
export class UploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  uploadedFiles: any[] = [];
  isUploading = false;
  uploadProgress = 0;
  plagiarismResultsVisible = false;
  similarityPercentage = 0;
  numberOfGroups = 0;
  currentTab: string = 'code'; // Default tab

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Initialize Chart.js if necessary
  }

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
  
      this.http.post('http://127.0.0.1:5000/upload', formData).subscribe(
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
    } else {
      alert('No files selected for upload');
    }
  }
  
  checkSimilarities(fileUrls: string[]) {
    this.http.post('http://127.0.0.1:5000/similarities', { file_paths: fileUrls }).subscribe(
      (response: any) => {
        this.displayPlagiarismResults(response);
      },
      (error) => {
        console.error('Similarity check error:', error);
      }
    );
  }
  

  displayPlagiarismResults(response: any) {
    // Handle the response and display the results as needed
    console.log('Plagiarism results:', response);

    // Example: Display the similarity percentage
    if (response.length === 1) {
      this.similarityPercentage = response[0].similarity_percentage;
      this.displayComparisonChart();
    } else if (response.length > 1) {
      this.numberOfGroups = response.length;
      this.displayGroupingChart();
    }
  }

  displayComparisonChart() {
    const ctx = document.getElementById('comparisonChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Similar Content', 'Unique Content'],
        datasets: [{
          data: [this.similarityPercentage, 100 - this.similarityPercentage],
          backgroundColor: ['#ff6384', '#36a2eb'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            enabled: true,
          }
        }
      }
    });
  }

  displayGroupingChart() {
    const ctx = document.getElementById('groupingChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: this.numberOfGroups }, (_, i) => `Group ${i + 1}`),
        datasets: [{
          data: Array.from({ length: this.numberOfGroups }, () => Math.floor(Math.random() * 100)),
          backgroundColor: '#36a2eb',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          }
        }
      }
    });
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }
}
