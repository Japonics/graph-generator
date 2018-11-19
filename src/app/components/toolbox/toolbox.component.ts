import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-toolbox',
  templateUrl: 'toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent implements OnInit {

  constructor(public dialog: MatDialog) {
  }

  public ngOnInit() {
  }

  public generateGraph() {
    let generateGraphConfigModal = this.dialog.open(UserProfileComponent, {
      height: '400px',
      width: '600px',
    });


  }

  public generateFile() {

  }
}
