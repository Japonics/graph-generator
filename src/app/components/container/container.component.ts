import {
  Component,
  OnInit
} from '@angular/core';
import {Subject} from 'rxjs';
import {IGraphGenerationConfig} from '../../interfaces/graph-generation-config.interface';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  public configCommunicator: Subject<IGraphGenerationConfig> = new Subject<IGraphGenerationConfig>();
  public loggerCommunicator: Subject<IGraphGenerationConfig> = new Subject<IGraphGenerationConfig>();

  constructor() {
  }

  public ngOnInit() {
  }
}
