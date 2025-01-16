import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import Chart from 'chart.js/auto';
import { UploadService } from '../../services/upload.service';
import { RouterModule } from '@angular/router';

interface GroupedFile {
  [index: number]: string | number;
  0: string;
  1: string;
  2: number;
}

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  standalone: true,
  imports: [NgForOf, NgClass, NgIf, DecimalPipe,RouterModule]
})
export class UploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  uploadedFiles: any[] = [];
  isUploading = false;
  uploadProgress = 0;
  plagiarismResultsVisible = false;
  similarityPercentage = 0;
  overlapCount = 0;
  overlappingLines: string[] = [];
  groupedFiles: GroupedFile[] = [];
  numberOfGroups = 0;
  currentTab: string = 'code'; // Default tab

  constructor(private fileService: UploadService) { }

  ngOnInit() {
    // Initialize Chart.js if necessary
  }

  getFileType(file: any): string {
    const extension = file.name.split('.').pop().toLowerCase();
    return extension;
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const fileType = this.getFileType(files[i]);
        if (this.uploadedFiles.length === 0 || this.getFileType(this.uploadedFiles[0]) === fileType) {
          this.uploadedFiles.push(files[i]);
        } else {
          alert('All files must be of the same type.');
          break;
        }
      }
      console.log('Selected files:', this.uploadedFiles);
    }
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
        const fileType = this.getFileType(files[i]);
        if (this.uploadedFiles.length === 0 || this.getFileType(this.uploadedFiles[0]) === fileType) {
          this.uploadedFiles.push(files[i]);
        } else {
          alert('All files must be of the same type.');
          break;
        }
      }
      console.log('Dropped files:', this.uploadedFiles);
    }
  }

  uploadFiles() {
    if (this.uploadedFiles.length < 2) {
      alert('Please select at least two files for comparison or grouping.');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    if (this.uploadedFiles.length === 2) {
      this.compareFiles();
    } else {
      this.groupFiles();
    }
  }

  compareFiles() {
    this.fileService.compareFiles(this.uploadedFiles[0], this.uploadedFiles[1])
      .subscribe(result => {
        console.log('Comparison Result:', result);
        this.similarityPercentage = parseFloat(this.formatPercentage(result.overlap_percentage));
        this.overlapCount = result.overlap_count;
        this.overlappingLines = result.overlapping_lines;
        this.plagiarismResultsVisible = true;
        this.displayPlagiarismResults();
        this.isUploading = false;
      }, error => {
        console.error('Comparison Error:', error);
        this.isUploading = false;
      });
  }

  groupFiles() {
    this.fileService.groupFiles(this.uploadedFiles)
      .subscribe(result => {
        console.log('Grouping Result:', result);
        this.groupedFiles = result.grouped_files.map((group: GroupedFile) => {
          group[2] = parseFloat(this.formatPercentage(group[2] as number));
          return group;
        });
        this.numberOfGroups = result.grouped_files.length;
        this.plagiarismResultsVisible = true;
        this.displayPlagiarismResults();
        this.isUploading = false;
      }, error => {
        console.error('Grouping Error:', error);
        this.isUploading = false;
      });
  }

  displayPlagiarismResults() {
    if (this.uploadedFiles.length === 2) {
      const ctx = document.getElementById('comparisonChart') as HTMLCanvasElement | null;
      if (ctx) {
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
      } else {
        console.error('Comparison chart element not found.');
      }
    } else if (this.uploadedFiles.length > 2) {
      const ctx = document.getElementById('groupingChart') as HTMLCanvasElement | null;
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Array.from({ length: this.numberOfGroups }, (_, i) => `Group ${i + 1}`),
            datasets: [{
              data: this.groupedFiles.map(group => group[2] as number), // Assuming the third element is the similarity percentage
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
      } else {
        console.error('Grouping chart element not found.');
      }
    }
  }

  formatPercentage(value: number): string {
    return value.toFixed(1);
  }

  checkAgain() {
    this.plagiarismResultsVisible = false;
    this.uploadedFiles = [];
    this.similarityPercentage = 0;
    this.overlapCount = 0;
    this.overlappingLines = [];
    this.groupedFiles = [];
    this.numberOfGroups = 0;
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    console.log('Updated files:', this.uploadedFiles);
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }
}
