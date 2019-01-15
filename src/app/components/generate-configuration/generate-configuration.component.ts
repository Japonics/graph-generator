import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {IGraphGenerationConfig} from '../../interfaces/graph-generation-config.interface';

@Component({
  selector: 'app-generate-configuration',
  templateUrl: './generate-configuration.component.html',
  styleUrls: ['./generate-configuration.component.scss']
})
export class GenerateConfigurationComponent {

  public data: IGraphGenerationConfig = {
    probability: 1,
    vertex: 1,
    edges: 1
  };

  constructor(public dialogRef: MatDialogRef<GenerateConfigurationComponent>) {
  }

  public generate(): void {
    this.dialogRef.close(this.data);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
