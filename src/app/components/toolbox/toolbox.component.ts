import {Component, OnInit, Input} from '@angular/core';
import {MatDialog} from '@angular/material';
import {GenerateConfigurationComponent} from '../generate-configuration/generate-configuration.component';
import {IGraphGenerationConfig} from '../../interfaces/graph-generation-config.interface';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-toolbox',
  templateUrl: 'toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent implements OnInit {

  @Input() configSender: Subject<IGraphGenerationConfig>;
  @Input() logger: Subject<string>;

  constructor(public dialog: MatDialog) {
  }

  public ngOnInit() {
  }

  public generateGraph() {
    const generateGraphConfigModal = this.dialog.open(GenerateConfigurationComponent, {
      height: '350px',
      width: '400px',
    });

    generateGraphConfigModal.afterClosed().subscribe((config: IGraphGenerationConfig) => {
      if (config) {
        this.configSender.next(config);
      }
    });

  }

  public generateFile() {

  }
}
