import {Component} from '@angular/core';
import {Subject} from 'rxjs';
import {IGraphGenerationConfig} from '../../interfaces/graph-generation-config.interface';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent {

  public configCommunicator: Subject<IGraphGenerationConfig> = new Subject<IGraphGenerationConfig>();
  public loggerCommunicator: Subject<HTMLDivElement> = new Subject<HTMLDivElement>();
  public onRegenerateNeighborhoodMatrix: Subject<boolean> = new Subject<boolean>();
  public onRegenerateListOfIncidents: Subject<boolean> = new Subject<boolean>();
  public onSearch3Cycles: Subject<boolean> = new Subject<boolean>();
  public onSearch4Cycles: Subject<boolean> = new Subject<boolean>();

  constructor() {
  }
}
