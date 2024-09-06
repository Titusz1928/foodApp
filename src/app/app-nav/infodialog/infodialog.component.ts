import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'flapp-infodialog',
  templateUrl: './infodialog.component.html',
  styleUrls: ['./infodialog.component.scss']
})
export class InfodialogComponent implements OnInit {

  dialogRef: MatDialogRef<InfodialogComponent>;

  constructor(dialogRef: MatDialogRef<InfodialogComponent>) {
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

}
