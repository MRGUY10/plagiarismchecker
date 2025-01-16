import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
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
  plagiarismPercentage = 0;
  totalWords = 0;
  plagiarizedWords = 0;
  similarityPercentage = 0;
  numberOfGroups = 0;
  currentTab: string = 'code'; // Default tab

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

  // Simulate file upload with loading bar and plagiarism check
  uploadFiles() {
    if (this.uploadedFiles.length > 0) {
      console.log('Simulating file upload:', this.uploadedFiles);
      this.isUploading = true;
      this.uploadProgress = 0;

      const interval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
          this.isUploading = false;
          this.plagiarismResultsVisible = true;
          this.displayPlagiarismResults();
        }
      }, 500);
    } else {
      alert('No files selected for upload');
    }
  }

  displayPlagiarismResults() {
    if (this.uploadedFiles.length === 2) {
      // Simulate document comparison results
      this.similarityPercentage = Math.floor(Math.random() * 100);

      // Display the comparison pie chart
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
    } else if (this.uploadedFiles.length > 2) {
      // Simulate document grouping results
      this.numberOfGroups = Math.floor(Math.random() * (this.uploadedFiles.length / 2)) + 1;

      // Display the grouping bar chart
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
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }
}
